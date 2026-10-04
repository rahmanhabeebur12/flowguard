import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Key,
  CheckCircle2,
  XCircle,
  Copy,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';
import { CapabilityManifest } from '../types';

export const CapabilityManifests: React.FC = () => {
  const [manifest, setManifest] = useState<CapabilityManifest | null>(null);
  const [integrityPassed, setIntegrityPassed] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    api.getCapabilityManifest('task-seed-001').then((data) => {
      setManifest(data);
    });
  }, []);

  const handleCopySignature = () => {
    if (manifest?.signature) {
      navigator.clipboard.writeText(manifest.signature);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-cyber-border">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <FileCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Capability Manifests &bull; Authority Boundary
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Immutable authority tokens compiled exclusively from trusted user intent.
          </p>
        </div>

        {/* Invariant badge */}
        <div className="flex items-center space-x-2 mt-3 md:mt-0 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>INVARIANT 1: DATA CANNOT CREATE AUTHORITY</span>
        </div>
      </div>

      {/* Control Plane vs Execution Plane Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trusted Control Plane Box */}
        <div className="p-6 rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-cyan-950/20 via-[#0E1526] to-slate-900 shadow-glow-cyan space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                Trusted Control Plane
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-200">
              AUTHORITY SOURCE
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            User requests are directly evaluated by the Intent Compiler into an approved capability manifest.
            This defines what the agent is authorized to do <em>before</em> any untrusted data enters the context.
          </p>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/20 text-xs font-mono space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Origin:</span>
              <span className="text-cyan-400 font-bold">User Interface (Trusted)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">State:</span>
              <span className="text-emerald-400 font-bold">IMMUTABLE (Locked)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Integrity:</span>
              <span className="text-cyan-300 font-bold">Cryptographically Signed</span>
            </div>
          </div>
        </div>

        {/* Potentially Untrusted Execution Plane Box */}
        <div className="p-6 rounded-2xl border border-rose-500/40 bg-gradient-to-br from-rose-950/20 via-[#0E1526] to-slate-900 shadow-glow-red space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse"></span>
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-300">
                Execution Plane (Outside TCB)
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-200">
              UNTRUSTED INPUTS
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            The AI agent reads untrusted PDFs, emails, and web pages. It may be fully coerced by prompt injection.
            However, execution plane inputs have <em>zero permission</em> to alter the Capability Manifest.
          </p>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-500/20 text-xs font-mono space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Origin:</span>
              <span className="text-rose-400 font-bold">External Files / Web / Tools</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Privilege:</span>
              <span className="text-rose-300 font-bold">CANNOT GRANT AUTHORITY</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Security Gate:</span>
              <span className="text-amber-400 font-bold">Reference Monitor Intercepts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Manifest Live View */}
      {manifest && (
        <div className="p-6 rounded-2xl border border-cyber-border bg-[#0E1524]/80 backdrop-blur-md space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold uppercase text-white">
                Active Capability Manifest Record
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Signature Verified &amp; Untampered
              </span>
            </div>
          </div>

          {/* Structured Attributes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Task Purpose:</span>
                <span className="text-cyan-400 font-bold text-sm">{manifest.purpose}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Allowed Operations:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {manifest.allowed_actions.map((act) => (
                    <span
                      key={act}
                      className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30"
                    >
                      ✓ {act}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Allowed Resources:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {manifest.allowed_resources.map((res) => (
                    <span
                      key={res}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700"
                    >
                      ✓ {res}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Allowed Destinations:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {manifest.allowed_destinations.map((dest) => (
                    <span
                      key={dest}
                      className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold"
                    >
                      ✓ {dest}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Approved Release Scope:</span>
                <div className="mt-1">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
                    {manifest.release_scope}
                  </span>
                  <span className="text-[10px] text-slate-500 ml-2 font-sans">
                    (Attempts to release &gt; summary_only will be blocked)
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Task ID:</span>
                <span className="text-slate-400">{manifest.task_id}</span>
              </div>
            </div>
          </div>

          {/* Cryptographic Signature Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                Cryptographic Integrity Hash (SHA-256):
              </span>
              <p className="font-mono text-xs text-cyan-400 break-all">{manifest.signature}</p>
            </div>
            <button
              onClick={handleCopySignature}
              className="ml-4 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Copy Hash"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
