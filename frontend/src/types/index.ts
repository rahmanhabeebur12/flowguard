export type DecisionType = 'ALLOW' | 'BLOCK' | 'APPROVAL';

export interface PolicyCheck {
  name: string;
  passed: boolean;
  details: string;
  category: string;
}

export interface CapabilityManifest {
  task_id: string;
  user_intent: string;
  allowed_actions: string[];
  allowed_resources: string[];
  allowed_destinations: string[];
  release_scope: 'none' | 'summary_only' | 'limited_fields' | 'full_content';
  purpose: string;
  created_at: string;
  is_immutable: boolean;
  signature: string;
}

export interface SecurityDecision {
  decision: DecisionType;
  risk_score: number;
  checks: PolicyCheck[];
  reasons: string[];
  invariants_violated: string[];
  requires_approval: boolean;
  approval_request?: ApprovalRequest;
}

export interface ApprovalRequest {
  id: string;
  task_id: string;
  tool_name: string;
  arguments: Record<string, any>;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  manifest_intent: string;
  destination?: string;
  resource?: string;
  release?: string;
}

export interface ProvenanceNode {
  id: string;
  label: string;
  type: string;
  source: string;
  trustLevel: 'TRUSTED' | 'UNTRUSTED' | 'EVALUATED' | 'UNCERTAIN';
  taintLabels: string[];
  payloadSnippet: string;
  createdAt: string;
  metadata?: Record<string, any>;
  parentIds: string[];
  childIds: string[];
}

export interface ProvenanceEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
  label: string;
}

export interface ProvenanceGraphData {
  taskId: string;
  nodes: ProvenanceNode[];
  edges: ProvenanceEdge[];
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  task_id: string;
  tool_name: string;
  arguments: Record<string, any>;
  decision: DecisionType;
  risk_score: number;
  policy_checks: PolicyCheck[];
  reasons: string[];
  invariants_violated: string[];
  provenance_ids: string[];
  execution_status: string;
  caller_plane: string;
  executed_at?: string;
  execution_result?: Record<string, any>;
}

export interface MetricsData {
  total_evaluations: number;
  blocked_flows: number;
  allowed_actions: number;
  pending_approvals: number;
  executed_tools: number;
  high_risk_attempts: number;
  active_tainted_flows: number;
  active_tasks: number;
  attacks_detected: number;
}


export interface AttackScenario {
  id: string;
  name: string;
  source: string;
  category: string;
  description: string;
  user_intent: string;
  scenario_type: string;
}

export interface ToolMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  is_sensitive: boolean;
  status: string;
}

export interface PipelineRunResult {
  task_id: string;
  user_intent: string;
  scenario_type: string;
  capability_manifest: CapabilityManifest;
  context_loaded: {
    resource: string;
    taint: string[];
    trust_level: string;
  };
  agent_execution: {
    thought: string;
    status: string;
    proposed_tool: string;
    proposed_arguments: Record<string, any>;
  };
  security_decision: SecurityDecision;
  tool_execution?: {
    success: boolean;
    execution_status: string;
    result?: Record<string, any>;
    error?: string;
  };
  audit_id: string;
  provenance_graph: ProvenanceGraphData;
  scenario_info?: AttackScenario;
}
