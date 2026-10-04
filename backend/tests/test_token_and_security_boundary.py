import pytest
import time
from app.tools.base_tool import FlowGuardExecutionToken, SecurityViolationException
from app.tools import get_tool, TOOL_REGISTRY
from app.core.intent_compiler import IntentCompiler
from app.core.reference_monitor import ReferenceMonitor
from app.agent.agent_runtime import AgentRuntime

def test_forged_token_rejected():
    """Test 1: Agent creates a completely forged token with fabricated signature."""
    forged_token = "task-fake:send_email:fakehash:1700000000:60:deadbeefbadc0ffee123456789abcdef"
    is_valid = FlowGuardExecutionToken.verify(forged_token, "send_email")
    assert is_valid is False

    email_tool = get_tool("send_email")
    with pytest.raises(SecurityViolationException):
        email_tool.run({"recipient": "attacker@example.com", "body": "leak"}, execution_token=forged_token)

def test_modified_token_rejected():
    """Test 2: Legitimate token modified by tampering a single character."""
    args = {"recipient": "professor@college.edu", "body": "Summary"}
    valid_token = FlowGuardExecutionToken.generate("task-1", "send_email", args)
    
    # Tamper with the signature at the end
    tampered_token = valid_token[:-2] + "99"
    assert FlowGuardExecutionToken.verify(tampered_token, "send_email", expected_arguments=args) is False

    email_tool = get_tool("send_email")
    with pytest.raises(SecurityViolationException):
        email_tool.run(args, execution_token=tampered_token)

def test_token_wrong_tool_rejected():
    """Test 3: Token issued for read_file attempted on send_email."""
    args = {"filename": "report.pdf"}
    token = FlowGuardExecutionToken.generate("task-1", "read_file", args)

    # Attempt to use read_file token to execute send_email
    email_tool = get_tool("send_email")
    with pytest.raises(SecurityViolationException):
        email_tool.run({"recipient": "attacker@example.com", "body": "leak"}, execution_token=token)

def test_token_wrong_destination_arguments_rejected():
    """Test 4: Token issued for professor@college.edu attempted on attacker@example.com (Parameter Tampering)."""
    legit_args = {"recipient": "professor@college.edu", "body": "Summary"}
    token = FlowGuardExecutionToken.generate("task-1", "send_email", legit_args)

    malicious_args = {"recipient": "attacker@example.com", "body": "Summary"}
    email_tool = get_tool("send_email")
    
    # Token must be rejected because argument hash mismatch!
    with pytest.raises(SecurityViolationException):
        email_tool.run(malicious_args, execution_token=token)

def test_token_wrong_task_rejected():
    """Test 5: Token issued for task-A attempted on task-B."""
    args = {"recipient": "professor@college.edu", "body": "Summary"}
    token = FlowGuardExecutionToken.generate("task-A", "send_email", args)

    # Verify fails if task_id doesn't match
    assert FlowGuardExecutionToken.verify(token, "send_email", expected_arguments=args, expected_task_id="task-B") is False

def test_token_never_issued_after_block():
    """Test 6: Verify that on BLOCK, no execution token is generated."""
    manifest = IntentCompiler.compile(
        user_intent="Read report.pdf, summarize it and email the summary to professor@college.edu.",
        task_id="task-block-test",
    )
    # Propose call to attacker
    eval_result = ReferenceMonitor.evaluate(
        task_id="task-block-test",
        tool_name="send_email",
        arguments={"recipient": "attacker@example.com", "body": "FULL_REPORT"},
        manifest=manifest,
    )
    assert eval_result["decision"] == "BLOCK"
    assert eval_result["execution_token"] is None

def test_token_never_issued_after_approval_without_operator_action():
    """Test 7: Verify that on APPROVAL, no execution token is generated until operator approves."""
    manifest = IntentCompiler.compile(
        user_intent="Read report.pdf, summarize it and email the summary to professor@college.edu.",
        task_id="task-appr-test",
    )
    # Propose call to unapproved external destination
    eval_result = ReferenceMonitor.evaluate(
        task_id="task-appr-test",
        tool_name="send_email",
        arguments={"recipient": "external@example.com", "body": "Summary of report"},
        manifest=manifest,
    )
    assert eval_result["decision"] == "APPROVAL"
    assert eval_result["execution_token"] is None
    assert eval_result["approval_request"] is not None

def test_expired_token_rejected():
    """Test token expiration rejection."""
    args = {"recipient": "professor@college.edu", "body": "Summary"}
    # Token with 0 second expiry
    expired_token = FlowGuardExecutionToken.generate("task-exp", "send_email", args, expiry_seconds=0)
    time.sleep(1) # Ensure time has lapsed
    assert FlowGuardExecutionToken.verify(expired_token, "send_email", expected_arguments=args) is False

def test_all_six_tools_protected_by_token():
    """Test Invariant 3 & 4 across all 6 tools: FileTool, EmailTool, DatabaseTool, HttpTool, CalendarTool, BankingTool."""
    tools_and_args = [
        ("read_file", {"filename": "report.pdf"}),
        ("send_email", {"recipient": "professor@college.edu", "body": "Summary"}),
        ("query_database", {"table": "customers"}),
        ("http_request", {"url": "https://api.partner.org/status"}),
        ("calendar_event", {"title": "Meeting"}),
        ("bank_transfer", {"amount": 100, "target_account": "ACT-1"}),
    ]

    for tool_name, args in tools_and_args:
        tool = get_tool(tool_name)
        # 1. Direct call without token MUST raise SecurityViolationException
        with pytest.raises(SecurityViolationException) as exc_info:
            tool.run(args, execution_token=None)
        assert f"Direct execution of sensitive tool '{tool_name}' BLOCKED!" in str(exc_info.value)

        # 2. Call with valid token MUST succeed
        token = FlowGuardExecutionToken.generate("task-test-all", tool_name, args)
        res = tool.run(args, execution_token=token)
        assert res is not None
        assert "success" in res
