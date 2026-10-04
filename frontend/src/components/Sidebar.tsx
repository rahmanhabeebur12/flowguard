import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlayCircle,
  Award,
  Zap,
  GitFork,
  FileCheck,
  ScrollText,
  Wrench,
  Layers,
  Scale,
  FlaskConical,
  Settings,
  Lock,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navSections = [
    {
      title: 'RUNTIME SECURITY',
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/demo', label: 'Live Demo', icon: PlayCircle },
        { to: '/judge', label: 'Judge Mode', icon: Award, highlight: true },
        { to: '/attacks', label: 'Attack Simulator', icon: Zap },
      ],
    },
    {
      title: 'ZERO-TRUST CORE',
      items: [
        { to: '/provenance', label: 'Provenance DAG', icon: GitFork },
        { to: '/capabilities', label: 'Capability Manifests', icon: FileCheck },
        { to: '/audit', label: 'Audit Log', icon: ScrollText },
        { to: '/tools', label: 'Tool Sandbox', icon: Wrench },
      ],
    },
    {
      title: 'ARCHITECTURE & INTEL',
      items: [
        { to: '/architecture', label: 'Security Architecture', icon: Layers },
        { to: '/comparison', label: 'Why FlowGuard?', icon: Scale },
        { to: '/evaluation', label: 'Evaluation (MVP)', icon: FlaskConical },
        { to: '/settings', label: 'Settings & Config', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 border-r border-cyber-border bg-[#0B0F17]/95 flex flex-col h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx}>
            <div className="px-3 mb-2 text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
              {section.title}
            </div>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-glow-cyan'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                      } ${item.highlight ? 'relative' : ''}`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                    {item.highlight && (
                      <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono font-bold">
                        60s
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Trust boundary banner */}
      <div className="p-3 border-t border-cyber-border bg-slate-950/60">
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
          <div className="flex items-center space-x-2 text-cyan-400 font-semibold mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Zero-Trust Invariant</span>
          </div>
          <p className="text-slate-400 leading-relaxed font-mono text-[10px]">
            &ldquo;AI can be manipulated. Authority cannot.&rdquo;
          </p>
        </div>
      </div>
    </aside>
  );
};
