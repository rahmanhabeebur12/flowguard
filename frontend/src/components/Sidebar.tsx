import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlayCircle,
  Zap,
  FileCheck,
  GitFork,
  ScrollText,
  Wrench,
  Settings as SettingsIcon,
  Lock,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navSections = [
    {
      title: 'RUNTIME',
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/demo', label: 'Live Runtime', icon: PlayCircle },
        { to: '/attacks', label: 'Attack Simulator', icon: Zap },
      ],
    },
    {
      title: 'ZERO-TRUST CORE',
      items: [
        { to: '/capabilities', label: 'Policy / Capabilities', icon: FileCheck },
        { to: '/provenance', label: 'Provenance', icon: GitFork },
        { to: '/audit', label: 'Audit Log', icon: ScrollText },
        { to: '/tools', label: 'Tool Sandbox', icon: Wrench },
      ],
    },
    {
      title: 'SETTINGS',
      items: [
        { to: '/settings', label: 'Settings', icon: SettingsIcon },
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
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
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

