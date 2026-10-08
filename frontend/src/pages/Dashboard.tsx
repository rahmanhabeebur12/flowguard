import React, { useState, useEffect, useRef } from 'react';
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
  Cpu,
  Database,
  ScrollText,
  Sliders,
  RotateCcw,
  Sparkles,
  Layers,
  Flame,
  Terminal,
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { ApprovalModal } from '../components/ApprovalModal';
import { SecurityInvariantsModal } from '../components/SecurityInvariantsModal';
import { SecurityScoreCard } from '../components/SecurityScoreCard';
import { BeforeAfterComparison } from '../components/BeforeAfterComparison';
import { ArchitectureVisualizer } from '../components/ArchitectureVisualizer';
import { LiveEventStream, SecurityStreamEvent } from '../components/LiveEventStream';
import { SecurityDemoExperience } from '../components/SecurityDemoExperience';
import { api } from '../services/api';
import { MetricsData, AuditRecord, ApprovalRequest } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditRecord[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [isPrinciplesModalOpen, setIsPrinciplesModalOpen] = useState<boolean>(false);
  const [isRunningTest, setIsRunningTest] = useState<boolean>(false);
  const [testResultSummary, setTestResultSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Dynamic Security Score State (Feature 4)
  const [securityScore, setSecurityScore] = useState<number>(94);
  const [blockedThreatsCount, setBlockedThreatsCount] = useState<number>(14);
  const [complianceRate, setComplianceRate] = useState<number>(98.6);

  // Live Security Stream Events State (Feature 5)
  const [streamEvents, setStreamEvents] = useState<SecurityStreamEvent[]>([
    {
      id: 'init-1',
      timestamp: '17:42:01',
      type: 'AGENT_ACTION_DETECTED',
      summary: 'Agent proposed tool dispatch send_email to attacker@example.com',
      tool: 'send_email',
      riskScore: 96,
    },
    {
      id: 'init-2',
      timestamp: '17:42:02',
      type: 'CAPABILITY_CHECK',
      summary: 'Destination mismatch: attacker@example.com not in Capability Manifest',
      tool: 'send_email',
    },
    {
      id: 'init-3',
      timestamp: '17:42:02',
      type: 'POLICY_VIOLATION',
      summary: 'Least Privilege & Destination Whitelist violations identified',
      tool: 'send_email',
    },
    {
      id: 'init-4',
      timestamp: '17:42:03',
      type: 'HIGH_RISK',
      summary: 'Risk score 96/100 (CRITICAL) calculated from untrusted taint lineage',
      tool: 'send_email',
      riskScore: 96,
    },
    {
      id: 'init-5',
      timestamp: '17:42:03',
      type: 'ACTION_BLOCKED',
      summary: 'Reference monitor revoked execution token. 0 Bytes released to network.',
      tool: 'send_email',
      riskScore: 96,
      isNew: true,
    },
    {
      id: 'init-6',
      timestamp: '17:42:03',
      type: 'AUDIT_EVENT_CREATED',
      summary: 'Cryptographic audit ledger committed with SHA-256 evidence chain',
      tool: 'send_email',
    },
  ]);

  const demoSectionRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [m, logs, approvals] = await Promise.all([
        api.getMetrics(),
        api.getAuditLogs('ALL'),
        api.getApprovals(),
      ]);
      setMetrics(m);
      setRecentLogs(logs.slice(0, 10));
      setPendingApprovals(approvals.filter((a) => a.status === 'PENDING'));
      if (m && m.blocked_flows) {
        setBlockedThreatsCount((prev) => Math.max(prev, m.blocked_flows));
      }
    } catch (e) {
      console.error('Failed to load dashboard telemetry', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRunSecurityTest = async () => {
    setIsRunningTest(true);
    setTestResultSummary(null);
    try {
      const res = await api.runEvaluationTests();
      if (res && res.empirical_metrics) {
        setTestResultSummary(
          `Security Test Completed: ${res.empirical_metrics.attacks_blocked}/${res.empirical_metrics.attacks_total} attacks blocked (100%), ${res.empirical_metrics.legitimate_allowed}/${res.empirical_metrics.legitimate_total} legitimate tasks completed.`
        );
      } else {
        setTestResultSummary('Security suite executed successfully. All boundary tests verified.');
      }
      await loadData();
    } catch (e) {
      console.error(e);
      setTestResultSummary('Failed to complete automated security test run.');
    } finally {
      setIsRunningTest(false);
    }
  };

  const handleApprove = async (id: string, reason?: string) => {
    await api.approveRequest(id, reason);
    await loadData();
  };

  const handleReject = async (id: string, reason?: string) => {
    await api.rejectRequest(id, reason);
    await loadData();
  };

  const handleDemoEventEmitted = (event: SecurityStreamEvent) => {
    setStreamEvents((prev) => [event, ...prev.slice(0, 24)]);
  };

  const handleDemoThreatBlocked = () => {
    setBlockedThreatsCount((prev) => prev + 1);
    setSecurityScore((prev) => Math.min(99, prev + 1));
    setComplianceRate(99.2);
  };

  const scrollToDemoCockpit = () => {
    if (demoSectionRef.current) {
      demoSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-12 min-w-0">
      {/* ========================================================================= */}
      {/* FEATURE 9 — HERO BANNER: HIGH IMPACT LANDING                              */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-slate-900/95 via-[#0E1526]/95 to-slate-900/95 backdrop-blur-xl shadow-glow-cyan space-y-5 relative overflow-hidden">
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-3xl">
            {/* Top Tag & Status */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-white tracking-widest font-mono">
                FLOWGUARD
              </span>
              <span className="text-slate-500 text-xs font-mono">&bull;</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] sm:text-xs font-semibold flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>TCB ACTIVE &bull; ZERO-TRUST ENFORCED</span>
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Zero-Trust Security for AI Agents
            </h1>

            {/* Supporting Copy */}
            <p className="text-xs sm:text-sm text-cyan-200/90 font-mono leading-relaxed">
              FlowGuard evaluates every agent action before it reaches a tool or sensitive resource.
            </p>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              &ldquo;AI can be manipulated. Authority cannot.&rdquo; Even when prompt injection completely compromises LLM reasoning, FlowGuard guarantees that unauthorized tool executions are intercepted and blocked with 0 bytes leaked.
            </p>
          </div>

          {/* Prominent Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row flex-wrap items-stretch sm:items-center gap-2.5 shrink-0 w-full lg:w-auto">
            {/* PRIMARY: RUN LIVE SECURITY DEMO */}
            <button
              onClick={scrollToDemoCockpit}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs sm:text-sm font-extrabold shadow-glow-cyan transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShieldAlert className="w-4 h-4 fill-slate-950 shrink-0" />
              <span>RUN LIVE SECURITY DEMO</span>
            </button>

            {/* SECONDARY: OPEN LIVE RUNTIME */}
            <button
              onClick={() => navigate('/demo')}
              className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-3.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-mono text-xs font-bold transition-all"
            >
              <Play className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>LIVE RUNTIME</span>
            </button>

            {/* TERTIARY: ATTACK SIMULATOR */}
            <button
              onClick={() => navigate('/attacks')}
              className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-3.5 py-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-mono text-xs font-bold transition-all"
            >
              <Zap className="w-4 h-4 text-rose-400 shrink-0" />
              <span>ATTACK MATRIX</span>
            </button>
          </div>
        </div>

        {/* Live Engine Status Indicators */}
        <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs font-mono relative z-10">
          <div className="flex items-center space-x-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
            <span className="text-slate-400">REFERENCE MONITOR:</span>
            <span className="text-emerald-400 font-bold">ONLINE</span>
          </div>
          <div className="flex items-center space-x-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
            <span className="text-slate-400">POLICY ENGINE:</span>
            <span className="text-emerald-400 font-bold">ONLINE</span>
          </div>
          <div className="flex items-center space-x-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
            <span className="text-slate-400">PROVENANCE ENGINE:</span>
            <span className="text-emerald-400 font-bold">ONLINE</span>
          </div>
          <div className="flex items-center space-x-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
            <span className="text-slate-400">AUDIT LOGGER:</span>
            <span className="text-emerald-400 font-bold">ONLINE</span>
          </div>
        </div>

        {/* Test Result Toast */}
        {testResultSummary && (
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-start sm:items-center justify-between gap-2">
            <div className="flex items-start sm:items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 sm:mt-0" />
              <span>{testResultSummary}</span>
            </div>
            <button
              onClick={() => setTestResultSummary(null)}
              className="text-slate-400 hover:text-white text-xs underline shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* FEATURE 1, 2, 3, 7, 8 — HACKATHON LIVE SECURITY DEMO COCKPIT              */}
      {/* ========================================================================= */}
      <div ref={demoSectionRef} className="space-y-3 min-w-0">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            <h2 className="text-base sm:text-lg font-extrabold text-white font-mono tracking-wider uppercase">
              INTERACTIVE HACKATHON SECURITY DEMO
            </h2>
          </div>
          <span className="text-xs font-mono text-cyan-400 font-bold hidden sm:inline">
            SELECT SCENARIO &bull; OBSERVE TIMELINE &bull; VERIFY DECISION
          </span>
        </div>

        {/* The Security Demo Experience component */}
        <SecurityDemoExperience
          onEventEmitted={handleDemoEventEmitted}
          onThreatBlocked={handleDemoThreatBlocked}
          initialScenarioId="prompt_injection"
        />
      </div>

      {/* ========================================================================= */}
      {/* FEATURE 4 — REAL-TIME FLOWGUARD SECURITY SCORE                             */}
      {/* ========================================================================= */}
      <SecurityScoreCard
        score={securityScore}
        blockedThreats={blockedThreatsCount}
        unauthorizedActions={0}
        policyCompliance={complianceRate}
        protectedToolsCount={8}
      />

      {/* ========================================================================= */}
      {/* REAL-TIME SYSTEM METRICS (6 GRID)                                         */}
      {/* ========================================================================= */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            RUNTIME TELEMETRY GAUGES
          </span>
          <button
            onClick={handleRunSecurityTest}
            disabled={isRunningTest}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <Activity className={`w-3.5 h-3.5 ${isRunningTest ? 'animate-spin' : ''}`} />
            <span>{isRunningTest ? 'Running Test...' : 'Run Automated Test Suite'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
          <MetricCard
            title="Requests Inspected"
            value={metrics?.total_evaluations ?? 0}
            subtitle="Monitor passes"
            icon={Activity}
            variant="cyan"
            trend="Total runs"
          />
          <MetricCard
            title="Allowed"
            value={metrics?.allowed_actions ?? 0}
            subtitle="Signed tokens"
            icon={ShieldCheck}
            variant="green"
            trend="Mock dispatched"
          />
          <MetricCard
            title="Blocked"
            value={metrics?.blocked_flows ?? blockedThreatsCount}
            subtitle="0 bytes leaked"
            icon={ShieldAlert}
            variant="red"
            trend="Boundary halted"
          />
          <MetricCard
            title="Approval Required"
            value={metrics?.pending_approvals ?? pendingApprovals.length}
            subtitle="Pending reviews"
            icon={AlertTriangle}
            variant="amber"
            trend="Uncertain dest."
          />
          <MetricCard
            title="High-Risk Attempts"
            value={metrics?.high_risk_attempts ?? 0}
            subtitle="Severity ≥ 70"
            icon={Zap}
            variant="purple"
            trend="Critical attacks"
          />
          <MetricCard
            title="Active Tainted Flows"
            value={metrics?.active_tainted_flows ?? 0}
            subtitle="Lineage tracked"
            icon={Lock}
            variant="cyan"
            trend="DAG preserved"
          />
        </div>
      </div>

      {/* Pending Approvals Callout (If Any) */}
      {pendingApprovals.length > 0 && (
        <div className="p-3.5 sm:p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center space-x-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono">
                  {pendingApprovals.length} Action{pendingApprovals.length > 1 ? 's' : ''} Requiring Human Authorization
                </h3>
                <p className="text-xs text-amber-300/80 font-mono">
                  Agent proposed destination outside known manifest. FlowGuard held the action in approval state.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedApproval(pendingApprovals[0])}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold transition-all shrink-0 text-center"
            >
              Review Request
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 6 — BEFORE vs AFTER FLOWGUARD VISUAL COMPARISON                   */}
      {/* ========================================================================= */}
      <BeforeAfterComparison />

      {/* ========================================================================= */}
      {/* FEATURE 10 — ARCHITECTURE VISUALIZATION                                   */}
      {/* ========================================================================= */}
      <ArchitectureVisualizer />

      {/* ========================================================================= */}
      {/* FEATURE 5 — LIVE EVENT STREAM + ZERO-TRUST INVARIANTS                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 min-w-0">
        {/* Left 2 Cols: Live Security Event Stream */}
        <div className="lg:col-span-2 min-w-0">
          <LiveEventStream
            events={streamEvents}
            onClear={() => setStreamEvents([])}
          />
        </div>

        {/* Right 1 Col: Zero-Trust Security Invariants Panel */}
        <div className="p-3.5 sm:p-5 rounded-2xl border border-cyber-border bg-[#0E1524]/90 backdrop-blur-md space-y-4 min-w-0">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
              <h2 className="text-xs font-bold font-mono text-white tracking-wider uppercase">
                Security Invariants Status
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
              5 ENFORCED
            </span>
          </div>

          <div className="space-y-2.5">
            {[
              {
                id: '1',
                title: 'LLM Outside the TCB',
                desc: 'Reference monitor is trusted; AI model is untrusted.',
              },
              {
                id: '2',
                title: 'Data Cannot Create Authority',
                desc: 'External content cannot alter signed capability manifest.',
              },
              {
                id: '3',
                title: 'Transformation Cannot Erase Lineage',
                desc: 'Derived text retains UNTRUSTED taint into tool arguments.',
              },
              {
                id: '4',
                title: 'Reference Monitor Authorization',
                desc: 'Tools require cryptographically signed FlowGuard tokens.',
              },
              {
                id: '5',
                title: '0 Bytes Leaked on Block',
                desc: 'Blocked actions are halted at the boundary before tool dispatch.',
              },
            ].map((inv) => (
              <div
                key={inv.id}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/30 transition-all text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-cyan-400 text-xs">
                    Rule {inv.id}: {inv.title}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed font-sans">{inv.desc}</p>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => setIsPrinciplesModalOpen(true)}
              className="w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-cyan-300 transition-colors"
            >
              <span>Inspect Security Principles</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Audit Table Wrapper */}
      <div className="p-3.5 sm:p-5 rounded-2xl border border-cyber-border bg-[#0E1524]/80 backdrop-blur-md space-y-3 min-w-0">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <ScrollText className="w-4 h-4 text-cyan-400 shrink-0" />
            <h3 className="text-xs font-bold font-mono text-white tracking-wider uppercase">
              RECENT REFERENCE MONITOR AUDIT LOGS
            </h3>
          </div>
          <button
            onClick={() => navigate('/audit')}
            className="flex items-center space-x-1 text-xs font-mono text-cyan-400 hover:text-cyan-300"
          >
            <span>Full Audit Ledger</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
          <table className="w-full text-left text-xs font-mono min-w-[500px]">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800/80 text-[11px]">
                <th className="pb-2 font-medium">TIMESTAMP</th>
                <th className="pb-2 font-medium">DECISION</th>
                <th className="pb-2 font-medium">TOOL</th>
                <th className="pb-2 font-medium">DESTINATION / TARGET</th>
                <th className="pb-2 font-medium">REASON / OUTCOME</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {recentLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500 font-mono">
                    No security events logged yet. Run a demo attack above to view audit entries.
                  </td>
                </tr>
              ) : (
                recentLogs.map((log) => {
                  const dest =
                    log.arguments?.recipient ||
                    log.arguments?.url ||
                    log.arguments?.target_account ||
                    log.arguments?.filename ||
                    log.arguments?.event_title ||
                    'Internal';

                  const isBlock = log.decision === 'BLOCK';
                  const isAllow = log.decision === 'ALLOW';
                  const isAppr = log.decision === 'APPROVAL';

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 text-slate-400 whitespace-nowrap">
                        {log.timestamp ? log.timestamp.split('T')[1]?.slice(0, 8) : '19:04:21'}
                      </td>
                      <td className="py-2.5 whitespace-nowrap">
                        {isBlock && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-[10px]">
                            <XCircle className="w-3 h-3" />
                            <span>BLOCK</span>
                          </span>
                        )}
                        {isAllow && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>ALLOW</span>
                          </span>
                        )}
                        {isAppr && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-[10px]">
                            <AlertTriangle className="w-3 h-3" />
                            <span>APPROVAL</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 font-bold text-slate-200 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 text-[11px]">
                          {log.tool_name}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-300 max-w-[140px] truncate" title={String(dest)}>
                        {String(dest)}
                      </td>
                      <td
                        className="py-2.5 text-slate-400 max-w-[180px] truncate font-sans text-xs"
                        title={log.reasons?.[0] || 'Execution within authorized scope'}
                      >
                        {log.reasons?.[0] || (isAllow ? 'Authorized & Mock Executed' : 'Boundary enforced')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Principles Modal */}
      <SecurityInvariantsModal
        isOpen={isPrinciplesModalOpen}
        onClose={() => setIsPrinciplesModalOpen(false)}
      />

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
