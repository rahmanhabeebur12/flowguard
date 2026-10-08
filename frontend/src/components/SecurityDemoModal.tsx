import React from 'react';
import { X, ShieldAlert, Sparkles } from 'lucide-react';
import { SecurityDemoExperience } from './SecurityDemoExperience';
import { SecurityStreamEvent } from './LiveEventStream';

interface SecurityDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventEmitted?: (event: SecurityStreamEvent) => void;
  onThreatBlocked?: () => void;
  initialScenarioId?: string;
}

export const SecurityDemoModal: React.FC<SecurityDemoModalProps> = ({
  isOpen,
  onClose,
  onEventEmitted,
  onThreatBlocked,
  initialScenarioId = 'prompt_injection',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="security-demo-title"
        className="relative w-full max-w-5xl rounded-2xl sm:rounded-3xl border border-cyan-500/40 bg-[#0B0F17] shadow-glow-cyan my-auto max-h-[92vh] flex flex-col z-10 overflow-hidden animate-fade-in"
      >
        {/* Modal Top Header */}
        <div className="p-3.5 sm:p-5 border-b border-cyber-border bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2
                  id="security-demo-title"
                  className="text-sm sm:text-base md:text-lg font-extrabold text-white font-mono tracking-wide"
                >
                  LIVE HACKATHON SECURITY DEMO
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold hidden sm:inline">
                  ZERO-TRUST RUNTIME
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-mono">
                Observe FlowGuard intercepting and blocking untrusted AI agent actions in real time
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close Security Demo"
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 min-w-0">
          <SecurityDemoExperience
            onEventEmitted={onEventEmitted}
            onThreatBlocked={onThreatBlocked}
            initialScenarioId={initialScenarioId}
            isModal={true}
          />
        </div>

        {/* Modal Footer Note */}
        <div className="p-3 sm:p-4 border-t border-cyber-border bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-slate-400 gap-2 shrink-0">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-[11px]">
              Invariant: &ldquo;AI can be manipulated. Authority cannot.&rdquo;
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors text-center"
          >
            Close Demo
          </button>
        </div>
      </div>
    </div>
  );
};
