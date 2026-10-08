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
  X,
  Shield,
  Layers,
  Scale,
  Activity,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
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
      title: 'VERIFICATION',
      items: [
        { to: '/architecture', label: 'Architecture', icon: Layers },
        { to: '/why-flowguard', label: 'Why FlowGuard', icon: Scale },
        { to: '/evaluation', label: 'Evaluation Suite', icon: Activity },
      ],
    },
    {
      title: 'SETTINGS',
      items: [
        { to: '/settings', label: 'Settings', icon: SettingsIcon },
      ],
    },
  ];

  const renderNavContent = () => (
    <>
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
                    onClick={() => {
                      if (onClose) onClose();
                    }}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
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
      <div className="p-3 border-t border-cyber-border bg-slate-950/60 shrink-0">
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
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (Only visible on lg and above) */}
      <aside className="hidden lg:flex w-64 border-r border-cyber-border bg-[#0B0F17]/95 flex-col h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0">
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer (Only visible on < lg when isOpen is true) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Slide-out drawer panel */}
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#0B0F17] border-r border-cyber-border z-50 flex flex-col shadow-2xl select-none animate-fade-in">
            {/* Mobile Drawer Top Header */}
            <div className="h-16 border-b border-cyber-border px-4 flex items-center justify-between shrink-0 bg-slate-950/60">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-glow-cyan">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-sm tracking-wider text-white">
                  FLOWGUARD
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close navigation menu"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {renderNavContent()}
          </aside>
        </div>
      )}
    </>
  );
};
