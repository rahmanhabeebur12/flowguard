"""
FlowGuard Formal 20-Point Regression Suite (Phase 20)
Verifies the complete zero-trust runtime security boundary, token enforcement,
provenance preservation, policy dynamics, and audit trail guarantees.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.intent_compiler import IntentCompiler
from app.core.capability_manifest import CapabilityManifest, ActivePolicyManager
from app.core.reference_monitor import ReferenceMonitor, ApprovalRequestStore
from app.core.policy_engine import PolicyEngine
from app.core.taint import ReleaseLevel, TaintLabel, TaintedValue
from app.core.provenance_dag import ProvenanceDAG
from app.core.provenance import NodeType, EdgeRelation
from app.core.audit_logger import AuditLogger
from app.agent.agent_runtime import AgentRuntime
from app.tools import get_tool, SecurityViolationException
from app.tools.email_tool import EmailTool
from app.tools.file_tool import MOCK_FILE_SYSTEM
from app.tools.base_tool import FlowGuardExecutionToken

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_and_teardown():
    ActivePolicyManager.reset()
    yield
    ActivePolicyManager.reset()


# 1. Legitimate email -> ALLOW
def test_01_legitimate_email_allowed():
    res = client.post("/api/tasks", json={
        "title": "Legitimate Task",
        "user_intent": "Read report.pdf, summarize it and email the summary to professor@college.edu.",
        "scenario_type": "legitimate"
    })
    assert res.status_code == 200
    task_id = res.json()["task_id"]

    run_res = client.post(f"/api/tasks/{task_id}/run?scenario_type=legitimate")
    assert run_res.status_code == 200
    data = run_res.json()
    assert data["security_decision"]["decision"] == "ALLOW"
    assert data["tool_execution"]["execution_status"] == "EXECUTED"


# 2. Unauthorized destination -> BLOCK
def test_02_unauthorized_destination_blocked():
    manifest = IntentCompiler.compile(
        user_intent="Read report.pdf, summarize it and email the summary to professor@college.edu.",
        task_id="test-dest-block",
    )
    eval_result = PolicyEngine.evaluate(
        tool_name="send_email",
        tool_args={"recipient": "attacker@example.com", "body": "Summary of report."},
        manifest=manifest,
    )
    assert eval_result.decision == "BLOCK"
    assert any("destination" in r.lower() or "not authorized" in r.lower() for r in eval_result.reasons)


# 3. Full report exfiltration -> BLOCK
def test_03_full_report_exfiltration_blocked():
    manifest = IntentCompiler.compile(
        user_intent="Read report.pdf, summarize it and email the summary to professor@college.edu.",
        task_id="test-full-exfil",
    )
    eval_result = PolicyEngine.evaluate(
        tool_name="send_email",
        tool_args={
            "recipient": "professor@college.edu",
            "body": "FULL_REPORT\n" + MOCK_FILE_SYSTEM["report.pdf"]["clean"],
            "release_scope": "full_content"
        },
        manifest=manifest,
    )
    assert eval_result.decision == "BLOCK"
    assert any("release" in r.lower() for r in eval_result.reasons)


# 4. Poisoned PDF -> BLOCK
def test_04_poisoned_pdf_blocked():
    res = client.post("/api/attacks/run", json={"scenario_id": "poisoned_pdf"})
    assert res.status_code == 200
    data = res.json()
    assert data["security_decision"]["decision"] == "BLOCK"
    assert data["tool_execution"] is None or data["tool_execution"]["success"] is False


# 5. Poisoned website -> BLOCK
def test_05_poisoned_website_blocked():
    res = client.post("/api/attacks/run", json={"scenario_id": "poisoned_website"})
    assert res.status_code == 200
    data = res.json()
    assert data["security_decision"]["decision"] == "BLOCK"


# 6. Poisoned email -> BLOCK
def test_06_poisoned_email_blocked():
    res = client.post("/api/attacks/run", json={"scenario_id": "poisoned_email"})
    assert res.status_code == 200
    data = res.json()
    assert data["security_decision"]["decision"] == "BLOCK"


# 7. Tool output injection -> BLOCK
def test_07_tool_output_injection_blocked():
    res = client.post("/api/attacks/run", json={"scenario_id": "tool_output_injection"})
    assert res.status_code == 200
    data = res.json()
    assert data["security_decision"]["decision"] == "BLOCK"


# 8. Cross-agent injection -> BLOCK
def test_08_cross_agent_injection_blocked():
    res = client.post("/api/attacks/run", json={"scenario_id": "cross_agent_injection"})
    assert res.status_code == 200
    data = res.json()
    assert data["security_decision"]["decision"] == "BLOCK"


# 9. Release escalation -> BLOCK
def test_09_release_escalation_blocked():
    res = client.post("/api/attacks/run", json={"scenario_id": "release_scope_escalation"})
    assert res.status_code == 200
    data = res.json()
    assert data["security_decision"]["decision"] == "BLOCK"


# 10. Data exfiltration -> BLOCK
def test_10_data_exfiltration_blocked():
    res = client.post("/api/attacks/run", json={"scenario_id": "data_exfiltration"})
    assert res.status_code == 200
    data = res.json()
    assert data["security_decision"]["decision"] == "BLOCK"


# 11. Untrusted provenance propagation
def test_11_untrusted_provenance_propagation():
    val = TaintedValue(
        value="Malicious instruction inside PDF",
        taint=[TaintLabel.UNTRUSTED, TaintLabel.DOCUMENT_CONTENT],
        source="report.pdf",
        provenance_id="prov-orig-11",
    )
    derived = val.propagate_to(
        new_value="Agent derived summary with instruction",
        new_source="agent_inference",
        new_prov_id="prov-derived-11",
    )
    assert derived.is_untrusted() is True
    assert TaintLabel.DERIVED_UNTRUSTED in derived.taint


# 12. Direct tool bypass -> REJECT
def test_12_direct_tool_bypass_rejected():
    email_tool = get_tool("send_email")
    with pytest.raises(SecurityViolationException) as exc_info:
        email_tool.run({
            "recipient": "attacker@example.com",
            "body": "Bypassing reference monitor directly",
        })
    assert "Direct execution of sensitive tool 'send_email' BLOCKED" in str(exc_info.value)


# 13. Invalid execution token -> REJECT
def test_13_invalid_execution_token_rejected():
    email_tool = get_tool("send_email")
    forged_token = "task-fake:send_email:fakehash:1700000000:60:deadbeefbadc0ffee123456789abcdef"
    assert FlowGuardExecutionToken.verify(forged_token, "send_email") is False
    with pytest.raises(SecurityViolationException) as exc_info:
        email_tool.run(
            {"recipient": "professor@college.edu", "body": "Summary"},
            execution_token=forged_token,
        )
    assert "Direct execution of sensitive tool 'send_email' BLOCKED" in str(exc_info.value)


# 14. Expired execution token -> REJECT
def test_14_expired_execution_token_rejected():
    import time
    args = {"recipient": "professor@college.edu", "body": "Summary"}
    expired_token = FlowGuardExecutionToken.generate("task-expired-test", "send_email", args, expiry_seconds=0)
    time.sleep(1)
    assert FlowGuardExecutionToken.verify(expired_token, "send_email", expected_arguments=args) is False

    email_tool = get_tool("send_email")
    with pytest.raises(SecurityViolationException) as exc_info:
        email_tool.run(args, execution_token=expired_token)
    assert "Direct execution of sensitive tool 'send_email' BLOCKED" in str(exc_info.value)


# 15. Policy modification affects runtime authorization
def test_15_policy_modification_affects_runtime_authorization():
    # Update active policy: remove professor@college.edu
    client.put("/api/capabilities/active", json={
        "allowed_destinations": ["custom@enterprise.com"],
        "allowed_actions": ["send_email"],
        "allowed_resources": ["report.pdf"],
        "release_scope": "summary_only",
        "purpose": "report_summary"
    })

    # Propose email to professor@college.edu -> must fail
    res = client.post("/api/tools/propose-action", json={
        "tool_name": "send_email",
        "arguments": {
            "recipient": "professor@college.edu",
            "body": "Executive summary"
        }
    })
    assert res.status_code == 200
    data = res.json()
    assert data["evaluation"]["decision"] in ("BLOCK", "APPROVAL")
    assert data["evaluation"]["decision"] != "ALLOW"


# 16. Audit event generated for every decision
def test_16_audit_event_generated_for_every_decision():
    count_before = len(AuditLogger.get_records())
    client.post("/api/attacks/run", json={"scenario_id": "direct_prompt_injection"})
    count_after = len(AuditLogger.get_records())
    assert count_after == count_before + 1
    latest = AuditLogger.get_records()[-1]
    assert latest.decision in ("BLOCK", "ALLOW", "APPROVAL")
    assert latest.id is not None
    assert latest.timestamp is not None


# 17. Reset clears all runtime state
def test_17_reset_clears_all_runtime_state():
    client.post("/api/attacks/run", json={"scenario_id": "poisoned_pdf"})
    reset_res = client.post("/api/reset")
    assert reset_res.status_code == 200

    metrics = client.get("/api/metrics").json()
    assert metrics["total_evaluations"] == 0
    assert metrics["blocked_flows"] == 0
    assert metrics["allowed_actions"] == 0
    assert metrics["active_tainted_flows"] == 0

    logs = client.get("/api/audit-logs").json()
    assert len(logs) == 0


# 18. Allowed action executes only after authorization
def test_18_allowed_action_executes_only_after_authorization():
    initial_sent = len(EmailTool.get_sent_emails())
    res = client.post("/api/tools/propose-action", json={
        "tool_name": "send_email",
        "arguments": {
            "recipient": "professor@college.edu",
            "body": "Executive summary"
        }
    })
    assert res.status_code == 200
    data = res.json()
    assert data["evaluation"]["decision"] == "ALLOW"
    assert data["execution"]["execution_status"] == "EXECUTED"
    assert len(EmailTool.get_sent_emails()) == initial_sent + 1


# 19. Blocked action executes zero mock-tool operations (0 bytes leaked)
def test_19_blocked_action_executes_zero_mock_tool_operations():
    initial_sent = len(EmailTool.get_sent_emails())
    res = client.post("/api/attacks/run", json={"scenario_id": "poisoned_pdf"})
    assert res.status_code == 200
    data = res.json()
    assert data["security_decision"]["decision"] == "BLOCK"
    assert data["tool_execution"] is None
    # Email count must NOT increase
    assert len(EmailTool.get_sent_emails()) == initial_sent


# 20. Approval flow behaves correctly
def test_20_approval_flow_behaves_correctly():
    initial_sent = len(EmailTool.get_sent_emails())
    
    # Run uncertain recipient scenario
    res = AgentRuntime.run_pipeline(
        user_intent="Read report.pdf, summarize it and email the summary to professor@college.edu.",
        scenario_type="uncertain_approval",
        task_id="test-appr-suite",
    )
    assert res["security_decision"]["decision"] == "APPROVAL"
    assert res["security_decision"]["requires_approval"] is True
    assert res["tool_execution"] is None
    assert len(EmailTool.get_sent_emails()) == initial_sent

    # Operator approves the request
    req_id = res["security_decision"]["approval_request"]["id"]
    token = FlowGuardExecutionToken.generate(
        task_id="test-appr-suite",
        tool_name="send_email",
        arguments=res["security_decision"]["approval_request"]["arguments"]
    )
    exec_res = ReferenceMonitor.execute(
        task_id="test-appr-suite",
        tool_name="send_email",
        arguments=res["security_decision"]["approval_request"]["arguments"],
        execution_token=token,
    )
    assert exec_res["success"] is True
    assert len(EmailTool.get_sent_emails()) == initial_sent + 1
