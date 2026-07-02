# ClinSight AI – Agentic Clinical Intelligence Platform

A comprehensive healthcare platform featuring two distinct user experiences: **Doctor Dashboard** for real-time clinical intelligence and **Patient Portal** for self-managed health.

## Overview

ClinSight AI addresses the critical gap in hospital workflows where physicians struggle with unstructured patient data before consultations. The platform provides:

- **60-second pre-consultation briefs** with structured summaries
- **Real-time drug interaction detection** with severity flagging
- **Clinical pattern recognition** identifying trends physicians might miss
- **AI-powered insights** via Groq integration
- **Live audit trail** logging all actions
- **Patient-centric health management** with appointment booking and test reminders

## Tech Stack

- **Frontend**: React 19 + Next.js 16 + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Data**: Synthetic patient records (no external DB for MVP)
- **AI Integration**: Groq (simulated for demo)
- **State Management**: React hooks + SWR-ready
- **UI Components**: shadcn/ui + Lucide icons

## Project Structure

```
clin-sight-ai-platform/
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── auth.ts
│       ├── db.ts
│       └── server.ts
├── frontend/
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── next.config.mjs
│   ├── postcss.config.mjs
│   ├── components.json
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── auth/
│   │   ├── doctor/
│   │   └── patient/
│   ├── components/
│   │   ├── doctor/
│   │   └── ui/
│   ├── lib/
│   │   ├── drugInteractions.ts
│   │   ├── syntheticData.ts
│   │   ├── useAuth.ts
│   │   └── utils.ts
│   └── public/
├── AUTHENTICATION_GUIDE.md
├── AUTH_SETUP.txt
├── AUTH_SYSTEM.md
├── PROJECT_SUMMARY.md
├── QUICKSTART.md
├── next-env.d.ts
└── .env
```

## Doctor Dashboard Features

### 1. Pre-Consultation Brief (60-second summary)
- Patient overview: age, allergies, active conditions
- Recent visit history (last 5 visits)
- Active medications with dosages & cautions
- Latest lab results with trend indicators
- Clinical flags (CRITICAL/HIGH/ROUTINE)

**Access**: Enter Patient ID (P001, P002, P003)

### 2. Interactive Tabs
- **Overview**: Allergies, conditions, medications
- **Labs**: Lab results with WORSENING/IMPROVING/STABLE indicators
- **Interactions**: Drug-drug interaction detection
- **Visits**: Recent visit history with summaries
- **Triage**: Clinical flags & recommended routing

### 3. Drug Interaction Detection
Detects dangerous medication combinations:
- **Critical**: Metformin + Contrast Media (MALA risk)
- **High**: Clopidogrel + Aspirin (dual antiplatelet therapy)
- **Moderate**: ACE inhibitors + NSAIDs (renal dysfunction)

### 4. AI Assistant (Right Sidebar)
Ask free-text queries about patient data:
- "What's the patient's kidney function trend?"
- "Diabetes control?"
- "Heart failure status?"

### 5. Audit Trail
Real-time logging of all actions:
- Brief generation timestamp & hash
- Record access log
- Lab retrieval events

### 6. Triage Routing
Automatic severity assessment based on:
- Critical drug interactions
- Worsening lab values (HbA1c > 8%, high creatinine)
- Elevated cardiac biomarkers (BNP)

## Patient Portal Features

### 1. Home Hub
Quick access to:
- Chat with Receptionist
- Health Summary
- Test Reminders
- Medication Tracker

### 2. AI Receptionist Chatbot
Multi-turn conversation with contextual responses:
- **"hey"** → Welcome screen with options
- **"book"** → Department selection & appointment booking
- **"emergency"** → 108 + hospital emergency line
- **"departments"** → List of available departments
- **"health summary"** → Personalized diagnoses, meds, alerts

### 3. Health Summary
View personal health information (after entering Patient ID):
- Active diagnoses with ICD-10 codes
- Current medications
- Allergies

### 4. Test Reminders
Overdue test alerts with direct booking links:
- HbA1c (Overdue - 33 days)
- Lipid Panel (Due in 5 days)
- Links to 1mg & Thyrocare

### 5. Medication Tracker
Current medications with:
- Dosage & frequency
- 1mg pharmacy ordering links
- Refill reminders

## Demo Patients

### P001 - Rajesh Kumar (62, M)
- **Conditions**: Type 2 Diabetes, Hypertension, CKD Stage 3
- **Allergies**: Penicillin, Shellfish
- **Clinical Flags**: 
  - ⚠️ HbA1c worsening (8.2%, trend ↑)
  - ⚠️ Creatinine rising (kidney decline)
  - 🔴 HIGH triage level

### P002 - Priya Nair (45, F)
- **Conditions**: Asthma (Intermittent), Allergic Rhinitis
- **Allergies**: NSAID
- **Clinical Status**: Well-controlled, stable labs
- 🟢 ROUTINE triage level

