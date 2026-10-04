import React, { useState, useEffect } from 'react';
import {
  ScrollText,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  ShieldAlert,
  Clock,
  Code,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { api } from '../services/api';
import { AuditRecord } from '../types';

export const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditRecord[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const decisionQuery = filter === 'HIGH_RISK' ? 'ALL' : filter;
      const data = await api.getAuditLogs(decisionQuery);
      setLogs(data);
      if (data.length > 0 && !selectedRecord) {
        setSelectedRecord(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'HIGH_RISK' && log.risk_score < 70) {
      return false;
    }
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.tool_name.toLowerCase().includes(term) ||
      log.task_id.toLowerCase().includes(term) ||
      JSON.stringify(log.arguments).toLowerCase().includes(term) ||
      (log.reasons && log.reasons.some((r) => r.toLowerCase().includes(term)))
    );
  });

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `flowguard-audit-log-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCsv = () => {
    const headers = ['id', 'timestamp', 'task_id', 'tool_name', 'decision', 'risk_score', 'execution_status', 'reasons'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      l.task_id,
      l.tool_name,
      l.decision,
      l.risk_score,
      l.execution_status,
      `"${(l.reasons || []).join('; ').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers.join(','), ...rows.map((e) => e.join(','))].join('\n'));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute('download', `flowguard-audit-log-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-cyber-border gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0">
              <ScrollText className="w-5 h-5" />
            </span>
            <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Security Audit Log
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Tamper-evident runtime verification log for all agent tool evaluations.
          </p>
        </div>

        {/* Filter Pills and Export Controls */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {['ALL', 'ALLOW', 'BLOCK', 'APPROVAL', 'HIGH_RISK'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-mono font-bold transition-all ${
                filter === f
                  ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {f === 'ALL' ? 'ALL' : f === 'HIGH_RISK' ? 'HIGH RISK' : f}
            </button>
          ))}

          <div className="flex items-center space-x-1.5 pl-0 sm:pl-2 border-l-0 sm:border-l border-slate-800">
            <button
              onClick={handleExportJson}
              title="Export as JSON"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-cyan-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
            <button
              onClick={handleExportCsv}
              title="Export as CSV"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-300 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by tool name, recipient, argument, or reason..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Two Column Layout: Table + Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Audit Records Table */}
        <div className="lg:col-span-2 p-3.5 sm:p-5 rounded-2xl border border-cyber-border bg-[#0E1524]/80 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono min-w-[550px]">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="pb-3 font-medium">TIME</th>
                  <th className="pb-3 font-medium">TOOL</th>
                  <th className="pb-3 font-medium">TARGET / DESTINATION</th>
                  <th className="pb-3 font-medium">DECISION</th>
                  <th className="pb-3 font-medium">RISK</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No matching audit records found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const isSelected = selectedRecord?.id === log.id;
                    const dest =
                      log.arguments?.recipient ||
                      log.arguments?.url ||
                      log.arguments?.filename ||
                      'Internal';

                    return (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedRecord(log)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-cyan-500/10' : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-3 text-slate-400">
                          {log.timestamp ? log.timestamp.split('T')[1]?.slice(0, 8) : '18:42:13'}
                        </td>
                        <td className="py-3 font-bold text-slate-200">
                          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300">
                            {log.tool_name}
                          </span>
                        </td>
                        <td className="py-3 text-slate-300 max-w-[140px] truncate" title={String(dest)}>
                          {String(dest)}
                        </td>
                        <td className="py-3">
                          {log.decision === 'ALLOW' && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px]">
                              ALLOWED
                            </span>
                          )}
                          {log.decision === 'BLOCK' && (
                            <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-[10px]">
                              BLOCKED
                            </span>
                          )}
                          {log.decision === 'APPROVAL' && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-[10px]">
                              APPROVAL
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          <span
                            className={`font-bold ${
                              log.risk_score > 60
                                ? 'text-rose-400'
                                : log.risk_score > 30
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {log.risk_score}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <ChevronRight className="w-4 h-4 text-slate-500 inline" />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Event Inspector Detail Drawer */}
        <div className="p-3.5 sm:p-5 rounded-2xl border border-cyber-border bg-[#0E1524]/80 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-mono font-bold uppercase text-white">
              Security Evaluation Inspector
            </span>
            <span className="text-[10px] font-mono text-cyan-400">
              {selectedRecord?.id}
            </span>
          </div>

          {selectedRecord ? (
            <div className="space-y-4 text-xs font-mono">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-slate-500 text-[10px] block">VERDICT</span>
                  <span
                    className={`text-sm font-extrabold ${
                      selectedRecord.decision === 'ALLOW'
                        ? 'text-emerald-400'
                        : selectedRecord.decision === 'APPROVAL'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {selectedRecord.decision}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[10px] block">RISK SCORE</span>
                  <span className="text-sm font-extrabold text-white">
                    {selectedRecord.risk_score} / 100
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase block mb-1">
                  Proposed Arguments:
                </span>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 text-[11px] overflow-x-auto whitespace-pre-wrap break-all">
                  {JSON.stringify(selectedRecord.arguments, null, 2)}
                </pre>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase block mb-1">
                  Policy Evaluation Checks:
                </span>
                <div className="space-y-1.5">
                  {selectedRecord.policy_checks?.map((c, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg border text-[11px] ${
                        c.passed
                          ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300'
                          : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5 font-bold">
                        {c.passed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        <span>{c.name}</span>
                      </div>
                      <p className="text-slate-400 font-sans text-[11px] mt-0.5">{c.details}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase block mb-1">
                  Primary Reasons:
                </span>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-sans leading-relaxed text-xs">
                  {selectedRecord.reasons?.length > 0 ? (
                    selectedRecord.reasons.map((r, i) => <p key={i}>&bull; {r}</p>)
                  ) : (
                    <p className="text-emerald-400">Within approved capability manifest parameters.</p>
                  )}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] flex justify-between">
                <span className="text-slate-400">Execution Status:</span>
                <span className="text-cyan-400 font-bold">{selectedRecord.execution_status}</span>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">Select a record from the list.</p>
          )}
        </div>
      </div>
    </div>
  );
};
