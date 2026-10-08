import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  Bot,
  Wrench,
  Database,
  Flame,
  Lock,
  FileKey,
  Sliders,
  Zap,
  ScrollText,
  ArrowRight,
  ArrowDown,
  XCircle,
  CheckCircle2,
} from 'lucide-react';

export const BeforeAfterComparison: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'both' | 'without' | 'with'>('both');

  return (
    <div className="p-3.5 sm:p-6 rounded-2xl border border-cyber-border bg-gradient-to-br from-[#0C121F]/90 via-slate-900/90 to-[#0B0F17]/95 backdrop-blur-xl shadow-2xl space-y-4 sm:space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 border-b border-slate-800 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h2 className="text-sm sm:text-base md:text-lg font-extrabold text-white font-mono tracking-wide">
              PARADIGM COMPARISON &bull; BEFORE vs AFTER FLOWGUARD
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            &ldquo;Protect the tool boundary, not just the prompt.&rdquo; Demonstrating why runtime authorization succeeds where prompt-level filters fail.
          </p>
        </div>

        {/* Mobile View Toggle */}
        <div className="flex sm:hidden items-center p-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('both')}
            className={`px-2.5 py-1 rounded ${activeTab === 'both' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'}`}
          >
            Both
          </button>
          <button
            onClick={() => setActiveTab('without')}
            className={`px-2.5 py-1 rounded ${activeTab === 'without' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-400'}`}
          >
            Without
          </button>
          <button
            onClick={() => setActiveTab('with')}
            className={`px-2.5 py-1 rounded ${activeTab === 'with' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400'}`}
          >
            With FlowGuard
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-w-0">
        {/* ========================================================================= */}
        {/* PANEL 1: WITHOUT FLOWGUARD (VULNERABLE)                                   */}
        {/* ========================================================================= */}
        {(activeTab === 'both' || activeTab === 'without') && (
          <div className="p-4 sm:p-5 rounded-2xl border border-rose-500/30 bg-rose-950/10 backdrop-blur-md space-y-4 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-3">
              {/* Header Badge */}
              <div className="flex items-center justify-between pb-2.5 border-b border-rose-500/20">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded bg-rose-500/20 text-rose-400">
                    <AlertOctagon className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-xs sm:text-sm font-bold text-rose-300 uppercase tracking-wide">
                    WITHOUT FLOWGUARD (Vulnerable)
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  UNPROTECTED
                </span>
              </div>

              {/* Attack Narrative */}
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Prompt injection manipulates the AI agent. With direct tool credentials and no runtime gatekeeper, the agent executes unauthorized actions immediately.
              </p>

              {/* Visual Pipeline Flow */}
              <div className="space-y-2 py-2">
                {/* Step 1: Manipulated Agent */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-rose-500/30 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <Bot className="w-4 h-4 text-rose-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-bold text-white truncate">AI Agent (Manipulated)</div>
                      <div className="text-[10px] text-rose-300/80 font-mono truncate">Prompt injection overrides system prompt</div>
                    </div>
                  </div>
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                </div>

                {/* Arrow */}
                <div className="flex justify-center text-rose-400/60">
                  <ArrowDown className="w-4 h-4 animate-bounce" />
                </div>

                {/* Step 2: Direct Tool Binding */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-rose-500/30 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <Wrench className="w-4 h-4 text-rose-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-bold text-white truncate">Direct Tool Execution</div>
                      <div className="text-[10px] text-rose-300/80 font-mono truncate">Agent possesses raw API credentials & tokens</div>
                    </div>
                  </div>
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                </div>

                {/* Arrow */}
                <div className="flex justify-center text-rose-400/60">
                  <ArrowDown className="w-4 h-4 animate-bounce" />
                </div>

                {/* Step 3: Sensitive Resource */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-rose-500/30 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <Database className="w-4 h-4 text-rose-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-bold text-white truncate">Sensitive Resource / Egress</div>
                      <div className="text-[10px] text-rose-300/80 font-mono truncate">Customer DB, banking API, email dispatch</div>
                    </div>
                  </div>
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                </div>

                {/* Arrow */}
                <div className="flex justify-center text-rose-400/60">
                  <ArrowDown className="w-4 h-4 animate-bounce" />
                </div>

                {/* Step 4: Potential Damage */}
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-600/50 flex items-center justify-between shadow-glow-red">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <Flame className="w-5 h-5 text-rose-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-extrabold text-rose-300 uppercase truncate">
                        💥 POTENTIAL DAMAGE: 100% LEAKED
                      </div>
                      <div className="text-[10px] text-slate-300 font-sans truncate">
                        Confidential data exfiltrated &bull; Unauthorized action executed
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-600/30 text-rose-200 border border-rose-500 font-bold shrink-0">
                    BREACH
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Flaw Summary */}
            <div className="pt-3 border-t border-rose-500/20 text-[11px] text-slate-400 font-mono">
              <span className="text-rose-400 font-bold">Failure Root Cause:</span> Trusting LLM output as authoritative action intent.
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PANEL 2: WITH FLOWGUARD (ZERO-TRUST SECURED)                             */}
        {/* ========================================================================= */}
        {(activeTab === 'both' || activeTab === 'with') && (
          <div className="p-4 sm:p-5 rounded-2xl border border-cyan-500/40 bg-cyan-950/10 backdrop-blur-md space-y-4 relative overflow-hidden flex flex-col justify-between shadow-glow-cyan">
            <div className="space-y-3">
              {/* Header Badge */}
              <div className="flex items-center justify-between pb-2.5 border-b border-cyan-500/30">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded bg-cyan-500/20 text-cyan-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-xs sm:text-sm font-bold text-cyan-300 uppercase tracking-wide">
                    WITH FLOWGUARD (Zero-Trust Enforced)
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  PROTECTED
                </span>
              </div>

              {/* Narrative */}
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Even if prompt injection completely manipulates LLM reasoning, the agent has no authority. FlowGuard intercepts every action at the perimeter.
              </p>

              {/* Visual Pipeline Flow */}
              <div className="space-y-2 py-2">
                {/* Step 1: Agent Proposes */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <Bot className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-bold text-white truncate">AI Agent (Untrusted Domain)</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">Agent generates proposal &bull; Outside TCB</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">UNTRUSTED</span>
                </div>

                {/* Arrow to FlowGuard */}
                <div className="flex justify-center text-cyan-400">
                  <ArrowDown className="w-4 h-4 animate-pulse" />
                </div>

                {/* Step 2: FlowGuard Reference Monitor */}
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-cyan-300 font-mono text-xs font-bold">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      <span>FLOWGUARD REFERENCE MONITOR (TCB)</span>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      GATEWAY
                    </span>
                  </div>

                  {/* 3 Sub-checks */}
                  <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
                    <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800 text-center">
                      <FileKey className="w-3 h-3 text-cyan-400 mx-auto mb-0.5" />
                      <span className="text-slate-300 block font-semibold truncate">Capability Check</span>
                      <span className="text-slate-500 text-[9px]">Manifest validation</span>
                    </div>
                    <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800 text-center">
                      <Sliders className="w-3 h-3 text-cyan-400 mx-auto mb-0.5" />
                      <span className="text-slate-300 block font-semibold truncate">Policy Engine</span>
                      <span className="text-slate-500 text-[9px]">Zero-trust bounds</span>
                    </div>
                    <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800 text-center">
                      <Zap className="w-3 h-3 text-cyan-400 mx-auto mb-0.5" />
                      <span className="text-slate-300 block font-semibold truncate">Risk Analysis</span>
                      <span className="text-slate-500 text-[9px]">Lineage &amp; taint DAG</span>
                    </div>
                  </div>
                </div>

                {/* Arrow to Outcome */}
                <div className="flex justify-center text-cyan-400">
                  <ArrowDown className="w-4 h-4" />
                </div>

                {/* Step 3: Block Decision & Audit */}
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between shadow-glow-green">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <Lock className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-extrabold text-emerald-300 uppercase truncate">
                        🛡 ACTION BLOCKED &bull; 0 BYTES LEAKED
                      </div>
                      <div className="text-[10px] text-slate-300 font-sans truncate">
                        Execution token withheld &bull; Tamper-evident audit logged
                      </div>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
              </div>
            </div>

            {/* Bottom Invariant Summary */}
            <div className="pt-3 border-t border-cyan-500/20 text-[11px] text-slate-400 font-mono flex items-center justify-between">
              <div>
                <span className="text-cyan-400 font-bold">Core Invariant:</span> AI can be manipulated. Authority cannot.
              </div>
              <span className="text-emerald-400 font-bold">100% BLOCKED</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
