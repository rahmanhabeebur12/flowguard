from typing import Dict, Any, List
from app.tools.base_tool import BaseTool

MOCK_DATABASE = {
    "customers": [
        {"id": 101, "name": "Alice Chen", "tier": "Enterprise", "ssn": "9128", "balance": 45200.0},
        {"id": 102, "name": "Bob Smith", "tier": "Standard", "ssn": "4310", "balance": 118500.0},
        {"id": 103, "name": "Carol Danvers", "tier": "Premium", "ssn": "5521", "balance": 320000.0},
    ],
    "financial_audit": [
        {"tx_id": "tx_9901", "amount": 12500.0, "status": "CLEARED"},
        {"tx_id": "tx_9902", "amount": 450000.0, "status": "PENDING_REVIEW"},
    ]
}

class DatabaseTool(BaseTool):
    name = "query_database"
    is_sensitive = True

    def _execute(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        table = arguments.get("table") or arguments.get("resource", "customers")
        records = MOCK_DATABASE.get(table, [])
        return {
            "success": True,
            "table": table,
            "row_count": len(records),
            "rows": records,
        }
