import React from 'react';
import {
  ShieldAlert,
  Upload,
  FileSpreadsheet,
  PlusCircle,
  BookOpen,
  Sparkles,
  Download,
  RotateCcw
} from 'lucide-react';

interface HeaderProps {
  onOpenUpload: () => void;
  onOpenManual: () => void;
  onOpenCompliance: () => void;
  onLoadSample: (sampleId: string) => void;
  onExportCSV: () => void;
  onExportExcel: () => void;
  onResetData: () => void;
  isProcessingBatch: boolean;
  totalRecords: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenUpload,
  onOpenManual,
  onOpenCompliance,
  onLoadSample,
  onExportCSV,
  onExportExcel,
  onResetData,
  isProcessingBatch,
  totalRecords
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Clinical Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-900/40">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">AegisTriage</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Healthcare Triage Agent
                </span>
                <span className="hidden sm:inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Clinical Safety, Fairness & Regulatory Routing Engine
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Sample Selector */}
            <div className="relative group hidden md:block">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
                Load Sample Batch
              </button>
              <div className="absolute right-0 mt-1 w-72 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2 hidden group-hover:block z-50">
                <div className="px-3 py-1 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  Preloaded Datasets
                </div>
                <button
                  onClick={() => onLoadSample('hospital-diverse-mix')}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-700/80 text-slate-200 flex flex-col"
                >
                  <span className="font-medium text-white flex items-center justify-between">
                    General Hospital Mix (12)
                    <span className="text-[10px] bg-cyan-900/60 text-cyan-300 px-1.5 py-0.5 rounded">All 12 Types</span>
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">Med error, interpreter denial, HIPAA, billing</span>
                </button>
                <button
                  onClick={() => onLoadSample('critical-safety-batch')}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-700/80 text-slate-200 flex flex-col border-t border-slate-700/60"
                >
                  <span className="font-medium text-red-300 flex items-center justify-between">
                    Critical Safety Incidents (4)
                    <span className="text-[10px] bg-red-950 text-red-300 px-1.5 py-0.5 rounded border border-red-800">High Risk</span>
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">Anaphylaxis, fall hematoma, perforated bowel</span>
                </button>
              </div>
            </div>

            {/* Upload File Button */}
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition"
              title="Upload CSV or Excel file"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload CSV / Excel</span>
            </button>

            {/* Quick Single Complaint */}
            <button
              onClick={onOpenManual}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Triage a single complaint narrative"
            >
              <PlusCircle className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Single Triage</span>
            </button>

            {/* Export Dropdown */}
            {totalRecords > 0 && (
              <div className="relative group">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  title="Export triaged records"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden lg:inline">Export</span>
                </button>
                <div className="absolute right-0 mt-1 w-44 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 hidden group-hover:block z-50">
                  <button
                    onClick={onExportCSV}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700 flex items-center justify-between"
                  >
                    <span>Export to CSV</span>
                    <span className="text-[10px] text-slate-400">.csv</span>
                  </button>
                  <button
                    onClick={onExportExcel}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700 flex items-center justify-between"
                  >
                    <span>Export to Excel</span>
                    <span className="text-[10px] text-slate-400">.xlsx</span>
                  </button>
                </div>
              </div>
            )}

            {/* Compliance Guide */}
            <button
              onClick={onOpenCompliance}
              className="inline-flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Healthcare Compliance & CMS Guidelines"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline">Guidelines</span>
            </button>

            {/* Clear / Reset */}
            {totalRecords > 0 && (
              <button
                onClick={onResetData}
                disabled={isProcessingBatch}
                className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
                title="Reset queue and load fresh data"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