### P003 - Arjun Singh (58, M)
- **Conditions**: CAD, Post-MI (2019), Heart Failure (HFrEF)
- **Allergies**: None
- **Clinical Flags**:
  - ⚠️ Elevated BNP (480, trend ↑)
  - ⚠️ EF 32% (moderate HF)
  - 🟠 HIGH triage level

## Getting Started

### 1. Install Frontend Dependencies
```bash
cd frontend
pnpm install
```

### 2. Run the Frontend
```bash
cd frontend
pnpm dev
```

The app will be available at `http://localhost:3000`

### 3. Run the Backend (optional)
```bash
cd backend
npm install
npm run dev
```

### 3. Try It Out

**Doctor Flow:**
1. Go to `/doctor`
2. Enter Patient ID: `P001` (or P002, P003)
3. Explore tabs: Overview, Labs, Interactions, Visits, Triage
4. Try AI Assistant: Type "kidney function" or "diabetes"

**Patient Flow:**
1. Go to `/patient`
2. Type "hey" in the chat
3. Try: "book appointment", "health summary P001", "emergency"
4. Explore tabs: Health Summary, Test Reminders, Medications

## Key Implementation Details

### Drug Interaction Engine
Located in `/lib/drugInteractions.ts`:
- Real-world interaction database with severity levels
- Automatic detection by comparing all medication pairs
- Severity-based color coding (red/orange/yellow/blue)

### Synthetic Data
Located in `/lib/syntheticData.ts`:
- 3 fully populated patient records with:
  - Demographics & allergies
  - Multiple active conditions (ICD-10)
  - 4-6 active medications with cautions
  - 8+ lab results with trends
  - 3-5 recent visit summaries
  - Upcoming test reminders

### Triage Algorithm
Automatic routing based on:
1. Critical drug interactions → CRITICAL
2. High-risk lab values → HIGH
3. Default → ROUTINE

### AI Responses
Simulated Groq responses (mock for demo):
- Keyword matching on user queries
- Context-aware responses using patient data
- Fallback responses for unrecognized queries

## Future Enhancements

### Phase 1: Real Backend Integration
- [ ] Connect to actual Groq API for NLP
- [ ] Implement Firebase/Supabase for persistence
- [ ] Add WebSocket support for real-time streaming
- [ ] Blockchain audit trail (Ethereum/Polygon)

### Phase 2: Advanced Features
- [ ] OCR-based medical document upload & parsing
- [ ] Real-time multi-agent orchestration
- [ ] Second opinion diagnosis mode
- [ ] One-click referral workflow
- [ ] Video consultation support

### Phase 3: Hospital Integration
- [ ] EMR/EHR system connectors
- [ ] HL7/FHIR compliance
- [ ] Hospital authentication (LDAP/SSO)
- [ ] Analytics & reporting dashboard
- [ ] Performance metrics (LCP, INP, CLS)

## API Routes (Currently Simulated)

### Doctor Dashboard
- `GET /api/patients` – List patients
- `POST /api/brief/:patientId` – Generate brief
- `POST /api/drug-interactions/:patientId` – Check interactions
- `POST /api/nlp-query` – Groq AI query
- `GET /api/audit-trail/:patientId` – Audit log

### Patient Portal
- `POST /api/documents/upload` – OCR document upload
- `GET /api/patient/summary` – Health summary
- `GET /api/patient/reminders` – Overdue tests
- `POST /api/nutrition/analyze` – Nutrition advice
- `POST /api/chat/receptionist` – Receptionist chat

## Color Scheme

- **Primary**: Cyan (#0e7490) – Trust & clinical authority
- **Critical Alert**: Red (#dc2626) – Dangerous interactions
- **Warning**: Orange (#ea580c) – Moderate caution
- **Success**: Green (#16a34a) – Stable/improving
- **Background**: Slate (#f8fafc) – Clean, clinical

## Accessibility

- ARIA roles for all interactive elements
- Semantic HTML (main, header, nav)
- Keyboard navigation support
- Screen reader friendly labels
- Color contrast compliance (WCAG AA)

## Performance

- Server-side synthetic data (instant)
- Client-side tab switching (no network)
- Lazy-loaded components
- Optimized bundle with tree-shaking
- Ready for ISR/SSR caching

## Security Considerations

**Current (MVP):**
- No authentication (demo mode)
- Client-side simulated data
- Mock Groq responses

**Production (Future):**
- HIPAA compliance
- AES-256 patient data encryption
- Role-based access control (RBAC)
- Audit logging to blockchain
- Secure session management
- Rate limiting on API endpoints

## License

Proprietary – ClinSight AI Platform

## Support

For issues or feature requests, contact: support@clinsightai.com
