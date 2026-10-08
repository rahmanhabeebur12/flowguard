import React from 'react';
import { Shield, ShieldCheck, Zap, Lock, Activity, CheckCircle2 } from 'lucide-react';

interface SecurityScoreCardProps {
  score?: number;
  blockedThreats?: number;
  unauthorizedActions?: number;
  policyCompliance?: number;
  protectedToolsCount?: number;
  className?: string;
}

export const SecurityScoreCard: React.FC<SecurityScoreCardProps> = ({
  score = 94,
  blockedThreats = 14,
  unauthorizedActions = 0,
  policyCompliance = 98.6,
  protectedToolsCount = 8,
  className = '',
}) => {
  // Score status label and colors
  const getScoreColor = (val: number) => {
    if (val >= 90) return { text: 'text-emerald-400', stroke: '#10B981', glow: 'shadow-glow-green', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    if (val >= 75) return { text: 'text-cyan-400', stroke: '#06B6D4', glow: 'shadow-glow-cyan', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' };
    return { text: 'text-amber-400', stroke: '#F59E0B', glow: 'shadow-glow-amber', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
  };

  const status = getScoreColor(score);
  const strokeDashoffset = 283 - (283 * Math.min(score, 100)) / 100;

  return (
    <div
      className={`p-3.5 sm:p-5 rounded-2xl border border-cyber-border bg-gradient-to-br from-[#0E1526]/95 via-slate-900/90 to-[#0A0E18]/95 backdrop-blur-xl shadow-2xl relative overflow-hidden min-w-0 ${className}`}
    >
      {/* Background glow vignette */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 border-b border-slate-800/80 gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider text-slate-400 uppercase block">
              REAL-TIME POSTURE
            </span>
            <h3 className="text-xs sm:text-sm md:text-base font-extrabold text-white tracking-wide font-mono">
              FLOWGUARD SECURITY SCORE
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] sm:text-xs font-mono font-bold w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>DEFENSE ACTIVE &bull; 0 BYTES LEAKED</span>
        </div>
      </div>

      {/* Score Body */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-3 sm:pt-4">
        {/* Left: Score Gauge */}
        <div className="md:col-span-4 flex items-center justify-center p-2">
          <div className="relative flex items-center justify-center">
            {/* SVG Circle Gauge */}
            <svg className="w-28 h-28 sm:w-32 sm:h-32 transform -rotate-90" viewBox="0 0 100 100">
              {/* Track */}
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Dynamic Fill */}
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke={status.stroke}
                strokeWidth="8"
                strokeDasharray="276"
                strokeDashoffset={276 - (276 * Math.min(score, 100)) / 100}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Score Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${status.text}`}>
                {score}
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase font-semibold">
                OUT OF 100
              </span>
            </div>
          </div>
        </div>

        {/* Right: Sub-Metrics Grid */}
        <div className="md:col-span-8 grid grid-cols-2 gap-2 sm:gap-3">
          {/* Policy Compliance */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-[10px] sm:text-xs font-mono mb-1">
              <span className="truncate">Policy Compliance</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />
            </div>
            <div className="text-base sm:text-xl font-mono font-extrabold text-emerald-400">
              {policyCompliance}%
            </div>
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono">
              Invariants strictly enforced
            </span>
          </div>

          {/* Blocked Threats */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-rose-500/30 transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-[10px] sm:text-xs font-mono mb-1">
              <span className="truncate">Blocked Threats</span>
              <Zap className="w-3.5 h-3.5 text-rose-400 shrink-0 ml-1" />
            </div>
            <div className="text-base sm:text-xl font-mono font-extrabold text-rose-400 flex items-center space-x-1">
              <span>{blockedThreats}</span>
              <span className="text-[10px] text-slate-400 font-normal">intercepted</span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono">
              0 bytes escaped sandbox
            </span>
          </div>

          {/* Unauthorized Actions Prevented */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-[10px] sm:text-xs font-mono mb-1">
              <span className="truncate">Unauthorized Actions</span>
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-1" />
            </div>
            <div className="text-base sm:text-xl font-mono font-extrabold text-cyan-300">
              {unauthorizedActions} Leaks Allowed
            </div>
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono">
              Non-bypassable monitor
            </span>
          </div>

          {/* Protected Tools */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-purple-500/30 transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-[10px] sm:text-xs font-mono mb-1">
              <span className="truncate">Protected Tools</span>
              <Lock className="w-3.5 h-3.5 text-purple-400 shrink-0 ml-1" />
            </div>
            <div className="text-base sm:text-xl font-mono font-extrabold text-purple-300">
              {protectedToolsCount} Isolated Tools
            </div>
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono">
              Token execution boundary
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
