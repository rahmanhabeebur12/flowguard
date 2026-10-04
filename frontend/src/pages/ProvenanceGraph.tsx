import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { api } from '../services/api';
import { ProvenanceGraphData, ProvenanceNode } from '../types';

export const ProvenanceGraph: React.FC = () => {
  const [taskId, setTaskId] = useState<string>('task-seed-001');
  const [graphData, setGraphData] = useState<ProvenanceGraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<ProvenanceNode | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const availableTasks = [
    { id: 'task-seed-001', label: 'Poisoned PDF Exfiltration (Tainted Lineage)' },
    { id: 'task-seed-002', label: 'Legitimate Report Summary (Clean Lineage)' },
    { id: 'task-seed-003', label: 'HTTP Tool Output Injection' },
    { id: 'task-seed-004', label: 'Uncertain External Recipient' },
  ];

  const fetchGraph = async (id: string) => {
    try {
      setLoading(true);
      const data = await api.getProvenanceDag(id);
      setGraphData(data);
      if (data.nodes.length > 0) {
        setSelectedNode(data.nodes[0]);
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-cyber-border">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <GitFork className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Information-Flow Provenance DAG
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Visualizing lineage preservation. Core rule: &ldquo;Transformation cannot erase provenance.&rdquo;
          </p>
        </div>

        {/* Task selector */}
        <div className="mt-3 md:mt-0 flex items-center space-x-2">
          <label className="text-xs font-mono text-slate-400">Task Trace:</label>
          <select
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {availableTasks.map((t) => (
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
        <div className="lg:col-span-2 p-6 rounded-2xl border border-cyber-border bg-[#0E1524]/80 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-white uppercase">
                Data Lineage Graph
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                {graphData?.nodes.length ?? 0} Nodes &bull; {graphData?.edges.length ?? 0} Edges
              </span>
            </div>
            <div className="flex items-center space-x-3 text-[10px] font-mono">
              <span className="flex items-center space-x-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Trusted</span>
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
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${badge.border} ${badge.bg} ${
                      isSelected ? `${badge.glow} scale-[1.01] border-cyan-400` : 'hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-black/40 text-slate-200">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-white">{node.label}</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              ({node.source})
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-300 mt-1 line-clamp-1">
                            {node.payloadSnippet || 'No payload data'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-1">
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                            hasUntrustedTaint
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          {node.trustLevel}
                        </span>
                        <div className="flex space-x-1">
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

        {/* Right 1 Col: Detailed Node Inspector */}
        <div className="p-5 rounded-2xl border border-cyber-border bg-[#0E1524]/80 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-mono font-bold uppercase text-white">
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

              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-slate-500 text-[10px] block">TYPE:</span>
                  <span className="text-cyan-400 font-bold">{selectedNode.type}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">SOURCE:</span>
                  <span className="text-slate-300">{selectedNode.source}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">TRUST STATUS:</span>
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
                <div>
                  <span className="text-slate-500 text-[10px] block">CREATED AT:</span>
                  <span className="text-slate-400 text-[10px]">
                    {selectedNode.createdAt.split('T')[1]?.slice(0, 8)}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase block mb-1">
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
                <span className="text-slate-500 text-[10px] uppercase block mb-1">
                  Lineage Ancestry:
                </span>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Parent Nodes:</span>
                    <span className="text-slate-300">
                      {selectedNode.parentIds?.length > 0
                        ? selectedNode.parentIds.join(', ')
                        : 'Root Node (User Intent)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Derived Children:</span>
                    <span className="text-slate-300">
                      {selectedNode.childIds?.length > 0
                        ? selectedNode.childIds.join(', ')
                        : 'Terminal Action Node'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase block mb-1">
                  Payload Inspection:
                </span>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 max-h-36 overflow-y-auto leading-relaxed">
                  {selectedNode.payloadSnippet}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-sans text-slate-400">
                <span className="text-cyan-400 font-bold block mb-0.5">
                  Invariant 2 Enforcement:
                </span>
                Transformation of untrusted data retains the <code className="text-rose-400">DERIVED_UNTRUSTED</code> label all the way into proposed tool arguments.
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">Select a node from the graph.</p>
          )}
        </div>
      </div>
    </div>
  );
};
