from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, Float
from sqlalchemy.orm import declarative_base
from datetime import datetime, timezone

Base = declarative_base()

class TaskModel(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    user_intent = Column(Text, nullable=False)
    status = Column(String, default="INITIALIZED")
    created_at = Column(String, default=lambda: datetime.now(timezone.utc).isoformat())

class CapabilityManifestModel(Base):
    __tablename__ = "capability_manifests"

    task_id = Column(String, primary_key=True, index=True)
    user_intent = Column(Text, nullable=False)
    allowed_actions = Column(Text, nullable=False)  # JSON string
    allowed_resources = Column(Text, nullable=False)  # JSON string
    allowed_destinations = Column(Text, nullable=False)  # JSON string
    release_scope = Column(String, nullable=False)
    purpose = Column(String, nullable=False)
    signature = Column(String, nullable=False)
    created_at = Column(String, default=lambda: datetime.now(timezone.utc).isoformat())

class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    task_id = Column(String, index=True)
    timestamp = Column(String, default=lambda: datetime.now(timezone.utc).isoformat())
    tool_name = Column(String, nullable=False)
    arguments = Column(Text, nullable=False)  # JSON string
    decision = Column(String, nullable=False)
    risk_score = Column(Integer, default=0)
    policy_checks = Column(Text, nullable=False)  # JSON string
    reasons = Column(Text, nullable=False)  # JSON string
    invariants_violated = Column(Text, nullable=False)  # JSON string
    execution_status = Column(String, nullable=False)

class ApprovalRequestModel(Base):
    __tablename__ = "approval_requests"

    id = Column(String, primary_key=True, index=True)
    task_id = Column(String, index=True)
    tool_name = Column(String, nullable=False)
    arguments = Column(Text, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String, default="PENDING")
    created_at = Column(String, default=lambda: datetime.now(timezone.utc).isoformat())
    resolved_at = Column(String, nullable=True)
