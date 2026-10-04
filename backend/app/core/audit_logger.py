from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import uuid

class AuditRecord(BaseModel):
    id: str = Field(default_factory=lambda: f"audit-{uuid.uuid4().hex[:8]}")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    task_id: str
    tool_name: str
    arguments: Dict[str, Any]
    decision: str  # ALLOW | BLOCK | APPROVAL
    risk_score: int
    policy_checks: List[Dict[str, Any]] = Field(default_factory=list)
    reasons: List[str] = Field(default_factory=list)
    invariants_violated: List[str] = Field(default_factory=list)
    provenance_ids: List[str] = Field(default_factory=list)
    execution_status: str  # EXECUTED | BLOCKED | PENDING_APPROVAL | REJECTED_BY_ADMIN
    caller_plane: str = "EXECUTION_PLANE"
    executed_at: Optional[str] = None
    execution_result: Optional[Dict[str, Any]] = None

class AuditLogger:
    """
    In-memory and persistent log store for FlowGuard Reference Monitor.
    All evaluations are append-only.
    """
    _records: List[AuditRecord] = []

    @classmethod
    def log_evaluation(
        cls,
        task_id: str,
        tool_name: str,
        arguments: Dict[str, Any],
        decision: str,
        risk_score: int,
        policy_checks: List[Any],
        reasons: List[str],
        invariants_violated: List[str],
        provenance_ids: Optional[List[str]] = None,
        execution_status: Optional[str] = None,
    ) -> AuditRecord:
        if execution_status is None:
            if decision == "ALLOW":
                execution_status = "READY_TO_EXECUTE"
            elif decision == "APPROVAL":
                execution_status = "PENDING_APPROVAL"
            else:
                execution_status = "BLOCKED"

        serializable_checks = []
        for c in policy_checks:
            if hasattr(c, "model_dump"):
                serializable_checks.append(c.model_dump())
            elif isinstance(c, dict):
                serializable_checks.append(c)
            else:
                serializable_checks.append(str(c))

        record = AuditRecord(
            task_id=task_id,
            tool_name=tool_name,
            arguments=arguments,
            decision=decision,
            risk_score=risk_score,
            policy_checks=serializable_checks,
            reasons=reasons,
            invariants_violated=invariants_violated,
            provenance_ids=provenance_ids or [],
            execution_status=execution_status,
        )

        cls._records.insert(0, record)  # prepend for most recent first
        return record

    @classmethod
    def update_execution(cls, record_id: str, status: str, result: Optional[Dict[str, Any]] = None) -> Optional[AuditRecord]:
        for r in cls._records:
            if r.id == record_id:
                r.execution_status = status
                r.executed_at = datetime.now(timezone.utc).isoformat()
                r.execution_result = result
                return r
        return None

    @classmethod
    def get_records(cls, decision_filter: Optional[str] = None, limit: int = 100) -> List[AuditRecord]:
        if not decision_filter or decision_filter.upper() == "ALL":
            return cls._records[:limit]
        return [r for r in cls._records if r.decision.upper() == decision_filter.upper()][:limit]

    @classmethod
    def get_by_id(cls, record_id: str) -> Optional[AuditRecord]:
        for r in cls._records:
            if r.id == record_id:
                return r
        return None

    @classmethod
    def get_metrics(cls) -> Dict[str, Any]:
        total = len(cls._records)
        blocked = sum(1 for r in cls._records if r.decision == "BLOCK")
        allowed = sum(1 for r in cls._records if r.decision == "ALLOW")
        approvals = sum(1 for r in cls._records if r.decision == "APPROVAL")
        executed = sum(1 for r in cls._records if r.execution_status == "EXECUTED")
        high_risk = sum(1 for r in cls._records if r.risk_score >= 70)
        tainted_flows = sum(
            1 for r in cls._records 
            if r.decision == "BLOCK" 
            or any("UNTRUSTED" in str(c) for c in r.policy_checks) 
            or any("taint" in str(inv).lower() for inv in r.invariants_violated)
        )
        unique_tasks = len(set(r.task_id for r in cls._records))

        return {
            "total_evaluations": total,
            "blocked_flows": blocked,
            "allowed_actions": allowed,
            "pending_approvals": approvals,
            "executed_tools": executed,
            "high_risk_attempts": high_risk,
            "active_tainted_flows": tainted_flows,
            "active_tasks": unique_tasks,
            "attacks_detected": blocked,
        }

    @classmethod
    def clear(cls):
        cls._records.clear()

