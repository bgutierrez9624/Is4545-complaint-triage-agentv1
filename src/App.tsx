import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { FilterBar } from './components/FilterBar';
import { ComplaintTable } from './components/ComplaintTable';
import { TriageInspector } from './components/TriageInspector';
import { UploadModal } from './components/UploadModal';
import { ManualTriageModal } from './components/ManualTriageModal';
import { ComplianceModal } from './components/ComplianceModal';
import { BatchProgressBanner } from './components/BatchProgressBanner';
import { SAMPLE_DATASETS } from './data/sampleComplaints';
import { ComplaintRecord, TriageFilterState, TriageResult } from './types/triage';
import { ruleBasedTriage } from './utils/triageEngine';
import { exportToCSV, exportToExcel } from './utils/fileParser';
import { Sparkles, FileSpreadsheet, Plus, ShieldCheck, RefreshCw } from 'lucide-react';

const STORAGE_KEY = 'aegis_triage_queue_v1';

export default function App() {
  const [records, setRecords] = useState<ComplaintRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }

    // Default to the comprehensive 12-case dataset, with the first 3 pre-triaged for immediate rich inspection
    const defaultBatch = JSON.parse(JSON.stringify(SAMPLE_DATASETS[0].records));
    for (let i = 0; i < 3; i++) {
      if (defaultBatch[i]) {
        defaultBatch[i].triageResult = ruleBasedTriage(defaultBatch[i].complaintText, defaultBatch[i].source);
        defaultBatch[i].status = 'Triaged';
      }
    }
    return defaultBatch;
  });

  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(() => {
    return records[0]?.id || null;
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isComplianceOpen, setIsComplianceOpen] = useState(false);

  // Batch triage state
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; currentTitle?: string }>({
    current: 0,
    total: 0
  });
  const cancelBatchRef = useRef(false);

  // Single triage state
  const [triagingRecordId, setTriagingRecordId] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<TriageFilterState>({
    searchQuery: '',
    severityFilter: '',
    categoryFilter: '',
    priorityFilter: '',
    humanReviewFilter: '',
    departmentFilter: '',
    statusFilter: '',
    sourceFilter: ''
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch {
      // ignore
    }
  }, [records]);

  // Selected record object
  const selectedRecord = useMemo(() => {
    return records.find(r => r.id === selectedRecordId) || records[0] || null;
  }, [records, selectedRecordId]);

  // Filtered list
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      // Search
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchesText = record.complaintText.toLowerCase().includes(q);
        const matchesId = record.id.toLowerCase().includes(q);
        const matchesPatient = (record.patientIdentifier || '').toLowerCase().includes(q);
        const matchesDept = (record.facilityOrDept || '').toLowerCase().includes(q);
        const matchesCategory = (record.triageResult?.primaryCategory || '').toLowerCase().includes(q);
        if (!matchesText && !matchesId && !matchesPatient && !matchesDept && !matchesCategory) {
          return false;
        }
      }

      // Severity
      if (filters.severityFilter && record.triageResult?.severityLevel !== filters.severityFilter) {
        return false;
      }

      // Category
      if (filters.categoryFilter && record.triageResult?.primaryCategory !== filters.categoryFilter) {
        return false;
      }

      // Human Review
      if (filters.humanReviewFilter && record.triageResult?.humanReviewRequirement !== filters.humanReviewFilter) {
        return false;
      }

      // Priority
      if (filters.priorityFilter && record.triageResult?.escalationPriority !== filters.priorityFilter) {
        return false;
      }

      // Department
      if (filters.departmentFilter && record.triageResult?.recommendedDepartment !== filters.departmentFilter) {
        return false;
      }

      // Status
      if (filters.statusFilter && record.status !== filters.statusFilter) {
        return false;
      }

      return true;
    });
  }, [records, filters]);

  // Call server to triage a single complaint
  const executeTriageApi = async (complaintText: string, metadata?: any): Promise<TriageResult> => {
    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaint: complaintText,
          metadata
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.triage) {
        return data.triage;
      }
      throw new Error('No triage returned from server');
    } catch (err) {
      console.warn('Falling back to client-side clinical triage engine:', err);
      // Deterministic certified fallback
      return ruleBasedTriage(complaintText, metadata?.source);
    }
  };

  // Triage single record
  const handleTriageSingle = async (record: ComplaintRecord) => {
    setTriagingRecordId(record.id);
    try {
      const triage = await executeTriageApi(record.complaintText, {
        source: record.source,
        patientIdentifier: record.patientIdentifier,
        facilityOrDept: record.facilityOrDept
      });

      setRecords(prev =>
        prev.map(r =>
          r.id === record.id
            ? { ...r, triageResult: triage, status: 'Triaged' }
            : r
        )
      );

      setSelectedRecordId(record.id);
    } catch (err: any) {
      console.error('Triage error:', err);
    } finally {
      setTriagingRecordId(null);
    }
  };

  // Triage batch
  const handleTriageBatch = async (recordsToTriage: ComplaintRecord[]) => {
    if (recordsToTriage.length === 0) return;

    setIsProcessingBatch(true);
    cancelBatchRef.current = false;
    setBatchProgress({
      current: 0,
      total: recordsToTriage.length,
      currentTitle: recordsToTriage[0]?.id
    });

    for (let i = 0; i < recordsToTriage.length; i++) {
      if (cancelBatchRef.current) break;

      const target = recordsToTriage[i];
      setBatchProgress({
        current: i + 1,
        total: recordsToTriage.length,
        currentTitle: `${target.id} (${target.source})`
      });

      try {
        const triage = await executeTriageApi(target.complaintText, {
          source: target.source,
          patientIdentifier: target.patientIdentifier,
          facilityOrDept: target.facilityOrDept
        });

        setRecords(prev =>
          prev.map(r =>
            r.id === target.id
              ? { ...r, triageResult: triage, status: 'Triaged' }
              : r
          )
        );
      } catch (err) {
        console.error(`Batch item ${target.id} failed:`, err);
      }
    }

    setIsProcessingBatch(false);
    setSelectedIds([]);
  };

  // Human Audit update
  const handleUpdateAudit = (recordId: string, notes: string, status: 'Reviewed' | 'Escalated') => {
    setRecords(prev =>
      prev.map(r =>
        r.id === recordId
          ? {
              ...r,
              humanNotes: notes,
              status,
              auditedBy: 'Clinical Triage Coordinator',
              auditedAt: new Date().toISOString()
            }
          : r
      )
    );
  };

  // Load preset dataset
  const handleLoadSample = (sampleId: string) => {
    const found = SAMPLE_DATASETS.find(s => s.id === sampleId);
    if (found) {
      const cloned = JSON.parse(JSON.stringify(found.records));
      setRecords(cloned);
      setSelectedRecordId(cloned[0]?.id || null);
      setSelectedIds([]);
      setFilters({
        searchQuery: '',
        severityFilter: '',
        categoryFilter: '',
        priorityFilter: '',
        humanReviewFilter: '',
        departmentFilter: '',
        statusFilter: '',
        sourceFilter: ''
      });
    }
  };

  // Import custom file
  const handleDataLoaded = (imported: ComplaintRecord[], sourceName: string) => {
    setRecords(imported);
    setSelectedRecordId(imported[0]?.id || null);
    setSelectedIds([]);
  };

  // Manual intake
  const handleManualSubmit = async (newRecord: ComplaintRecord, andRunTriage: boolean) => {
    setRecords(prev => [newRecord, ...prev]);
    setSelectedRecordId(newRecord.id);

    if (andRunTriage) {
      await handleTriageSingle(newRecord);
    }
  };

  // Selection handlers
  const handleToggleSelectId = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecords.map(r => r.id));
    }
  };

  // Reset queue
  const handleResetData = () => {
    if (window.confirm('Reset queue back to the default 12-case benchmark dataset?')) {
      handleLoadSample('hospital-diverse-mix');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-900 selection:text-white">
      {/* Top Navbar */}
      <Header
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenManual={() => setIsManualOpen(true)}
        onOpenCompliance={() => setIsComplianceOpen(true)}
        onLoadSample={handleLoadSample}
        onExportCSV={() => exportToCSV(records)}
        onExportExcel={() => exportToExcel(records)}
        onResetData={handleResetData}
        isProcessingBatch={isProcessingBatch}
        totalRecords={records.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        {/* Metric Cards */}
        <MetricCards
          records={records}
          onFilterSeverity={(sev) => setFilters(prev => ({ ...prev, severityFilter: prev.severityFilter === sev ? '' : sev }))}
          onFilterHumanReview={(hr) => setFilters(prev => ({ ...prev, humanReviewFilter: prev.humanReviewFilter === hr ? '' : hr }))}
          onFilterPriority={(p) => setFilters(prev => ({ ...prev, priorityFilter: prev.priorityFilter === p ? '' : p }))}
        />

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onChange={(up) => setFilters(prev => ({ ...prev, ...up }))}
          onReset={() => setFilters({
            searchQuery: '',
            severityFilter: '',
            categoryFilter: '',
            priorityFilter: '',
            humanReviewFilter: '',
            departmentFilter: '',
            statusFilter: '',
            sourceFilter: ''
          })}
          totalFiltered={filteredRecords.length}
          totalAll={records.length}
        />

        {/* Two-Column Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
          {/* Left Column: Complaint Queue Table */}
          <div className="lg:col-span-7 flex flex-col">
            {filteredRecords.length > 0 ? (
              <ComplaintTable
                records={filteredRecords}
                selectedId={selectedRecord?.id || null}
                onSelectRecord={(r) => setSelectedRecordId(r.id)}
                onTriageSingle={handleTriageSingle}
                selectedIds={selectedIds}
                onToggleSelectId={handleToggleSelectId}
                onToggleSelectAll={handleToggleSelectAll}
                onTriageBatch={handleTriageBatch}
                isProcessingBatch={isProcessingBatch}
              />
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
                <FileSpreadsheet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white mb-1">No matching complaints found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                  Adjust active filter criteria or upload a new CSV / Excel spreadsheet to populate the triage queue.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setFilters({
                      searchQuery: '',
                      severityFilter: '',
                      categoryFilter: '',
                      priorityFilter: '',
                      humanReviewFilter: '',
                      departmentFilter: '',
                      statusFilter: '',
                      sourceFilter: ''
                    })}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => setIsUploadOpen(true)}
                    className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold"
                  >
                    Upload File
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Detailed Triage Inspector (Steps 1 to 6) */}
          <div className="lg:col-span-5 lg:sticky lg:top-20 flex flex-col h-[calc(100vh-6.5rem)]">
            {selectedRecord ? (
              <TriageInspector
                record={selectedRecord}
                onTriageRecord={handleTriageSingle}
                onUpdateAudit={handleUpdateAudit}
                isTriaging={triagingRecordId === selectedRecord.id || isProcessingBatch}
              />
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
                Select a complaint from the table to view its full 6-step triage assessment.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Batch Processing Floating Banner */}
      <BatchProgressBanner
        current={batchProgress.current}
        total={batchProgress.total}
        currentTitle={batchProgress.currentTitle}
        isProcessing={isProcessingBatch}
        onCancel={() => { cancelBatchRef.current = true; setIsProcessingBatch(false); }}
      />

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDataLoaded={handleDataLoaded}
      />

      <ManualTriageModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        onSubmit={handleManualSubmit}
        isProcessing={isProcessingBatch}
      />

      <ComplianceModal
        isOpen={isComplianceOpen}
        onClose={() => setIsComplianceOpen(false)}
      />
    </div>
  );
}
