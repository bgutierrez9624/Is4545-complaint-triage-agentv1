import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  applyHealthcareSafetyGuardrails,
  ruleBasedTriage,
  buildFormattedOutput,
  COMPLAINT_CATEGORIES,
  SEVERITY_LEVELS,
  RISK_FLAG_TYPES,
  RECOMMENDED_DEPARTMENTS
} from './src/utils/triageEngine';
import { TriageResult } from './src/types/triage';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '25mb' }));

// Initialize Gemini Client
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const SYSTEM_INSTRUCTION = `You are a Healthcare Complaint Triage Assistant.
Your purpose is to help healthcare organizations review, prioritize, and route patient complaints efficiently while maintaining patient safety, fairness, compliance, and appropriate human oversight.
Your role is NOT to resolve complaints.
Your role is to triage complaints and determine:
- What happened
- How serious it is
- Who should review it
- How quickly it should be addressed
- Whether human intervention is required

You must strictly execute these 6 steps:

STEP 1: Complaint Category
Classify into exactly one primary category from:
- Communication
- Scheduling
- Wait Time
- Technology / Patient Portal
- Billing
- Clinical Care
- Discharge and Follow-Up
- Accessibility and Equity
- Patient Safety
- Privacy or Security
- Staff Conduct
- Other
Identify secondary categories if present (array of strings from above list).

STEP 2: Severity Assessment
Assign exactly one severity level:
- LEVEL 1 - Low (Minor inconvenience, routine dissatisfaction, general suggestion)
- LEVEL 2 - Moderate (Repeated service failures, significant frustration, communication breakdown)
- LEVEL 3 - High (Potential patient harm, medication-related concern, serious accessibility issue, escalated complaint)
- LEVEL 4 - Critical (Immediate patient safety risk, potential legal exposure, serious privacy violation, discrimination allegation)
Provide detailed clinical/operational reasoning for the assigned severity.

STEP 3: Risk Detection
Identify applicable risks from:
- Patient Safety Risk
- Clinical Risk
- Compliance Risk
- Privacy Risk
- Accessibility Risk
- Equity Risk
- Reputational Risk
- Operational Risk
For each flagged risk, provide a concise explanation of why it was flagged.

STEP 4: Escalation Recommendation
Recommend ROUTE TO from:
- Patient Experience Team
- Nursing Leadership
- Physician Leadership
- Quality Improvement Team
- Compliance Office
- Information Technology
- Revenue Cycle / Billing
- Accessibility Coordinator
- Risk Management
- Executive Review
Indicate escalation priority:
- Routine
- Priority
- Immediate

STEP 5: Human Review Requirement
Choose one:
- AI Review Only
- Human Review Recommended
- Human Review Required
CRITICAL MANDATE: Human Review Required MUST be selected whenever:
- Patient safety concerns exist
- Discrimination is alleged
- Privacy concerns exist
- Legal or compliance risks are present
- The complaint is ambiguous and requires investigation

STEP 6: Executive Summary
A concise executive summary including:
- Complaint category
- Severity level
- Major risk
- Recommended action`;

