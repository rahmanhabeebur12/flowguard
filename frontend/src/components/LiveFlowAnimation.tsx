import React, { useEffect, useState } from 'react';
import {
  User,
  Cpu,
  FileKey,
  Bot,
  Send,
  ShieldAlert,
  Sliders,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { DecisionType } from '../types';

interface LiveFlowAnimationProps {
  isRunning: boolean;
  decision?: DecisionType;
  currentStepIndex: number;
  onStepChange?: (index: number) => void;
  speedMs?: number;
}

export const STAGES = [
  { id: 'user', label: 'User Intent', icon: User, plane: 'CONTROL' },
  { id: 'compiler', label: 'Intent Compiler', icon: Cpu, plane: 'CONTROL' },
  { id: 'manifest', label: 'Capability Manifest', icon: FileKey, plane: 'CONTROL' },
  { id: 'agent', label: 'AI Agent (Untrusted)', icon: Bot, plane: 'EXECUTION' },
  { id: 'proposal', label: 'Proposed Tool Call', icon: Send, plane: 'EXECUTION' },
  { id: 'monitor', label: 'Reference Monitor', icon: ShieldAlert, plane: 'BOUNDARY' },
  { id: 'policy', label: 'Policy Engine (6 Checks)', icon: Sliders, plane: 'SECURITY' },
  { id: 'decision', label: 'Verdict', icon: CheckCircle, plane: 'SECURITY' },
];

export const LiveFlowAnimation: React.FC<LiveFlowAnimationProps> = ({
  isRunning,
  decision = 'BLOCK',
  currentStepIndex,
}) => {
  return (
    <div className="p-4 rounded-xl border border-slate-800 bg-[#0C121E]/80 backdrop-blur-md shadow-2xl">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 relative">
            {isRunning && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isRunning ? 'bg-cyan-500' : 'bg-slate-600'}`}></span>
          </span>
          <span className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
            Runtime Security Boundary Flow
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500">
          <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Control Plane
          </span>
          <span>&rarr;</span>
          <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Untrusted Agent
          </span>
          <span>&rarr;</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            FlowGuard Gate
          </span>
        </div>
      </div>

      {/* Horizontal Pipeline Steps */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 relative">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isActive = idx === currentStepIndex;
          const isCompleted = idx < currentStepIndex;
          const isPending = idx > currentStepIndex;

          let badgeColor = 'border-slate-800 bg-slate-900/60 text-slate-500';
          let textColor = 'text-slate-500';
          let glow = '';

          if (isActive) {
            badgeColor = 'border-cyan-500 bg-cyan-500/20 text-cyan-300';
            textColor = 'text-cyan-200 font-bold';
            glow = 'shadow-glow-cyan scale-105';
          } else if (isCompleted) {
            badgeColor = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400';
            textColor = 'text-slate-300';
          }

          // Special styling for final verdict
          if (idx === STAGES.length - 1 && isCompleted) {
            if (decision === 'ALLOW') {
              badgeColor = 'border-emerald-500 bg-emerald-500/20 text-emerald-400';
              textColor = 'text-emerald-300 font-bold';
              glow = 'shadow-glow-green';
            } else if (decision === 'APPROVAL') {
              badgeColor = 'border-amber-500 bg-amber-500/20 text-amber-400';
              textColor = 'text-amber-300 font-bold';
              glow = 'shadow-glow-amber';
            } else {
              badgeColor = 'border-rose-500 bg-rose-500/20 text-rose-400';
              textColor = 'text-rose-300 font-bold';
              glow = 'shadow-glow-red';
            }
          }

          return (
            <div
              key={stage.id}
              className={`flex flex-col items-center p-2.5 rounded-xl border transition-all duration-300 ${badgeColor} ${glow}`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[9px] font-mono text-slate-500">0{idx + 1}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                )}
              </div>
              <div className="p-2 rounded-lg bg-black/40 mb-2">
                {idx === STAGES.length - 1 && isCompleted ? (
                  decision === 'ALLOW' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : decision === 'APPROVAL' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span className={`text-[10px] text-center font-medium leading-tight ${textColor}`}>
                {idx === STAGES.length - 1 && isCompleted ? decision : stage.label}
              </span>
              <span className="mt-1 text-[8px] font-mono uppercase tracking-wider text-slate-500">
                {stage.plane}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
