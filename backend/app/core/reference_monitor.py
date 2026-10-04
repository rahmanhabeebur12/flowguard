import hashlib
import json
import uuid
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
from app.core.capability_manifest import CapabilityManifest
from app.core.policy_engine import PolicyEngine, PolicyEvaluationResult
from app.core.audit_logger import AuditLogger
from app.core.provenance_dag import ProvenanceDAG, get_or_create_dag
from app.core.provenance import NodeType, EdgeRelation
from app.tools import get_tool, FlowGuardExecutionToken, SecurityViolationException

class ApprovalRequestStore:
    """Manages pending human-in-the-loop approval requests."""
    _requests: Dict[str, Dict[str, Any]] = {}

    @classmethod
    def create(cls, task_id: str, tool_name: str, arguments: Dict[str, Any], reason: str, manifest: CapabilityManifest) -> Dict[str, Any]:
        req_id = f"appr-{uuid.uuid4().hex[:8]}"
        req = {
            "id": req_id,
            "task_id": task_id,
            "tool_name": tool_name,
            "arguments": arguments,
            "reason": reason,
            "status": "PENDING",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "manifest_intent": manifest.user_intent,
            "destination": arguments.get("recipient") or arguments.get("to") or arguments.get("url") or "external",
            "resource": arguments.get("filename") or arguments.get("resource") or "none",
            "release": arguments.get("release_scope") or "limited_fields",
        }
        cls._requests[req_id] = req
        return req

    @classmethod
    def get_all(cls) -> List[Dict[str, Any]]:
        return list(cls._requests.values())

    @classmethod
    def get_by_id(cls, req_id: str) -> Optional[Dict[str, Any]]:
        return cls._requests.get(req_id)

    @classmethod
    def resolve(cls, req_id: str, approved: bool) -> Optional[Dict[str, Any]]:
        req = cls._requests.get(req_id)
        if req:
            req["status"] = "APPROVED" if approved else "REJECTED"
            req["resolved_at"] = datetime.now(timezone.utc).isoformat()
        return req


class ReferenceMonitor:
    """
    Central Zero-Trust Reference Monitor for FlowGuard.
    All sensitive tool invocations from the execution plane MUST pass through this monitor.
    """

    @classmethod
    def evaluate(
        cls,
        task_id: str,
        tool_name: str,
        arguments: Dict[str, Any],
        manifest: CapabilityManifest,
        provenance_dag: Optional[ProvenanceDAG] = None,
        arg_provenance_map: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """
        Independent security evaluation of a proposed tool call.
        """
        dag = provenance_dag or get_or_create_dag(task_id)

        # 1. Run Policy Engine
        eval_result: PolicyEvaluationResult = PolicyEngine.evaluate(
            tool_name=tool_name,
            tool_args=arguments,
            manifest=manifest,
            provenance_dag=dag,
            arg_provenance_map=arg_provenance_map,
        )

        # 2. Add proposed action node to Provenance DAG
        action_node = dag.add_node(
            label=f"Proposed {tool_name}",
            node_type=NodeType.PROPOSED_ACTION,
            source="agent_proposal",
            trust_level="EVALUATED",
            taint_labels=["PROPOSED_ACTION"],
            payload_snippet=json.dumps(arguments)[:180],
            metadata={
                "tool": tool_name,
                "decision": eval_result.decision,
                "risk_score": eval_result.risk_score,
            }
        )

        # Link from parent provenance arguments if provided
        if arg_provenance_map:
            for _, parent_id in arg_provenance_map.items():
                if parent_id in dag.nodes:
                    dag.add_edge(parent_id, action_node.id, EdgeRelation.PROPOSED_FOR)

        # 3. Handle Approval state if required
        approval_req = None
        if eval_result.decision == "APPROVAL" or eval_result.requires_approval:
            approval_req = ApprovalRequestStore.create(
                task_id=task_id,
                tool_name=tool_name,
                arguments=arguments,
                reason=eval_result.reasons[0] if eval_result.reasons else "Policy cannot determine whether this destination is authorized.",
                manifest=manifest,
            )

        # 4. Generate Execution Token if ALLOWED
        execution_token = None
        if eval_result.decision == "ALLOW":
            execution_token = FlowGuardExecutionToken.generate(task_id, tool_name, arguments)

        # 5. Log to Audit Store
        audit_record = AuditLogger.log_evaluation(
            task_id=task_id,
            tool_name=tool_name,
            arguments=arguments,
            decision=eval_result.decision,
            risk_score=eval_result.risk_score,
            policy_checks=eval_result.checks,
            reasons=eval_result.reasons,
            invariants_violated=eval_result.invariants_violated,
            provenance_ids=[action_node.id] + list((arg_provenance_map or {}).values()),
            execution_status="READY_TO_EXECUTE" if eval_result.decision == "ALLOW" else ("PENDING_APPROVAL" if eval_result.decision == "APPROVAL" else "BLOCKED"),
        )

        return {
            "evaluation_id": audit_record.id,
            "task_id": task_id,
            "tool_name": tool_name,
            "arguments": arguments,
            "decision": eval_result.decision,
            "risk_score": eval_result.risk_score,
            "checks": [c.model_dump() for c in eval_result.checks],
            "reasons": eval_result.reasons,
            "invariants_violated": eval_result.invariants_violated,
            "requires_approval": eval_result.requires_approval,
            "approval_request": approval_req,
            "execution_token": execution_token,
            "action_node_id": action_node.id,
        }

    @classmethod
    def execute(
        cls,
        task_id: str,
        tool_name: str,
        arguments: Dict[str, Any],
        execution_token: str,
        audit_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Executes an authorized tool call using the cryptographically verified token.
        Cannot be called without valid token.
        """
        tool = get_tool(tool_name)
        try:
            result = tool.run(arguments, execution_token=execution_token, task_id=task_id)
            
            # Record execution in audit
            if audit_id:
                AuditLogger.update_execution(audit_id, "EXECUTED", result)
            
            # Update DAG with executed tool result
            dag = get_or_create_dag(task_id)
            exec_node = dag.add_node(
                label=f"Executed {tool_name}",
                node_type=NodeType.EXECUTED_TOOL,
                source=tool_name,
                trust_level="TRUSTED",
                taint_labels=["TOOL_OUTPUT"],
                payload_snippet=json.dumps(result)[:180],
            )

            return {
                "success": True,
                "execution_status": "EXECUTED",
                "result": result,
                "exec_node_id": exec_node.id,
            }
        except SecurityViolationException as sve:
            if audit_id:
                AuditLogger.update_execution(audit_id, "SECURITY_VIOLATION", {"error": str(sve)})
            return {
                "success": False,
                "execution_status": "VIOLATION",
                "error": str(sve),
            }
        except Exception as e:
            if audit_id:
                AuditLogger.update_execution(audit_id, "FAILED", {"error": str(e)})
            return {
                "success": False,
                "execution_status": "FAILED",
                "error": str(e),
            }
