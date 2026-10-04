import React from 'react';
import {
  Layers,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Bot,
  FileKey,
  Globe,
  FileText,
  Mail,
  Database,
  ArrowDown,
  ArrowRight,
  Lock,
} from 'lucide-react';

export const SecurityArchitecture: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-cyber-border">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              FlowGuard Security Architecture
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Zero-trust reference monitor architecture establishing isolation between LLM reasoning and system tools.
          </p>
        </div>

        {/* Core Principle Badge */}
        <div className="mt-3 md:mt-0 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-xs font-bold">
          LLM OUTSIDE TRUSTED COMPUTING BASE (TCB)
        </div>
      </div>

      {/* Main Architecture Diagram Container */}
      <div className="p-6 md:p-8 rounded-3xl border border-cyber-border bg-[#0E1526]/90 backdrop-blur-xl shadow-2xl space-y-8">
        {/* ========================================================================= */}
        {/* TIER 1: TRUSTED CONTROL PLANE                                             */}
        {/* ========================================================================= */}
        <div className="p-5 rounded-2xl border border-cyan-500/40 bg-cyan-950/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-300">
                1. Trusted Control Plane (Authority Synthesis)
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-500/40">
              TRUSTED USER DOMAIN
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono text-xs space-y-1">
              <User className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <div className="font-bold text-white">User Request</div>
              <p className="text-[10px] text-slate-400 font-sans">
                Authentic human operator instruction.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono text-xs space-y-1">
              <Sliders className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <div className="font-bold text-white">Intent Compiler</div>
              <p className="text-[10px] text-slate-400 font-sans">
                Compiles constraints &amp; release scope.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 text-center font-mono text-xs space-y-1 shadow-glow-cyan">
              <FileKey className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <div className="font-bold text-cyan-300">Capability Manifest</div>
              <p className="text-[10px] text-slate-400 font-sans">
                Signed immutable authority baseline.
              </p>
            </div>
          </div>
        </div>

        {/* PHYSICAL TRUST BOUNDARY DIVIDER */}
        <div className="relative flex items-center justify-center my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-dashed border-rose-500/40"></div>
          </div>
          <span className="relative px-4 py-1.5 rounded-full bg-slate-950 border border-rose-500/60 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider shadow-glow-red">
            🛡 Physical Zero-Trust Boundary (TCB Barrier)
          </span>
        </div>

        {/* ========================================================================= */}
        {/* TIER 2: POTENTIALLY UNTRUSTED EXECUTION PLANE                             */}
        {/* ========================================================================= */}
        <div className="p-5 rounded-2xl border border-rose-500/40 bg-rose-950/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-rose-400" />
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-rose-300">
                2. Potentially Untrusted Execution Plane (Reasoning &amp; Data)
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-200 border border-rose-500/40">
              UNTRUSTED ZONE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono text-xs space-y-1">
              <Globe className="w-5 h-5 text-rose-400 mx-auto mb-1" />
              <div className="font-bold text-white">External Resources</div>
              <p className="text-[10px] text-rose-300/80 font-sans">
                PDFs, web pages, emails containing potential prompt injection.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/40 text-center font-mono text-xs space-y-1 shadow-glow-red">
              <Bot className="w-5 h-5 text-rose-400 mx-auto mb-1" />
              <div className="font-bold text-rose-300">AI Agent Runtime</div>
              <p className="text-[10px] text-slate-400 font-sans">
                LLM may be tricked or coerced by injected directives.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono text-xs space-y-1">
              <ShieldAlert className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <div className="font-bold text-white">Proposed Tool Call</div>
              <p className="text-[10px] text-slate-400 font-sans">
                Proposal submitted to Reference Monitor gateway.
              </p>
            </div>
          </div>
        </div>

        {/* FLOW ARROW DOWN */}
        <div className="flex justify-center text-cyan-400">
          <ArrowDown className="w-6 h-6 animate-bounce" />
        </div>

        {/* ========================================================================= */}
        {/* TIER 3: FLOWGUARD REFERENCE MONITOR & POLICY ENGINE                       */}
        {/* ========================================================================= */}
        <div className="p-5 rounded-2xl border border-cyan-500/50 bg-gradient-to-r from-slate-950 via-[#0B1526] to-slate-950 shadow-glow-cyan space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                3. FlowGuard Reference Monitor &bull; Independent Policy Gate
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
              NON-BYPASSABLE
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center font-mono text-[11px]">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-cyan-400 font-bold block">1. Tool</span>
              <span className="text-slate-400 text-[10px]">Action Auth</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-cyan-400 font-bold block">2. Dest</span>
              <span className="text-slate-400 text-[10px]">Egress Target</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-cyan-400 font-bold block">3. Resource</span>
              <span className="text-slate-400 text-[10px]">File/DB Access</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-cyan-400 font-bold block">4. Scope</span>
              <span className="text-slate-400 text-[10px]">Release Level</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-cyan-400 font-bold block">5. Lineage</span>
              <span className="text-slate-400 text-[10px]">Provenance DAG</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-cyan-400 font-bold block">6. Purpose</span>
              <span className="text-slate-400 text-[10px]">Task Consistency</span>
            </div>
          </div>

          {/* Tri-State Outcomes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-center">
              <span className="text-emerald-400 font-bold block">ALLOW</span>
              <span className="text-slate-300 text-[11px]">Issues signed execution token</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-center">
              <span className="text-rose-400 font-bold block">BLOCK</span>
              <span className="text-slate-300 text-[11px]">Halts execution, 0 bytes sent</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-center">
              <span className="text-amber-400 font-bold block">APPROVAL</span>
              <span className="text-slate-300 text-[11px]">Human-in-the-loop review</span>
            </div>
          </div>
        </div>

        {/* FLOW ARROW DOWN */}
        <div className="flex justify-center text-emerald-400">
          <ArrowDown className="w-6 h-6 animate-bounce" />
        </div>

        {/* ========================================================================= */}
        {/* TIER 4: PROTECTED TOOLS & REAL SYSTEMS                                    */}
        {/* ========================================================================= */}
        <div className="p-5 rounded-2xl border border-cyber-border bg-[#0E1524]/60 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono font-bold uppercase text-slate-300">
              4. Protected Sensitive Tools &amp; Operating Environment
            </span>
            <span className="text-[10px] font-mono text-cyan-400">
              REQUIRES SIGNED EXECUTION TOKEN
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-xs font-mono">
            {['File System', 'Email SMTP', 'Database', 'HTTP Egress', 'Calendar', 'Banking API'].map((t) => (
              <div key={t} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
