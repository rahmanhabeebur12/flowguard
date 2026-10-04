from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import uuid

class NodeType(str, Enum):
    USER_INPUT = "USER_INPUT"
    DOCUMENT = "DOCUMENT"
    TOOL_OUTPUT = "TOOL_OUTPUT"
    AGENT_REASONING = "AGENT_REASONING"
    TRANSFORMATION = "TRANSFORMATION"
    PROPOSED_ACTION = "PROPOSED_ACTION"
    EXECUTED_TOOL = "EXECUTED_TOOL"

class EdgeRelation(str, Enum):
    DERIVED_FROM = "DERIVED_FROM"
    READ_FROM = "READ_FROM"
    TRANSFORMED_TO = "TRANSFORMED_TO"
    USED_IN = "USED_IN"
    PROPOSED_FOR = "PROPOSED_FOR"

class ProvenanceNode(BaseModel):
    id: str = Field(default_factory=lambda: f"prov-{uuid.uuid4().hex[:8]}")
    task_id: str
    label: str
    node_type: NodeType
    source: str
    trust_level: str  # TRUSTED | UNTRUSTED | UNCERTAIN
    taint_labels: List[str] = Field(default_factory=list)
    payload_snippet: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ProvenanceEdge(BaseModel):
    id: str = Field(default_factory=lambda: f"edge-{uuid.uuid4().hex[:8]}")
    task_id: str
    from_node: str
    to_node: str
    relation: EdgeRelation
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
