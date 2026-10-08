import React from 'react';
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
} from 'lucide-react';

export interface SecurityStreamEvent {
  id: string;
  timestamp: string;
  type:
    | 'AGENT_ACTION_DETECTED'
    | 'CAPABILITY_CHECK'
    | 'POLICY_VIOLATION'
    | 'HIGH_RISK'
    | 'ACTION_BLOCKED'
    | 'AUDIT_EVENT_CREATED'
    | 'LEGITIMATE_ALLOWED';
  summary: string;
  details?: string;
  tool?: string;
  riskScore?: number;
  isNew?: boolean;
}

interface LiveEventStreamProps {
  events: SecurityStreamEvent[];
  onClear?: () => void;
  className?: string;
}

export const LiveEventStream: React.FC<LiveEventStreamProps> = ({
  events,
  onClear,
  className = '',
}) => {
  const getEventBadge = (type: SecurityStreamEvent['type']) => {
    switch (type) {
      case 'AGENT_ACTION_DETECTED':
        return {
          label: 'AGENT ACTION DETECTED',
          badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
          icon: Activity,
        };
      case 'CAPABILITY_CHECK':
        return {
          label: 'CAPABILITY CHECK',
          badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
          icon: ShieldCheck,
        };
      case 'POLICY_VIOLATION':
        return {
          label: 'POLICY VIOLATION',
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          icon: AlertTriangle,
        };
      case 'HIGH_RISK':
        return {
          label: 'HIGH RISK DETECTED',
          badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          icon: Zap,
        };
      case 'ACTION_BLOCKED':
        return {
          label: 'ACTION BLOCKED',
          badge: 'bg-rose-600/20 text-rose-300 border-rose-500/50 font-bold',
          icon: XCircle,
        };
      case 'AUDIT_EVENT_CREATED':
        return {
          label: 'AUDIT EVENT CREATED',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: CheckCircle2,
        };
      case 'LEGITIMATE_ALLOWED':
        return {
          label: 'ACTION AUTHORIZED',
          badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
          icon: ShieldCheck,
        };
      default:
        return {
          label: 'SECURITY EVENT',
          badge: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: Activity,
        };
    }
  };

  return (
    <div
      className={`p-3.5 sm:p-5 rounded-2xl border border-cyber-border bg-[#0E1524]/90 backdrop-blur-md shadow-2xl space-y-3 min-w-0 ${className}`}
    >
      {/* Stream Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-slate-800 gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold font-mono text-white tracking-wider uppercase flex items-center space-x-2">
              <span>LIVE SECURITY EVENT STREAM</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
              Real-time telemetry from FlowGuard reference monitor &amp; policy engine
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
            {events.length} EVENTS
          </span>
          {onClear && events.length > 0 && (
            <button
              onClick={onClear}
              className="text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
        {events.length === 0 ? (
          <div className="py-8 text-center text-slate-500 font-mono text-xs">
            Listening for security telemetry... Run a security demo or execute an attack scenario to observe real-time stream.
          </div>
        ) : (
          events.map((evt, idx) => {
            const badgeInfo = getEventBadge(evt.type);
            const Icon = badgeInfo.icon;
            const isLatest = idx === 0 || evt.isNew;

            return (
              <div
                key={evt.id || idx}
                className={`p-2.5 rounded-xl border text-xs font-mono transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  isLatest
                    ? 'bg-slate-900/90 border-cyan-500/50 shadow-glow-cyan/50 ring-1 ring-cyan-500/20'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Left: Timestamp + Tag + Details */}
                <div className="flex items-start sm:items-center space-x-2.5 min-w-0">
                  {/* Timestamp */}
                  <span className="text-slate-500 text-[10px] sm:text-[11px] shrink-0 flex items-center space-x-1 pt-0.5 sm:pt-0">
                    <Clock className="w-3 h-3 inline text-slate-600" />
                    <span>{evt.timestamp}</span>
                  </span>

                  {/* Badge */}
                  <span
                    className={`px-2 py-0.5 rounded border text-[10px] font-bold shrink-0 flex items-center space-x-1 ${badgeInfo.badge}`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{badgeInfo.label}</span>
                  </span>

                  {/* Summary */}
                  <span className="text-slate-200 text-xs truncate max-w-[280px] sm:max-w-[340px] md:max-w-[420px]" title={evt.summary}>
                    {evt.summary}
                  </span>
                </div>

                {/* Right: Tool, Risk Score, New Badge */}
                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                  {evt.tool && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800 text-[10px]">
                      {evt.tool}
                    </span>
                  )}
                  {evt.riskScore !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        evt.riskScore >= 70
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      Risk {evt.riskScore}
                    </span>
                  )}
                  {isLatest && (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-cyan-400 text-slate-950 animate-pulse">
                      NEW
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
