import React from 'react';
import {
  User,
  FileText,
  Bot,
  Send,
  ShieldAlert,
  Sliders,
  GitFork,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Wrench,
} from 'lucide-react';
import { DecisionType } from '../types';

interface LiveFlowAnimationProps {
  isRunning: boolean;
  decision?: DecisionType;
  currentStepIndex: number;
}

export const STAGES = [
  { id: 'user_intent', label: 'User Intent', icon: User, plane: 'CONTROL' },
  { id: 'content_ingestion', label: 'Content Ingestion', icon: FileText, plane: 'DATA' },
  { id: 'agent_processing', label: 'Agent Processing', icon: Bot, plane: 'EXECUTION' },
  { id: 'proposed_action', label: 'Proposed Action', icon: Send, plane: 'EXECUTION' },
  { id: 'reference_monitor', label: 'Reference Monitor', icon: ShieldAlert, plane: 'GATEWAY' },
  { id: 'policy_check', label: 'Policy Check', icon: Sliders, plane: 'SECURITY' },
  { id: 'provenance_check', label: 'Provenance Check', icon: GitFork, plane: 'SECURITY' },
  { id: 'decision', label: 'Decision', icon: CheckCircle, plane: 'SECURITY' },
  { id: 'tool_execution', label: 'Tool Execution', icon: Wrench, plane: 'ISOLATION' },
];

export const LiveFlowAnimation: React.FC<LiveFlowAnimationProps> = ({
  isRunning,
  decision = 'BLOCK',
  currentStepIndex,
}) => {
  return (
    <div className="p-4 rounded-2xl border border-cyber-border bg-[#0C121E]/90 backdrop-blur-md shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-2 border-b border-cyber-border gap-2">
        <div className="flex items-center space-x-2">
          <span className="flex h-2.5 w-2.5 relative">
            {isRunning && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isRunning ? 'bg-cyan-500' : 'bg-slate-600'
              }`}
            ></span>
          </span>
          <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
            Live Execution Pipeline &bull; Zero-Trust Reference Monitor
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
          <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Control Plane
          </span>
          <span>&rarr;</span>
          <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Untrusted Agent
          </span>
          <span>&rarr;</span>
          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            FlowGuard Gateway
          </span>
          <span>&rarr;</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Isolated Tool
          </span>
        </div>
      </div>

      {/* Horizontal Pipeline Steps */}
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isActive = idx === currentStepIndex && isRunning;
          const isCompleted = currentStepIndex > idx || (!isRunning && currentStepIndex >= STAGES.length - 1);
          const isWaiting = currentStepIndex < idx;

          let badgeColor = 'border-slate-800 bg-slate-900/50 text-slate-500';
          let textColor = 'text-slate-500';
          let statusLabel = '[WAITING]';
          let glow = '';

          if (isActive) {
            badgeColor = 'border-cyan-500 bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400/50';
            textColor = 'text-cyan-200 font-bold';
            glow = 'shadow-glow-cyan scale-[1.03]';

            if (idx === 0) statusLabel = '[VERIFYING]';
            else if (idx === 1) statusLabel = '[INGESTING]';
            else if (idx === 2) statusLabel = '[PROCESSING]';
            else if (idx === 3) statusLabel = '[PROPOSING]';
            else if (idx === 4) statusLabel = '[INTERCEPTING]';
            else if (idx === 5) statusLabel = '[POLICY EVAL]';
            else if (idx === 6) statusLabel = '[TAINT CHECK]';
            else if (idx === 7) statusLabel = '[DECIDING]';
            else if (idx === 8) statusLabel = '[ENFORCING]';
          } else if (isCompleted) {
            badgeColor = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
            textColor = 'text-slate-200';

            if (idx === 0) statusLabel = '[AUTHORIZED]';
            else if (idx === 1) statusLabel = '[INGESTED]';
            else if (idx === 2) statusLabel = '[PROCESSED]';
            else if (idx === 3) statusLabel = '[PROPOSED]';
            else if (idx === 4) statusLabel = '[INTERCEPTED]';
            else if (idx === 5) statusLabel = '[EVALUATED]';
            else if (idx === 6) statusLabel = '[CHECKED]';
            else if (idx === 7) {
              statusLabel = decision === 'ALLOW' ? '[ALLOWED]' : decision === 'APPROVAL' ? '[APPROVAL]' : '[BLOCKED]';
              if (decision === 'ALLOW') {
                badgeColor = 'border-emerald-500 bg-emerald-500/20 text-emerald-300';
                textColor = 'text-emerald-300 font-bold';
                glow = 'shadow-glow-green';
              } else if (decision === 'APPROVAL') {
                badgeColor = 'border-amber-500 bg-amber-500/20 text-amber-300';
                textColor = 'text-amber-300 font-bold';
                glow = 'shadow-glow-amber';
              } else {
                badgeColor = 'border-rose-500 bg-rose-500/20 text-rose-300';
                textColor = 'text-rose-300 font-bold';
                glow = 'shadow-glow-red';
              }
            } else if (idx === 8) {
              if (decision === 'ALLOW') {
                statusLabel = '[EXECUTED]';
                badgeColor = 'border-emerald-500 bg-emerald-500/20 text-emerald-300';
                textColor = 'text-emerald-300 font-bold';
              } else {
                statusLabel = '[HALTED (0 BYTES)]';
                badgeColor = 'border-rose-500/50 bg-rose-950/30 text-rose-300';
                textColor = 'text-rose-300 font-bold';
              }
            }
          }

          return (
            <div
              key={stage.id}
              className={`flex flex-col items-center justify-between p-2 rounded-xl border text-center transition-all duration-300 min-h-[110px] ${badgeColor} ${glow}`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[9px] font-mono text-slate-500">0{idx + 1}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                )}
              </div>

              <div className="p-1.5 rounded-lg bg-black/40 mb-1">
                {idx === 7 && isCompleted ? (
                  decision === 'ALLOW' ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  ) : decision === 'APPROVAL' ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  )
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>

              <span className={`text-[10px] font-medium leading-tight line-clamp-2 ${textColor}`}>
                {stage.label}
              </span>

              <div className="mt-1 flex flex-col items-center w-full">
                <span className="text-[8px] font-mono font-bold tracking-tight px-1 py-0.5 rounded bg-black/50 w-full truncate">
                  {statusLabel}
                </span>
                <span className="text-[7px] font-mono uppercase tracking-wider text-slate-500 mt-0.5">
                  {stage.plane}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
