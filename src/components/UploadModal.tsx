import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Download,
  X,
  Sparkles,
  FileText
} from 'lucide-react';
import { parseCSVOrExcelFile, ParsedFileResult, generateSampleCSVString } from '../utils/fileParser';
import { SAMPLE_DATASETS } from '../data/sampleComplaints';
import { ComplaintRecord } from '../types/triage';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (records: ComplaintRecord[], sourceName: string) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<ParsedFileResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    setIsParsing(true);
    setParseError(null);
    try {
      const result = await parseCSVOrExcelFile(file);
      setParsedPreview(result);
    } catch (err: any) {
      setParseError(err.message || 'Failed to read file. Please check format.');
    } finally {
      setIsParsing(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadSampleTemplate = () => {
    const csvContent = generateSampleCSVString();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'healthcare-complaints-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleConfirmImport = () => {
    if (parsedPreview) {
      onDataLoaded(parsedPreview.records, parsedPreview.fileName);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Upload Complaint Data Source
              </h2>
              <p className="text-xs text-slate-400">
                Support for CSV and Microsoft Excel (.xlsx, .xls) files
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center ${
              isDragging
                ? 'border-teal-400 bg-teal-950/20'
                : 'border-slate-700 hover:border-slate-500 bg-slate-950/40'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
              accept=".csv,.xlsx,.xls"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-xl bg-slate-800 text-teal-400 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-white mb-1">
              Click to select or drag and drop your spreadsheet
            </p>
            <p className="text-xs text-slate-400 max-w-sm mb-3">
              Upload patient portal exports, CAHPS survey dumps, grievance registers, or online reviews.
            </p>
            <span className="text-[11px] font-medium text-slate-500 px-3 py-1 bg-slate-800 rounded-full">
              .CSV, .XLSX, or .XLS format
            </span>
          </div>

          {/* Loading / Error states */}
          {isParsing && (
            <div className="text-center py-4 text-cyan-400 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Parsing spreadsheet structure...</span>
            </div>
          )}

          {parseError && (
            <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-3.5 flex items-start gap-2.5 text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-xs text-rose-300">File Parsing Error</p>
                <p className="text-[11px] text-rose-200/90">{parseError}</p>
              </div>
            </div>
          )}

          {/* Parsed Preview */}
          {parsedPreview && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-teal-400" />
                  <span className="font-bold text-white text-xs">{parsedPreview.fileName}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-teal-900/40 text-teal-300 border border-teal-700/50">
                    {parsedPreview.totalRows} valid records detected
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Complaint Text Column:</span>
                  <span className="font-mono text-cyan-300 truncate block">
                    {parsedPreview.detectedColumns.textColumn}
                  </span>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">ID Column:</span>
                  <span className="font-mono text-slate-200 truncate block">
                    {parsedPreview.detectedColumns.idColumn || '(Auto-generated)'}
                  </span>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Date Column:</span>
                  <span className="font-mono text-slate-200 truncate block">
                    {parsedPreview.detectedColumns.dateColumn || '(Today\'s date)'}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                Sample preview: <span className="italic text-slate-300">"{parsedPreview.records[0]?.complaintText.slice(0, 120)}..."</span>
              </div>
            </div>
          )}

          {/* Download Sample Template & Quick Samples */}
          <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleDownloadSampleTemplate}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Download CSV Template</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 hidden sm:inline">Or load preset:</span>
              <button
                type="button"
                onClick={() => {
                  const sample = SAMPLE_DATASETS[0];
                  onDataLoaded(sample.records, sample.name);
                  onClose();
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg text-xs font-medium border border-slate-700 transition"
              >
                Hospital Batch (12)
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-850 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={!parsedPreview}
            className="inline-flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Import & Load Queue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
