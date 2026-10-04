import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  variant?: 'cyan' | 'green' | 'red' | 'amber' | 'purple';
  trend?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'cyan',
  trend,
}) => {
  const colorMap = {
    cyan: {
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-500/5',
      iconBg: 'bg-cyan-500/10 text-cyan-400',
      text: 'text-cyan-400',
      shadow: 'hover:shadow-glow-cyan',
    },
    green: {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/5',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      text: 'text-emerald-400',
      shadow: 'hover:shadow-glow-green',
    },
    red: {
      border: 'border-rose-500/30',
      bg: 'bg-rose-500/5',
      iconBg: 'bg-rose-500/10 text-rose-400',
      text: 'text-rose-400',
      shadow: 'hover:shadow-glow-red',
    },
    amber: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/5',
      iconBg: 'bg-amber-500/10 text-amber-400',
      text: 'text-amber-400',
      shadow: 'hover:shadow-glow-amber',
    },
    purple: {
      border: 'border-purple-500/30',
      bg: 'bg-purple-500/5',
      iconBg: 'bg-purple-500/10 text-purple-400',
      text: 'text-purple-400',
      shadow: 'hover:shadow-glow-cyan',
    },
  };

  const style = colorMap[variant];

  return (
    <div
      className={`p-3 sm:p-4 rounded-xl border ${style.border} ${style.bg} backdrop-blur-sm transition-all duration-300 ${style.shadow} min-w-0 flex flex-col justify-between`}
    >
      <div className="flex items-center justify-between gap-1 mb-2 sm:mb-3">
        <span className="text-[10px] sm:text-xs font-mono font-medium tracking-wider text-slate-400 uppercase truncate" title={title}>
          {title}
        </span>
        <div className={`p-1.5 sm:p-2 rounded-lg ${style.iconBg} shrink-0`}>
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      </div>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className={`text-xl sm:text-2xl lg:text-3xl font-extrabold font-mono ${style.text}`}>
          {value}
        </span>
        {trend && (
          <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 truncate max-w-full" title={trend}>
            {trend}
          </span>
        )}
      </div>
      <span className="text-[9px] sm:text-[10px] font-mono text-slate-500 mt-1 truncate block" title={subtitle}>
        {subtitle}
      </span>
    </div>
  );
};
