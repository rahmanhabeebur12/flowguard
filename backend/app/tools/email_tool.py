from typing import Dict, Any, List
from app.tools.base_tool import BaseTool
from datetime import datetime, timezone

class EmailTool(BaseTool):
    name = "send_email"
    is_sensitive = True

    _sent_emails: List[Dict[str, Any]] = []

    def _execute(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        recipient = arguments.get("recipient") or arguments.get("to")
        body = arguments.get("body") or arguments.get("content", "")
        subject = arguments.get("subject", "Automated Agent Dispatch")

        record = {
            "recipient": recipient,
            "subject": subject,
            "body": body,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status": "DELIVERED",
        }
        self._sent_emails.append(record)

        return {
            "success": True,
            "message": f"Email successfully dispatched to {recipient}",
            "recipient": recipient,
            "body_length": len(body),
            "delivered_at": record["timestamp"],
        }

    @classmethod
    def get_sent_emails(cls) -> List[Dict[str, Any]]:
        return cls._sent_emails
