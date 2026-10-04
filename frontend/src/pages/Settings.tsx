import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Cpu,
  Key,
  Database,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { api } from '../services/api';

export const Settings: React.FC = () => {
  const [agentMode, setAgentMode] = useState<'mock' | 'llm'>('mock');
  const [apiKey, setApiKey] = useState<string>('');
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await api.resetSystem();
      setResetMessage('Demo state successfully reset and reseeded with baseline events.');
      setTimeout(() => setResetMessage(null), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-cyber-border gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0">
              <SettingsIcon className="w-5 h-5" />
            </span>
            <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Settings &bull; Runtime Configuration
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Configure agent mode, simulation parameters, and zero-trust policies.
          </p>
        </div>
      </div>

      {resetMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* AI Agent Configuration Card */}
      <div className="p-4 sm:p-6 rounded-2xl border border-cyber-border bg-[#0E1524]/80 backdrop-blur-md space-y-4 font-mono text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-1.5">
          <div className="flex items-center space-x-2 text-white font-bold">
            <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="uppercase">AI Agent Runtime Mode</span>
          </div>
          <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 w-fit">
            OFFLINE READY &bull; NO PAID API REQUIRED
          </span>
        </div>

        <div className="space-y-3">
          <label className="flex items-start space-x-3 p-3.5 rounded-xl border border-cyan-500/40 bg-cyan-500/5 cursor-pointer">
            <input
              type="radio"
              name="agentMode"
              checked={agentMode === 'mock'}
              onChange={() => setAgentMode('mock')}
              className="mt-0.5"
            />
            <div>
              <span className="font-bold text-white block">
                Deterministic Vulnerable Mock Agent (Recommended for Demo)
              </span>
              <p className="text-slate-400 text-[11px] font-sans mt-0.5 leading-relaxed">
                Faithfully simulates an LLM swayed by indirect prompt injection. Demonstrates that FlowGuard stops the compromise regardless of model vulnerability without requiring an external paid API.
              </p>
            </div>
          </label>

          <label className="flex items-start space-x-3 p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 cursor-pointer">
            <input
              type="radio"
              name="agentMode"
              checked={agentMode === 'llm'}
              onChange={() => setAgentMode('llm')}
              className="mt-0.5"
            />
            <div>
              <span className="font-bold text-slate-300 block">
                Live External LLM (Optional)
              </span>
              <p className="text-slate-400 text-[11px] font-sans mt-0.5 leading-relaxed">
                Connect your own OpenAI, Anthropic, or Gemini API key. FlowGuard Reference Monitor enforces identical boundary checks regardless of provider.
              </p>
            </div>
          </label>

          {agentMode === 'llm' && (
            <div className="pt-2">
              <label className="block text-[11px] text-slate-400 mb-1">
                Optional LLM Provider API Key:
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-... (Optional)"
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Database State Management Card */}
      <div className="p-4 sm:p-6 rounded-2xl border border-cyber-border bg-[#0E1524]/80 backdrop-blur-md space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-white font-bold">
            <Database className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="uppercase">Demo State &amp; Reseed</span>
          </div>
        </div>

        <p className="text-slate-300 font-sans text-xs leading-relaxed">
          Clear temporary tasks and reseed baseline audit events, pending approvals, and capability manifests.
        </p>

        <button
          onClick={handleReset}
          disabled={isResetting}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 transition-colors disabled:opacity-50 w-full sm:w-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
          <span>{isResetting ? 'Resetting System...' : 'Reset Demo State & Reseed'}</span>
        </button>
      </div>

      {/* Security Invariants Reference Card */}
      <div className="p-4 sm:p-6 rounded-2xl border border-cyber-border bg-[#0E1524]/80 backdrop-blur-md space-y-4 font-mono text-xs">
        <div className="flex items-center space-x-2 text-white font-bold pb-3 border-b border-slate-800">
          <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="uppercase">The 8 Security Invariants Reference</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
          {[
            { id: '1', title: 'External data cannot modify authority' },
            { id: '2', title: 'Transformation cannot erase provenance' },
            { id: '3', title: 'The LLM cannot directly execute sensitive tools' },
            { id: '4', title: 'Every sensitive tool call must pass through reference monitor' },
            { id: '5', title: 'Destination must be authorized independently of model' },
            { id: '6', title: 'Release scope must be enforced independently of model' },
            { id: '7', title: 'Unknown authorization must not silently become ALLOW' },
            { id: '8', title: 'Authorized tool does not mean every argument is authorized' },
          ].map((inv) => (
            <div
              key={inv.id}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-2 text-slate-300"
            >
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">INVARIANT {inv.id}: </span>
                <span>{inv.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
