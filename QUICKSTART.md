# ClinSight AI – Quick Start Guide

## 🚀 Getting Started in 3 Steps

### 1. Install & Run
```bash
cd /vercel/share/v0-project
pnpm install
pnpm dev
```

Open `http://localhost:3000` in your browser.

---

## 📋 Doctor Dashboard Flow

### Step 1: Enter Patient ID
- Navigate to `/doctor` or click "Doctor Dashboard" from home
- Enter one of: **P001**, **P002**, or **P003**
- Click "Search Patient"

### Step 2: Review Pre-Consultation Brief (60 seconds)
You'll see:
- **Header**: Patient name, age, MRN, and triage level (CRITICAL/HIGH/ROUTINE)
- **Alerts**: Clinical flags highlighting critical issues
- **Tabs**: Navigate through Overview, Labs, Interactions, Visits, Triage

### Step 3: Explore Tabs

#### **Overview Tab**
- ⚠️ Allergies (red flags)
- Active diagnoses with ICD-10 codes
- Current medications with cautions
- Important: Drug contraindications displayed in red

#### **Labs Tab**
- All lab results with values and normal ranges
- **Trend Indicators**: 
  - ↑ **WORSENING** (red) – lab values getting worse
  - ↓ **IMPROVING** (green) – positive trends
  - → **STABLE** (blue) – no significant change
- Color-coded backgrounds (green for normal, red for abnormal)

#### **Interactions Tab**
- Drug-drug interactions detected automatically
- **Severity Levels**:
  - 🔴 **CRITICAL** (dark red) – Hold medication review
  - 🟠 **HIGH** (orange) – Requires monitoring
  - 🟡 **MODERATE** (yellow) – Use caution
  - 🔵 **MILD** (blue) – Routine combination
- Each interaction shows: description + clinical recommendation

#### **Visits Tab**
- Recent consultation history
- Chief complaints and provider notes
- Date and provider information

#### **Triage Tab**
- Overall triage recommendation (CRITICAL/HIGH/ROUTINE)
- List of clinical flags affecting the rating
- Suggested routing (department recommendation)

### Step 4: Query the AI Assistant (Right Sidebar)
Try asking:
- "kidney function" – Get kidney status for P001
- "diabetes control" – Check glycemic control
- "heart function" – View cardiac status for P003
- Any natural language question about the patient

**Response**: AI provides contextual answer pulling from patient data

---

## 👥 Patient Portal Flow

### Step 1: Enter Patient Portal
- Navigate to `/patient` or click "Patient Portal" from home

### Step 2: Start Chatting
Look at the **AI Receptionist** sidebar (right side). You have 3 ways to chat:

**Option A: Type "hey" in the chat box**
- Receptionist greets you with menu options
- Options: Book appointment, Health summary, Departments, Emergency

**Option B: Quick action buttons**
- 👋 **Hey** – Get started
- 📅 **Book Appointment** – Schedule a visit
- 🆘 **Emergency** – Get emergency contact

**Option C: Type specific queries**

### Step 3: Explore Responses

#### **"hey"** 
```
Hello! 👋 Welcome to our Patient Portal. I'm your AI Receptionist. 
How can I help you today?

You can:
✓ Book an appointment (Reply: book)
✓ View your health summary (Reply: health summary + Patient ID)
✓ Check test reminders
✓ Ask for emergency help
✓ Learn about departments
```

#### **"book" or "book appointment"**
```
I can help you book an appointment! Our departments are open 
Monday-Friday 9 AM-6 PM. Which department would you like to visit?

1. General Medicine
2. Cardiology
3. Endocrinology
4. Pulmonology
5. Nephrology
```

#### **"health summary"**
Receptionist asks for your Patient ID:
```
To view your health summary, please enter your Patient ID 
(e.g., P001, P002, P003)
```

Then enter **P001** (or P002/P003), and click "Load" to see:
- Active diagnoses with ICD-10 codes
- Current medications & dosages
- Allergies highlighted

#### **"emergency"**
```
For medical emergencies, please call 108 immediately or go to the 
nearest emergency room.

Hospital Emergency Line: +91-XXXXX-XXXXX
Our Emergency Department is available 24/7.
```