async function triageSingleComplaint(complaintText: string, metadata?: { source?: string; patientIdentifier?: string; facilityOrDept?: string }): Promise<TriageResult> {
  if (!complaintText || !complaintText.trim()) {
    throw new Error('Complaint text is required for triage');
  }

  if (ai) {
    try {
      const prompt = `Please triage the following healthcare complaint according to steps 1 through 6:\n\n${metadata?.source ? `SOURCE: ${metadata.source}\n` : ''}${metadata?.facilityOrDept ? `DEPARTMENT/FACILITY: ${metadata.facilityOrDept}\n` : ''}PATIENT COMPLAINT CONTENT:\n"""\n${complaintText}\n"""`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              primaryCategory: {
                type: Type.STRING,
                description: 'Must match one of the defined 12 categories'
              },
              secondaryCategories: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Secondary categories present, if any'
              },
              severityLevel: {
                type: Type.STRING,
                description: 'LEVEL 1 - Low | LEVEL 2 - Moderate | LEVEL 3 - High | LEVEL 4 - Critical'
              },
              severityJustification: {
                type: Type.STRING,
                description: 'Clinical/operational reasoning for the assigned severity'
              },
              identifiedRisks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    riskType: { type: Type.STRING },
                    explanation: { type: Type.STRING }
                  },
                  required: ['riskType', 'explanation']
                }
              },
              recommendedDepartment: {
                type: Type.STRING,
                description: 'One of the defined healthcare routing departments'
              },
              escalationPriority: {
                type: Type.STRING,
                description: 'Routine | Priority | Immediate'
              },
              humanReviewRequirement: {
                type: Type.STRING,
                description: 'AI Review Only | Human Review Recommended | Human Review Required'
              },
              humanReviewReason: {
                type: Type.STRING,
                description: 'Specific trigger rationale for the human review determination'
              },
              whatHappened: {
                type: Type.STRING,
                description: 'Objective 1-2 sentence description of what occurred'
              },
              executiveSummary: {
                type: Type.STRING,
                description: 'Step 6 executive summary including category, severity, major risk, recommended action'
              }
            },
            required: [
              'primaryCategory',
              'secondaryCategories',
              'severityLevel',
              'severityJustification',
              'identifiedRisks',
              'recommendedDepartment',
              'escalationPriority',
              'humanReviewRequirement',
              'executiveSummary'
            ]
          }
        }
      });

      const rawJson = response.text?.trim();
      if (rawJson) {
        const parsed = JSON.parse(rawJson);
        const result: TriageResult = {
          primaryCategory: (COMPLAINT_CATEGORIES.includes(parsed.primaryCategory) ? parsed.primaryCategory : 'Other') as any,
          secondaryCategories: Array.isArray(parsed.secondaryCategories)
            ? parsed.secondaryCategories.filter((c: any) => COMPLAINT_CATEGORIES.includes(c))
            : [],
          severityLevel: (SEVERITY_LEVELS.includes(parsed.severityLevel) ? parsed.severityLevel : 'LEVEL 2 - Moderate') as any,
          severityJustification: parsed.severityJustification || 'Severity evaluated by triage protocol.',
          identifiedRisks: Array.isArray(parsed.identifiedRisks)
            ? parsed.identifiedRisks.map((r: any) => ({
                riskType: RISK_FLAG_TYPES.includes(r.riskType) ? r.riskType : 'Operational Risk',
                explanation: r.explanation || 'Identified by triage review.'
              }))
            : [],
          recommendedDepartment: (RECOMMENDED_DEPARTMENTS.includes(parsed.recommendedDepartment) ? parsed.recommendedDepartment : 'Patient Experience Team') as any,
          escalationPriority: ['Routine', 'Priority', 'Immediate'].includes(parsed.escalationPriority) ? parsed.escalationPriority : 'Routine',
          humanReviewRequirement: ['AI Review Only', 'Human Review Recommended', 'Human Review Required'].includes(parsed.humanReviewRequirement)
            ? parsed.humanReviewRequirement
            : 'Human Review Recommended',
          humanReviewReason: parsed.humanReviewReason || '',
          whatHappened: parsed.whatHappened || complaintText.slice(0, 160),
          executiveSummary: parsed.executiveSummary || `${parsed.primaryCategory} rated at ${parsed.severityLevel}.`,
          formattedOutput: '',
          triagedAt: new Date().toISOString(),
          modelUsed: 'Gemini 3.8 Flash (Server-Side)'
        };

        return applyHealthcareSafetyGuardrails(result, complaintText);
      }
    } catch (err: any) {
      console.warn('Gemini triage call error, falling back to clinical safety rule engine:', err?.message || err);
    }
  }

  // Fallback to rule engine
  return ruleBasedTriage(complaintText, metadata?.source);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!geminiApiKey,
    model: 'gemini-3.8-flash',
    timestamp: new Date().toISOString()
  });
});

// Single triage endpoint
app.post('/api/triage', async (req, res) => {
  try {
    const { complaint, metadata } = req.body;
    if (!complaint || typeof complaint !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "complaint" text in request body' });
    }

    const triage = await triageSingleComplaint(complaint, metadata);
    res.json({ success: true, triage });
  } catch (err: any) {
    console.error('Error in /api/triage:', err);
    res.status(500).json({ error: err.message || 'Internal triage error' });
  }
});

// Batch triage endpoint (handles up to 100 items per request)
app.post('/api/triage-batch', async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing "items" array in request body' });
    }

    const results = [];
    for (const item of items) {
      const text = item.complaintText || item.text || item.complaint || '';
      if (!text) continue;
      const triage = await triageSingleComplaint(text, {
        source: item.source,
        patientIdentifier: item.patientIdentifier,
        facilityOrDept: item.facilityOrDept
      });
      results.push({
        id: item.id || Math.random().toString(36).substring(2, 9),
        triage
      });
    }

    res.json({ success: true, results, count: results.length });
  } catch (err: any) {
    console.error('Error in /api/triage-batch:', err);
    res.status(500).json({ error: err.message || 'Internal batch triage error' });
  }
});

// Mount Vite middleware or static files
async function setupServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Healthcare Complaint Triage Assistant server running on port ${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
