import React, { useState, useEffect } from 'react';
import { Shield, Cpu, RefreshCw, Menu, X } from 'lucide-react';
import { api } from '../services/api';

interface HeaderProps {
  onReset?: () => void;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
  onOpenDemo?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  isMobileMenuOpen = false,
  onToggleMobileMenu,
  onOpenDemo,
}) => {
  const [isResetting, setIsResetting] = useState(false);
  const [tcbStatus, setTcbStatus] = useState<string>('ISOLATED');

  useEffect(() => {
    api.getHealth()
      .then((data) => setTcbStatus(data.tcb_status))
      .catch(() => setTcbStatus('OFFLINE'));
  }, []);

  const handleReset = async () => {
    if (confirm('Reset demo state and reseed baseline events?')) {
      setIsResetting(true);
      try {
        await api.resetSystem();
        if (onReset) onReset();
      } catch (e) {
        console.error(e);
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <header className="h-16 border-b border-cyber-border bg-[#0B0F17]/95 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 flex items-center justify-between">
      {/* Brand & Mobile Hamburger */}
      <div className="flex items-center space-x-2.5 sm:space-x-4">
        {/* Mobile Hamburger Toggle (Visible only on < lg) */}
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-cyan-400" />
            ) : (
              <Menu className="w-5 h-5 text-slate-300" />
            )}
          </button>
        )}

        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="relative shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-glow-cyan">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base sm:text-lg tracking-wider text-white">
                FLOWGUARD
              </span>
            </div>
            <p className="hidden sm:block text-[10px] sm:text-[11px] text-slate-400 font-mono tracking-wide uppercase truncate max-w-[200px] md:max-w-none">
              ZERO-TRUST RUNTIME SECURITY FOR AI AGENTS
            </p>
          </div>
        </div>
      </div>

      {/* Right-side Status & Actions */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* Status indicator (Desktop only) */}
        <div className="hidden md:flex items-center space-x-3 bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-xs">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-400 font-semibold tracking-wide">Protection Active</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>TCB:</span>
            <span className="text-cyan-400 font-bold">{tcbStatus}</span>
          </div>
        </div>

        {/* Global RUN DEMO button */}
        {onOpenDemo && (
          <button
            onClick={onOpenDemo}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold shadow-glow-cyan transition-all shrink-0"
            title="Launch Interactive Hackathon Security Demo"
          >
            <Shield className="w-3.5 h-3.5 fill-slate-950 shrink-0" />
            <span className="text-[11px] sm:text-xs">RUN DEMO</span>
          </button>
        )}

        {/* Reset button */}
        <button
          onClick={handleReset}
          disabled={isResetting}
          title="Reset Simulation and Seed Baseline"
          className="flex items-center space-x-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-mono text-slate-300 transition-colors disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isResetting ? 'animate-spin' : ''}`} />
          <span className="text-[11px] sm:text-xs hidden xs:inline">Reset</span>
        </button>
      </div>
    </header>
  );
};
