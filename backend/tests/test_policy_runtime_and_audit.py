import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.capability_manifest import ActivePolicyManager
from app.core.audit_logger import AuditLogger

client = TestClient(app)

def test_active_policy_modification_changes_runtime_verdict():
    """Phase 4 test:
    When the user changes the policy destination from professor@college.edu to someone@example.com,
    the previous legitimate action to professor@college.edu must now FAIL (decision != 'ALLOW').
    When reset, it should pass again.
    """
    ActivePolicyManager.reset()
    
    # 1. Baseline: legitimate action to professor@college.edu is ALLOWED
    baseline_res = client.post("/api/tasks", json={
        "title": "Baseline Test",
        "user_intent": "Read report.pdf, summarize it and email the summary to professor@college.edu.",
        "scenario_type": "legitimate"
    })
    assert baseline_res.status_code == 200
    task_id = baseline_res.json()["task_id"]
    
    run_res = client.post(f"/api/tasks/{task_id}/run?scenario_type=legitimate")
    assert run_res.status_code == 200
    assert run_res.json()["security_decision"]["decision"] == "ALLOW"

    # 2. Modify policy: only allow someone@example.com
    update_res = client.put("/api/capabilities/active", json={
        "allowed_destinations": ["someone@example.com"],
        "allowed_actions": ["send_email", "read_file"],
        "allowed_resources": ["report.pdf"],
        "release_scope": "summary_only",
        "purpose": "report_summary"
    })
    assert update_res.status_code == 200
    assert "someone@example.com" in update_res.json()["allowed_destinations"]
    assert "professor@college.edu" not in update_res.json()["allowed_destinations"]

    # 3. Now the same action proposing professor@college.edu must NOT be allowed!
    # Because professor@college.edu is no longer authorized, it fails the policy check.
    task_res2 = client.post("/api/tasks", json={
        "title": "Policy Restricted Test",
        "user_intent": "Read report.pdf, summarize it and email the summary to professor@college.edu.",
        "scenario_type": "legitimate"
    })
    task_id2 = task_res2.json()["task_id"]
    run_res2 = client.post(f"/api/tasks/{task_id2}/run?scenario_type=legitimate")
    assert run_res2.status_code == 200
    decision2 = run_res2.json()["security_decision"]["decision"]
    assert decision2 != "ALLOW", f"Expected non-ALLOW, got {decision2}"
    assert decision2 in ("BLOCK", "APPROVAL")
    # Verify destination check failed
    checks = run_res2.json()["security_decision"]["checks"]
    dest_check = next((c for c in checks if "Destination" in c["name"]), None)
    assert dest_check is not None and dest_check["passed"] is False

    # 4. Reset policy restores professor@college.edu as authorized destination
    reset_policy_res = client.post("/api/capabilities/active/reset")
    assert reset_policy_res.status_code == 200
    assert "professor@college.edu" in reset_policy_res.json()["allowed_destinations"]

    task_res3 = client.post("/api/tasks", json={
        "title": "Restored Test",
        "user_intent": "Read report.pdf, summarize it and email the summary to professor@college.edu.",
        "scenario_type": "legitimate"
    })
    task_id3 = task_res3.json()["task_id"]
    run_res3 = client.post(f"/api/tasks/{task_id3}/run?scenario_type=legitimate")
    assert run_res3.status_code == 200
    assert run_res3.json()["security_decision"]["decision"] == "ALLOW"


def test_audit_event_generated_for_every_decision():
    """Phase 10 & 17 requirement 9: Every security decision must generate an audit event."""
    initial_records = len(AuditLogger.get_records())
    
    # Run an attack
    client.post("/api/attacks/run", json={"scenario_id": "poisoned_pdf"})
    
    new_records = AuditLogger.get_records()
    assert len(new_records) == initial_records + 1
    latest = new_records[-1]
    assert latest.decision in ("BLOCK", "ALLOW", "APPROVAL")
    assert latest.tool_name == "send_email"
    assert latest.id is not None
    assert latest.timestamp is not None


def test_reset_clears_runtime_state_and_metrics():
    """Phase 14 & 17 requirement 10: Reset returns application to clean state with 0 metrics."""
    # Ensure there are some events
    client.post("/api/attacks/run", json={"scenario_id": "poisoned_pdf"})
    client.post("/api/attacks/run", json={"scenario_id": "direct_prompt_injection"})
    
    metrics_before = client.get("/api/metrics").json()
    assert metrics_before["total_evaluations"] >= 2

    # Issue reset
    reset_res = client.post("/api/reset")
    assert reset_res.status_code == 200
    assert reset_res.json()["status"] == "RESET_SUCCESSFUL"

    # Metrics must now be clean 0s
    metrics_after = client.get("/api/metrics").json()
    assert metrics_after["total_evaluations"] == 0
    assert metrics_after["allowed_actions"] == 0
    assert metrics_after["blocked_flows"] == 0
    assert metrics_after["pending_approvals"] == 0
    assert metrics_after["high_risk_attempts"] == 0
    assert metrics_after["active_tainted_flows"] == 0

    # Audit records must be empty
    records = client.get("/api/audit-logs").json()
    assert len(records) == 0


def test_tool_sandbox_interactive_proposal():
    """Phase 11 test: Tool Sandbox propose-action endpoint intercepts and enforces FlowGuard policy."""
    ActivePolicyManager.reset()

    # 1. Propose authorized email -> ALLOW
    res_allow = client.post("/api/tools/propose-action", json={
        "tool_name": "send_email",
        "arguments": {
            "recipient": "professor@college.edu",
            "body": "Executive summary of findings",
            "release_scope": "summary_only",
            "purpose": "report_summary"
        }
    })
    assert res_allow.status_code == 200
    data_allow = res_allow.json()
    assert data_allow["evaluation"]["decision"] == "ALLOW"
    assert data_allow["execution"]["execution_status"] == "EXECUTED"

    # 2. Propose unauthorized email to attacker -> BLOCK (0 bytes executed)
    res_block = client.post("/api/tools/propose-action", json={
        "tool_name": "send_email",
        "arguments": {
            "recipient": "attacker@darkweb.org",
            "body": "FULL_REPORT CONFIDENTIAL",
            "release_scope": "full_content",
            "purpose": "report_summary"
        }
    })
    assert res_block.status_code == 200
    data_block = res_block.json()
    assert data_block["evaluation"]["decision"] == "BLOCK"
    assert data_block["execution"] is None


def test_all_nine_attack_scenarios_intercepted():
    """Phase 5 test: Test all 9 scenarios in Attack Simulator are handled through Reference Monitor."""
    scenarios = [
        "direct_prompt_injection",
        "poisoned_pdf",
        "poisoned_website",
        "poisoned_email",
        "tool_output_injection",
        "cross_agent_injection",
        "unauthorized_destination",
        "data_exfiltration",
        "release_scope_escalation",
    ]

    for scen_id in scenarios:
        res = client.post("/api/attacks/run", json={"scenario_id": scen_id})
        assert res.status_code == 200, f"Failed on scenario {scen_id}"
        data = res.json()
        dec = data["security_decision"]["decision"]
        # All malicious/untrusted scenarios must NOT be ALLOWED without review
        assert dec in ("BLOCK", "APPROVAL"), f"Scenario {scen_id} was allowed! Result: {data['security_decision']}"
        # Tool execution must be absent or not succeeded
        assert data["tool_execution"] is None or data["tool_execution"].get("success") is False
