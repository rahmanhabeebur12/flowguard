import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, ShieldAlert, ArrowRight } from 'lucide-react';
import { ApprovalRequest } from '../types';

interface ApprovalModalProps {
  request: ApprovalRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string, reason?: string) => Promise<void>;
  onReject: (id: string, reason?: string) => Promise<void>;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  const [operatorNote, setOperatorNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !request) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove(request.id, operatorNote || 'Operator approved destination');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      await onReject(request.id, operatorNote || 'Operator rejected unauthorized flow');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-amber-500/40 bg-[#0E1524] p-6 shadow-glow-amber text-slate-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">
              Security Approval Required
            </h3>
            <p className="text-xs text-amber-300/80 font-mono">
              UNCERTAIN AUTHORIZATION &bull; HUMAN-IN-THE-LOOP GATE
            </p>
          </div>
        </div>

        <div className="space-y-3 my-4 text-xs font-mono bg-slate-950/70 p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Task Intent:</span>
            <span className="text-slate-200 font-sans max-w-[280px] text-right truncate">
              {request.manifest_intent}
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Proposed Action:</span>
            <span className="text-cyan-400 font-bold">{request.tool_name}</span>
          </div>

          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Proposed Destination:</span>
            <span className="text-amber-400 font-bold">{request.destination || 'External'}</span>
          </div>

          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Release Scope:</span>
            <span className="text-slate-300">{request.release || 'summary_only'}</span>
          </div>

          <div className="pt-1">
            <span className="text-slate-400 block mb-1">Policy Monitor Assessment:</span>
            <p className="text-amber-300 font-sans leading-relaxed text-xs">
              {request.reason}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-mono text-slate-400 mb-1">
            Operator Audit Justification (Optional):
          </label>
          <input
            type="text"
            value={operatorNote}
            onChange={(e) => setOperatorNote(e.target.value)}
            placeholder="e.g. Verified partner domain out-of-band..."
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={handleReject}
            disabled={isSubmitting}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-semibold font-mono transition-colors disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject Call</span>
          </button>

          <button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 text-xs font-semibold font-mono shadow-glow-green transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve Once</span>
          </button>
        </div>
      </div>
    </div>
  );
};
