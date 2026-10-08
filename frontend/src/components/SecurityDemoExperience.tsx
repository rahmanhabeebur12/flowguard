import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Bot,
  FileKey,
  Sliders,
  Zap,
  Lock,
  ScrollText,
  XCircle,
  CheckCircle2,
  Database,
  Mail,
  Send,
  ArrowRight,
  Flame,
  HelpCircle,
  FastForward,
  Pause,
} from 'lucide-react';
import { HACKATHON_SCENARIOS, DemoScenario } from '../data/demoScenarios';
import { api } from '../services/api';
import { SecurityStreamEvent } from './LiveEventStream';

interface SecurityDemoExperienceProps {
  onEventEmitted?: (event: SecurityStreamEvent) => void;
  onThreatBlocked?: () => void;
  initialScenarioId?: string;
  isModal?: boolean;
}

export const SecurityDemoExperience: React.FC<SecurityDemoExperienceProps> = ({
  onEventEmitted,
  onThreatBlocked,
  initialScenarioId = 'prompt_injection',
  isModal = false,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario>(
    HACKATHON_SCENARIOS.find((s) => s.id === initialScenarioId) || HACKATHON_SCENARIOS[0]
  );
  const [activeStage, setActiveStage] = useState<number>(0); // 0 = idle, 1..6 = stages
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isWhyBlockedOpen, setIsWhyBlockedOpen] = useState<boolean>(true);
  const [liveLogSnippet, setLiveLogSnippet] = useState<string>('');

  const pauseRef = useRef<boolean>(false);
  const skipRef = useRef<boolean>(false);

  // 6 Visual Timeline Stages
  const stages = [
    {
      id: 1,
      title: 'AGENT ACTION',
      subtitle: 'Untrusted Instruction',
      icon: Bot,
      color: 'text-cyan-400',
      badge: 'PROPOSAL GENERATED',
      desc: 'AI Agent receives malicious instruction & attempts tool invocation',
    },
    {
      id: 2,
      title: 'CAPABILITY CHECK',
      subtitle: 'Manifest Verification',
      icon: FileKey,
      color: 'text-indigo-400',
      badge: 'IMMUTABLE MANIFEST',
      desc: 'FlowGuard compares requested tool & destination against signed whitelist',
    },
    {
      id: 3,
      title: 'POLICY EVALUATION',
      subtitle: 'Zero-Trust Engine',
      icon: Sliders,
      color: 'text-amber-400',
      badge: 'BOUNDS INSPECTION',
      desc: 'Evaluates Least Privilege, Release Scope, and Data Boundary constraints',
    },
    {
      id: 4,
      title: 'RISK ANALYSIS',
      subtitle: 'Taint & Lineage DAG',
      icon: Zap,
      color: 'text-rose-400',
      badge: 'ANOMALY DETECTED',
      desc: 'Calculates risk severity (CRITICAL) and detects untrusted data propagation',
    },
    {
      id: 5,
      title: '🚨 ACTION BLOCKED',
      subtitle: 'Reference Monitor Gate',
      icon: ShieldAlert,
      color: 'text-rose-400',
      badge: '0 BYTES LEAKED',
      desc: 'Reference monitor denies execution token. Network call halted.',
    },
    {
      id: 6,
      title: 'AUDIT EVIDENCE CREATED',
      subtitle: 'Tamper-Evident Log',
      icon: ScrollText,
      color: 'text-emerald-400',
      badge: 'CRYPTOGRAPHIC AUDIT',
      desc: 'Immutable security record committed with SHA-256 evidence chain',
    },
  ];

  const getFormatTime = () => {
    return new Date().toTimeString().split(' ')[0];
  };

  const emitEvent = (
    type: SecurityStreamEvent['type'],
    summary: string,
    tool?: string,
    riskScore?: number
  ) => {
    if (onEventEmitted) {
      onEventEmitted({
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: getFormatTime(),
        type,
        summary,
        tool,
        riskScore,
        isNew: true,
      });
    }
  };

  const delayStep = async (ms: number) => {
    if (skipRef.current) return;
    const interval = 50;
    let elapsed = 0;
    while (elapsed < ms) {
      if (skipRef.current) break;
      while (pauseRef.current) {
        await new Promise((r) => setTimeout(r, 100));
      }
      await new Promise((r) => setTimeout(r, interval));
      elapsed += interval;
    }
  };

  // Run the automated demo sequence
  const handleRunSecurityDemo = async (scenario: DemoScenario = selectedScenario) => {
    setIsRunning(true);
    setIsPaused(false);
    pauseRef.current = false;
    skipRef.current = false;
    setActiveStage(1);
    setLiveLogSnippet('');

    const stepDelay = 600;

    // STAGE 1: AGENT ACTION
    emitEvent(
      'AGENT_ACTION_DETECTED',
      `Agent proposed action: ${scenario.agentAction}`,
      scenario.targetTool,
      scenario.riskScore
    );
    setLiveLogSnippet(`[AGENT] Dispatch proposed: ${scenario.agentAction}`);
    await delayStep(stepDelay);

    // STAGE 2: CAPABILITY CHECK
    setActiveStage(2);
    emitEvent(
      'CAPABILITY_CHECK',
      `Checking manifest for tool '${scenario.targetTool}' and resource '${scenario.targetResource}'`,
      scenario.targetTool
    );
    setLiveLogSnippet(`[TCB] Comparing against Capability Manifest (${scenario.agentId})...`);
    await delayStep(stepDelay);

    // Try live backend call in background for real task ID / audit trail
    try {
      if (scenario.id === 'prompt_injection') {
        api.runAttackSimulation('poisoned_pdf').catch(() => {});
      } else if (scenario.id === 'data_exfiltration') {
        api.runAttackSimulation('data_exfiltration').catch(() => {});
      } else {
        api.runTaskPipeline(scenario.prompt, 'poisoned_doc').catch(() => {});
      }
    } catch (e) {
      // Graceful fallback: simulated data is self-contained
    }

    // STAGE 3: POLICY EVALUATION
    setActiveStage(3);
    emitEvent(
      'POLICY_VIOLATION',
      `Violations detected: ${scenario.violatedPolicies.join(', ')}`,
      scenario.targetTool
    );
    setLiveLogSnippet(`[POLICY] VIOLATION: ${scenario.violatedPolicies[0]} check failed.`);
    await delayStep(stepDelay);

    // STAGE 4: RISK ANALYSIS
    setActiveStage(4);
    emitEvent(
      'HIGH_RISK',
      `Risk Score: ${scenario.riskScore}/100 [CRITICAL]. Taint lineage: ${scenario.taintTags.join(', ')}`,
      scenario.targetTool,
      scenario.riskScore
    );
    setLiveLogSnippet(`[RISK_ENGINE] Score ${scenario.riskScore}/100 CRITICAL. Lineage tainted.`);
    await delayStep(stepDelay);

    // STAGE 5: 🚨 ACTION BLOCKED
    setActiveStage(5);
    emitEvent(
      'ACTION_BLOCKED',
      `BLOCKED: ${scenario.finalResult}`,
      scenario.targetTool,
      scenario.riskScore
    );
    setLiveLogSnippet(`[MONITOR] DENY: Execution token revoked. 0 BYTES RELEASED TO NETWORK.`);
    if (onThreatBlocked) onThreatBlocked();
    await delayStep(stepDelay);

    // STAGE 6: AUDIT EVIDENCE CREATED
    setActiveStage(6);
    emitEvent(
      'AUDIT_EVENT_CREATED',
      `Audit entry recorded for ${scenario.name} (SHA-256 evidence committed)`,
      scenario.targetTool
    );
    setLiveLogSnippet(`[AUDIT] Evidence ledger committed. Audit ID: fg-audit-${Date.now().toString(36)}`);

    setIsRunning(false);
    setIsPaused(false);
  };

  const handleResetDemo = () => {
    setActiveStage(0);
    setIsRunning(false);
    setIsPaused(false);
    pauseRef.current = false;
    skipRef.current = false;
    setLiveLogSnippet('');
  };

  const handleSelectScenario = (scen: DemoScenario) => {
    setSelectedScenario(scen);
    handleResetDemo();
  };

  const handleSkipAnimation = () => {
    skipRef.current = true;
  };

  const handleTogglePause = () => {
    pauseRef.current = !pauseRef.current;
    setIsPaused(pauseRef.current);
  };

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      {/* ========================================================================= */}
      {/* SCENARIO SELECTOR BAR (Feature 2)                                         */}
      {/* ========================================================================= */}
      <div className="p-3 sm:p-4 rounded-2xl border border-cyber-border bg-[#0E1524]/90 backdrop-blur-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              SELECT ATTACK SCENARIO:
            </span>
          </div>
          <span className="text-[10px] sm:text-xs font-mono text-slate-400">
            5 Controlled Simulations &bull; Real-Time Zero-Trust Interception
          </span>
        </div>

        {/* 5 Scenario Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {HACKATHON_SCENARIOS.map((scen) => {
            const isSelected = scen.id === selectedScenario.id;
            return (
              <button
                key={scen.id}
                onClick={() => handleSelectScenario(scen)}
                disabled={isRunning}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-400 shadow-glow-cyan text-white'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                } disabled:opacity-60`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    SCENARIO {scen.letter}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold ${
                      scen.riskLevel === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'
                    }`}
                  >
                    {scen.riskLevel}
                  </span>
                </div>
                <div className="text-xs font-mono font-bold truncate mt-1">
                  {scen.name}
                </div>
                <div className="text-[10px] text-slate-400 font-sans truncate mt-0.5">
                  {scen.tag}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ACTIVE SCENARIO METADATA CARD                                             */}
      {/* ========================================================================= */}
      <div className="p-3.5 sm:p-5 rounded-2xl border border-cyber-border bg-slate-950/80 backdrop-blur-md space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm sm:text-base font-extrabold text-white font-mono">
                {selectedScenario.name}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                RISK: {selectedScenario.riskLevel} ({selectedScenario.riskScore}/100)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                TOOL: {selectedScenario.targetTool}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed max-w-3xl">
              <strong className="text-slate-200">Attacker Intent:</strong> {selectedScenario.attackerIntent}
            </p>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => handleRunSecurityDemo()}
              disabled={isRunning}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-extrabold shadow-glow-cyan transition-all disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-slate-950 shrink-0" />
              <span>{isRunning ? 'EVALUATING PIPELINE...' : 'RUN SECURITY DEMO'}</span>
            </button>

            {isRunning && (
              <>
                <button
                  onClick={handleTogglePause}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-mono"
                  title={isPaused ? 'Resume' : 'Pause'}
                >
                  <Pause className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSkipAnimation}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-mono"
                  title="Fast Forward to Result"
                >
                  <FastForward className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={handleResetDemo}
              disabled={isRunning}
              className="flex items-center space-x-1 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white font-mono text-xs transition-colors disabled:opacity-50"
              title="Reset Demo Simulation State"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Live Attack Parameters Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">AGENT PROPOSAL:</span>
            <code className="text-rose-300 text-[11px] break-all block mt-0.5">
              {selectedScenario.agentAction}
            </code>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">VIOLATED POLICY:</span>
            <span className="text-amber-300 text-[11px] font-semibold block mt-0.5 truncate">
              {selectedScenario.violatedPolicies.join(' · ')}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">EXPECTED DECISION:</span>
            <span className="text-emerald-400 text-[11px] font-extrabold flex items-center space-x-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>BLOCK &bull; 0 BYTES LEAKED</span>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FEATURE 1 — VISUAL TIMELINE OF ATTACK INTERCEPTION                         */}
      {/* ========================================================================= */}
      <div className="p-3.5 sm:p-5 rounded-2xl border border-cyber-border bg-[#0E1526]/90 backdrop-blur-md shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-800 gap-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              ZERO-TRUST EVALUATION TIMELINE
            </span>
            {isRunning && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                STAGE {activeStage} OF 6 ACTIVE
              </span>
            )}
            {!isRunning && activeStage === 6 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                EVALUATION COMPLETE
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            AI Agent &rarr; Interception &rarr; Capability Check &rarr; Risk DAG &rarr; Block &rarr; Audit
          </span>
        </div>

        {/* 6 Stage Progressive Timeline Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
          {stages.map((stage) => {
            const Icon = stage.icon;
            const isPassed = activeStage > stage.id;
            const isCurrent = activeStage === stage.id;
            const isPending = activeStage < stage.id;

            let cardStyles = 'bg-slate-950/60 border-slate-800/80 text-slate-500 opacity-60';
            if (isCurrent) {
              cardStyles =
                stage.id === 5
                  ? 'bg-rose-950/40 border-rose-500 shadow-glow-red text-rose-200 ring-1 ring-rose-500/40 scale-[1.02]'
                  : 'bg-cyan-950/40 border-cyan-400 shadow-glow-cyan text-cyan-200 ring-1 ring-cyan-400/40 scale-[1.02]';
            } else if (isPassed) {
              cardStyles = 'bg-slate-900/80 border-slate-700 text-slate-300';
            }

            return (
              <div
                key={stage.id}
                className={`p-3 rounded-xl border transition-all flex flex-col justify-between min-h-[140px] relative ${cardStyles}`}
              >
                {/* Step Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-500">
                    STAGE 0{stage.id}
                  </span>
                  {isPassed && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                  {isCurrent && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  )}
                </div>

                {/* Stage Icon & Titles */}
                <div className="space-y-1 my-1">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <Icon className={`w-4 h-4 ${stage.color}`} />
                  </div>
                  <div className="font-mono font-bold text-xs leading-tight">
                    {stage.title}
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans leading-snug line-clamp-2">
                    {stage.desc}
                  </div>
                </div>

                {/* Stage Badge footer */}
                <div className="mt-2 pt-1 border-t border-slate-800/80 text-[8px] sm:text-[9px] font-mono truncate">
                  {isPassed ? (
                    <span className="text-emerald-400 font-semibold">[VERIFIED]</span>
                  ) : isCurrent ? (
                    <span className="text-cyan-300 font-bold uppercase animate-pulse">
                      [{stage.badge}]
                    </span>
                  ) : (
                    <span className="text-slate-600">[QUEUED]</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live log snippet during animation */}
        {liveLogSnippet && (
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs flex items-center space-x-2 text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0"></span>
            <span className="truncate">{liveLogSnippet}</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* FEATURE 3 — "WHY WAS THIS BLOCKED?" PANEL                                 */}
      {/* ========================================================================= */}
      {activeStage >= 5 && (
        <div className="p-4 sm:p-6 rounded-2xl border border-rose-500/40 bg-gradient-to-br from-rose-950/20 via-[#101422] to-slate-900/95 backdrop-blur-xl shadow-glow-red space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-rose-500/30 gap-2">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
                <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-white font-mono tracking-tight">
                    🚨 ACTION BLOCKED &bull; WHY WAS THIS BLOCKED?
                  </h3>
                </div>
                <p className="text-xs text-rose-300 font-mono">
                  Zero-Trust Reference Monitor Enforcement Report
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono text-xs font-bold">
                DECISION: DENY
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800 font-mono text-xs">
                AGENT: {selectedScenario.agentId}
              </span>
            </div>
          </div>

          {/* Explanation Body */}
          <div className="space-y-3 font-mono text-xs">
            {/* Primary Plain-English Reason */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-rose-500/30 space-y-1">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                SECURITY EXPLANATION:
              </span>
              <p className="text-sm text-slate-200 font-sans leading-relaxed">
                {selectedScenario.whyBlockedExplanation}
              </p>
            </div>

            {/* Violated Policies List */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                VIOLATED SECURITY POLICIES:
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedScenario.violatedPolicies.map((pol, idx) => (
                  <span
                    key={idx}
                    className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>{pol}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Evidence Comparison Table */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                AUTHORITY EVIDENCE COMPARISON:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {/* Requested */}
                <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/30 space-y-1">
                  <span className="text-rose-400 text-[10px] font-bold block">REQUESTED (Untrusted Agent):</span>
                  <div className="text-slate-300 text-[11px]">
                    <strong>Target:</strong> {selectedScenario.evidence.requestedResource}
                  </div>
                  <div className="text-slate-300 text-[11px] truncate">
                    <strong>Action:</strong> {selectedScenario.evidence.requestedAction}
                  </div>
                </div>

                {/* Allowed */}
                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                  <span className="text-emerald-400 text-[10px] font-bold block">AUTHORIZED (Capability Manifest):</span>
                  <div className="text-slate-300 text-[11px]">
                    <strong>Allowed:</strong> {selectedScenario.evidence.allowedResources}
                  </div>
                  <div className="text-slate-300 text-[11px] truncate">
                    <strong>Scope:</strong> {selectedScenario.evidence.allowedActions}
                  </div>
                </div>
              </div>

              {/* Taint tags */}
              <div className="pt-1 text-[11px] text-slate-400 flex flex-wrap items-center gap-1.5">
                <span className="text-slate-500">Taint tags detected:</span>
                {selectedScenario.taintTags.map((tag, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 7 — ATTACK RESULT CARD                                            */}
      {/* ========================================================================= */}
      {activeStage >= 5 && (
        <div className="p-4 sm:p-6 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-[#0C1522] via-slate-900 to-[#0A101D] backdrop-blur-xl shadow-glow-green space-y-4 animate-fade-in">
          {/* Result Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-emerald-500/30 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-glow-green">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-white font-mono tracking-wide">
                  🛡 THREAT INTERCEPTED &bull; 0 BYTES RELEASED
                </h3>
                <span className="text-xs text-emerald-400 font-mono">
                  Runtime Security Invariants Maintained &bull; Attack Neutralized
                </span>
              </div>
            </div>

            <div className="text-right font-mono text-xs">
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                TCB BOUNDARY: INTACT
              </span>
            </div>
          </div>

          {/* Verification Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30 flex items-center space-x-2 text-xs font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-200">Capability verified against manifest</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30 flex items-center space-x-2 text-xs font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-200">Policy constraints evaluated</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30 flex items-center space-x-2 text-xs font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-200">Threat blocked before dispatch</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30 flex items-center space-x-2 text-xs font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-200">Tamper-evident audit committed</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
