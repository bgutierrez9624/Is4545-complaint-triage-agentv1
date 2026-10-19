export type ComplaintCategory =
  | 'Communication'
  | 'Scheduling'
  | 'Wait Time'
  | 'Technology / Patient Portal'
  | 'Billing'
  | 'Clinical Care'
  | 'Discharge and Follow-Up'
  | 'Accessibility and Equity'
  | 'Patient Safety'
  | 'Privacy or Security'
  | 'Staff Conduct'
  | 'Other';

export type SeverityLevel =
  | 'LEVEL 1 - Low'
  | 'LEVEL 2 - Moderate'
  | 'LEVEL 3 - High'
  | 'LEVEL 4 - Critical';

export type RiskFlagType =
  | 'Patient Safety Risk'
  | 'Clinical Risk'
  | 'Compliance Risk'
  | 'Privacy Risk'
  | 'Accessibility Risk'
  | 'Equity Risk'
  | 'Reputational Risk'
  | 'Operational Risk';

export interface IdentifiedRisk {
  riskType: RiskFlagType;
  explanation: string;
}

export type RecommendedDepartment =
  | 'Patient Experience Team'
  | 'Nursing Leadership'
  | 'Physician Leadership'
  | 'Quality Improvement Team'
  | 'Compliance Office'
  | 'Information Technology'
  | 'Revenue Cycle / Billing'
  | 'Accessibility Coordinator'
  | 'Risk Management'
  | 'Executive Review';

export type EscalationPriority = 'Routine' | 'Priority' | 'Immediate';

export type HumanReviewRequirement =
  | 'AI Review Only'
  | 'Human Review Recommended'
  | 'Human Review Required';

export interface TriageResult {
  primaryCategory: ComplaintCategory;
  secondaryCategories: ComplaintCategory[];
  severityLevel: SeverityLevel;
  severityJustification: string;
  identifiedRisks: IdentifiedRisk[];
  recommendedDepartment: RecommendedDepartment;
  escalationPriority: EscalationPriority;
  humanReviewRequirement: HumanReviewRequirement;
  humanReviewReason?: string;
  whatHappened: string;
  executiveSummary: string;
  formattedOutput: string;
  triagedAt: string;
  modelUsed?: string;
}

export interface ComplaintRecord {
  id: string;
  date: string;
  source: string;
  patientIdentifier?: string;
  facilityOrDept?: string;
  complaintText: string;
  triageResult?: TriageResult;
  status: 'Unprocessed' | 'Triaged' | 'Reviewed' | 'Escalated';
  humanNotes?: string;
  auditedBy?: string;
  auditedAt?: string;
}

export interface TriageFilterState {
  searchQuery: string;
  severityFilter: string;
  categoryFilter: string;
  priorityFilter: string;
  humanReviewFilter: string;
  departmentFilter: string;
  statusFilter: string;
  sourceFilter: string;
}
