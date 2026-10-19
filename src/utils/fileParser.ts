import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ComplaintRecord, TriageResult } from '../types/triage';

export interface ParsedFileResult {
  records: ComplaintRecord[];
  fileName: string;
  totalRows: number;
  detectedColumns: {
    textColumn: string;
    idColumn?: string;
    dateColumn?: string;
    sourceColumn?: string;
    deptColumn?: string;
    patientColumn?: string;
  };
}

export function parseCSVOrExcelFile(file: File): Promise<ParsedFileResult> {
  return new Promise((resolve, reject) => {
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
          const result = processRawRowData(jsonData, file.name);
          resolve(result);
        } catch (err) {
          reject(new Error('Failed to parse Excel workbook: ' + (err as Error).message));
        }
      };
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsArrayBuffer(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const result = processRawRowData(results.data as Record<string, any>[], file.name);
            resolve(result);
          } catch (err) {
            reject(new Error('Failed to parse CSV file: ' + (err as Error).message));
          }
        },
        error: (err) => {
          reject(new Error('CSV parsing error: ' + err.message));
        }
      });
    }
  });
}

function processRawRowData(rows: Record<string, any>[], fileName: string): ParsedFileResult {
  if (!rows || rows.length === 0) {
    throw new Error('The uploaded file contains no data rows.');
  }

  const columns = Object.keys(rows[0] || {});
  const lowerCols = columns.map(c => ({ original: c, lower: c.toLowerCase().trim() }));

  // Find complaint text column
  const textMatches = ['complaint', 'text', 'comment', 'description', 'message', 'grievance', 'feedback', 'details', 'narrative', 'issue', 'review'];
  let textCol = lowerCols.find(c => textMatches.some(m => c.lower.includes(m)))?.original;
  if (!textCol) {
    // pick the longest string column in the first row
    let maxLen = -1;
    for (const c of columns) {
      const val = String(rows[0][c] || '');
      if (val.length > maxLen) {
        maxLen = val.length;
        textCol = c;
      }
    }
  }

  if (!textCol) {
    textCol = columns[0];
  }

  // Find ID column
  const idCol = lowerCols.find(c => ['id', 'complaint_id', 'case_id', 'record_id', 'ticket', 'reference', 'mrn'].includes(c.lower))?.original;
  // Find Date column
  const dateCol = lowerCols.find(c => ['date', 'created_at', 'timestamp', 'submitted', 'time'].some(m => c.lower.includes(m)))?.original;
  // Find Source column
  const sourceCol = lowerCols.find(c => ['source', 'channel', 'origin', 'type', 'intake'].some(m => c.lower.includes(m)))?.original;
  // Find Department column
  const deptCol = lowerCols.find(c => ['department', 'dept', 'facility', 'unit', 'clinic', 'location', 'service'].some(m => c.lower.includes(m)))?.original;
  // Find Patient ID column
  const patientCol = lowerCols.find(c => ['patient', 'patient_id', 'pt_id', 'mrn', 'person', 'complainant'].some(m => c.lower.includes(m)))?.original;

  const records: ComplaintRecord[] = [];
  rows.forEach((row, index) => {
    const text = String(row[textCol!] || '').trim();
    if (!text) return;

    const id = idCol && row[idCol] ? String(row[idCol]).trim() : `REC-${String(index + 1).padStart(4, '0')}`;
    const date = dateCol && row[dateCol] ? String(row[dateCol]).trim() : new Date().toISOString().split('T')[0];
    const source = sourceCol && row[sourceCol] ? String(row[sourceCol]).trim() : 'CSV/Excel Upload';
    const facilityOrDept = deptCol && row[deptCol] ? String(row[deptCol]).trim() : undefined;
    const patientIdentifier = patientCol && row[patientCol] ? String(row[patientCol]).trim() : `PT-${1000 + index}`;

    records.push({
      id,
      date,
      source,
      patientIdentifier,
      facilityOrDept,
      complaintText: text,
      status: 'Unprocessed'
    });
  });

  if (records.length === 0) {
    throw new Error('No valid complaint records found in the uploaded file.');
  }

  return {
    records,
    fileName,
    totalRows: records.length,
    detectedColumns: {
      textColumn: textCol,
      idColumn: idCol,
      dateColumn: dateCol,
      sourceColumn: sourceCol,
      deptColumn: deptCol,
      patientColumn: patientCol
    }
  };
}

