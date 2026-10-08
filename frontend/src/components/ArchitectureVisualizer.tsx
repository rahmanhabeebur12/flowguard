import React, { useState } from 'react';
import {
  Bot,
  Shield,
  FileKey,
  Zap,
  Lock,
  Database,
  ArrowRight,
  ArrowDown,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface ArchNode {
  id: string;
  step: number;
  title: string;
  subtitle: string;
  icon: any;
  plane: 'UNTRUSTED' | 'TCB_GATEWAY' | 'POLICY' | 'RISK' | 'AUTHORIZATION' | 'PROTECTED';
  badge: string;
  badgeColor: string;
  borderColor: string;
  description: string;
  details: string[];
}

export const ArchitectureVisualizer: React.FC = () => {
  const [activeNodeId, setActiveNodeId] = useState<string>('policy_engine');

  const nodes: ArchNode[] = [
    {
      id: 'ai_agent',
      step: 1,
      title: 'AI AGENT',
      subtitle: 'Untrusted Reasoning',
      icon: Bot,
      plane: 'UNTRUSTED',
      badge: 'OUTSIDE TCB',
      badgeColor: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
      borderColor: 'border-rose-500/40 hover:border-rose-500',
      description: 'The LLM agent operates outside the Trusted Computing Base (TCB). External content and prompt injections may manipulate its reasoning, but it has zero direct authority.',
      details: [
        'Untrusted execution domain',
        'No direct API keys or tool access',
        'Produces unverified action proposals only',
      ],
    },
    {
      id: 'policy_engine',
      step: 2,
      title: 'FLOWGUARD POLICY ENGINE',
      subtitle: 'Reference Monitor',
      icon: Shield,
      plane: 'TCB_GATEWAY',
      badge: 'NON-BYPASSABLE',
      badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      borderColor: 'border-cyan-500/40 hover:border-cyan-400',
      description: 'The authoritative reference monitor intercepting every action proposal before execution. Enforces complete mediation, tamper-resistance, and formal verifiability.',
      details: [
        'Complete mediation of tool boundary',
        'Tamper-resistant isolated runtime',
        'Cryptographic token minting',
      ],
    },
    {
      id: 'capability_check',
      step: 3,
      title: 'CAPABILITY CHECK',
      subtitle: 'Signed Manifests',
      icon: FileKey,
      plane: 'POLICY',
      badge: 'SHA-256 SIGNED',
      badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
      borderColor: 'border-indigo-500/40 hover:border-indigo-400',
      description: 'Evaluates the proposed action against immutable user-authorized capability manifests compiled prior to execution.',
      details: [
        'Destination address whitelist validation',
        'Allowed tool function verification',
        'Release scope bounds enforcement',
      ],
    },
    {
      id: 'risk_engine',
      step: 4,
      title: 'RISK ENGINE',
      subtitle: 'Taint & Lineage DAG',
      icon: Zap,
      plane: 'RISK',
      badge: 'TAINT TRACKING',
      badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
      borderColor: 'border-purple-500/40 hover:border-purple-400',
      description: 'Information flow lineage engine tracking tainted external data across transformations to detect unauthorized declassification and exfiltration.',
      details: [
        'Directed Acyclic Graph (DAG) lineage',
        'Dynamic risk scoring (0-100)',
        'Egress destination anomaly detection',
      ],
    },
    {
      id: 'tool_auth',
      step: 5,
      title: 'TOOL AUTHORIZATION',
      subtitle: 'Token Issuance',
      icon: Lock,
      plane: 'AUTHORIZATION',
      badge: 'EXECUTION TOKENS',
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      borderColor: 'border-amber-500/40 hover:border-amber-400',
      description: 'Generates single-use, cryptographically signed execution tokens for authorized actions. Revokes authorization and records 0 bytes leaked on blocks.',
      details: [
        'Cryptographic single-use nonce tokens',
        'Human-in-the-loop quarantine support',
        'Zero-trust deny-by-default posture',
      ],
    },
    {
      id: 'protected_resource',
      step: 6,
      title: 'PROTECTED RESOURCE',
      subtitle: 'Isolated Tools & Data',
      icon: Database,
      plane: 'PROTECTED',
      badge: 'AIR-GAPPED',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      borderColor: 'border-emerald-500/40 hover:border-emerald-400',
      description: 'Underlying operating system tools, database connections, webhooks, and email dispatch services that only execute when presented with verified FlowGuard tokens.',
      details: [
        'Isolated execution perimeter',
        'Guaranteed 0 bytes leaked on blocks',
        'Tamper-evident audit recording',
      ],
    },
  ];

  const selectedNode = nodes.find((n) => n.id === activeNodeId) || nodes[1];

  return (
    <div className="p-3.5 sm:p-6 rounded-2xl border border-cyber-border bg-gradient-to-br from-[#0B0F17]/95 via-[#0E1526]/90 to-[#0A0E18]/95 backdrop-blur-xl shadow-2xl space-y-4 sm:space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 border-b border-slate-800 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Layers className="w-4 h-4" />
            </span>
            <h2 className="text-sm sm:text-base md:text-lg font-extrabold text-white font-mono tracking-wide">
              ZERO-TRUST ARCHITECTURE PIPELINE
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            End-to-end authorization journey: from untrusted agent proposal to verified resource execution
          </p>
        </div>

        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] sm:text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>REFERENCE MONITOR ACTIVE</span>
        </div>
      </div>

      {/* Visual Pipeline Nodes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {nodes.map((node, index) => {
          const Icon = node.icon;
          const isSelected = node.id === activeNodeId;

          return (
            <div
              key={node.id}
              onClick={() => setActiveNodeId(node.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between relative group ${
                isSelected
                  ? 'bg-slate-900/90 border-cyan-400 shadow-glow-cyan ring-1 ring-cyan-400/50'
                  : `bg-slate-950/60 ${node.borderColor} hover:bg-slate-900/50`
              }`}
            >
              {/* Step indicator */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-slate-500 font-bold">
                  0{node.step}
                </span>
                <span className={`text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${node.badgeColor}`}>
                  {node.badge}
                </span>
              </div>

              {/* Node Icon + Name */}
              <div className="space-y-1.5 my-1">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="font-mono font-bold text-xs text-white leading-tight">
                  {node.title}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  {node.subtitle}
                </div>
              </div>

              {/* Status footer */}
              <div className="mt-2 pt-1.5 border-t border-slate-800/80 text-[9px] font-mono text-slate-500 flex items-center justify-between">
                <span>{isSelected ? 'ACTIVE' : 'INSPECT'}</span>
                {index < nodes.length - 1 && (
                  <span className="hidden lg:inline text-cyan-400">&rarr;</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Node Details Drawer */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row md:items-start justify-between gap-4 text-xs font-mono">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
              ARCHITECTURE LAYER 0{selectedNode.step}:
            </span>
            <span className="text-white font-extrabold text-sm font-mono">
              {selectedNode.title}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded border ${selectedNode.badgeColor}`}>
              {selectedNode.badge}
            </span>
          </div>
          <p className="text-slate-300 font-sans text-xs leading-relaxed">
            {selectedNode.description}
          </p>
        </div>

        {/* Feature bullets */}
        <div className="space-y-1 text-slate-400 text-[11px] shrink-0 border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-4">
          <div className="text-slate-300 font-bold mb-1">Layer Guarantees:</div>
          {selectedNode.details.map((detail, idx) => (
            <div key={idx} className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{detail}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
