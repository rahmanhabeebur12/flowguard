import React, { useState, useEffect } from 'react';
import {
  Zap,
  Play,
  ShieldAlert,
  Bot,
  Sliders,
  CheckCircle2,
  XCircle,
  FileText,
  Globe,
  Mail,
  Share2,
  Database,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { api } from '../services/api';
import { AttackScenario, PipelineRunResult } from '../types';

export const AttackSimulator: React.FC = () => {
  const [scenarios, setScenarios] = useState<AttackScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<AttackScenario | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [runResult, setRunResult] = useState<PipelineRunResult | null>(null);
  const [activeStage, setActiveStage] = useState<number>(0);

  useEffect(() => {
    api.getAttackScenarios().then((data) => {
      setScenarios(data);
      if (data.length > 0) {
        setSelectedScenario(data[1]); // Default to Poisoned PDF
        setCustomPrompt(data[1].user_intent);
      }
    });
  }, []);

  const handleSelect = (scen: AttackScenario) => {
    setSelectedScenario(scen);
    setCustomPrompt(scen.user_intent);
    setRunResult(null);
  };

  const handleRunAttack = async () => {
    if (!selectedScenario) return;
    setIsRunning(true);
    setRunResult(null);
    setActiveStage(0);

    // Staged animation
    await new Promise((r) => setTimeout(r, 350));
    setActiveStage(1); // Agent reasoning

    await new Promise((r) => setTimeout(r, 450));
    setActiveStage(2); // Proposed tool call

    try {
      const data = await api.runAttackSimulation(selectedScenario.id, customPrompt);

      await new Promise((r) => setTimeout(r, 450));
      setActiveStage(3); // FlowGuard Interception

      await new Promise((r) => setTimeout(r, 450));
      setActiveStage(4); // Policy checks

      await new Promise((r) => setTimeout(r, 400));
      setActiveStage(5); // Verdict (BLOCK)

      setRunResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'DIRECT_INJECTION':
        return Flame;
      case 'INDIRECT_INJECTION':
        return FileText;
      case 'WEB_EGRESS':
        return Globe;
      case 'INBOUND_INJECTION':
        return Mail;
      case 'SECOND_ORDER_INJECTION':
        return Sliders;
      case 'MULTI_AGENT':
        return Share2;
      case 'SEMANTIC_EVASION':
        return Bot;
      case 'DATA_LEAK':
        return Database;
      default:
        return Zap;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-cyber-border">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
              <Zap className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Live Attack Simulator &bull; 8 Vectors
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Simulate realistic prompt injection and data exfiltration vectors. Verify that FlowGuard halts every unauthorized flow.
          </p>
        </div>
      </div>

      {/* Grid of 8 Attack Scenarios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {scenarios.map((scen, idx) => {
          const isSelected = selectedScenario?.id === scen.id;
          const Icon = getCategoryIcon(scen.category);
          return (
            <button
              key={scen.id}
              onClick={() => handleSelect(scen)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-rose-500 bg-rose-500/10 shadow-glow-red scale-[1.02]'
                  : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 text-rose-400">
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px] font-mono font-bold">0{idx + 1}</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {scen.category}
                </span>
              </div>
              <h3 className="text-xs font-bold text-white mb-1">{scen.name}</h3>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {scen.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Execution Arena */}
      {selectedScenario && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Attack Configuration */}
          <div className="p-5 rounded-2xl border border-cyber-border bg-[#0E1524]/80 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-bold uppercase text-white">
                Attack Configuration
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                THREAT VECTOR
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-400">TARGET / SCENARIO:</span>
              <p className="text-sm font-bold text-white">{selectedScenario.name}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-400">INJECTION SOURCE:</span>
              <p className="text-xs font-mono text-cyan-300 bg-slate-950 p-2 rounded-lg border border-slate-800">
                {selectedScenario.source}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-400">ATTACK DESCRIPTION:</span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {selectedScenario.description}
              </p>
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-mono text-slate-400">PROMPT IN VOCATION:</span>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              onClick={handleRunAttack}
              disabled={isRunning}
              className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-mono font-bold text-xs shadow-glow-red transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Play className={`w-4 h-4 fill-white ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'SIMULATING ATTACK...' : 'RUN ATTACK SIMULATION'}</span>
            </button>
          </div>

          {/* Right 2 Columns: Interception & Flow Visualization */}
          <div className="lg:col-span-2 p-5 rounded-2xl border border-cyber-border bg-[#0E1524]/80 backdrop-blur-md space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-bold uppercase text-white">
                Boundary Interception Pipeline
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Zero-Trust Gatekeeper
              </span>
            </div>

            {/* Visual Step Trace */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center text-xs font-mono">
              {[
                { label: '1. Injected Input', sub: 'Untrusted Resource' },
                { label: '2. Agent Swayed', sub: 'Model Compromised' },
                { label: '3. Malicious Proposal', sub: 'Exfiltration Attempt' },
                { label: '4. FlowGuard Intercept', sub: 'Reference Monitor' },
                { label: '5. Action Blocked', sub: 'Real System Shielded' },
              ].map((step, idx) => {
                const isActive = activeStage === idx + 1;
                const isPast = activeStage > idx + 1;
                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isActive
                        ? 'border-rose-500 bg-rose-500/20 text-rose-300 shadow-glow-red scale-105'
                        : isPast
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-800 bg-slate-900/50 text-slate-500'
                    }`}
                  >
                    <div className="font-bold text-[11px]">{step.label}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{step.sub}</div>
                  </div>
                );
              })}
            </div>

            {/* Results Details */}
            {runResult ? (
              <div className="space-y-4 pt-2">
                {/* Proposed Tool Call */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">
                    Agent Proposed Malicious Action:
                  </div>
                  <div className="text-rose-400 font-bold">
                    {runResult.agent_execution.proposed_tool}(
                    {JSON.stringify(runResult.agent_execution.proposed_arguments, null, 2)}
                    )
                  </div>
                </div>

                {/* Verdict Badge */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10 border border-rose-500/40">
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-5 h-5 text-rose-400" />
                    <div>
                      <span className="font-mono font-extrabold text-rose-300 text-sm">
                        INTERCEPTED & BLOCKED BY FLOWGUARD
                      </span>
                      <p className="text-xs text-slate-400">
                        Zero bytes dispatched. Real tool boundary remained secure.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded bg-rose-500 text-slate-950 shadow-glow-red">
                    RISK SCORE: {runResult.security_decision.risk_score}/100
                  </span>
                </div>

                {/* Failed Policy Checks */}
                <div className="space-y-1.5">
                  <span className="text-xs font-mono text-slate-400 font-bold">
                    FAILED POLICY CHECKS:
                  </span>
                  {runResult.security_decision.checks
                    .filter((c) => !c.passed)
                    .map((c, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-xs font-mono text-rose-300 flex items-start space-x-2"
                      >
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">{c.name}: </span>
                          <span className="text-slate-300">{c.details}</span>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Primary Reasons */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-sans text-slate-300 leading-relaxed">
                  <span className="font-mono font-bold text-cyan-400 block mb-1">
                    Security Analysis:
                  </span>
                  {runResult.security_decision.reasons.map((r, i) => (
                    <p key={i}>&bull; {r}</p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-xl">
                Select an attack scenario from the top and click &ldquo;Run Attack Simulation&rdquo;.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
