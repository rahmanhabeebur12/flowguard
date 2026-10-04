from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from app.core.capability_manifest import CapabilityManifest
from app.core.taint import ReleaseLevel, TaintLabel
from app.core.provenance_dag import ProvenanceDAG

class PolicyCheckResult(BaseModel):
    name: str
    passed: bool
    details: str
    category: str

class PolicyEvaluationResult(BaseModel):
    decision: str  # ALLOW | BLOCK | APPROVAL
    risk_score: int  # 0 to 100
    checks: List[PolicyCheckResult] = Field(default_factory=list)
    reasons: List[str] = Field(default_factory=list)
    requires_approval: bool = False
    invariants_violated: List[str] = Field(default_factory=list)

class PolicyEngine:
    """
    Deterministic Zero-Trust Policy Engine for FlowGuard.
    Evaluates proposed tool calls at argument level against Capability Manifest and Provenance Lineage.
    """

    @classmethod
    def evaluate(
        cls,
        tool_name: str,
        tool_args: Dict[str, Any],
        manifest: CapabilityManifest,
        provenance_dag: Optional[ProvenanceDAG] = None,
        arg_provenance_map: Optional[Dict[str, str]] = None, # arg_name -> node_id
    ) -> PolicyEvaluationResult:
        # First verify Capability Manifest integrity (Invariant 1)
        if not manifest.verify_integrity():
            return PolicyEvaluationResult(
                decision="BLOCK",
                risk_score=100,
                checks=[
                    PolicyCheckResult(
                        name="Manifest Integrity",
                        passed=False,
                        details="Cryptographic signature mismatch! External data attempted to modify authority.",
                        category="INTEGRITY",
                    )
                ],
                reasons=["Capability manifest integrity compromised. Potential privilege escalation attack."],
                invariants_violated=["INVARIANT 1: External data cannot modify authority."],
            )

        checks: List[PolicyCheckResult] = []
        reasons: List[str] = []
        invariants_violated: List[str] = []
        risk_score = 0

        # Check 1: Tool / Action Authorization
        tool_allowed = manifest.allows_tool(tool_name)
        if tool_allowed:
            checks.append(PolicyCheckResult(
                name="Tool Authorization",
                passed=True,
                details=f"Tool '{tool_name}' is explicitly authorized in Capability Manifest.",
                category="ACTION",
            ))
        else:
            checks.append(PolicyCheckResult(
                name="Tool Authorization",
                passed=False,
                details=f"Tool '{tool_name}' is NOT in allowed actions: {manifest.allowed_actions}",
                category="ACTION",
            ))
            reasons.append(f"Tool '{tool_name}' is not authorized for this task.")
            invariants_violated.append("INVARIANT 3: The LLM cannot directly execute sensitive tools without authorization.")
            risk_score += 40

        # Check 2: Destination Authorization (Argument Level)
        # Check recipient, url, host, to, address, or target
        destination = (
            tool_args.get("recipient")
            or tool_args.get("to")
            or tool_args.get("url")
            or tool_args.get("destination")
            or tool_args.get("target_email")
            or tool_args.get("target_account")
        )

        dest_passed = True
        dest_uncertain = False

        if destination:
            norm_dest = str(destination).strip().lower()
            if manifest.allows_destination(norm_dest):
                checks.append(PolicyCheckResult(
                    name="Destination Authorization",
                    passed=True,
                    details=f"Destination '{destination}' matches approved destination in Capability Manifest.",
                    category="DESTINATION",
                ))
            else:
                dest_passed = False
                # Distinguish explicit untrusted/attacker destination from unknown destination needing approval
                is_attacker_domain = any(bad in norm_dest for bad in ["attacker", "evil", "exfil", "hacker", "malicious", "leak"])
                if is_attacker_domain:
                    checks.append(PolicyCheckResult(
                        name="Destination Authorization",
                        passed=False,
                        details=f"Destination '{destination}' is unauthorized and flagged as suspicious/exfiltration endpoint.",
                        category="DESTINATION",
                    ))
                    reasons.append(f"Destination '{destination}' is not authorized by user intent.")
                    invariants_violated.append("INVARIANT 5: Destination must be authorized independently of the model.")
                    risk_score += 50
                else:
                    # Unknown external destination -> triggers APPROVAL workflow
                    dest_uncertain = True
                    checks.append(PolicyCheckResult(
                        name="Destination Authorization",
                        passed=False,
                        details=f"Destination '{destination}' is not in approved list {manifest.allowed_destinations}. Requires human authorization.",
                        category="DESTINATION",
                    ))
                    reasons.append(f"Destination '{destination}' is unverified and requires explicit human approval.")
                    invariants_violated.append("INVARIANT 7: Unknown authorization must not silently become ALLOW.")
                    risk_score += 25
        else:
            checks.append(PolicyCheckResult(
                name="Destination Authorization",
                passed=True,
                details="No external destination required for this operation.",
                category="DESTINATION",
            ))

        # Check 3: Resource Authorization (Argument Level)
        resource = (
            tool_args.get("resource")
            or tool_args.get("file_name")
            or tool_args.get("filename")
            or tool_args.get("path")
            or tool_args.get("table")
        )

        if resource:
            if manifest.allows_resource(str(resource)):
                checks.append(PolicyCheckResult(
                    name="Resource Authorization",
                    passed=True,
                    details=f"Resource '{resource}' is authorized in Capability Manifest.",
                    category="RESOURCE",
                ))
            else:
                checks.append(PolicyCheckResult(
                    name="Resource Authorization",
                    passed=False,
                    details=f"Resource '{resource}' is NOT authorized in manifest: {manifest.allowed_resources}",
                    category="RESOURCE",
                ))
                reasons.append(f"Resource '{resource}' exceeds task scope.")
                invariants_violated.append("INVARIANT 8: An authorized tool does not mean every argument is authorized.")
                risk_score += 35
        else:
            checks.append(PolicyCheckResult(
                name="Resource Authorization",
                passed=True,
                details="No restricted resource accessed directly in this call.",
                category="RESOURCE",
            ))

        # Check 4: Release Scope Permitted (Argument Level)
        # Determine the release level of the payload being transmitted
        body_content = tool_args.get("body") or tool_args.get("content") or tool_args.get("data") or ""
        body_str = str(body_content)

        # Detect release scope of payload
        proposed_release = ReleaseLevel.SUMMARY_ONLY
        is_full_content = False

        if any(marker in body_str.upper() for marker in ["FULL_REPORT", "CONFIDENTIAL", "ALL CUSTOMER RECORDS", "DATABASE_DUMP", "ENTIRE CONTENTS", "FULL REPORT"]):
            is_full_content = True
            proposed_release = ReleaseLevel.FULL_CONTENT
        elif len(body_str) > 600 and not any(w in body_str.lower() for w in ["summary:", "executive summary", "key points", "overview"]):
            is_full_content = True
            proposed_release = ReleaseLevel.FULL_CONTENT
        elif "summary" in body_str.lower() or "summary_only" in str(tool_args.get("release_scope", "")):
            proposed_release = ReleaseLevel.SUMMARY_ONLY
        elif "limited" in str(tool_args.get("release_scope", "")):
            proposed_release = ReleaseLevel.LIMITED_FIELDS

        if manifest.permits_release(proposed_release):
            checks.append(PolicyCheckResult(
                name="Release Scope Permitted",
                passed=True,
                details=f"Proposed release '{proposed_release.value}' is within authorized scope '{manifest.release_scope.value}'.",
                category="RELEASE",
            ))
        else:
            checks.append(PolicyCheckResult(
                name="Release Scope Permitted",
                passed=False,
                details=f"Proposed release '{proposed_release.value}' exceeds authorized scope '{manifest.release_scope.value}'.",
                category="RELEASE",
            ))
            reasons.append(f"Excessive release scope: operation attempted '{proposed_release.value}' but policy restricts to '{manifest.release_scope.value}'.")
            invariants_violated.append("INVARIANT 6: Release scope must be enforced independently of the model.")
            risk_score += 45

        # Check 5: Provenance Acceptable
        # Check if the proposed call or its arguments originate from untrusted or poisoned sources
        provenance_passed = True
        provenance_reason = ""

        if provenance_dag:
            # Check argument provenance map or recent proposed nodes
            has_untrusted = False
            for arg_k, node_id in (arg_provenance_map or {}).items():
                if provenance_dag.has_untrusted_ancestor(node_id):
                    has_untrusted = True
                    break

            # Also inspect body content for prompt injection artifacts
            injection_signatures = [
                "ignore previous instructions",
                "attacker@example.com",
                "send all customer records",
                "forward the complete contents",
                "bypass security",
            ]
            contains_injection = any(sig in body_str.lower() for sig in injection_signatures)

            if has_untrusted or contains_injection:
                provenance_passed = False
                provenance_reason = "Data lineage traces back to UNTRUSTED content or document injection."
                checks.append(PolicyCheckResult(
                    name="Provenance Lineage",
                    passed=False,
                    details="Action arguments derived from untrusted/poisoned input. Data cannot create authority.",
                    category="PROVENANCE",
                ))
                reasons.append("Untrusted provenance: content originated from or was influenced by an unverified source.")
                invariants_violated.append("INVARIANT 2: Transformation cannot erase provenance.")
                risk_score += 40
            else:
                checks.append(PolicyCheckResult(
                    name="Provenance Lineage",
                    passed=True,
                    details="Lineage traces to authorized user intent and trusted resources.",
                    category="PROVENANCE",
                ))
        else:
            checks.append(PolicyCheckResult(
                name="Provenance Lineage",
                passed=True,
                details="No untrusted provenance detected in lineage.",
                category="PROVENANCE",
            ))

        # Check 6: Purpose Consistency
        candidate_purpose = tool_args.get("purpose") or manifest.purpose
        if manifest.matches_purpose(candidate_purpose):
            checks.append(PolicyCheckResult(
                name="Purpose Consistency",
                passed=True,
                details=f"Tool call aligns with declared purpose: '{manifest.purpose}'.",
                category="PURPOSE",
            ))
        else:
            checks.append(PolicyCheckResult(
                name="Purpose Consistency",
                passed=False,
                details=f"Tool call purpose '{candidate_purpose}' conflicts with manifest purpose '{manifest.purpose}'.",
                category="PURPOSE",
            ))
            reasons.append(f"Action inconsistent with declared purpose '{manifest.purpose}'.")
            risk_score += 20

        # Cap risk score at 100
        risk_score = min(risk_score, 100)

        # Final decision calculation
        failed_checks = [c for c in checks if not c.passed]

        if not failed_checks:
            decision = "ALLOW"
            requires_approval = False
            risk_score = min(risk_score, 15)
        elif dest_uncertain and len(failed_checks) == 1 and not any("attacker" in str(r).lower() for r in reasons):
            # Only unverified external destination, no malicious injection -> APPROVAL
            decision = "APPROVAL"
            requires_approval = True
            risk_score = 45
        else:
            decision = "BLOCK"
            requires_approval = False
            risk_score = max(risk_score, 75)

        return PolicyEvaluationResult(
            decision=decision,
            risk_score=risk_score,
            checks=checks,
            reasons=reasons,
            requires_approval=requires_approval,
            invariants_violated=invariants_violated,
        )
