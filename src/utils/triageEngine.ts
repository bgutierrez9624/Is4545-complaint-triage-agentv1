import {
  ComplaintCategory,
  SeverityLevel,
  RiskFlagType,
  IdentifiedRisk,
  RecommendedDepartment,
  EscalationPriority,
  HumanReviewRequirement,
  TriageResult
} from '../types/triage';

export const COMPLAINT_CATEGORIES: ComplaintCategory[] = [
  'Communication',
  'Scheduling',
  'Wait Time',
  'Technology / Patient Portal',
  'Billing',
  'Clinical Care',
  'Discharge and Follow-Up',
  'Accessibility and Equity',
  'Patient Safety',
  'Privacy or Security',
  'Staff Conduct',
  'Other'
];

export const SEVERITY_LEVELS: SeverityLevel[] = [
  'LEVEL 1 - Low',
  'LEVEL 2 - Moderate',
  'LEVEL 3 - High',
  'LEVEL 4 - Critical'
];

export const RISK_FLAG_TYPES: RiskFlagType[] = [
  'Patient Safety Risk',
  'Clinical Risk',
  'Compliance Risk',
  'Privacy Risk',
  'Accessibility Risk',
  'Equity Risk',
  'Reputational Risk',
  'Operational Risk'
];

export const RECOMMENDED_DEPARTMENTS: RecommendedDepartment[] = [
  'Patient Experience Team',
  'Nursing Leadership',
  'Physician Leadership',
  'Quality Improvement Team',
  'Compliance Office',
  'Information Technology',
  'Revenue Cycle / Billing',
  'Accessibility Coordinator',
  'Risk Management',
  'Executive Review'
];

export function buildFormattedOutput(result: Omit<TriageResult, 'formattedOutput' | 'triagedAt'>): string {
  const secondary = result.secondaryCategories && result.secondaryCategories.length > 0
    ? result.secondaryCategories.join(', ')
    : 'None';

  const riskStr = result.identifiedRisks && result.identifiedRisks.length > 0
    ? result.identifiedRisks.map(r => `${r.riskType} (${r.explanation})`).join('; ')
    : 'None identified';

  return `Complaint Category: ${result.primaryCategory}
Secondary Categories: ${secondary}
Severity Level: ${result.severityLevel}
Severity Justification: ${result.severityJustification}
Risk Flags: ${riskStr}
Recommended Department: ${result.recommendedDepartment}
Escalation Priority: ${result.escalationPriority}
Human Review Status: ${result.humanReviewRequirement}
Executive Summary: ${result.executiveSummary}`;
}

/**
 * Enforces mandatory healthcare regulatory and safety rules:
 * - Patient safety concerns exist -> Human Review Required
 * - Discrimination is alleged -> Human Review Required & Equity Risk
 * - Privacy concerns exist -> Human Review Required & Compliance/Privacy Risk
 * - Legal or compliance risks are present -> Human Review Required
 * - Level 4 Critical -> Human Review Required & Immediate or Priority escalation
 */
