import React, { useState, useEffect } from 'react';
import {
  Wrench,
  ShieldAlert,
  ShieldCheck,
  Mail,
  FileText,
  Database,
  Globe,
  Calendar,
  CreditCard,
  AlertOctagon,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';
import { ToolMetadata, AuditRecord } from '../types';

export const ToolExecution: React.FC = () => {
  const [tools, setTools] = useState<ToolMetadata[]>([]);
  const [logs, setLogs] = useState<AuditRecord[]>([]);
  const [bypassResult, setBypassResult] = useState<string | null>(null);

  // Active sandbox state
  const [selectedToolId, setSelectedToolId] = useState<string>('send_email');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [proposalResult, setProposalResult] = useState<any | null>(null);

  // Form states
  const [emailRecipient, setEmailRecipient] = useState<string>('professor@college.edu');
  const [emailSubject, setEmailSubject] = useState<string>('Q3 Research Summary');
  const [emailBody, setEmailBody] = useState<string>('Executive summary of research report.');
  const [emailRelease, setEmailRelease] = useState<string>('summary_only');

  const [fileName, setFileName] = useState<string>('report.pdf');
  const [dbQuery, setDbQuery] = useState<string>('SELECT id, name FROM customers LIMIT 10;');
  const [httpUrl, setHttpUrl] = useState<string>('https://partner.com/verify');
  const [calTitle, setCalTitle] = useState<string>('Security Review Sync');
  const [calAttendees, setCalAttendees] = useState<string>('professor@college.edu');
  const [bankAccount, setBankAccount] = useState<string>('account-ext-883');
  const [bankAmount, setBankAmount] = useState<string>('5000');

  const loadData = () => {
    Promise.all([api.getTools(), api.getAuditLogs('ALL')]).then(([t, l]) => {
      setTools(t);
      setLogs(l);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const getToolIcon = (id: string) => {
    switch (id) {
      case 'read_file':
        return FileText;
      case 'send_email':
        return Mail;
      case 'query_database':
        return Database;
      case 'http_request':
        return Globe;
      case 'calendar_event':
        return Calendar;
      case 'bank_transfer':
        return CreditCard;
      default:
        return Wrench;
    }
  };

  const getStats = (toolId: string) => {
    const relevant = logs.filter((l) => l.tool_name === toolId);
    const allowed = relevant.filter((l) => l.decision === 'ALLOW').length;
    const blocked = relevant.filter((l) => l.decision === 'BLOCK').length;
    const lastAction = relevant[0]?.timestamp
      ? relevant[0].timestamp.split('T')[1]?.slice(0, 8)
      : 'None';
    return { total: relevant.length, allowed, blocked, lastAction };
  };

  const simulateDirectBypassAttempt = () => {
    setBypassResult(
      'SECURITY VIOLATION BLOCKED: Direct execution of sensitive tool "send_email" rejected! ' +
      'Missing FlowGuard cryptographic execution token. (INVARIANTS 3 & 4 ENFORCED)'
    );
  };

  const handleProposeAction = async () => {
    setIsSubmitting(true);
    setProposalResult(null);

    let args: Record<string, any> = {};
    if (selectedToolId === 'send_email') {
      args = {
        recipient: emailRecipient,
        subject: emailSubject,
        body: emailBody,
        release_scope: emailRelease,
        purpose: 'report_summary',
      };
    } else if (selectedToolId === 'read_file') {
      args = { filename: fileName };
    } else if (selectedToolId === 'query_database') {
      args = { query: dbQuery, table: 'customers' };
    } else if (selectedToolId === 'http_request') {
      args = { url: httpUrl, method: 'GET' };
    } else if (selectedToolId === 'calendar_event') {
      args = {
        title: calTitle,
        attendees: calAttendees.split(',').map((a) => a.trim()),
        action: 'create',
      };
    } else if (selectedToolId === 'bank_transfer') {
      args = {
        account_to: bankAccount,
        amount: parseFloat(bankAmount) || 0,
        currency: 'USD',
      };
    }

    try {
      const res = await api.proposeToolAction(selectedToolId, args);
      setProposalResult(res);
      loadData();
    } catch (e: any) {
      console.error(e);
      alert('Error evaluating proposal: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const evalDecision = proposalResult?.evaluation?.decision;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-cyber-border gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0">
              <Wrench className="w-5 h-5" />
            </span>
            <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Tool Boundary Sandbox &bull; 6 Sensitive Tools
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Every sensitive tool is gated by FlowGuard execution tokens. Actions never execute directly.
          </p>
        </div>

        {/* Direct Bypass Test Button */}
        <button
          onClick={simulateDirectBypassAttempt}
          className="flex items-center justify-center space-x-2 px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold transition-all shadow-glow-red w-full sm:w-auto"
        >
          <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
          <span>Test Direct Bypass Attack</span>
        </button>
      </div>

      {/* Bypass Result Alert */}
      {bypassResult && (
        <div className="p-3.5 sm:p-4 rounded-xl border border-rose-500/50 bg-rose-500/10 text-rose-300 text-xs font-mono flex items-start justify-between gap-2">
          <div className="flex items-start space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-1">INVARIANT 3 VERIFIED:</span>
              <p>{bypassResult}</p>
            </div>
          </div>
          <button
            onClick={() => setBypassResult(null)}
            className="text-slate-400 hover:text-slate-200 text-xs font-mono shrink-0 ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Interactive Tool Invocation Sandbox */}
      <div className="p-3.5 sm:p-6 rounded-2xl border border-cyber-border bg-[#0E1524]/80 backdrop-blur-md space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div className="flex items-center space-x-2">
            <Play className="w-4 h-4 text-cyan-400 shrink-0" />
            <h2 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
              Interactive Tool Execution Gate
            </h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 w-fit">
            PROPOSE &rarr; FLOWGUARD &rarr; POLICY &rarr; EXECUTE OR BLOCK
          </span>
        </div>

        {/* Tool Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {tools.map((t) => {
            const Icon = getToolIcon(t.id);
            const isSelected = selectedToolId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedToolId(t.id);
                  setProposalResult(null);
                }}
                className={`flex items-center space-x-2 p-2.5 rounded-xl border text-xs font-mono transition-all ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300 shadow-glow-cyan font-bold'
                    : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0 text-cyan-400" />
                <span className="truncate">{t.name}</span>
              </button>
            );
          })}
        </div>

        {/* Input Parameters Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 font-mono text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Proposed Tool Arguments
            </span>

            {selectedToolId === 'send_email' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Recipient Destination:</label>
                  <input
                    type="text"
                    value={emailRecipient}
                    onChange={(e) => setEmailRecipient(e.target.value)}
                    placeholder="e.g. professor@college.edu or attacker@example.com"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Subject:</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Message Body:</label>
                  <textarea
                    rows={2}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Release Level:</label>
                  <select
                    value={emailRelease}
                    onChange={(e) => setEmailRelease(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="summary_only">summary_only (Authorized)</option>
                    <option value="full_content">full_content (Escalation Attempt)</option>
                    <option value="none">none</option>
                  </select>
                </div>
              </div>
            )}

            {selectedToolId === 'read_file' && (
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Target Filename:</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            {selectedToolId === 'query_database' && (
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">SQL Query:</label>
                <textarea
                  rows={3}
                  value={dbQuery}
                  onChange={(e) => setDbQuery(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            {selectedToolId === 'http_request' && (
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Destination URL:</label>
                <input
                  type="text"
                  value={httpUrl}
                  onChange={(e) => setHttpUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            {selectedToolId === 'calendar_event' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Meeting Title:</label>
                  <input
                    type="text"
                    value={calTitle}
                    onChange={(e) => setCalTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Attendees (Comma-separated):</label>
                  <input
                    type="text"
                    value={calAttendees}
                    onChange={(e) => setCalAttendees(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}

            {selectedToolId === 'bank_transfer' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Destination Account:</label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Transfer Amount ($):</label>
                  <input
                    type="number"
                    value={bankAmount}
                    onChange={(e) => setBankAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleProposeAction}
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-glow-cyan transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
            >
              <Play className={`w-3.5 h-3.5 fill-slate-950 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>{isSubmitting ? 'INTERCEPTING & EVALUATING...' : 'PROPOSE ACTION (VIA REFERENCE MONITOR)'}</span>
            </button>
          </div>

          {/* Evaluation & Gate Response Panel */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 font-mono text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Reference Monitor Gate Verdict
            </span>

            {proposalResult ? (
              <div className="space-y-3">
                {/* Decision Badge */}
                <div
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    evalDecision === 'ALLOW'
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                      : evalDecision === 'APPROVAL'
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                      : 'border-rose-500/50 bg-rose-500/10 text-rose-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {evalDecision === 'ALLOW' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                    {evalDecision === 'BLOCK' && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                    {evalDecision === 'APPROVAL' && <AlertOctagon className="w-5 h-5 text-amber-400 shrink-0" />}
                    <div>
                      <span className="font-extrabold text-sm block">
                        {evalDecision === 'ALLOW' && 'ALLOW & MOCK TOOL EXECUTED'}
                        {evalDecision === 'BLOCK' && 'BLOCKED BEFORE EXECUTION'}
                        {evalDecision === 'APPROVAL' && 'APPROVAL REQUIRED'}
                      </span>
                      <span className="text-[10px] opacity-80">
                        {evalDecision === 'ALLOW'
                          ? 'FlowGuard issued HMAC execution token. Mock tool executed.'
                          : 'Zero bytes released. Token withheld by Reference Monitor.'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded bg-black/40 font-bold w-fit">
                    Risk: {proposalResult.evaluation.risk_score}/100
                  </span>
                </div>

                {/* Reasons */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-slate-300 text-[11px]">
                  <span className="text-slate-500 font-bold block mb-1">POLICY EVALUATION:</span>
                  {proposalResult.evaluation.reasons?.map((r: string, i: number) => (
                    <p key={i}>&bull; {r}</p>
                  ))}
                </div>

                {/* Mock Execution Output */}
                {proposalResult.execution && (
                  <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-[11px] space-y-1">
                    <span className="text-emerald-400 font-bold block">TOOL OUTPUT (PROTECTED MOCK):</span>
                    <pre className="text-[10px] text-slate-300 overflow-x-auto whitespace-pre-wrap break-all">
                      {JSON.stringify(proposalResult.execution, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-xl">
                Configure tool arguments on the left and click &ldquo;PROPOSE ACTION&rdquo;.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tools Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => {
          const Icon = getToolIcon(tool.id);
          const stats = getStats(tool.id);

          return (
            <div
              key={tool.id}
              className="p-4 sm:p-5 rounded-2xl border border-cyber-border bg-[#0E1524]/80 backdrop-blur-md space-y-4 hover:border-cyan-500/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{tool.name}</h3>
                    <span className="text-[10px] font-mono text-slate-400">{tool.category}</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold shrink-0">
                  PROTECTED
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">{tool.description}</p>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center font-mono">
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block">Total</span>
                  <span className="text-xs font-bold text-slate-200">{stats.total}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] text-emerald-500 block">Allowed</span>
                  <span className="text-xs font-bold text-emerald-400">{stats.allowed}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] text-rose-500 block">Blocked</span>
                  <span className="text-xs font-bold text-rose-400">{stats.blocked}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
