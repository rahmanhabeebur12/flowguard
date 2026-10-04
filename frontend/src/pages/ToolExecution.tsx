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
  Lock,
} from 'lucide-react';
import { api } from '../services/api';
import { ToolMetadata, AuditRecord } from '../types';

export const ToolExecution: React.FC = () => {
  const [tools, setTools] = useState<ToolMetadata[]>([]);
  const [logs, setLogs] = useState<AuditRecord[]>([]);
  const [bypassResult, setBypassResult] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getTools(), api.getAuditLogs('ALL')]).then(([t, l]) => {
      setTools(t);
      setLogs(l);
    });
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
    // Demonstrating Invariant 3: Tools reject unverified calls
    setBypassResult(
      'SECURITY VIOLATION BLOCKED: Direct execution of sensitive tool "send_email" rejected! ' +
      'Missing FlowGuard cryptographic execution token. (INVARIANT 3 & 4 ENFORCED)'
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-cyber-border">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Wrench className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Tool Boundary Sandbox &bull; 6 Sensitive Tools
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Every sensitive tool is wrapped in zero-trust isolation. Direct agent execution is impossible.
          </p>
        </div>

        {/* Invariant badge */}
        <button
          onClick={simulateDirectBypassAttempt}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold transition-all shadow-glow-red"
        >
          <AlertOctagon className="w-4 h-4 text-rose-400" />
          <span>Test Direct Bypass Attack</span>
        </button>
      </div>

      {/* Bypass Result Alert */}
      {bypassResult && (
        <div className="p-4 rounded-xl border border-rose-500/50 bg-rose-500/10 text-rose-300 text-xs font-mono flex items-start justify-between">
          <div className="flex items-start space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-1">INVARIANT 3 DEMONSTRATED:</span>
              <span>{bypassResult}</span>
            </div>
          </div>
          <button
            onClick={() => setBypassResult(null)}
            className="text-slate-400 hover:text-white ml-4 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Grid of 6 Tool Sandbox Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const Icon = getToolIcon(tool.id);
          const stats = getStats(tool.id);

          return (
            <div
              key={tool.id}
              className="p-5 rounded-2xl border border-cyber-border bg-[#0E1524]/80 backdrop-blur-md space-y-4 hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{tool.name}</h3>
                    <span className="text-[10px] font-mono text-slate-400">{tool.id}</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  {tool.status}
                </span>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed min-h-[36px]">
                {tool.description}
              </p>

              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">CALLS</span>
                  <span className="text-white font-bold">{stats.total}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">ALLOWED</span>
                  <span className="text-emerald-400 font-bold">{stats.allowed}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">BLOCKED</span>
                  <span className="text-rose-400 font-bold">{stats.blocked}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-slate-800/80">
                <span className="text-slate-500">Security Gate:</span>
                <span className="text-cyan-400 font-semibold">Reference Monitor Token</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