#### **"departments"**
```
We have the following departments:
• General Medicine
• Cardiology
• Endocrinology (Diabetes)
• Pulmonology (Respiratory)
• Nephrology (Kidney)
• Gastroenterology
• Neurology
```

### Step 4: Navigate Main Tabs

**Health Summary**
- Enter Patient ID to load data
- View diagnoses, medications, allergies

**Test Reminders**
- Shows overdue tests with red alerts
- Links to book on 1mg or Thyrocare
- Example: HbA1c (33 days overdue)

**Medication Tracker**
- Current medications with dosages
- Direct pharmacy links to 1mg for each med

---

## 🧪 Demo Patients Explained

### **P001 – Rajesh Kumar (62, Male)**
**Best for testing**: Drug interactions, worsening trends, high-risk scenario

- **Conditions**: Type 2 Diabetes, Hypertension, CKD Stage 3
- **Medications**: Metformin, Lisinopril, Atorvastatin, Aspirin
- **Key Finding**: Drug interactions between:
  - Lisinopril (ACE-I) + Aspirin (NSAID) → Renal dysfunction risk
  - Furosemide (if loaded) + Lisinopril → Hyperkalemia risk
- **Labs**: HbA1c **worsening** (8.2%), Creatinine **rising**
- **Triage**: 🟠 **HIGH** – Multiple clinical flags

### **P002 – Priya Nair (45, Female)**
**Best for testing**: Well-controlled disease, no complex interactions

- **Conditions**: Asthma (Intermittent), Allergic Rhinitis
- **Medications**: Albuterol, Fluticasone, Cetirizine
- **Key Finding**: No significant drug interactions
- **Labs**: All **stable** (FEV1 82%, IgE normal)
- **Triage**: 🟢 **ROUTINE** – Clean bill of health

### **P003 – Arjun Singh (58, Male)**
**Best for testing**: Cardiac disease, biomarker elevation, HF management

- **Conditions**: Coronary Artery Disease, Post-MI (2019), Heart Failure (HFrEF)
- **Medications**: Carvedilol, Lisinopril, Furosemide, Clopidogrel
- **Key Finding**: Elevated BNP (480) + Dual antiplatelet therapy
- **Labs**: EF **stable** (32%), BNP **worsening**, Troponin normal
- **Triage**: 🟠 **HIGH** – Heart failure decompensation risk

---

## 🎯 Quick Testing Checklist

### Doctor Dashboard
- [ ] Search P001 → See HIGH triage
- [ ] Click "Labs" → See worsening HbA1c, rising creatinine
- [ ] Click "Interactions" → See 2-3 drug interactions
- [ ] Click "Triage" → Understand clinical flags
- [ ] Type "kidney" in AI box → Get kidney function analysis
- [ ] Check Audit Trail sidebar → See action logging

### Patient Portal
- [ ] Type "hey" → Get welcome menu
- [ ] Type "book" → See departments
- [ ] Type "health summary P001" → Load patient data
- [ ] Type "emergency" → See emergency info
- [ ] Click "Test Reminders" tab → See overdue tests
- [ ] Click "Health Summary" → Load P001, view conditions

---

## 🔗 URL Shortcuts

| Page | URL |
|------|-----|
| Home | `http://localhost:3000` |
| Doctor Dashboard | `http://localhost:3000/doctor` |
| Patient Portal | `http://localhost:3000/patient` |

---

## 🛠 Troubleshooting

**Port already in use?**
```bash
# Use a different port
PORT=3001 pnpm dev
```

**Styles not loading?**
```bash
# Clear Next.js cache
rm -rf .next
pnpm dev
```

**Need a fresh build?**
```bash
pnpm build
pnpm start
```

---

## 📞 Support

For issues or questions:
1. Check the README.md for detailed documentation
2. Try one of the demo Patient IDs (P001, P002, P003)
3. Explore each tab to understand the interface

---

## 🚀 What's Next?

**Future Enhancements:**
- Real Groq API integration for advanced AI queries
- Firebase backend for persistent data
- OCR document uploads with automatic parsing
- Blockchain audit trail
- Video consultation support
- Hospital EMR integration

**Phase 2 Features:**
- Second opinion diagnostic mode
- One-click referral workflow
- Nutrition analyzer
- Medication refill automation

---

Enjoy exploring ClinSight AI! 🎉
