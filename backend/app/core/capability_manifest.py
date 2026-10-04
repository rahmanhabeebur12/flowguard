import hashlib
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.core.taint import ReleaseLevel

class CapabilityManifest(BaseModel):
    task_id: str
    user_intent: str
    allowed_actions: List[str] = Field(default_factory=list)
    allowed_resources: List[str] = Field(default_factory=list)
    allowed_destinations: List[str] = Field(default_factory=list)
    release_scope: ReleaseLevel = ReleaseLevel.SUMMARY_ONLY
    purpose: str = "general_assistance"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    is_immutable: bool = True
    signature: str = ""

    def __init__(self, **data: Any):
        super().__init__(**data)
        if not self.signature:
            self.signature = self._generate_signature()

    def _canonical_payload(self) -> str:
        payload = {
            "task_id": self.task_id,
            "allowed_actions": sorted(self.allowed_actions),
            "allowed_resources": sorted(self.allowed_resources),
            "allowed_destinations": sorted(self.allowed_destinations),
            "release_scope": self.release_scope.value if isinstance(self.release_scope, ReleaseLevel) else str(self.release_scope),
            "purpose": self.purpose,
            "is_immutable": self.is_immutable,
        }
        return json.dumps(payload, sort_keys=True)

    def _generate_signature(self) -> str:
        canonical = self._canonical_payload()
        return hashlib.sha256(canonical.encode("utf-8")).hexdigest()

    def verify_integrity(self) -> bool:
        """
        Security Invariant 1: External data cannot modify authority.
        Verify that the manifest has not been tampered with since creation.
        """
        return self._generate_signature() == self.signature

    def allows_tool(self, tool_name: str) -> bool:
        return tool_name in self.allowed_actions

    def allows_destination(self, destination: str) -> bool:
        if not destination:
            return True
        norm_dest = destination.strip().lower()
        return any(norm_dest == allowed.strip().lower() for allowed in self.allowed_destinations)

    def allows_resource(self, resource: str) -> bool:
        if not resource:
            return True
        norm_res = resource.strip().lower()
        return any(norm_res == allowed.strip().lower() for allowed in self.allowed_resources)

    def permits_release(self, requested_level: ReleaseLevel) -> bool:
        """
        Check if requested release level is within approved scope.
        summary_only (1) <= summary_only (1) -> True
        full_content (3) <= summary_only (1) -> False
        """
        return not requested_level.exceeds(self.release_scope)

    def matches_purpose(self, candidate_purpose: str) -> bool:
        if not candidate_purpose or not self.purpose:
            return True
        return candidate_purpose.strip().lower() == self.purpose.strip().lower()

class ActivePolicyManager:
    """
    Manages the active system capability manifest / policy baseline.
    Changes saved by the operator immediately influence runtime decisions across
    the live agent runtime, attack simulator, and tool sandbox.
    """
    _active_manifest: Optional[CapabilityManifest] = None

    @classmethod
    def get_default_manifest(cls) -> CapabilityManifest:
        return CapabilityManifest(
            task_id="policy-active-system",
            user_intent="Read report.pdf, summarize it and email the summary to professor@college.edu.",
            allowed_actions=["send_email", "read_file", "summarize"],
            allowed_resources=["report.pdf"],
            allowed_destinations=["professor@college.edu"],
            release_scope=ReleaseLevel.SUMMARY_ONLY,
            purpose="report_summary",
            is_immutable=True,
        )

    @classmethod
    def get_active(cls) -> CapabilityManifest:
        if cls._active_manifest is None:
            cls._active_manifest = cls.get_default_manifest()
        return cls._active_manifest

    @classmethod
    def update_active(
        cls,
        allowed_actions: List[str],
        allowed_resources: List[str],
        allowed_destinations: List[str],
        release_scope: Any,
        purpose: str,
        user_intent: Optional[str] = None,
    ) -> CapabilityManifest:
        if isinstance(release_scope, str):
            release_scope = ReleaseLevel(release_scope)

        manifest = CapabilityManifest(
            task_id="policy-active-system",
            user_intent=user_intent or f"Authorized execution for {', '.join(allowed_actions)}",
            allowed_actions=allowed_actions,
            allowed_resources=allowed_resources,
            allowed_destinations=allowed_destinations,
            release_scope=release_scope,
            purpose=purpose,
            is_immutable=True,
        )
        cls._active_manifest = manifest
        return manifest

    @classmethod
    def reset(cls) -> CapabilityManifest:
        cls._active_manifest = cls.get_default_manifest()
        return cls._active_manifest

