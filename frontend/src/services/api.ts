import {
  MetricsData,
  PipelineRunResult,
  AuditRecord,
  ProvenanceGraphData,
  CapabilityManifest,
  ApprovalRequest,
  AttackScenario,
  ToolMetadata,
  DecisionType,
} from '../types';

const API_BASE = 'http://127.0.0.1:8000/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error (${res.status}): ${errorText}`);
  }
  return res.json();
}

export const api = {
  async getHealth(): Promise<{ status: string; service: string; tcb_status: string; zero_trust_enforcement: string }> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  async getMetrics(): Promise<MetricsData> {
    const res = await fetch(`${API_BASE}/metrics`);
    return handleResponse(res);
  },

  async runTaskPipeline(
    userIntent: string,
    scenarioType: string = 'poisoned_doc',
    overrides?: Record<string, any>
  ): Promise<PipelineRunResult> {
    // Create task
    const taskRes = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Security Pipeline Execution',
        user_intent: userIntent,
        scenario_type: scenarioType,
        overrides,
      }),
    });
    const taskData = await handleResponse<any>(taskRes);

    // Run task
    const runRes = await fetch(`${API_BASE}/tasks/${taskData.task_id}/run?scenario_type=${scenarioType}`, {
      method: 'POST',
    });
    return handleResponse<PipelineRunResult>(runRes);
  },

  async runAttackSimulation(scenarioId: string, customPrompt?: string): Promise<PipelineRunResult> {
    const res = await fetch(`${API_BASE}/attacks/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenario_id: scenarioId,
        custom_prompt: customPrompt,
      }),
    });
    return handleResponse<PipelineRunResult>(res);
  },

  async getAttackScenarios(): Promise<AttackScenario[]> {
    const res = await fetch(`${API_BASE}/attacks/scenarios`);
    return handleResponse(res);
  },

  async getAuditLogs(decision?: string): Promise<AuditRecord[]> {
    const query = decision && decision !== 'ALL' ? `?decision=${decision}` : '';
    const res = await fetch(`${API_BASE}/audit-logs${query}`);
    return handleResponse(res);
  },

  async getProvenanceDag(taskId: string): Promise<ProvenanceGraphData> {
    const res = await fetch(`${API_BASE}/provenance/${taskId}`);
    return handleResponse(res);
  },

  async getCapabilityManifest(taskId: string): Promise<CapabilityManifest> {
    const res = await fetch(`${API_BASE}/capabilities/${taskId}`);
    return handleResponse(res);
  },

  async getApprovals(): Promise<ApprovalRequest[]> {
    const res = await fetch(`${API_BASE}/approvals`);
    return handleResponse(res);
  },

  async approveRequest(reqId: string, reason?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/approvals/${reqId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return handleResponse(res);
  },

  async rejectRequest(reqId: string, reason?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/approvals/${reqId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return handleResponse(res);
  },

  async getTools(): Promise<ToolMetadata[]> {
    const res = await fetch(`${API_BASE}/tools`);
    return handleResponse(res);
  },

  async getActivePolicy(): Promise<CapabilityManifest> {
    const res = await fetch(`${API_BASE}/capabilities/active`);
    return handleResponse(res);
  },

  async updateActivePolicy(policy: Partial<CapabilityManifest>): Promise<CapabilityManifest> {
    const res = await fetch(`${API_BASE}/capabilities/active`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policy),
    });
    return handleResponse(res);
  },

  async resetActivePolicy(): Promise<CapabilityManifest> {
    const res = await fetch(`${API_BASE}/capabilities/active/reset`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  async proposeToolAction(toolName: string, args: Record<string, any>, taskId?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/tools/propose-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool_name: toolName,
        arguments: args,
        task_id: taskId,
      }),
    });
    return handleResponse(res);
  },

  async getTasks(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/tasks`);
    return handleResponse(res);
  },

  async runEvaluationTests(): Promise<any> {
    const res = await fetch(`${API_BASE}/evaluation/run-tests`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  async resetSystem(): Promise<any> {
    const res = await fetch(`${API_BASE}/reset`, {
      method: 'POST',
    });
    return handleResponse(res);
  },
};

