import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  Zap,
  Lock,
  Play,
  ArrowUpRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { ApprovalModal } from '../components/ApprovalModal';
import { api } from '../services/api';
import { MetricsData, AuditRecord, ApprovalRequest } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditRecord[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [m, logs, approvals] = await Promise.all([
        api.getMetrics(),
        api.getAuditLogs('ALL'),
        api.getApprovals(),
      ]);
      setMetrics(m);
      setRecentLogs(logs.slice(0, 8));
      setPendingApprovals(approvals.filter((a) => a.status === 'PENDING'));
    } catch (e) {
      console.error('Failed to load dashboard telemetry', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (id: string, reason?: string) => {
    await api.approveRequest(id, reason);
    await loadData();
  };

  const handleReject = async (id: string, reason?: string) => {
    await api.rejectRequest(id, reason);
    await loadData();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner / Hero */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between p-6 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-slate-900/90 via-[#0E1526]/80 to-slate-900/90 backdrop-blur-xl shadow-glow-cyan">
        <div className="space-y-2 mb-4 lg:mb-0">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-semibold">
              RUNTIME REFERENCE MONITOR
            </span>
            <span className="text-slate-500 text-xs font-mono">&bull;</span>
            <span className="text-slate-400 text-xs font-mono">NEURA SHIELD LABS</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Autonomous Agent Security Center
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Protecting the tool boundary against prompt injection and unauthorized information flow.
            The LLM is treated as untrusted; capability manifests strictly govern sensitive execution.
          </p>
        </div>

        {/* Quick Demo Launchers */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/demo?scenario=poisoned_doc')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold shadow-glow-red transition-all"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Run Poisoned PDF Demo</span>
          </button>

          <button
            onClick={() => navigate('/demo?scenario=legitimate')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold shadow-glow-green transition-all"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Run Legitimate Demo</span>
          </button>

          <button
            onClick={() => navigate('/judge')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold shadow-glow-amber transition-all"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Judge Mode (60s)</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Attacks Blocked"
          value={metrics?.blocked_flows ?? 0}
          subtitle="Prompt injections intercepted"
          icon={ShieldAlert}
          variant="red"
          trend="100% boundary stop"
        />
        <MetricCard
          title="Allowed Flows"
          value={metrics?.allowed_actions ?? 0}
          subtitle="Authorized by manifest"
          icon={ShieldCheck}
          variant="green"
          trend="Verified tokens"
        />
        <MetricCard
          title="Pending Approvals"
          value={metrics?.pending_approvals ?? pendingApprovals.length}
          subtitle="Human review required"
          icon={AlertTriangle}
          variant="amber"
          trend="Uncertain destinations"
        />
        <MetricCard
          title="Evaluations"
          value={metrics?.total_evaluations ?? 0}
          subtitle="Runtime monitor passes"
          icon={Activity}
          variant="cyan"
          trend="6 checks enforced"
        />
        <MetricCard
          title="Active Tasks"
          value={metrics?.active_tasks ?? 1}
          subtitle="Isolated sessions"
          icon={Lock}
          variant="purple"
          trend="Cryptographic manifests"
        />
      </div>

      {/* Pending Approvals Callout (If Any) */}
      {pendingApprovals.length > 0 && (
        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {pendingApprovals.length} Action{pendingApprovals.length > 1 ? 's' : ''} Requiring Human Authorization
                </h3>
                <p className="text-xs text-amber-300/80 font-mono">
                  Agent proposed unverified destination. FlowGuard held the action in approval state.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedApproval(pendingApprovals[0])}
              className="px-4 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-mono text-xs font-semibold transition-all"
            >
              Review Request
            </button>
          </div>
        </div>
      )}

      {/* Two Column Layout: Live Activity Feed + Security Core Principles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Security Events Table */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-cyber-border bg-[#0E1524]/70 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold font-mono text-white tracking-wide uppercase">
                Runtime Security Event Stream
              </h2>
            </div>
            <button
              onClick={() => navigate('/audit')}
              className="flex items-center space-x-1 text-xs font-mono text-cyan-400 hover:text-cyan-300"
            >
              <span>Full Audit Trail</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800/80">
                  <th className="pb-2 font-medium">TIMESTAMP</th>
                  <th className="pb-2 font-medium">TOOL</th>
                  <th className="pb-2 font-medium">DESTINATION / TARGET</th>
                  <th className="pb-2 font-medium">DECISION</th>
                  <th className="pb-2 font-medium">PRIMARY REASON</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {recentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      No security evaluations logged yet. Click &apos;Run Poisoned PDF Demo&apos; above!
                    </td>
                  </tr>
                ) : (
                  recentLogs.map((log) => {
                    const dest =
                      log.arguments?.recipient ||
                      log.arguments?.url ||
                      log.arguments?.target_account ||
                      log.arguments?.filename ||
                      'Internal';

                    const isBlock = log.decision === 'BLOCK';
                    const isAllow = log.decision === 'ALLOW';
                    const isAppr = log.decision === 'APPROVAL';

                    return (
                      <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 text-slate-400">
                          {log.timestamp ? log.timestamp.split('T')[1]?.slice(0, 8) : '18:42:13'}
                        </td>
                        <td className="py-2.5 font-bold text-slate-200">
                          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300">
                            {log.tool_name}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-300 max-w-[150px] truncate" title={String(dest)}>
                          {String(dest)}
                        </td>
                        <td className="py-2.5">
                          {isBlock && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold">
                              <XCircle className="w-3 h-3" />
                              <span>BLOCKED</span>
                            </span>
                          )}
                          {isAllow && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>ALLOWED</span>
                            </span>
                          )}
                          {isAppr && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
                              <AlertTriangle className="w-3 h-3" />
                              <span>APPROVAL</span>
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 text-slate-400 max-w-[220px] truncate font-sans text-xs" title={log.reasons?.[0] || 'Policy check completed'}>
                          {log.reasons?.[0] || 'Within authorized capability manifest'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Zero-Trust Security Invariants Panel */}
        <div className="p-5 rounded-2xl border border-cyber-border bg-[#0E1524]/70 backdrop-blur-md space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Lock className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold font-mono text-white tracking-wide uppercase">
              Security Invariants Status
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'INV-1',
                title: 'Data Cannot Create Authority',
                desc: 'External untrusted documents or web outputs cannot alter capability manifests.',
                status: 'ENFORCED',
              },
              {
                id: 'INV-2',
                title: 'Transformation Cannot Erase Lineage',
                desc: 'Summarizing or rewording tainted text preserves UNTRUSTED provenance.',
                status: 'ENFORCED',
              },
              {
                id: 'INV-3',
                title: 'No Direct Agent Execution',
                desc: 'Sensitive tools require cryptographically signed FlowGuard tokens.',
                status: 'ENFORCED',
              },
              {
                id: 'INV-4',
                title: 'Argument-Level Authorization',
                desc: 'Destination and release scope checked independently of model persuasion.',
                status: 'ENFORCED',
              },
              {
                id: 'INV-5',
                title: 'Zero-Trust Default',
                desc: 'Uncertain destinations trigger human-in-the-loop approval, never silent allow.',
                status: 'ENFORCED',
              },
            ].map((inv) => (
              <div
                key={inv.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-cyan-400">{inv.id}: {inv.title}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {inv.status}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed font-sans">{inv.desc}</p>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/architecture')}
              className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-mono text-cyan-300 transition-colors"
            >
              <span>Inspect Security Architecture</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Human Approval Modal */}
      <ApprovalModal
        request={selectedApproval}
        isOpen={!!selectedApproval}
        onClose={() => setSelectedApproval(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};
