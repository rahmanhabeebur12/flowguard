from typing import Dict, Any, List
from app.tools.base_tool import BaseTool, SecurityViolationException, FlowGuardExecutionToken
from app.tools.file_tool import FileTool
from app.tools.email_tool import EmailTool
from app.tools.database_tool import DatabaseTool
from app.tools.http_tool import HttpTool
from app.tools.calendar_tool import CalendarTool
from app.tools.banking_tool import BankingTool

TOOL_REGISTRY: Dict[str, BaseTool] = {
    "read_file": FileTool(),
    "send_email": EmailTool(),
    "query_database": DatabaseTool(),
    "http_request": HttpTool(),
    "calendar_event": CalendarTool(),
    "bank_transfer": BankingTool(),
}

def get_tool(tool_name: str) -> BaseTool:
    tool = TOOL_REGISTRY.get(tool_name)
    if not tool:
        raise ValueError(f"Tool '{tool_name}' not registered in FlowGuard sandbox.")
    return tool

def get_all_tools_metadata() -> List[Dict[str, Any]]:
    # Metadata for the Tool Execution page
    return [
        {
            "id": "read_file",
            "name": "File System",
            "description": "Secure file access sandbox (report.pdf, customer_records.db, etc.)",
            "category": "STORAGE",
            "is_sensitive": True,
            "status": "PROTECTED",
        },
        {
            "id": "send_email",
            "name": "Email Dispatcher",
            "description": "Outbound SMTP gateway with recipient & release enforcement",
            "category": "COMMUNICATION",
            "is_sensitive": True,
            "status": "PROTECTED",
        },
        {
            "id": "query_database",
            "name": "Database Gateway",
            "description": "Relational query engine with row-level & schema authorization",
            "category": "STORAGE",
            "is_sensitive": True,
            "status": "PROTECTED",
        },
        {
            "id": "http_request",
            "name": "HTTP / Web Connector",
            "description": "External egress gateway with destination validation & taint tagging",
            "category": "NETWORK",
            "is_sensitive": True,
            "status": "PROTECTED",
        },
        {
            "id": "calendar_event",
            "name": "Calendar API",
            "description": "Scheduling service with attendee verification",
            "category": "INTEGRATION",
            "is_sensitive": True,
            "status": "PROTECTED",
        },
        {
            "id": "bank_transfer",
            "name": "Banking & Wire API",
            "description": "High-risk financial ledger operations with mandatory approval gate",
            "category": "FINANCIAL",
            "is_sensitive": True,
            "status": "PROTECTED",
        },
    ]