export function applyHealthcareSafetyGuardrails(result: TriageResult, complaintText: string): TriageResult {
  const textLower = complaintText.toLowerCase();
  const guarded = { ...result };
  const currentRisks = [...(guarded.identifiedRisks || [])];

  const hasPatientSafety = currentRisks.some(r => r.riskType === 'Patient Safety Risk') ||
    textLower.includes('fall') || textLower.includes('choking') || textLower.includes('wrong med') ||
    textLower.includes('overdose') || textLower.includes('seizure') || textLower.includes('cardiac arrest') ||
    textLower.includes('bleeding out') || textLower.includes('suicid');

  const hasDiscrimination = textLower.includes('discriminat') || textLower.includes('racis') ||
    textLower.includes('sexism') || textLower.includes('lgbtq') || textLower.includes('disability slur') ||
    textLower.includes('treated differently because') || textLower.includes('refused interpreter');

  const hasPrivacy = currentRisks.some(r => r.riskType === 'Privacy Risk') ||
    textLower.includes('hipaa') || textLower.includes('sent my medical records to') ||
    textLower.includes('someone else\'s chart') || textLower.includes('privacy breach') ||
    textLower.includes('unauthorized access');

  const hasLegal = textLower.includes('lawyer') || textLower.includes('attorney') ||
    textLower.includes('lawsuit') || textLower.includes('sue the hospital') ||
    textLower.includes('malpractice') || textLower.includes('oig complaint');

  if (hasDiscrimination && !currentRisks.some(r => r.riskType === 'Equity Risk')) {
    currentRisks.push({
      riskType: 'Equity Risk',
      explanation: 'Complaint contains allegations of biased treatment or discrimination under ACA Section 1557 / Title VI.'
    });
  }

  if (hasPrivacy && !currentRisks.some(r => r.riskType === 'Privacy Risk')) {
    currentRisks.push({
      riskType: 'Privacy Risk',
      explanation: 'Potential disclosure of protected health information (PHI) requiring HIPAA compliance officer audit.'
    });
  }

  if (hasLegal && !currentRisks.some(r => r.riskType === 'Compliance Risk')) {
    currentRisks.push({
      riskType: 'Compliance Risk',
      explanation: 'Explicit mention of legal representation, regulatory filing, or litigation risk requiring Risk Management triage.'
    });
  }

  guarded.identifiedRisks = currentRisks;

  const requiresHumanReview =
    hasPatientSafety ||
    hasDiscrimination ||
    hasPrivacy ||
    hasLegal ||
    guarded.severityLevel === 'LEVEL 4 - Critical' ||
    guarded.identifiedRisks.some(r =>
      r.riskType === 'Patient Safety Risk' ||
      r.riskType === 'Clinical Risk' ||
      r.riskType === 'Compliance Risk' ||
      r.riskType === 'Privacy Risk' ||
      r.riskType === 'Equity Risk'
    );

  if (requiresHumanReview) {
    guarded.humanReviewRequirement = 'Human Review Required';
    if (!guarded.humanReviewReason) {
      const triggers: string[] = [];
      if (hasPatientSafety) triggers.push('Patient Safety concern');
      if (hasDiscrimination) triggers.push('Allegation of discrimination');
      if (hasPrivacy) triggers.push('Privacy/HIPAA disclosure');
      if (hasLegal) triggers.push('Litigation/Compliance exposure');
      if (guarded.severityLevel === 'LEVEL 4 - Critical') triggers.push('Level 4 Critical incident');
      guarded.humanReviewReason = `Mandatory Human Review triggered by: ${triggers.join(', ') || 'High Clinical/Compliance Risk'}.`;
    }
  }

  if (guarded.severityLevel === 'LEVEL 4 - Critical' && guarded.escalationPriority === 'Routine') {
    guarded.escalationPriority = 'Immediate';
  }

  guarded.formattedOutput = buildFormattedOutput(guarded);
  return guarded;
}

/**
 * Robust Rule-based Triage Engine for local fallback or instant baseline
 */
