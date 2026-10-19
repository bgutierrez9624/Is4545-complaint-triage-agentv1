import React, { useState } from 'react';
import { PlusCircle, Sparkles, X, FileText, AlertTriangle } from 'lucide-react';
import { ComplaintRecord } from '../types/triage';

interface ManualTriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (record: ComplaintRecord, andRunTriage: boolean) => void;
  isProcessing: boolean;
}

export const ManualTriageModal: React.FC<ManualTriageModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isProcessing
}) => {
  const [complaintText, setComplaintText] = useState('');
  const [source, setSource] = useState('Patient Portal');
  const [facilityOrDept, setFacilityOrDept] = useState('');
  const [patientIdentifier, setPatientIdentifier] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (andRunTriage: boolean) => {
    if (!complaintText.trim()) return;

    const newRecord: ComplaintRecord = {
      id: `GRV-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      source,
      facilityOrDept: facilityOrDept.trim() || undefined,
      patientIdentifier: patientIdentifier.trim() || `PT-${Math.floor(1000 + Math.random() * 9000)}`,
      complaintText: complaintText.trim(),
      status: 'Unprocessed'
    };

    onSubmit(newRecord, andRunTriage);
    onClose();
  };

  const handleInsertQuickExample = (type: 'med' | 'discrim' | 'billing' | 'portal') => {
    if (type === 'med') {
      setComplaintText('Patient received antibiotic dose 2 hours late. When called, the floor nurse stated they were understaffed and argued with the family. The patient developed mild rash and elevated temp.');
      setSource('Direct Call');
      setFacilityOrDept('4-East Medical Unit');
    } else if (type === 'discrim') {
      setComplaintText('Reception staff refused to provide a certified ASL interpreter for a deaf patient attending a pre-surgical consult, demanding that the adult daughter interpret complex anesthesia consent risks.');
      setSource('Grievance Form');
      setFacilityOrDept('Pre-Op Surgical Clinic');
    } else if (type === 'billing') {
      setComplaintText('Billed $3,200 for out-of-network pathology services during an emergency room visit without notice or consent, in violation of the federal No Surprises Act.');
      setSource('Survey Comment');
      setFacilityOrDept('Emergency Department');
    } else {
      setComplaintText('The patient portal repeatedly locked my account when trying to message my cardiologist about severe palpitations. Technical support told me to wait 3 business days.');
      setSource('Patient Portal');
      setFacilityOrDept('Cardiology Services');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Intake Single Complaint
              </h2>
              <p className="text-xs text-slate-400">
                Input narrative for immediate 6-step triage assessment
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

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Quick preset triggers */}
          <div>
            <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">Quick Test Scenarios:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleInsertQuickExample('med')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-[11px] transition"
              >
                Medication Delay
              </button>
              <button
                type="button"
                onClick={() => handleInsertQuickExample('discrim')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 text-[11px] transition"
              >
                ASL Interpreter Denial
              </button>
              <button
                type="button"
                onClick={() => handleInsertQuickExample('billing')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 text-[11px] transition"
              >
                Surprise Billing
              </button>
              <button
                type="button"
                onClick={() => handleInsertQuickExample('portal')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[11px] transition"
              >
                Portal Lockout
              </button>
            </div>
          </div>

          {/* Narrative */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Complaint / Grievance Text *
            </label>
            <textarea
              rows={5}
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              placeholder="Paste patient message, survey feedback, online review, or grievance report narrative..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 leading-relaxed font-sans"
            />
          </div>

          {/* Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Intake Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Patient Portal">Patient Portal</option>
                <option value="Grievance Form">Grievance Form</option>
                <option value="Survey Comment">Survey Comment</option>
                <option value="Online Review">Online Review</option>
                <option value="Direct Call">Direct Call</option>
                <option value="In-Person Feedback">In-Person Feedback</option>
                <option value="Discharge Follow-Up">Discharge Follow-Up</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Facility or Department
              </label>
              <input
                type="text"
                value={facilityOrDept}
                onChange={(e) => setFacilityOrDept(e.target.value)}
                placeholder="e.g. Inpatient 4-West"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Patient Identifier / MRN
              </label>
              <input
                type="text"
                value={patientIdentifier}
                onChange={(e) => setPatientIdentifier(e.target.value)}
                placeholder="e.g. PT-4910 or Anonymous"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
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
            onClick={() => handleSubmit(false)}
            disabled={!complaintText.trim()}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition disabled:opacity-40"
          >
            Add to Queue
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={!complaintText.trim() || isProcessing}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold shadow-md transition disabled:opacity-40"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Triage Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
