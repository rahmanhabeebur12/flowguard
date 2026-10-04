from typing import Dict, Any, List
from app.tools.base_tool import BaseTool
from datetime import datetime, timezone

class CalendarTool(BaseTool):
    name = "calendar_event"
    is_sensitive = True

    _events: List[Dict[str, Any]] = [
        {"id": "ev_01", "title": "Quarterly Research Sync", "attendees": ["professor@college.edu", "lead@aurashield.org"], "time": "2026-10-05T14:00:00Z"},
        {"id": "ev_02", "title": "SOC Threat Briefing", "attendees": ["team@aurashield.org"], "time": "2026-10-06T10:00:00Z"},
    ]

    def _execute(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        action = arguments.get("action", "create")
        if action == "list":
            return {"success": True, "events": self._events}
        
        event = {
            "id": f"ev_{len(self._events)+1:02d}",
            "title": arguments.get("title", "Ad-hoc Meeting"),
            "attendees": arguments.get("attendees", []),
            "time": arguments.get("time", datetime.now(timezone.utc).isoformat()),
        }
        self._events.append(event)
        return {"success": True, "created_event": event}

class BankingTool(BaseTool):
    name = "bank_transfer"
    is_sensitive = True

    _balance = 500000.00
    _transfers: List[Dict[str, Any]] = []

    def _execute(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        action = arguments.get("action", "transfer")
        if action == "balance":
            return {"success": True, "balance": self._balance, "currency": "USD"}
        
        amount = float(arguments.get("amount", 0.0))
        target_account = arguments.get("target_account") or arguments.get("destination", "UNKNOWN")

        if amount > self._balance:
            return {"success": False, "error": "Insufficient funds"}

        self._balance -= amount
        record = {
            "amount": amount,
            "target_account": target_account,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status": "COMPLETED",
        }
        self._transfers.append(record)
        return {
            "success": True,
            "transferred": amount,
            "target": target_account,
            "remaining_balance": self._balance,
        }
