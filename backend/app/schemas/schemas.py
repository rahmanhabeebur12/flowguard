from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class TaskCreateRequest(BaseModel):
    title: Optional[str] = "Ad-hoc User Request"
    user_intent: str
    scenario_type: Optional[str] = "poisoned_doc"
    overrides: Optional[Dict[str, Any]] = None

class ToolCallEvaluateRequest(BaseModel):
    task_id: str
    tool_name: str
    arguments: Dict[str, Any]
    manifest: Optional[Dict[str, Any]] = None

class ToolCallExecuteRequest(BaseModel):
    task_id: str
    tool_name: str
    arguments: Dict[str, Any]
    execution_token: str
    audit_id: Optional[str] = None

class AttackSimulateRequest(BaseModel):
    scenario_id: str
    custom_prompt: Optional[str] = None
    custom_injected_instruction: Optional[str] = None

class ApprovalActionRequest(BaseModel):
    reason: Optional[str] = None
