import React from 'react';
import {
  BookOpen,
  X,
  ShieldAlert,
  AlertTriangle,
  Scale,
  Lock,
  HeartPulse,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface ComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComplianceModal: React.FC<ComplianceModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Clinical Safety & Regulatory Triage Standards
              </h2>
              <p className="text-xs text-slate-400">
                Operating rules, severity tiers, risk criteria, and mandatory human review protocols
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-300">
          {/* Mission & Guardrails Banner */}
          <div className="bg-gradient-to-r from-teal-950/40 to-cyan-950/40 border border-teal-800/60 rounded-xl p-4">
            <h3 className="font-bold text-sm text-teal-300 flex items-center gap-2 mb-1">
              <ShieldAlert className="w-4 h-4 text-teal-400" />
              Role of the Healthcare Complaint Triage Agent
            </h3>
            <p className="text-slate-200 leading-relaxed text-xs">
              The agent's role is <strong>NOT to resolve complaints</strong>. The purpose is to objectively classify what happened, assess clinical/operational severity, flag exposure risks, route to the correct leadership department, determine urgency, and enforce mandatory human review oversight.
            </p>
          </div>

          {/* Severity Levels */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-2.5 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-rose-400" />
              Step 2: Four-Tier Severity Assessment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-slate-950 border border-emerald-900/50 rounded-lg p-3">
                <span className="font-bold text-emerald-300 block mb-1">LEVEL 1 – Low</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Minor inconvenience, routine dissatisfaction, general suggestion. No clinical harm or regulatory exposure.
                </p>
              </div>
              <div className="bg-slate-950 border border-blue-900/50 rounded-lg p-3">
                <span className="font-bold text-blue-300 block mb-1">LEVEL 2 – Moderate</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Repeated service failures, significant patient frustration, communication breakdown, billing discrepancies.
                </p>
              </div>
              <div className="bg-slate-950 border border-amber-900/50 rounded-lg p-3">
                <span className="font-bold text-amber-300 block mb-1">LEVEL 3 – High</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Potential patient harm, medication-related concern, serious accessibility issue, or escalated grievance.
                </p>
              </div>
              <div className="bg-slate-950 border border-rose-900/50 rounded-lg p-3">
                <span className="font-bold text-rose-300 block mb-1">LEVEL 4 – Critical</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Immediate patient safety risk, potential legal exposure, serious privacy violation, or discrimination allegation.
                </p>
              </div>
            </div>
          </div>

          {/* Mandatory Human Review Criteria */}
          <div className="bg-purple-950/30 border border-purple-800/60 rounded-xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-200 mb-2 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-purple-400" />
              Step 5: Mandatory Human Review Triggers
            </h3>
            <p className="text-slate-300 text-xs mb-2">
              The agent strictly enforces <strong className="text-purple-200">"Human Review Required"</strong> whenever any of the following triggers are met:
            </p>
            <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc list-inside">
              <li><strong>Patient safety concerns:</strong> Medication dosing errors, patient falls, post-procedure complications, missed acute symptoms.</li>
              <li><strong>Discrimination allegations:</strong> Denied language interpreters, civil rights violations under ACA Section 1557 or Title VI.</li>
              <li><strong>Privacy concerns:</strong> Protected Health Information (PHI) disclosures, unauthorized chart access under HIPAA.</li>
              <li><strong>Legal or compliance risks:</strong> Explicit legal threats, regulatory filings with state health departments or CMS.</li>
              <li><strong>Ambiguous complaints:</strong> Complex multi-provider events requiring formal chart audit and interview.</li>
            </ul>
          </div>

          {/* 8 Risk Flags */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-2">
              Step 3: Applicable Healthcare Risk Categories
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="font-semibold text-rose-300 block">Patient Safety</span>
                <span className="text-slate-400">Direct physical harm</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="font-semibold text-amber-300 block">Clinical Risk</span>
                <span className="text-slate-400">Diagnostic/treatment care</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="font-semibold text-purple-300 block">Compliance</span>
                <span className="text-slate-400">CMS, OIG, or laws</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="font-semibold text-cyan-300 block">Privacy</span>
                <span className="text-slate-400">HIPAA & PHI breach</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="font-semibold text-teal-300 block">Accessibility</span>
                <span className="text-slate-400">ADA physical barriers</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="font-semibold text-pink-300 block">Equity</span>
                <span className="text-slate-400">Bias or language barrier</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="font-semibold text-blue-300 block">Reputational</span>
                <span className="text-slate-400">CAHPS / media impact</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="font-semibold text-indigo-300 block">Operational</span>
                <span className="text-slate-400">Process/system delays</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-850 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
