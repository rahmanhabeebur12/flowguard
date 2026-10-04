import React from 'react';
import { X, Lock, ShieldCheck, Cpu, Database, EyeOff, CheckCircle2 } from 'lucide-react';

interface SecurityInvariantsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityInvariantsModal: React.FC<SecurityInvariantsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const invariants = [
    {
      number: '1',
      title: 'LLM is outside the Trusted Computing Base (TCB)',
      principle: 'AI models can be manipulated by malicious adversarial prompts and indirect injections. The reference monitor is trusted; the model is untrusted.',
      enforcement: 'The LLM never directly executes tools or issues permissions. All proposals pass through the Reference Monitor.',
      icon: Cpu,
    },
    {
      number: '2',
      title: 'Untrusted data cannot create authority',
      principle: 'External input, ingested files (PDF/web), and tool outputs cannot elevate permissions or rewrite Capability Manifests.',
      enforcement: 'Authority is statically synthesized and signed (SHA-256) strictly from verified user intent.',
      icon: ShieldCheck,
    },
    {
      number: '3',
      title: 'Transformation cannot erase provenance',
      principle: 'Summarizing, rephrasing, translating, or embedding untrusted text preserves its UNTRUSTED / TAINT status throughout the DAG.',
      enforcement: 'FlowGuard propagates DERIVED_UNTRUSTED taint into arguments, blocking covert exfiltration.',
      icon: Database,
    },
    {
      number: '4',
      title: 'Sensitive tools require reference-monitor authorization',
      principle: 'Every sensitive operation (email, file, database, HTTP, calendar, financial) must be pre-authorized before execution.',
      enforcement: 'Mock and real tools verify an unexpired, cryptographically signed FlowGuardExecutionToken.',
      icon: Lock,
    },
    {
      number: '5',
      title: 'Blocked actions cannot reach tool execution (0 Bytes Leaked)',
      principle: 'When policy or provenance fails, the execution pipeline halts immediately at the security boundary.',
      enforcement: '0 bytes are released, zero network requests are dispatched, and an immutable audit record is logged.',
      icon: EyeOff,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl border border-cyan-500/40 bg-[#0C121E] shadow-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
          <div className="flex items-center space-x-2.5 min-w-0 mr-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0">
              <Lock className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white font-mono uppercase tracking-wider truncate">
                FlowGuard Security Principles
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400 font-mono truncate">
                Core Invariant: &ldquo;AI can be manipulated. Authority cannot.&rdquo;
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5 Core Principles */}
        <div className="space-y-3 font-mono text-xs">
          {invariants.map((inv) => {
            const Icon = inv.icon;
            return (
              <div
                key={inv.number}
                className="p-3 sm:p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {inv.number}
                    </span>
                    <span className="font-bold text-slate-200 text-xs truncate">{inv.title}</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                    ENFORCED
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed pl-7">
                  {inv.principle}
                </p>
                <div className="pl-7 pt-1 flex items-center space-x-1.5 text-[10px] text-cyan-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{inv.enforcement}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-cyber-border flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-4">
          <span className="text-[10px] sm:text-[11px] font-mono text-slate-500">
            Runtime Policy Guarantee &bull; Reference Monitor v1.0
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs shadow-glow-cyan transition-all text-center"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
