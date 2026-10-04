import re
import uuid
from typing import Optional, List, Dict, Any
from app.core.capability_manifest import CapabilityManifest
from app.core.taint import ReleaseLevel

class IntentCompiler:
    """
    Compiles a verified USER INTENT into an immutable CAPABILITY MANIFEST.
    Operates strictly within the Trusted Control Plane.
    """

    EMAIL_REGEX = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')
    FILE_REGEX = re.compile(r'\b[\w-]+\.(?:pdf|docx|csv|txt|json|xlsx|db)\b', re.IGNORECASE)
    URL_REGEX = re.compile(r'https?://[^\s/$.?#].[^\s]*', re.IGNORECASE)

    @classmethod
    def compile(cls, user_intent: str, task_id: Optional[str] = None, overrides: Optional[Dict[str, Any]] = None) -> CapabilityManifest:
        task_id = task_id or f"task-{uuid.uuid4().hex[:8]}"
        intent_lower = user_intent.lower()

        # Extract actions
        actions = []
        if any(w in intent_lower for w in ["read", "open", "parse", "view", "inspect"]):
            actions.append("read_file")
        if any(w in intent_lower for w in ["summarize", "summary", "digest", "brief"]):
            actions.append("summarize")
        if any(w in intent_lower for w in ["email", "mail", "send", "forward", "dispatch"]):
            actions.append("send_email")
        if any(w in intent_lower for w in ["query", "select", "database", "sql", "db"]):
            actions.append("query_database")
        if any(w in intent_lower for w in ["fetch", "http", "api", "get", "request", "download"]):
            actions.append("http_request")
        if any(w in intent_lower for w in ["calendar", "schedule", "meeting", "invite"]):
            actions.append("calendar_event")
        if any(w in intent_lower for w in ["transfer", "wire", "pay", "bank"]):
            actions.append("bank_transfer")

        # Default fallback action if none matched
        if not actions:
            actions = ["read_file", "summarize"]

        # Extract resources
        resources = cls.FILE_REGEX.findall(user_intent)
        if not resources and "customer" in intent_lower:
            resources.append("customer_records.db")

        # Extract destinations
        destinations = cls.EMAIL_REGEX.findall(user_intent)
        urls = cls.URL_REGEX.findall(user_intent)
        for url in urls:
            destinations.append(url)

        # Extract release scope
        if any(w in intent_lower for w in ["summary", "summarize", "overview", "brief"]):
            release_scope = ReleaseLevel.SUMMARY_ONLY
        elif any(w in intent_lower for w in ["limited", "partial", "fields", "redacted"]):
            release_scope = ReleaseLevel.LIMITED_FIELDS
        elif any(w in intent_lower for w in ["full", "complete", "raw", "entire", "everything"]):
            release_scope = ReleaseLevel.FULL_CONTENT
        else:
            release_scope = ReleaseLevel.SUMMARY_ONLY

        # Purpose determination
        if "report" in intent_lower and "summary" in intent_lower:
            purpose = "report_summary"
        elif "customer" in intent_lower:
            purpose = "customer_support"
        elif "financial" in intent_lower or "bank" in intent_lower:
            purpose = "financial_operation"
        else:
            purpose = "user_task_execution"

        # Apply specific overrides if passed (useful for custom tests/scenarios)
        manifest_data = {
            "task_id": task_id,
            "user_intent": user_intent,
            "allowed_actions": actions,
            "allowed_resources": resources,
            "allowed_destinations": destinations,
            "release_scope": release_scope,
            "purpose": purpose,
            "is_immutable": True,
        }

        if overrides:
            manifest_data.update(overrides)

        manifest = CapabilityManifest(**manifest_data)
        return manifest
