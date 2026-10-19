import React from 'react';
import {
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  UserCheck,
  Send
} from 'lucide-react';
import { ComplaintRecord } from '../types/triage';

interface MetricCardsProps {
  records: ComplaintRecord[];
  onFilterSeverity?: (severity: string) => void;
  onFilterHumanReview?: (status: string) => void;
  onFilterPriority?: (priority: string) => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  records,
  onFilterSeverity,
  onFilterHumanReview,
  onFilterPriority
}) => {
  const total = records.length;
  const triaged = records.filter(r => r.status !== 'Unprocessed' && r.triageResult).length;
  const pending = total - triaged;

  const level4Critical = records.filter(r => r.triageResult?.severityLevel === 'LEVEL 4 - Critical').length;
  const level3High = records.filter(r => r.triageResult?.severityLevel === 'LEVEL 3 - High').length;
  const humanReviewRequired = records.filter(r => r.triageResult?.humanReviewRequirement === 'Human Review Required').length;
  const immediateEscalation = records.filter(r => r.triageResult?.escalationPriority === 'Immediate').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* Total Complaints */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
          <span>Queue Intake</span>
          <Clock className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-white">{total}</span>
          <span className="text-xs text-slate-400">
            {pending > 0 ? `${pending} pending` : 'All triaged'}
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-teal-400"></span>
          <span>{triaged} Processed ({total > 0 ? Math.round((triaged / total) * 100) : 0}%)</span>
        </div>
      </div>

      {/* Level 4 Critical */}
      <button
        type="button"
        onClick={() => onFilterSeverity && onFilterSeverity('LEVEL 4 - Critical')}
        className={`text-left rounded-xl p-3.5 border transition cursor-pointer ${
          level4Critical > 0
            ? 'bg-rose-950/40 border-rose-800/80 hover:bg-rose-950/60 shadow-sm shadow-rose-950/30'
            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-xs font-semibold mb-1">
          <span className={level4Critical > 0 ? 'text-rose-300' : 'text-slate-400'}>
            Level 4 Critical
          </span>
          <Flame className={`w-3.5 h-3.5 ${level4Critical > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className={`text-2xl font-bold ${level4Critical > 0 ? 'text-rose-200' : 'text-slate-300'}`}>
            {level4Critical}
          </span>
          <span className="text-[11px] text-rose-400/80">Immediate Risk</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 truncate">
          Patient safety / Legal exposure
        </div>
      </button>

      {/* Level 3 High */}
      <button
        type="button"
        onClick={() => onFilterSeverity && onFilterSeverity('LEVEL 3 - High')}
        className={`text-left rounded-xl p-3.5 border transition cursor-pointer ${
          level3High > 0
            ? 'bg-amber-950/30 border-amber-800/60 hover:bg-amber-950/50'
            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-xs font-semibold mb-1">
          <span className={level3High > 0 ? 'text-amber-300' : 'text-slate-400'}>
            Level 3 High
          </span>
          <AlertTriangle className={`w-3.5 h-3.5 ${level3High > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className={`text-2xl font-bold ${level3High > 0 ? 'text-amber-200' : 'text-slate-300'}`}>
            {level3High}
          </span>
          <span className="text-[11px] text-amber-400/80">Potential Harm</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 truncate">
          Medication / Serious issues
        </div>
      </button>

      {/* Human Review Required */}
      <button
        type="button"
        onClick={() => onFilterHumanReview && onFilterHumanReview('Human Review Required')}
        className={`text-left rounded-xl p-3.5 border transition cursor-pointer ${
          humanReviewRequired > 0
            ? 'bg-purple-950/30 border-purple-800/60 hover:bg-purple-950/50'
            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-xs font-semibold mb-1">
          <span className={humanReviewRequired > 0 ? 'text-purple-300' : 'text-slate-400'}>
            Human Oversight
          </span>
          <UserCheck className={`w-3.5 h-3.5 ${humanReviewRequired > 0 ? 'text-purple-400' : 'text-slate-500'}`} />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className={`text-2xl font-bold ${humanReviewRequired > 0 ? 'text-purple-200' : 'text-slate-300'}`}>
            {humanReviewRequired}
          </span>
          <span className="text-[11px] text-purple-400/80">Required</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 truncate">
          Safety / Bias / Privacy audit
        </div>
      </button>

      {/* Immediate Escalation */}
      <button
        type="button"
        onClick={() => onFilterPriority && onFilterPriority('Immediate')}
        className={`text-left rounded-xl p-3.5 border transition cursor-pointer ${
          immediateEscalation > 0
            ? 'bg-red-950/30 border-red-800/60 hover:bg-red-950/50'
            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-xs font-semibold mb-1">
          <span className={immediateEscalation > 0 ? 'text-red-300' : 'text-slate-400'}>
            Immediate SLA
          </span>
          <Send className={`w-3.5 h-3.5 ${immediateEscalation > 0 ? 'text-red-400' : 'text-slate-500'}`} />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className={`text-2xl font-bold ${immediateEscalation > 0 ? 'text-red-200' : 'text-slate-300'}`}>
            {immediateEscalation}
          </span>
          <span className="text-[11px] text-red-400/80">&lt; 2h routing</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 truncate">
          Executive / Risk Mgmt
        </div>
      </button>

      {/* Triage Efficiency */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
          <span>AI Compliance Rate</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-teal-300">100%</span>
          <span className="text-[11px] text-slate-400">Standardized</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 truncate">
          CMS & Section 1557 Guarded
        </div>
      </div>
    </div>
  );
};
