from app.agent.agent_runtime import AgentRuntime
from app.core.audit_logger import AuditLogger

def seed_demo_data():
    """
    Populates the runtime with baseline events so the SOC dashboard
    and audit log immediately reflect realistic security posture.
    """
    if len(AuditLogger.get_records()) > 0:
        return

    # Scenario 1: Poisoned Document Attack (BLOCKED)
    AgentRuntime.run_pipeline(
        user_intent="Read report.pdf, summarize it and email the summary to professor@college.edu.",
        scenario_type="poisoned_doc",
        task_id="task-seed-001",
    )

    # Scenario 2: Legitimate Execution (ALLOWED)
    AgentRuntime.run_pipeline(
        user_intent="Read report.pdf, summarize it and email the summary to professor@college.edu.",
        scenario_type="legitimate",
        task_id="task-seed-002",
    )

    # Scenario 3: Tool Output Injection (BLOCKED)
    AgentRuntime.run_pipeline(
        user_intent="Fetch verification status from https://partner.com/verify and process customer list",
        scenario_type="tool_output_injection",
        task_id="task-seed-003",
    )

    # Scenario 4: Uncertain External Destination (APPROVAL REQUIRED)
    AgentRuntime.run_pipeline(
        user_intent="Send summary of report.pdf to external collaborator colleague@externallab.org",
        scenario_type="uncertain_approval",
        task_id="task-seed-004",
    )
