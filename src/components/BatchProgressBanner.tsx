import React from 'react';
import { Sparkles, Loader2, X } from 'lucide-react';

interface BatchProgressBannerProps {
  current: number;
  total: number;
  currentTitle?: string;
  isProcessing: boolean;
  onCancel?: () => void;
}

export const BatchProgressBanner: React.FC<BatchProgressBannerProps> = ({
  current,
  total,
  currentTitle,
  isProcessing,
  onCancel
}) => {
  if (!isProcessing || total === 0) return null;

  const percentage = Math.round((current / total) * 100);

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-md w-full bg-slate-900 border border-teal-500/50 rounded-xl p-4 shadow-2xl animate-slide-up text-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
          <span className="text-xs font-bold text-white">
            AI Triage in Progress...
          </span>
          <span className="text-[11px] font-mono text-teal-300">
            {current}/{total} ({percentage}%)
          </span>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white p-1 rounded"
            title="Stop processing"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-teal-500 to-cyan-400 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {currentTitle && (
        <p className="text-[11px] text-slate-400 truncate">
          Analyzing: <span className="text-slate-200">{currentTitle}</span>
        </p>
      )}
    </div>
  );
};
