import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import {
  COMPLAINT_CATEGORIES,
  SEVERITY_LEVELS,
  RECOMMENDED_DEPARTMENTS
} from '../utils/triageEngine';
import { TriageFilterState } from '../types/triage';

interface FilterBarProps {
  filters: TriageFilterState;
  onChange: (updated: Partial<TriageFilterState>) => void;
  onReset: () => void;
  totalFiltered: number;
  totalAll: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  onReset,
  totalFiltered,
  totalAll
}) => {
  const hasActiveFilters =
    filters.searchQuery ||
    filters.severityFilter ||
    filters.categoryFilter ||
    filters.priorityFilter ||
    filters.humanReviewFilter ||
    filters.departmentFilter ||
    filters.statusFilter;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4 text-slate-200">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search complaint text, patient ID, MRN, facility, or keyword..."
            value={filters.searchQuery}
            onChange={(e) => onChange({ searchQuery: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onChange({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Severity */}
          <select
            value={filters.severityFilter}
            onChange={(e) => onChange({ severityFilter: e.target.value })}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="">All Severities</option>
            {SEVERITY_LEVELS.map(lvl => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>

          {/* Category */}
          <select
            value={filters.categoryFilter}
            onChange={(e) => onChange({ categoryFilter: e.target.value })}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-cyan-500 cursor-pointer max-w-[150px] truncate"
          >
            <option value="">All Categories</option>
            {COMPLAINT_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Human Review Status */}
          <select
            value={filters.humanReviewFilter}
            onChange={(e) => onChange({ humanReviewFilter: e.target.value })}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="">All Review Types</option>
            <option value="Human Review Required">Human Review Required</option>
            <option value="Human Review Recommended">Human Review Recommended</option>
            <option value="AI Review Only">AI Review Only</option>
          </select>

          {/* Escalation Priority */}
          <select
            value={filters.priorityFilter}
            onChange={(e) => onChange({ priorityFilter: e.target.value })}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="">All Urgencies</option>
            <option value="Immediate">Immediate Priority</option>
            <option value="Priority">Priority</option>
            <option value="Routine">Routine</option>
          </select>

          {/* Department */}
          <select
            value={filters.departmentFilter}
            onChange={(e) => onChange({ departmentFilter: e.target.value })}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-cyan-500 cursor-pointer max-w-[150px] truncate"
          >
            <option value="">All Departments</option>
            {RECOMMENDED_DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-2 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded-lg transition"
              title="Clear all active filters"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear ({totalFiltered}/{totalAll})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
