import { ComplaintRecord } from '../types/triage';

export const SAMPLE_DATASETS: {
  id: string;
  name: string;
  description: string;
  badge: string;
  records: ComplaintRecord[];
}[] = [
  {
    id: 'hospital-diverse-mix',
    name: 'Hospital Network Multi-Department Grievance Batch (12 Cases)',
    description: 'Realistic mix across all 12 categories: medication safety, civil rights discrimination, HIPAA breach, post-op sepsis, surprise billing, and ADA accessibility.',
    badge: 'Comprehensive Benchmark',
    records: [
      {
        id: 'GRV-2026-0101',
        date: '2026-10-18',
        source: 'Grievance Form',
        patientIdentifier: 'PT-8942',
        facilityOrDept: 'Inpatient Cardiology - 4 West',
        complaintText: 'My 72-year-old father was admitted to 4-West. The night nurse administered a double dose of Metoprolol instead of his prescribed 25mg dose. His heart rate dropped to 38 bpm and rapid response had to be called. We were terrified and no physician came to explain what happened.',
        status: 'Unprocessed'
      },
      {
        id: 'GRV-2026-0102',
        date: '2026-10-18',
        source: 'Patient Portal',
        patientIdentifier: 'PT-3109',
        facilityOrDept: 'Emergency Department Triage',
        complaintText: 'I arrived at the ED triage with my mother who only speaks Spanish. I requested a certified medical interpreter as required by law. The triage nurse told me "This is America, she should learn English or you translate for her" and refused to contact Language Services. My mother was forced to sign consent forms she could not understand.',
        status: 'Unprocessed'
      },
      {
        id: 'GRV-2026-0103',
        date: '2026-10-17',
        source: 'Grievance Form',
        patientIdentifier: 'PT-7721',
        facilityOrDept: 'Central Revenue & Patient Billing',
        complaintText: 'The hospital billing department emailed an itemized statement containing my full psychiatric treatment notes, diagnostic codes, and Social Security Number directly to my ex-husband\'s work email address instead of my address on file. This is a severe HIPAA violation and unauthorized disclosure of protected health information.',
        status: 'Unprocessed'
      },
      {
        id: 'GRV-2026-0104',
        date: '2026-10-17',
        source: 'Discharge Follow-Up',
        patientIdentifier: 'PT-4410',
        facilityOrDept: 'Orthopedic Surgery Unit',
        complaintText: 'Discharged yesterday after total knee arthroplasty without written wound care instructions or my surgical pain prescriptions called into the pharmacy. Today the incision site is hot, swollen, and leaking purulent drainage, and my temperature is 102.3F. Called the clinic line four times and have only received voicemail.',
        status: 'Unprocessed'
      },
      {
        id: 'GRV-2026-0105',
        date: '2026-10-16',
        source: 'Survey Comment',
        patientIdentifier: 'PT-5563',
        facilityOrDept: 'Patient Accounts',
        complaintText: 'Received a surprise bill for $8,450 from an out-of-network surgical assistant during an emergency appendectomy at your hospital. I verified in advance that the facility was in-network. This violates the federal No Surprises Act. Billing representative refused to place the bill on administrative hold.',
        status: 'Unprocessed'
      },
      {
        id: 'GRV-2026-0106',
        date: '2026-10-16',
        source: 'In-Person Feedback',
        patientIdentifier: 'PT-9018',
        facilityOrDept: 'Outpatient Oncology Pavilion',
        complaintText: 'The designated wheelchair ramp at the Cancer Center main entrance was blocked by maintenance ladders and cleaning carts for the third consecutive appointment. I am undergoing radiation therapy and had to struggle up concrete stairs on forearm crutches. Security staff watched and did nothing to help.',
        status: 'Unprocessed'
      },
      {
        id: 'GRV-2026-0107',
        date: '2026-10-15',
        source: 'Patient Portal',
        patientIdentifier: 'PT-6229',
        facilityOrDept: 'Information Technology / Portal',
        complaintText: 'The mobile patient portal repeatedly displays Error 504 Gateway Timeout when I attempt to submit urgent blood pressure logs or request insulin refills from Dr. Patel. The pharmacy reports no e-prescriptions received. I have been without basal insulin for 36 hours due to this app failure.',
        status: 'Unprocessed'
      },
      {
        id: 'GRV-2026-0108',
        date: '2026-10-15',
        source: 'Direct Call',
        patientIdentifier: 'PT-1184',
        facilityOrDept: 'Neurology Department',
        complaintText: 'Formal legal notice: Our family has retained malpractice litigation counsel regarding Dr. Roberts\' gross failure to order a STAT head CT scan when my wife presented with sudden thunderclap headache, resulting in a ruptured cerebral aneurysm. Hospital administration is instructed to preserve all electronic records.',
        status: 'Unprocessed'
      },
      {
        id: 'GRV-2026-0109',
        date: '2026-10-14',
        source: 'Online Review',
        patientIdentifier: 'Anonymous',
        facilityOrDept: 'Outpatient Pediatric Clinic',
        complaintText: 'Appointment was booked for 1:30 PM. We waited in the tiny waiting area for 2 hours and 20 minutes with a sick 3-year-old before being called back. The medical assistant gave no updates or explanations. Front desk staff were dismissive when asked about the delay.',
        status: 'Unprocessed'
      },
      {
        id: 'GRV-2026-0110',
        date: '2026-10-14',
        source: 'Survey Comment',
        patientIdentifier: 'PT-2287',
        facilityOrDept: 'Diagnostic Radiology',
        complaintText: 'The front desk receptionist at Radiology check-in rolled her eyes when I asked for directions to the changing room, was openly playing videos on her personal smartphone with the volume up, and ignored elderly patients standing at the registration desk counter.',
        status: 'Unprocessed'
      },
      {
        id: 'GRV-2026-0111',
        date: '2026-10-13',
        source: 'Patient Portal',
        patientIdentifier: 'PT-7332',
        facilityOrDept: 'Women\'s Health & Gynecology',
        complaintText: 'I had an endometrial biopsy three weeks ago. I was told pathology results would take 3-5 days. Every time I call the clinic, reception says "the provider hasn\'t reviewed the queue yet" and promises a callback that never happens. I am losing sleep waiting to know if I have cancer.',
        status: 'Unprocessed'
      },
      {
        id: 'GRV-2026-0112',
        date: '2026-10-12',
        source: 'Survey Comment',
        patientIdentifier: 'Anonymous',
        facilityOrDept: 'Ambulatory Lab Services',
        complaintText: 'Suggesting that the Westside Lab draw station open on Saturday mornings from 8 AM to 12 PM. Right now having only weekday 8 AM - 4 PM hours makes it very difficult for full-time workers to get routine fasting lab draws done without taking time off.',
        status: 'Unprocessed'
      }
    ]
  },
  {
    id: 'critical-safety-batch',
    name: 'High-Risk & Critical Safety Incidents (4 Cases)',
    description: 'High severity cases testing patient safety, sentinel events, medication mix-ups, and legal risk escalation.',
    badge: 'Critical & Sentinel',
    records: [
      {
        id: 'GRV-CRIT-001',
        date: '2026-10-18',
        source: 'Direct Call',
        patientIdentifier: 'PT-9901',
        facilityOrDept: 'Pediatric Emergency Unit',
        complaintText: 'Nurse administered penicillin IV to our 6-year-old daughter despite a bright red allergy bracelet and penicillin allergy noted on every document. She immediately developed anaphylactic shock, hives, and wheezing requiring epinephrine and pediatric ICU transfer.',
        status: 'Unprocessed'
      },
      {
        id: 'GRV-CRIT-002',
        date: '2026-10-17',
        source: 'Grievance Form',
        patientIdentifier: 'PT-8832',
        facilityOrDept: 'Surgical ICU - 3rd Floor',
        complaintText: 'Patient was left unassisted to walk to the bathroom despite designated high fall risk protocol. Fell on the tiled floor, hitting his head. Sustained a 4cm scalp laceration and acute subdural hematoma requiring emergency neurosurgical burr hole evacuation.',
        status: 'Unprocessed'
      },
      {
        id: 'GRV-CRIT-003',
        date: '2026-10-16',
        source: 'Grievance Form',
        patientIdentifier: 'PT-6641',
        facilityOrDept: 'Executive Administration',
        complaintText: 'Formal complaint filed with the state department of health and OCR: Transgender patient admitted for pneumonia was subjected to continuous harassment, purposeful misgendering by nursing supervisors, and denied appropriate sanitary accommodations for four days.',
        status: 'Unprocessed'
      },
      {
        id: 'GRV-CRIT-004',
        date: '2026-10-15',
        source: 'Grievance Form',
        patientIdentifier: 'PT-5120',
        facilityOrDept: 'Outpatient Surgery Center',
        complaintText: 'Patient was sent home post-laparoscopy with severe uncontrolled abdominal pain. Surgeon dismissed symptoms as "normal gas pain" over the phone without ordering an evaluation. Readmitted 24 hours later in septic shock with a perforated cecum from trocar puncture.',
        status: 'Unprocessed'
      }
    ]
  }
];
