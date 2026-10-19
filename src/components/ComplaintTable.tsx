import React from 'react';
import {
  Flame,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Send,
  UserCheck
} from 'lucide-react';
import { ComplaintRecord } from '../types/triage';

interface ComplaintTableProps {
  records: ComplaintRecord[];
  selectedId: string | null;
  onSelectRecord: (record: ComplaintRecord) => void;
  onTriageSingle: (record: ComplaintRecord) => void;
  selectedIds: string[];
  onToggleSelectId: (id: string) => void;
  onToggleSelectAll: () => void;
  onTriageBatch: (recordsToTriage: ComplaintRecord[]) => void;
  isProcessingBatch: boolean;
}

export const ComplaintTable: React.FC<ComplaintTableProps> = ({
  records,
  selectedId,
  onSelectRecord,
  onTriageSingle,
  selectedIds,
  onToggleSelectId,
  onToggleSelectAll,
  onTriageBatch,
  isProcessingBatch
}) => {
  const allSelected = records.length > 0 && selectedIds.length === records.length;
  const untriagedRecords = records.filter(r => r.status === 'Unprocessed');

  const getSeverityBadge = (severity?: string) => {
    if (!severity) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-400">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
    }

    if (severity.includes('Critical')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
          <Flame className="w-3 h-3 text-rose-400" />
          L4 Critical
        </span>
      );
    }
    if (severity.includes('High')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          L3 High
        </span>
      );
    }
    if (severity.includes('Moderate')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
          <Info className="w-3 h-3 text-blue-400" />
          L2 Moderate
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
        <CheckCircle className="w-3 h-3 text-emerald-400" />
        L1 Low
      </span>
    );
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    if (priority === 'Immediate') {
      return (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 uppercase tracking-wider">
          Immediate
        </span>
      );
    }
    if (priority === 'Priority') {
      return (
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
          Priority
        </span>
      );
    }
    return (
      <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
        Routine
      </span>
    );
  };

  const getHumanReviewBadge = (req?: string) => {
    if (!req) return null;
    if (req === 'Human Review Required') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 border border-purple-700/60">
          <UserCheck className="w-3 h-3 text-purple-400" />
          Review Required
        </span>
      );
    }
    if (req === 'Human Review Recommended') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-300 border border-blue-700/40">
          Recommended
        </span>
      );
    }
    return (
      <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded-full bg-slate-800">
        AI Review Only
      </span>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* Batch Control Bar */}
      <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onToggleSelectAll}
              className="rounded bg-slate-800 border-slate-700 text-teal-600 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Select All ({records.length})</span>
          </label>
          {selectedIds.length > 0 && (
            <span className="text-teal-400 font-semibold">
              ({selectedIds.length} selected)
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {selectedIds.length > 0 && (
            <button
              onClick={() => {
                const selectedRecords = records.filter(r => selectedIds.includes(r.id));
                onTriageBatch(selectedRecords);
              }}
              disabled={isProcessingBatch}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Triage Selected ({selectedIds.length})</span>
            </button>
          )}

          {untriagedRecords.length > 0 && (
            <button
              onClick={() => onTriageBatch(untriagedRecords)}
              disabled={isProcessingBatch}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg text-xs font-semibold transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Triage All Untriaged ({untriagedRecords.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-800/60 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              <th className="py-2.5 px-3 w-8"></th>
              <th className="py-2.5 px-3">Case & Source</th>
              <th className="py-2.5 px-3">Complaint Narrative</th>
              <th className="py-2.5 px-3">Severity & Category</th>
              <th className="py-2.5 px-3">Routing & Priority</th>
              <th className="py-2.5 px-3">Oversight</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {records.map((record) => {
              const isSelected = selectedId === record.id;
              const isChecked = selectedIds.includes(record.id);
              const triage = record.triageResult;

              return (
                <tr
                  key={record.id}
                  onClick={() => onSelectRecord(record)}
                  className={`hover:bg-slate-800/50 transition cursor-pointer ${
                    isSelected ? 'bg-cyan-950/30 border-l-2 border-l-cyan-500' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleSelectId(record.id)}
                      className="rounded bg-slate-800 border-slate-700 text-teal-600 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
                    />
                  </td>

                  {/* Case & Source */}
                  <td className="py-3 px-3 min-w-[130px]">
                    <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                      <span>{record.id}</span>
                      {record.status === 'Reviewed' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Audited by Human" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[140px] mt-0.5">
                      {record.source}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {record.facilityOrDept || record.date}
                    </div>
                  </td>

                  {/* Narrative snippet */}
                  <td className="py-3 px-3 max-w-[280px]">
                    <p className="text-slate-300 line-clamp-2 leading-relaxed">
                      {record.complaintText}
                    </p>
                    {triage && triage.identifiedRisks && triage.identifiedRisks.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {triage.identifiedRisks.slice(0, 2).map((risk, i) => (
                          <span
                            key={i}
                            className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-rose-300/90 border border-slate-700"
                          >
                            {risk.riskType}
                          </span>
                        ))}
                        {triage.identifiedRisks.length > 2 && (
                          <span className="text-[9px] text-slate-400">
                            +{triage.identifiedRisks.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Severity & Category */}
                  <td className="py-3 px-3 min-w-[140px]">
                    <div className="mb-1">
                      {getSeverityBadge(triage?.severityLevel)}
                    </div>
                    <div className="text-[11px] font-medium text-slate-200 truncate">
                      {triage ? triage.primaryCategory : <span className="text-slate-500 italic">Not Triaged</span>}
                    </div>
                    {triage?.secondaryCategories && triage.secondaryCategories.length > 0 && (
                      <div className="text-[10px] text-slate-400 truncate">
                        +{triage.secondaryCategories[0]}
                      </div>
                    )}
                  </td>

                  {/* Routing & Priority */}
                  <td className="py-3 px-3 min-w-[140px]">
                    {triage ? (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          {getPriorityBadge(triage.escalationPriority)}
                        </div>
                        <div className="text-[11px] text-slate-300 font-medium truncate">
                          {triage.recommendedDepartment}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[11px] italic">Pending</span>
                    )}
                  </td>

                  {/* Oversight */}
                  <td className="py-3 px-3 min-w-[130px]">
                    {triage ? (
                      <div>
                        {getHumanReviewBadge(triage.humanReviewRequirement)}
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[11px] italic">Pending</span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                    {triage ? (
                      <button
                        onClick={() => onSelectRecord(record)}
                        className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/40 rounded transition"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onTriageSingle(record)}
                        disabled={isProcessingBatch}
                        className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 bg-teal-600/80 hover:bg-teal-500 text-white rounded transition shadow-sm"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Triage</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