export function exportToCSV(records: ComplaintRecord[], filename = 'triaged-healthcare-complaints.csv') {
  const exportData = records.map(r => {
    const t = r.triageResult;
    return {
      'Complaint ID': r.id,
      'Date': r.date,
      'Source': r.source,
      'Patient Identifier': r.patientIdentifier || 'Anonymous',
      'Department / Facility': r.facilityOrDept || 'N/A',
      'Original Complaint Text': r.complaintText,
      'Triage Status': r.status,
      'Primary Category': t ? t.primaryCategory : 'Pending',
      'Secondary Categories': t && t.secondaryCategories ? t.secondaryCategories.join('; ') : 'None',
      'Severity Level': t ? t.severityLevel : 'Pending',
      'Severity Justification': t ? t.severityJustification : '',
      'Risk Flags': t && t.identifiedRisks ? t.identifiedRisks.map(rk => `${rk.riskType}: ${rk.explanation}`).join(' | ') : 'None',
      'Recommended Department': t ? t.recommendedDepartment : 'Pending',
      'Escalation Priority': t ? t.escalationPriority : 'Pending',
      'Human Review Status': t ? t.humanReviewRequirement : 'Pending',
      'Executive Summary': t ? t.executiveSummary : '',
      'Triaged At': t ? t.triagedAt : '',
      'Engine / Model': t ? t.modelUsed : '',
      'Auditor Notes': r.humanNotes || '',
      'Audited By': r.auditedBy || ''
    };
  });

  const csv = Papa.unparse(exportData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToExcel(records: ComplaintRecord[], filename = 'triaged-healthcare-complaints.xlsx') {
  const exportData = records.map(r => {
    const t = r.triageResult;
    return {
      'Complaint ID': r.id,
      'Date': r.date,
      'Source': r.source,
      'Patient Identifier': r.patientIdentifier || 'Anonymous',
      'Department / Facility': r.facilityOrDept || 'N/A',
      'Original Complaint Text': r.complaintText,
      'Triage Status': r.status,
      'Primary Category': t ? t.primaryCategory : 'Pending',
      'Secondary Categories': t && t.secondaryCategories ? t.secondaryCategories.join('; ') : 'None',
      'Severity Level': t ? t.severityLevel : 'Pending',
      'Severity Justification': t ? t.severityJustification : '',
      'Risk Flags': t && t.identifiedRisks ? t.identifiedRisks.map(rk => `${rk.riskType}: ${rk.explanation}`).join(' | ') : 'None',
      'Recommended Department': t ? t.recommendedDepartment : 'Pending',
      'Escalation Priority': t ? t.escalationPriority : 'Pending',
      'Human Review Status': t ? t.humanReviewRequirement : 'Pending',
      'Executive Summary': t ? t.executiveSummary : '',
      'Triaged At': t ? t.triagedAt : '',
      'Auditor Notes': r.humanNotes || ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Triaged Complaints');
  XLSX.writeFile(workbook, filename);
}

export function generateSampleCSVString(): string {
  const sampleRows = [
    {
      'Complaint_ID': 'PT-GRIEV-1001',
      'Date': '2026-10-18',
      'Source': 'Patient Portal',
      'Patient_ID': 'MRN-48921',
      'Department': 'Emergency Medicine',
      'Complaint_Text': 'Nurse in ED triage was extremely rude and screamed at my daughter when she asked for water after waiting for 3 hours. Completely unprofessional.'
    },
    {
      'Complaint_ID': 'PT-GRIEV-1002',
      'Date': '2026-10-17',
      'Source': 'Grievance Form',
      'Patient_ID': 'MRN-90231',
      'Department': 'Oncology Infusion',
      'Complaint_Text': 'Nurse started intravenous chemotherapy without scanning the patient wristband. Drug was intended for the neighboring patient in bed 4B. Infusion was stopped after 5 minutes.'
    },
    {
      'Complaint_ID': 'PT-GRIEV-1003',
      'Date': '2026-10-16',
      'Source': 'Survey Comment',
      'Patient_ID': 'MRN-78119',
      'Department': 'Ambulatory Surgery',
      'Complaint_Text': 'Charged a $1,200 facility fee that was not disclosed prior to my colonoscopy. Insurance told me it would be 100% preventive screening.'
    }
  ];
  return Papa.unparse(sampleRows);
}
