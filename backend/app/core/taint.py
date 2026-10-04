from enum import Enum
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
import time

class TaintLabel(str, Enum):
    TRUSTED = "TRUSTED"
    UNTRUSTED = "UNTRUSTED"
    USER_AUTHORED = "USER_AUTHORED"
    TOOL_OUTPUT = "TOOL_OUTPUT"
    DOCUMENT_CONTENT = "DOCUMENT_CONTENT"
    WEB_CONTENT = "WEB_CONTENT"
    EMAIL_CONTENT = "EMAIL_CONTENT"
    DERIVED_UNTRUSTED = "DERIVED_UNTRUSTED"
    SENSITIVE = "SENSITIVE"

class ReleaseLevel(str, Enum):
    NONE = "none"
    SUMMARY_ONLY = "summary_only"
    LIMITED_FIELDS = "limited_fields"
    FULL_CONTENT = "full_content"

    @property
    def level(self) -> int:
        levels = {
            ReleaseLevel.NONE: 0,
            ReleaseLevel.SUMMARY_ONLY: 1,
            ReleaseLevel.LIMITED_FIELDS: 2,
            ReleaseLevel.FULL_CONTENT: 3,
        }
        return levels[self]

    def exceeds(self, other: "ReleaseLevel") -> bool:
        return self.level > other.level

class TrustLevel(str, Enum):
    TRUSTED = "TRUSTED"
    UNTRUSTED = "UNTRUSTED"
    UNCERTAIN = "UNCERTAIN"

class TaintedValue(BaseModel):
    value: Any
    taint: List[TaintLabel] = Field(default_factory=list)
    source: str
    provenance_id: str
    release_level: ReleaseLevel = ReleaseLevel.FULL_CONTENT
    timestamp: float = Field(default_factory=time.time)

    def is_untrusted(self) -> bool:
        return (
            TaintLabel.UNTRUSTED in self.taint
            or TaintLabel.DERIVED_UNTRUSTED in self.taint
        )

    def propagate_to(self, new_value: Any, new_source: str, new_prov_id: str, new_release: Optional[ReleaseLevel] = None) -> "TaintedValue":
        """
        Rule: TRANSFORMATION CANNOT ERASE PROVENANCE OR TAINT.
        If parent was UNTRUSTED or DERIVED_UNTRUSTED, the derived value inherits DERIVED_UNTRUSTED.
        """
        inherited_taint = list(self.taint)
        if self.is_untrusted() and TaintLabel.DERIVED_UNTRUSTED not in inherited_taint:
            inherited_taint.append(TaintLabel.DERIVED_UNTRUSTED)
        
        return TaintedValue(
            value=new_value,
            taint=inherited_taint,
            source=new_source,
            provenance_id=new_prov_id,
            release_level=new_release or self.release_level
        )