export function ruleBasedTriage(complaintText: string, source: string = 'General'): TriageResult {
  const text = complaintText.toLowerCase();

  let primaryCategory: ComplaintCategory = 'Other';
  const secondaryCategories: ComplaintCategory[] = [];
  let severityLevel: SeverityLevel = 'LEVEL 1 - Low';
  let severityJustification = 'Standard feedback with no clinical risk or safety harm identified.';
  const identifiedRisks: IdentifiedRisk[] = [];
  let recommendedDepartment: RecommendedDepartment = 'Patient Experience Team';
  let escalationPriority: EscalationPriority = 'Routine';
  let humanReviewRequirement: HumanReviewRequirement = 'AI Review Only';
  let humanReviewReason = '';
  let whatHappened = complaintText.slice(0, 160);

  // Critical indicators
  const isMedicationSevere = text.includes('wrong dose') || text.includes('wrong medicine') || text.includes('allergic reaction') || text.includes('anaphylaxis') || text.includes('overdose');
  const isPhysicalHarm = text.includes('fell') || text.includes('unresponsive') || text.includes('lost consciousness') || text.includes('infection after surgery') || text.includes('sepsis') || text.includes('hematoma') || text.includes('bleeding heavily');
  const isDiscrimination = text.includes('racis') || text.includes('discriminat') || text.includes('refused interpreter') || text.includes('slur') || text.includes('biased');
  const isPrivacyBreach = text.includes('hipaa') || text.includes('gave my records') || text.includes('sent to wrong person') || text.includes('breach') || text.includes('unauthorized chart');
  const isLegalThreat = text.includes('lawyer') || text.includes('lawsuit') || text.includes('malpractice') || text.includes('attorney');

  // Category classification
  if (text.includes('bill') || text.includes('charge') || text.includes('insurance') || text.includes('copay') || text.includes('statement') || text.includes('overcharged')) {
    primaryCategory = 'Billing';
    recommendedDepartment = 'Revenue Cycle / Billing';
  } else if (text.includes('portal') || text.includes('app') || text.includes('password') || text.includes('website') || text.includes('login') || text.includes('crash')) {
    primaryCategory = 'Technology / Patient Portal';
    recommendedDepartment = 'Information Technology';
  } else if (text.includes('wait') || text.includes('delayed') || text.includes('hours') || text.includes('late') || text.includes('waiting room')) {
    primaryCategory = 'Wait Time';
    recommendedDepartment = 'Patient Experience Team';
  } else if (text.includes('reschedul') || text.includes('cancel') || text.includes('appointment') || text.includes('booked') || text.includes('slot')) {
    primaryCategory = 'Scheduling';
    recommendedDepartment = 'Patient Experience Team';
  } else if (text.includes('discharge') || text.includes('follow-up') || text.includes('home health') || text.includes('prescription call-in') || text.includes('readmission')) {
    primaryCategory = 'Discharge and Follow-Up';
    recommendedDepartment = 'Nursing Leadership';
  } else if (isPrivacyBreach) {
    primaryCategory = 'Privacy or Security';
    recommendedDepartment = 'Compliance Office';
  } else if (isDiscrimination || text.includes('wheelchair') || text.includes('ramp') || text.includes('deaf') || text.includes('interpreter') || text.includes('asl')) {
    primaryCategory = 'Accessibility and Equity';
    recommendedDepartment = 'Accessibility Coordinator';
  } else if (isMedicationSevere || isPhysicalHarm || text.includes('sentinel') || text.includes('safety')) {
    primaryCategory = 'Patient Safety';
    recommendedDepartment = 'Risk Management';
  } else if (text.includes('doctor') || text.includes('diagnosis') || text.includes('biopsy') || text.includes('lab result') || text.includes('misdiagnos') || text.includes('symptom')) {
    primaryCategory = 'Clinical Care';
    recommendedDepartment = 'Physician Leadership';
  } else if (text.includes('nurse') || text.includes('rude') || text.includes('yelled') || text.includes('attitude') || text.includes('disrespect') || text.includes('unprofessional')) {
    primaryCategory = 'Staff Conduct';
    recommendedDepartment = 'Nursing Leadership';
  } else if (text.includes('explained') || text.includes('no one told me') || text.includes('miscommunication') || text.includes('call back')) {
    primaryCategory = 'Communication';
    recommendedDepartment = 'Patient Experience Team';
  }

  // Secondary categories
  if (primaryCategory !== 'Communication' && (text.includes('rude') || text.includes('attitude') || text.includes('no one told'))) {
    secondaryCategories.push('Communication');
  }
  if (primaryCategory !== 'Wait Time' && (text.includes('wait') || text.includes('delay'))) {
    secondaryCategories.push('Wait Time');
  }
  if (primaryCategory !== 'Clinical Care' && (text.includes('medication') || text.includes('treatment') || text.includes('pain'))) {
    secondaryCategories.push('Clinical Care');
  }

  // Severity and Risks
  if (isLegalThreat || (isPhysicalHarm && text.includes('death')) || (isMedicationSevere && text.includes('icu'))) {
    severityLevel = 'LEVEL 4 - Critical';
    severityJustification = 'Immediate patient safety risk or direct legal liability exposure with high severity potential.';
    escalationPriority = 'Immediate';
    recommendedDepartment = 'Risk Management';
    humanReviewRequirement = 'Human Review Required';
    humanReviewReason = 'Level 4 Critical incident involving immediate patient safety or legal exposure.';
    identifiedRisks.push(
      { riskType: 'Patient Safety Risk', explanation: 'Potential acute or catastrophic harm requiring rapid root-cause analysis.' },
      { riskType: 'Compliance Risk', explanation: 'Direct litigation threat or regulatory report exposure.' },
      { riskType: 'Reputational Risk', explanation: 'High profile adverse event with external liability.' }
    );
  } else if (isMedicationSevere || isPhysicalHarm || isDiscrimination || isPrivacyBreach) {
    severityLevel = 'LEVEL 3 - High';
    severityJustification = 'Concern touches potential clinical harm, medication administration failure, serious civil rights, or privacy breach.';
    escalationPriority = 'Priority';
    humanReviewRequirement = 'Human Review Required';
    humanReviewReason = 'Potential patient safety, medication discrepancy, discrimination, or PHI disclosure.';

    if (isMedicationSevere || isPhysicalHarm) {
      identifiedRisks.push({ riskType: 'Patient Safety Risk', explanation: 'Medication administration or post-procedure clinical complication reported.' });
      identifiedRisks.push({ riskType: 'Clinical Risk', explanation: 'Clinical trajectory of patient may be compromised without prompt physician review.' });
      recommendedDepartment = 'Physician Leadership';
    }
    if (isDiscrimination) {
      identifiedRisks.push({ riskType: 'Equity Risk', explanation: 'Allegation of disparate care or denied language accommodation.' });
      identifiedRisks.push({ riskType: 'Compliance Risk', explanation: 'Civil rights compliance review required under ACA Section 1557.' });
      recommendedDepartment = 'Accessibility Coordinator';
    }
    if (isPrivacyBreach) {
      identifiedRisks.push({ riskType: 'Privacy Risk', explanation: 'Protected Health Information potentially exposed to unauthorized recipient.' });
      identifiedRisks.push({ riskType: 'Compliance Risk', explanation: 'Potential HIPAA Breach Notification Rule assessment required.' });
      recommendedDepartment = 'Compliance Office';
    }
  } else if (text.includes('repeated') || text.includes('third time') || text.includes('unacceptable') || text.includes('terrible') || text.includes('furious') || text.includes('billing error')) {
    severityLevel = 'LEVEL 2 - Moderate';
    severityJustification = 'Repeated service failures or significant operational friction causing substantial patient distress.';
    escalationPriority = 'Routine';
    humanReviewRequirement = 'Human Review Recommended';
    identifiedRisks.push({ riskType: 'Operational Risk', explanation: 'Process breakdown or recurring workflow bottleneck impacted care delivery.' });
    identifiedRisks.push({ riskType: 'Reputational Risk', explanation: 'Moderate risk of negative public review or CMS CAHPS score degradation.' });
  } else {
    severityLevel = 'LEVEL 1 - Low';
    severityJustification = 'Routine feedback or minor service inconvenience without clinical consequence.';
    escalationPriority = 'Routine';
    humanReviewRequirement = 'AI Review Only';
    identifiedRisks.push({ riskType: 'Operational Risk', explanation: 'Minor operational inconvenience that can be logged for quarterly trend reporting.' });
  }

  whatHappened = complaintText.length > 200 ? complaintText.substring(0, 197) + '...' : complaintText;

  const executiveSummary = `${primaryCategory} concern rated at ${severityLevel}. Major risk: ${identifiedRisks[0]?.riskType || 'Operational Risk'}. Recommended action: Route to ${recommendedDepartment} for ${escalationPriority} review and outreach.`;

  const baseResult: TriageResult = {
    primaryCategory,
    secondaryCategories,
    severityLevel,
    severityJustification,
    identifiedRisks,
    recommendedDepartment,
    escalationPriority,
    humanReviewRequirement,
    humanReviewReason,
    whatHappened,
    executiveSummary,
    formattedOutput: '',
    triagedAt: new Date().toISOString(),
    modelUsed: 'Clinical Rule Engine (Certified Safety Fallback)'
  };

  return applyHealthcareSafetyGuardrails(baseResult, complaintText);
}
