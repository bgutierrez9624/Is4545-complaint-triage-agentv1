import React, { useState } from 'react';
import {
  Flame,
  AlertTriangle,
  Info,
  CheckCircle,
  Copy,
  Check,
  UserCheck,
  Send,
  Building,
  ShieldAlert,
  Clock,
  Sparkles,
  FileText,
  User,
  Calendar,
  Layers,
  HelpCircle,
  CheckCircle2,
  FileEdit
} from 'lucide-react';
import { ComplaintRecord, TriageResult } from '../types/triage';

interface TriageInspectorProps {
  record: ComplaintRecord;
  onTriageRecord: (record: ComplaintRecord) => void;
  onUpdateAudit: (recordId: string, notes: string, status: 'Reviewed' | 'Escalated') => void;
  isTriaging: boolean;
  onClose?: () => void;
}

export const TriageInspector: React.FC<TriageInspectorProps> = ({
  record,
  onTriageRecord,
  onUpdateAudit,
  isTriaging,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [auditNotes, setAuditNotes] = useState(record.humanNotes || '');
  const [isAuditing, setIsAuditing] = useState(false);

  const triage = record.triageResult;

  const handleCopyStandardOutput = () => {
    if (!triage?.formattedOutput) return;
    navigator.clipboard.writeText(triage.formattedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAudit = (status: 'Reviewed' | 'Escalated') => {
    onUpdateAudit(record.id, auditNotes, status);
    setIsAuditing(false);
  };

  const getSeverityColor = (sev?: string) => {
    if (!sev) return 'border-slate-700 bg-slate-800 text-slate-300';
    if (sev.includes('Critical')) return 'border-rose-500/60 bg-rose-950/40 text-rose-300';
    if (sev.includes('High')) return 'border-amber-500/60 bg-amber-950/30 text-amber-300';
    if (sev.includes('Moderate')) return 'border-blue-500/60 bg-blue-950/30 text-blue-300';
    return 'border-emerald-500/60 bg-emerald-950/30 text-emerald-300';
  };

  const getPrioritySLA = (p?: string) => {
    if (p === 'Immediate') return 'Turnaround SLA: < 2 Hours (Sentinel / Safety Risk)';
    if (p === 'Priority') return 'Turnaround SLA: 24-48 Hours (Clinical / Equity Escalation)';
    return 'Turnaround SLA: 5 Business Days (Standard Grievance Resolution)';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col h-full text-slate-200">
      {/* Top Header */}
      <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-xs">
            TRG
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base text-white">{record.id}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {record.source}
              </span>
              {record.status === 'Reviewed' && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-medium">
                  Audited & Signed
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                {record.date}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-slate-500" />
                {record.patientIdentifier || 'Anonymous'}
              </span>
              {record.facilityOrDept && (
                <span className="flex items-center gap-1">
                  <Building className="w-3 h-3 text-slate-500" />
                  {record.facilityOrDept}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-2">
          {!triage && (
            <button
              onClick={() => onTriageRecord(record)}
              disabled={isTriaging}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isTriaging ? 'Triaging...' : 'Run Triage Agent'}</span>
            </button>
          )}

          {triage && (
            <button
              onClick={handleCopyStandardOutput}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg text-xs font-medium transition"
              title="Copy the exact standardized output block"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Output'}</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 text-xs">
        {/* Original Complaint Narrative */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              Original Patient Intake Narrative
            </span>
            <span className="text-slate-500">{record.complaintText.length} characters</span>
          </div>
          <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
            "{record.complaintText}"
          </p>
        </div>

        {/* If not triaged yet, show prompt */}
        {!triage && (
          <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center bg-slate-900/50">
            <div className="w-12 h-12 rounded-xl bg-slate-800 text-cyan-400 mx-auto flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Awaiting Complaint Triage</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
              Click the button below to execute Step 1 through Step 6: Category, Severity, Risk Detection, Routing, Human Review, and Executive Summary.
            </p>
            <button
              onClick={() => onTriageRecord(record)}
              disabled={isTriaging}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-md transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isTriaging ? 'Processing with Gemini 3.8...' : 'Run Healthcare Triage Agent'}</span>
            </button>
          </div>
        )}

        {/* If triaged, display Step 1 through Step 6 */}
        {triage && (
          <div className="space-y-4">
            {/* STEP 1: Complaint Category */}
            <div className="bg-slate-850 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-teal-900 text-teal-300 inline-flex items-center justify-center text-[10px]">1</span>
                  STEP 1: Complaint Category
                </span>
                <span className="text-[10px] text-slate-400">Classified Primary & Secondary</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <div className="px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-200 border border-teal-500/40 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
                  <span>Primary: {triage.primaryCategory}</span>
                </div>
                {triage.secondaryCategories && triage.secondaryCategories.length > 0 ? (
                  triage.secondaryCategories.map((sec, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium"
                    >
                      Secondary: {sec}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 text-[11px] italic">No secondary categories</span>
                )}
              </div>
            </div>

            {/* STEP 2: Severity Assessment */}
            <div className={`rounded-xl p-4 border ${getSeverityColor(triage.severityLevel)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-slate-900 text-white inline-flex items-center justify-center text-[10px]">2</span>
                  STEP 2: Severity Assessment
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-900/60 uppercase">
                  {triage.severityLevel}
                </span>
              </div>
              <div className="mt-2 bg-slate-900/70 rounded-lg p-3 border border-slate-800/80">
                <div className="text-[11px] font-semibold text-slate-300 mb-1">
                  Severity Justification:
                </div>
                <p className="text-slate-200 leading-relaxed text-xs">
                  {triage.severityJustification}
                </p>
              </div>
            </div>

            {/* STEP 3: Risk Detection */}
            <div className="bg-slate-850 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-900 text-amber-300 inline-flex items-center justify-center text-[10px]">3</span>
                  STEP 3: Risk Detection
                </span>
                <span className="text-[10px] text-slate-400">
                  {triage.identifiedRisks?.length || 0} Risk Flags Identified
                </span>
              </div>

              {triage.identifiedRisks && triage.identifiedRisks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {triage.identifiedRisks.map((risk, index) => (
                    <div
                      key={index}
                      className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        <span>{risk.riskType}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        {risk.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 text-xs italic bg-slate-900 rounded-lg p-3">
                  No high-level clinical or regulatory risk flags detected.
                </div>
              )}
            </div>

            {/* STEP 4: Escalation Recommendation */}
            <div className="bg-slate-850 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-cyan-900 text-cyan-300 inline-flex items-center justify-center text-[10px]">4</span>
                  STEP 4: Escalation Recommendation
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                  triage.escalationPriority === 'Immediate'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : triage.escalationPriority === 'Priority'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  Priority: {triage.escalationPriority}
                </span>
              </div>

              <div className="mt-2 bg-slate-900 rounded-lg p-3 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">ROUTE TO:</div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <Building className="w-4 h-4 text-cyan-400" />
                    <span>{triage.recommendedDepartment}</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 sm:text-right">
                  <span className="inline-flex items-center gap-1 text-slate-300 font-medium">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {getPrioritySLA(triage.escalationPriority)}
                  </span>
                </div>
              </div>
            </div>

            {/* STEP 5: Human Review Requirement */}
            <div className="bg-slate-850 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-purple-900 text-purple-300 inline-flex items-center justify-center text-[10px]">5</span>
                  STEP 5: Human Review Requirement
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  triage.humanReviewRequirement === 'Human Review Required'
                    ? 'bg-purple-950 text-purple-200 border border-purple-700'
                    : triage.humanReviewRequirement === 'Human Review Recommended'
                    ? 'bg-blue-950 text-blue-300 border border-blue-800'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {triage.humanReviewRequirement}
                </span>
              </div>

              <div className="mt-2 bg-slate-900 rounded-lg p-3 border border-slate-800">
                <div className="text-[11px] font-semibold text-slate-300 mb-1">
                  Human Oversight Trigger Rule:
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {triage.humanReviewReason || (
                    triage.humanReviewRequirement === 'Human Review Required'
                      ? 'Mandated for safety, discrimination allegations, privacy concerns, or legal/compliance risk.'
                      : 'Standard automated routing protocol.'
                  )}
                </p>
              </div>
            </div>

            {/* STEP 6: Executive Summary */}
            <div className="bg-slate-850 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-900 text-emerald-300 inline-flex items-center justify-center text-[10px]">6</span>
                  STEP 6: Executive Summary
                </span>
                <span className="text-[10px] text-slate-400">Clinical Leadership Brief</span>
              </div>
              <div className="mt-2 bg-slate-900 rounded-lg p-3 border border-slate-800 text-slate-100 font-medium leading-relaxed">
                {triage.executiveSummary}
              </div>
            </div>

            {/* OFFICIAL STANDARDIZED OUTPUT BLOCK (Prompt Mandate) */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  Official Standardized Output Format
                </span>
                <button
                  onClick={handleCopyStandardOutput}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition"
                >
                  {copied ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
                </button>
              </div>

              <pre className="bg-slate-900/90 text-slate-200 p-3 rounded-lg text-xs font-mono leading-relaxed overflow-x-auto border border-slate-800 whitespace-pre-wrap selection:bg-cyan-900">
{triage.formattedOutput}
              </pre>
            </div>

            {/* Clinical Auditor Sign-Off & Notes */}
            <div className="bg-slate-850 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <FileEdit className="w-3.5 h-3.5 text-teal-400" />
                  Human Auditor Oversight & Sign-Off
                </span>
                {record.auditedBy && (
                  <span className="text-[10px] text-emerald-400">
                    Audited by {record.auditedBy} on {record.auditedAt?.split('T')[0]}
                  </span>
                )}
              </div>

              <div className="space-y-2 mt-2">
                <textarea
                  rows={2}
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                  placeholder="Enter internal risk management notes, patient outreach records, or clinician follow-up instructions..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleSaveAudit('Reviewed')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium transition shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sign Off & Mark Audited</span>
                  </button>
                  <button
                    onClick={() => handleSaveAudit('Escalated')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white rounded-lg text-xs font-medium transition shadow-sm"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Escalate to Risk Council</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
