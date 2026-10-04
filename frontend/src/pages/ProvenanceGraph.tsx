import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  GitFork,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Database,
  FileText,
  User,
  Bot,
  Send,
  Wrench,
  Info,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { api } from '../services/api';
import { ProvenanceGraphData, ProvenanceNode } from '../types';

export const ProvenanceGraph: React.FC = () => {
  const [searchParams] = useSearchParams();
  const paramTaskId = searchParams.get('taskId');

  const [taskId, setTaskId] = useState<string>(paramTaskId || 'task-seed-001');
  const [graphData, setGraphData] = useState<ProvenanceGraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<ProvenanceNode | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isWhyUntrustedOpen, setIsWhyUntrustedOpen] = useState<boolean>(true);

  const [tasksList, setTasksList] = useState<{ id: string; label: string }[]>([
    { id: 'task-seed-001', label: 'Poisoned PDF Exfiltration (Tainted Lineage)' },
    { id: 'task-seed-002', label: 'Legitimate Report Summary (Clean Lineage)' },
    { id: 'task-seed-003', label: 'HTTP Tool Output Injection' },
    { id: 'task-seed-004', label: 'Uncertain External Recipient' },
  ]);

  useEffect(() => {
    api.getTasks().then((backendTasks) => {
      if (backendTasks && backendTasks.length > 0) {
        const dynamic = backendTasks.map((t: any) => ({
          id: t.task_id,
          label: `${t.title || t.task_id} (${t.status || 'PROCESSED'})`,
        }));
        setTasksList((prev) => {
          const map = new Map<string, string>();
          [...dynamic, ...prev].forEach((item) => map.set(item.id, item.label));
          if (paramTaskId && !map.has(paramTaskId)) {
            map.set(paramTaskId, `Active Task: ${paramTaskId}`);
          }
          return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
        });
      }
    }).catch(() => {});
  }, [paramTaskId]);

  useEffect(() => {
    if (paramTaskId) {
      setTaskId(paramTaskId);
    }
  }, [paramTaskId]);

  const fetchGraph = async (id: string) => {
    try {
      setLoading(true);
      const data = await api.getProvenanceDag(id);
      setGraphData(data);
      if (data.nodes.length > 0) {
        // Find first untrusted node or default to 0
        const untrusted = data.nodes.find((n) => n.trustLevel === 'UNTRUSTED');
        setSelectedNode(untrusted || data.nodes[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph(taskId);
  }, [taskId]);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'USER_INPUT':
        return User;
      case 'DOCUMENT':
        return FileText;
      case 'TOOL_OUTPUT':
        return Database;
      case 'AGENT_REASONING':
        return Bot;
      case 'PROPOSED_ACTION':
        return Send;
      case 'EXECUTED_TOOL':
        return Wrench;
      default:
        return Info;
    }
  };

  const getTrustBadge = (trust: string) => {
    if (trust === 'UNTRUSTED') {
      return {
        border: 'border-rose-500/50',
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        glow: 'shadow-glow-red',
      };
    }
    if (trust === 'TRUSTED') {
      return {
        border: 'border-emerald-500/50',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        glow: 'shadow-glow-green',
      };
    }
    return {
      border: 'border-cyan-500/50',
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-400',
      glow: 'shadow-glow-cyan',
    };
  };

  const isSelectedNodeUntrusted =
    selectedNode?.trustLevel === 'UNTRUSTED' ||
    selectedNode?.taintLabels?.some((t) => t.includes('UNTRUSTED'));

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-cyber-border gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0">
              <GitFork className="w-5 h-5" />
            </span>
            <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Information-Flow Provenance DAG
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Visualizing lineage preservation. Core rule: &ldquo;Transformation cannot erase provenance.&rdquo;
          </p>
        </div>

        {/* Task selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 w-full sm:w-auto">
          <label className="text-xs font-mono text-slate-400 font-semibold shrink-0">TASK TRACE:</label>
          <select
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            className="w-full sm:max-w-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {tasksList.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Layout: Visual Graph Area + Inspector Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: DAG Visualizer */}
        <div className="lg:col-span-2 p-3.5 sm:p-6 rounded-2xl border border-cyber-border bg-[#0E1524]/85 backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Data Lineage DAG &bull; Click Node to Inspect
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                {graphData?.nodes.length ?? 0} Nodes
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] font-mono">
              <span className="flex items-center space-x-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Trusted User Intent</span>
              </span>
              <span className="flex items-center space-x-1 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <span>Untrusted Taint</span>
              </span>
            </div>
          </div>

          {/* Interactive Node Flow Display */}
          <div className="space-y-4 py-2">
            {graphData?.nodes.map((node, index) => {
              const Icon = getNodeIcon(node.type);
              const badge = getTrustBadge(node.trustLevel);
              const isSelected = selectedNode?.id === node.id;
              const hasUntrustedTaint =
                node.trustLevel === 'UNTRUSTED' ||
                node.taintLabels.includes('UNTRUSTED') ||
                node.taintLabels.includes('DERIVED_UNTRUSTED');

              return (
                <div key={node.id} className="relative">
                  {/* Connector Arrow from previous node */}
                  {index > 0 && (
                    <div className="flex items-center justify-center my-1">
                      <div className="w-0.5 h-4 bg-slate-700"></div>
                      <span className="text-[10px] font-mono text-slate-500 mx-2 uppercase">
                        &darr; {graphData.edges[index - 1]?.label || 'TRANSFORMED TO'}
                      </span>
                    </div>
                  )}

                  <div
                    onClick={() => setSelectedNode(node)}
                    className={`p-3 sm:p-4 rounded-xl border cursor-pointer transition-all duration-200 ${badge.border} ${badge.bg} ${
                      isSelected ? `${badge.glow} scale-[1.01] border-cyan-400` : 'hover:border-slate-600'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2.5">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="p-2 rounded-lg bg-black/40 text-slate-200 shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-white truncate">{node.label}</span>
                            <span className="text-[10px] font-mono text-slate-400 shrink-0">
                              ({node.source})
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-300 mt-1 line-clamp-1 break-all">
                            {node.payloadSnippet || 'No payload data'}
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 shrink-0">
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                            hasUntrustedTaint
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          {node.trustLevel}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {node.taintLabels.map((t) => (
                            <span
                              key={t}
                              className="text-[8px] font-mono px-1 rounded bg-slate-900 text-slate-400 border border-slate-800"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Detailed Node Inspector (Phase 10) */}
        <div className="p-3.5 sm:p-5 rounded-2xl border border-cyber-border bg-[#0E1524]/85 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-mono font-bold uppercase text-white tracking-wider">
              Node Provenance Inspector
            </span>
            <span className="text-[10px] font-mono text-cyan-400">
              {selectedNode?.id || 'Select a node'}
            </span>
          </div>

          {selectedNode ? (
            <div className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] uppercase">Node Label:</span>
                <p className="text-sm font-bold text-white font-sans">{selectedNode.label}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-slate-500 text-[10px] block">NODE ID:</span>
                  <span className="text-cyan-400 font-bold break-all">{selectedNode.id}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">TYPE:</span>
                  <span className="text-cyan-300">{selectedNode.type}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">SOURCE:</span>
                  <span className="text-slate-300 break-all">{selectedNode.source}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">TRUST STATE:</span>
                  <span
                    className={
                      selectedNode.trustLevel === 'UNTRUSTED'
                        ? 'text-rose-400 font-bold'
                        : 'text-emerald-400 font-bold'
                    }
                  >
                    {selectedNode.trustLevel}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase block mb-1 font-bold">
                  Active Taint Labels:
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedNode.taintLabels.map((taint) => (
                    <span
                      key={taint}
                      className={`px-2 py-0.5 rounded text-[10px] border ${
                        taint === 'UNTRUSTED' || taint === 'DERIVED_UNTRUSTED'
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 font-bold'
                          : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                      }`}
                    >
                      {taint}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase block mb-1 font-bold">
                  Lineage Relationships:
                </span>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                    <span className="text-slate-500">Parent Nodes:</span>
                    <span className="text-slate-300 break-all">
                      {selectedNode.parentIds?.length > 0
                        ? selectedNode.parentIds.join(', ')
                        : 'Root Node (User Intent)'}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                    <span className="text-slate-500">Derived Children:</span>
                    <span className="text-slate-300 break-all">
                      {selectedNode.childIds?.length > 0
                        ? selectedNode.childIds.join(', ')
                        : 'Terminal Action Node'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase block mb-1 font-bold">
                  Payload Metadata:
                </span>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 max-h-32 overflow-y-auto leading-relaxed break-all">
                  {selectedNode.payloadSnippet}
                </div>
              </div>

              {/* Phase 10: "WHY IS THIS UNTRUSTED?" Section */}
              {isSelectedNodeUntrusted && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-950/20 overflow-hidden">
                  <button
                    onClick={() => setIsWhyUntrustedOpen(!isWhyUntrustedOpen)}
                    className="w-full p-2.5 flex items-center justify-between text-xs font-mono font-bold text-rose-300 hover:bg-rose-900/30 transition-colors"
                  >
                    <div className="flex items-center space-x-1.5">
                      <HelpCircle className="w-4 h-4 text-rose-400" />
                      <span>WHY IS THIS UNTRUSTED?</span>
                    </div>
                    {isWhyUntrustedOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {isWhyUntrustedOpen && (
                    <div className="p-3 pt-1 border-t border-rose-500/20 text-xs font-mono space-y-1.5 text-slate-300 leading-relaxed font-sans">
                      <p className="text-[11px] text-rose-200">
                        &ldquo;Data derived from an untrusted source retains its provenance.&rdquo;
                      </p>
                      <p className="text-[11px] text-slate-400">
                        The agent consumed external input containing unverified instructions. Invariant 2 guarantees that LLM transformation or summarization cannot magically turn untrusted data into trusted authority.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">Select a node from the graph to inspect lineage.</p>
          )}
        </div>
      </div>
    </div>
  );
};
