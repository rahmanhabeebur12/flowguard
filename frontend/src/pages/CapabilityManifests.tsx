import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  ShieldCheck,
  Save,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Copy,
  Lock,
  Sliders,
  Send,
  FileText,
  Mail,
  AlertTriangle,
  ArrowRight,
  Eye,
  Info,
} from 'lucide-react';
import { api } from '../services/api';
import { CapabilityManifest } from '../types';

export const CapabilityManifests: React.FC = () => {
  const [manifest, setManifest] = useState<CapabilityManifest | null>(null);
  const [allowedActions, setAllowedActions] = useState<string[]>(['send_email', 'read_file']);
  const [allowedResources, setAllowedResources] = useState<string>('report.pdf');
  const [allowedDestinations, setAllowedDestinations] = useState<string>('professor@college.edu');
  const [releaseScope, setReleaseScope] = useState<string>('summary_only');
  const [purpose, setPurpose] = useState<string>('report_summary');

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const availableTools = [
    { id: 'send_email', label: 'send_email (Egress / Communication)' },
    { id: 'read_file', label: 'read_file (Local Storage Access)' },
    { id: 'query_database', label: 'query_database (SQL Store Access)' },
    { id: 'http_request', label: 'http_request (Web Gateway Dispatch)' },
    { id: 'calendar_event', label: 'calendar_event (Internal Scheduler)' },
    { id: 'bank_transfer', label: 'bank_transfer (High-Risk Financial Tool)' },
  ];

  const loadActivePolicy = async () => {
    try {
      const data = await api.getActivePolicy();
      setManifest(data);
      setAllowedActions(data.allowed_actions || []);
      setAllowedResources(data.allowed_resources?.join(', ') || '');
      setAllowedDestinations(data.allowed_destinations?.join(', ') || '');
      setReleaseScope(data.release_scope || 'summary_only');
      setPurpose(data.purpose || 'report_summary');
    } catch (e) {
      console.error('Failed to load active capability policy:', e);
    }
  };

  useEffect(() => {
    loadActivePolicy();
  }, []);

  const handleToggleAction = (actionId: string) => {
    setAllowedActions((prev) =>
      prev.includes(actionId) ? prev.filter((a) => a !== actionId) : [...prev, actionId]
    );
  };

  const handleSavePolicy = async () => {
    setIsSaving(true);
    try {
      const resourcesList = allowedResources
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const destinationsList = allowedDestinations
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const updated = await api.updateActivePolicy({
        allowed_actions: allowedActions,
        allowed_resources: resourcesList,
        allowed_destinations: destinationsList,
        release_scope: releaseScope as any,
        purpose: purpose.trim(),
        user_intent: `Policy governed execution: ${allowedActions.join(', ')} -> ${destinationsList.join(', ')}`,
      });

      setManifest(updated);
      setSaveMessage('Capability policy successfully saved and signed. Runtime Reference Monitor will now enforce these exact rules.');
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (e) {
      console.error(e);
      alert('Failed to save policy');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPolicy = async () => {
    try {
      const resetData = await api.resetActivePolicy();
      setManifest(resetData);
      setAllowedActions(resetData.allowed_actions || []);
      setAllowedResources(resetData.allowed_resources?.join(', ') || '');
      setAllowedDestinations(resetData.allowed_destinations?.join(', ') || '');
      setReleaseScope(resetData.release_scope || 'summary_only');
      setPurpose(resetData.purpose || 'report_summary');
      setSaveMessage('Capability policy restored to baseline defaults.');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopySignature = () => {
    if (manifest?.signature) {
      navigator.clipboard.writeText(manifest.signature);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Phase 12: Real-time Policy Impact Calculation
  const currentDest = manifest?.allowed_destinations?.join(', ') || 'professor@college.edu';
  const proposedDest = allowedDestinations.trim();
  const destChanged = currentDest !== proposedDest;

  const currentResources = manifest?.allowed_resources?.join(', ') || 'report.pdf';
  const proposedResources = allowedResources.trim();
  const resourceChanged = currentResources !== proposedResources;

  const emailAllowed = allowedActions.includes('send_email');
  const emailDisabled = manifest?.allowed_actions?.includes('send_email') && !emailAllowed;

  // Impact Prediction:
  const impactWarnings: string[] = [];
  if (destChanged && !proposedDest.includes('professor@college.edu')) {
    impactWarnings.push(
      'Legitimate professor email (professor@college.edu) -> WOULD FAIL Destination Authorization check.'
    );
  }
  if (emailDisabled) {
    impactWarnings.push('All email dispatch operations -> WOULD FAIL Tool Authorization check.');
  }
  if (resourceChanged && !proposedResources.includes('report.pdf')) {
    impactWarnings.push('Reading report.pdf -> WOULD FAIL Resource Authorization check.');
  }
  if (releaseScope === 'aggregates_only') {
    impactWarnings.push('Document summaries -> WOULD FAIL Release Scope (aggregates_only strictly enforced).');
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-cyber-border gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0">
              <FileCheck className="w-5 h-5" />
            </span>
            <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Capability Manifest &amp; Authority Policy Editor
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Zero-Trust Authority Synthesis. The AI agent cannot exceed these boundary limits under any circumstance.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleResetPolicy}
            className="flex-1 sm:flex-none justify-center flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>

          <button
            onClick={handleSavePolicy}
            disabled={isSaving}
            className="flex-1 sm:flex-none justify-center flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs shadow-glow-cyan transition-all disabled:opacity-50"
          >
            <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            <span className="truncate">{isSaving ? 'SAVING...' : 'SAVE POLICY'}</span>
          </button>
        </div>
      </div>

      {/* Save Notification */}
      {saveMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Main Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Editor */}
        <div className="lg:col-span-2 p-3.5 sm:p-6 rounded-2xl border border-cyber-border bg-[#0E1524]/85 backdrop-blur-md space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-mono font-bold uppercase text-white tracking-wider">
              1. Policy Parameters &amp; Ceilings
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              IMMUTABLE WHEN SIGNED
            </span>
          </div>

          {/* AUTHORIZED TOOLS (Phase 11) */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-300 font-semibold block">
              AUTHORIZED TOOLS (Select to permit):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableTools.map((t) => {
                const isChecked = allowedActions.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleToggleAction(t.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-mono flex items-center justify-between transition-all ${
                      isChecked
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300 shadow-glow-cyan'
                        : 'border-slate-800 bg-slate-900/60 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <span>{t.label}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        isChecked
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isChecked ? 'ALLOWED' : 'REVOKED'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AUTHORIZED DESTINATIONS (Phase 11) */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-slate-300 font-semibold">
                AUTHORIZED DESTINATIONS (Comma-separated addresses):
              </label>
              <span className="text-[10px] font-mono text-cyan-400">Strict Boundary</span>
            </div>
            <input
              type="text"
              value={allowedDestinations}
              onChange={(e) => setAllowedDestinations(e.target.value)}
              placeholder="e.g. professor@college.edu, team@internal.org"
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <p className="text-[11px] text-slate-500 font-sans">
              Any egress proposed outside this whitelist will be immediately BLOCKED or held for SOC approval.
            </p>
          </div>

          {/* AUTHORIZED RESOURCES (Phase 11) */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <label className="text-xs font-mono text-slate-300 font-semibold block">
              AUTHORIZED RESOURCES:
            </label>
            <input
              type="text"
              value={allowedResources}
              onChange={(e) => setAllowedResources(e.target.value)}
              placeholder="e.g. report.pdf, notes.txt"
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* AUTHORIZED RELEASE LEVEL (Phase 11) */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <label className="text-xs font-mono text-slate-300 font-semibold block">
              AUTHORIZED RELEASE LEVEL:
            </label>
            <select
              value={releaseScope}
              onChange={(e) => setReleaseScope(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="summary_only">summary_only (Derived overview; blocks raw full_content)</option>
              <option value="limited_fields">limited_fields (Select non-confidential columns)</option>
              <option value="aggregates_only">aggregates_only (Statistical metrics / counts only)</option>
              <option value="full_content">full_content (Complete file release — HIGH RISK)</option>
            </select>
          </div>

          {/* AUTHORIZED PURPOSE (Phase 11) */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <label className="text-xs font-mono text-slate-300 font-semibold block">
              AUTHORIZED PURPOSE:
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. report_summary"
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Right 1 Col: Active Policy Status + Phase 12 Policy Impact Preview */}
        <div className="space-y-6">
          {/* Active Policy Status Card */}
          <div className="p-3.5 sm:p-5 rounded-2xl border border-cyan-500/30 bg-[#0E1524]/85 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                Active Policy Status
              </span>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>ONLINE</span>
              </span>
            </div>

            {manifest ? (
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Destination:</span>
                  <span className="text-emerald-400 font-bold truncate max-w-[140px] sm:max-w-[180px] text-right">
                    {manifest.allowed_destinations?.join(', ') || 'None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Release Scope:</span>
                  <span className="text-cyan-300">{manifest.release_scope}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Purpose:</span>
                  <span className="text-slate-300">{manifest.purpose}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tools Allowed:</span>
                  <span className="text-slate-300">{manifest.allowed_actions?.length} tool(s)</span>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block mb-1">
                    SHA-256 Authority Signature:
                  </span>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[10px] text-cyan-400 break-all font-mono flex items-center justify-between">
                    <span className="truncate">{manifest.signature.slice(0, 24)}...</span>
                    <button
                      onClick={handleCopySignature}
                      className="text-slate-400 hover:text-white ml-1 shrink-0"
                      title="Copy full hash"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {copied && <span className="text-[10px] text-emerald-400">Copied!</span>}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-mono">Loading active policy...</p>
            )}
          </div>

          {/* Phase 12: POLICY IMPACT PREVIEW */}
          <div className="p-3.5 sm:p-5 rounded-2xl border border-amber-500/30 bg-amber-950/10 backdrop-blur-md space-y-3">
            <div className="flex items-center space-x-2 pb-2 border-b border-amber-500/20">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                Policy Impact Preview
              </h2>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-500">DESTINATION COMPARISON:</div>
                <div className="flex flex-col sm:flex-row sm:justify-between text-[11px] gap-0.5">
                  <span className="text-slate-400">CURRENT:</span>
                  <span className="text-slate-200 font-bold break-all">{currentDest}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between text-[11px] gap-0.5">
                  <span className="text-amber-400">PROPOSED:</span>
                  <span className="text-cyan-300 font-bold break-all">{proposedDest || '(None)'}</span>
                </div>
              </div>

              {/* Live Predicted Impact */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  PREDICTED RUNTIME IMPACT:
                </span>
                {impactWarnings.length > 0 ? (
                  <div className="space-y-1">
                    {impactWarnings.map((warn, i) => (
                      <div
                        key={i}
                        className="p-2 rounded bg-rose-950/30 border border-rose-800/40 text-[11px] text-rose-300 leading-relaxed font-sans"
                      >
                        <strong>&bull; IMPACT:</strong> {warn}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2 rounded bg-emerald-950/20 border border-emerald-800/30 text-[11px] text-emerald-300 font-sans">
                    &check; Standard executive workflows remain authorized within current scope.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
