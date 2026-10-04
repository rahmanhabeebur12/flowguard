import React, { useState, useEffect } from 'react';
import { Shield, Cpu, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

interface HeaderProps {
  onReset?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
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
    <header className="h-16 border-b border-cyber-border bg-[#0B0F17]/90 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-glow-cyan">
              <Shield className="w-6 h-6" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-wider text-white">FLOWGUARD</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-wide uppercase">
              ZERO-TRUST RUNTIME SECURITY FOR AI AGENTS
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Status indicator */}
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

        {/* Reset button */}
        <button
          onClick={handleReset}
          disabled={isResetting}
          title="Reset Simulation and Seed Baseline"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-mono text-slate-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isResetting ? 'animate-spin' : ''}`} />
          <span>Reset Demo</span>
        </button>
      </div>
    </header>
  );
};
