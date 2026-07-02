export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'doctor' | 'patient';
  createdAt: Date;
}

export const userStore = new Map<string, User>();

export function findUserByEmail(email: string): User | undefined {
  return Array.from(userStore.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): User | undefined {
  return userStore.get(id);
}

export function saveUser(user: User): void {
  userStore.set(user.id, user);
}

// Patient Data structure
export interface LabResult {
  name: string;
  value: number;
  unit: string;
  normalRange: string;
  date: string;
  trend?: 'improving' | 'worsening' | 'stable';
}

export interface Medication {
  name: string;
  dose: string;
  frequency: string;
  startDate: string;
  indications: string[];
  cautions?: string[];
}

export interface Visit {
  date: string;
  chief_complaint: string;
  summary: string;
  provider: string;
}

export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  mrn: string;
  dateOfBirth: string;
  allergies: string[];
  conditions: Array<{ name: string; icd10: string; onsetDate: string }>;
  medications: Medication[];
  labResults: LabResult[];
  recentVisits: Visit[];
  upcomingReminders: Array<{ test: string; dueDate: string; provider: string }>;
}

export const syntheticPatients: Record<string, PatientRecord> = {
  'P001': {
    id: 'P001',
    name: 'Rajesh Kumar',
    age: 62,
    mrn: 'MRN-2024-001',
    dateOfBirth: '1962-03-15',
    allergies: ['Penicillin', 'Shellfish'],
    conditions: [
      { name: 'Type 2 Diabetes Mellitus', icd10: 'E11.9', onsetDate: '2015-06-20' },
      { name: 'Hypertension', icd10: 'I10', onsetDate: '2012-11-10' },
      { name: 'Chronic Kidney Disease Stage 3', icd10: 'N18.3', onsetDate: '2018-02-15' },
    ],
    medications: [
      {
        name: 'Metformin',
        dose: '1000mg',
        frequency: 'Twice daily',
        startDate: '2015-07-01',
        indications: ['Type 2 Diabetes'],
        cautions: ['Monitor renal function'],
      },
      {
        name: 'Lisinopril',
        dose: '10mg',
        frequency: 'Once daily',
        startDate: '2012-12-01',
        indications: ['Hypertension', 'Proteinuria reduction'],
        cautions: ['Check K+ levels, do not use in pregnancy'],
      },
      {
        name: 'Atorvastatin',
        dose: '40mg',
        frequency: 'Once daily at night',
        startDate: '2016-03-15',
        indications: ['Dyslipidemia', 'Cardiovascular protection'],
        cautions: ['Monitor liver function, risk of muscle pain'],
      },
      {
        name: 'Aspirin',
        dose: '75mg',
        frequency: 'Once daily',
        startDate: '2018-05-20',
        indications: ['Cardiovascular protection'],
        cautions: ['GI bleeding risk, contraindicated in aspirin allergy'],
      },
    ],
    labResults: [
      { name: 'HbA1c', value: 8.2, unit: '%', normalRange: '<5.7%', date: '2024-12-15', trend: 'worsening' },
      { name: 'HbA1c', value: 7.8, unit: '%', normalRange: '<5.7%', date: '2024-09-10', trend: 'stable' },
      { name: 'HbA1c', value: 7.9, unit: '%', normalRange: '<5.7%', date: '2024-06-15', trend: 'stable' },
      { name: 'Creatinine', value: 1.6, unit: 'mg/dL', normalRange: '0.7-1.3', date: '2024-12-15', trend: 'worsening' },
      { name: 'Creatinine', value: 1.4, unit: 'mg/dL', normalRange: '0.7-1.3', date: '2024-09-10', trend: 'worsening' },
      { name: 'Creatinine', value: 1.2, unit: 'mg/dL', normalRange: '0.7-1.3', date: '2024-06-15', trend: 'stable' },
      { name: 'eGFR', value: 42, unit: 'mL/min/1.73m²', normalRange: '>60', date: '2024-12-15', trend: 'worsening' },
      { name: 'eGFR', value: 50, unit: 'mL/min/1.73m²', normalRange: '>60', date: '2024-09-10', trend: 'worsening' },
      { name: 'eGFR', value: 58, unit: 'mL/min/1.73m²', normalRange: '>60', date: '2024-06-15', trend: 'stable' },
      { name: 'TSH', value: 2.1, unit: 'mIU/L', normalRange: '0.4-4.0', date: '2024-12-15', trend: 'stable' },
      { name: 'Haemoglobin', value: 12.5, unit: 'g/dL', normalRange: '13.5-17.5', date: '2024-12-15', trend: 'stable' },
      { name: 'Fasting Blood Sugar', value: 156, unit: 'mg/dL', normalRange: '70-100', date: '2024-12-15', trend: 'worsening' },
      { name: 'Fasting Blood Sugar', value: 142, unit: 'mg/dL', normalRange: '70-100', date: '2024-09-10', trend: 'worsening' },
      { name: 'Fasting Blood Sugar', value: 130, unit: 'mg/dL', normalRange: '70-100', date: '2024-06-15', trend: 'stable' },
    ],
    recentVisits: [
      {
        date: '2024-12-15',
        chief_complaint: 'Follow-up for diabetes and CKD',
        summary: 'HbA1c worsening to 8.2%, creatinine 1.6. Patient reports fatigue. Adjusted metformin counseling.',
        provider: 'Dr. Priya Sharma',
      },
      {
        date: '2024-09-10',
        chief_complaint: 'Routine checkup',
        summary: 'BP controlled at 128/80 mmHg. HbA1c stable at 7.8%. Refill prescriptions.',
        provider: 'Dr. Amit Patel',
      },
      {
        date: '2024-06-15',
        chief_complaint: 'Diabetes management review',
        summary: 'Patient compliant with medications. Advised lifestyle modifications. Labs stable.',
        provider: 'Dr. Priya Sharma',
      },
    ],
    upcomingReminders: [
      { test: 'Lipid Panel', dueDate: '2025-03-15', provider: 'Thyrocare' },
      { test: 'Urine Albumin-to-Creatinine Ratio', dueDate: '2025-01-30', provider: '1mg' },
      { test: 'Annual Eye Exam', dueDate: '2025-02-28', provider: 'Apollo Hospitals' },
    ],
  },
  'P002': {
    id: 'P002',
    name: 'Priya Nair',
    age: 45,
    mrn: 'MRN-2024-002',
    dateOfBirth: '1979-07-22',
    allergies: ['NSAID'],
    conditions: [
      { name: 'Asthma (Intermittent)', icd10: 'J45.901', onsetDate: '2005-01-10' },
      { name: 'Allergic Rhinitis', icd10: 'J30.9', onsetDate: '2008-03-15' },
    ],
    medications: [
      {
        name: 'Albuterol Inhaler',
        dose: '100mcg',
        frequency: 'As needed',
        startDate: '2005-02-01',
        indications: ['Asthma'],
        cautions: ['Can cause tremors, not for daily use'],
      },
      {
        name: 'Fluticasone Nasal Spray',
        dose: '50mcg',
        frequency: 'Once daily',
        startDate: '2008-04-01',
        indications: ['Allergic rhinitis'],
        cautions: ['Epistaxis risk'],
      },
      {
        name: 'Cetirizine',
        dose: '10mg',
        frequency: 'Once daily',
        startDate: '2015-03-01',
        indications: ['Allergies'],
        cautions: ['Avoid if allergy to hydroxyzine'],
      },
    ],
    labResults: [
      { name: 'Spirometry (FEV1)', value: 82, unit: '%', normalRange: '>80%', date: '2024-12-10', trend: 'stable' },
      { name: 'Peak Flow', value: 420, unit: 'L/min', normalRange: '370-460', date: '2024-12-10', trend: 'stable' },
      { name: 'IgE', value: 145, unit: 'IU/mL', normalRange: '<150', date: '2024-09-05', trend: 'stable' },
    ],
    recentVisits: [
      {
        date: '2024-12-10',
        chief_complaint: 'Annual asthma review',
        summary: 'FEV1 82%, well-controlled. Minimal rescue inhaler use. Refill prescriptions.',
        provider: 'Dr. Deepak Kumar',
      },
      {
        date: '2024-06-15',
        chief_complaint: 'Seasonal allergies flare',
        summary: 'Increased nasal symptoms. Optimized antihistamine. Patient counseled on triggers.',
        provider: 'Dr. Deepak Kumar',
      },
    ],
    upcomingReminders: [
      { test: 'Spirometry Repeat', dueDate: '2025-06-10', provider: 'Apollo Hospitals' },
      { test: 'Allergy Testing', dueDate: '2025-03-01', provider: 'Max Healthcare' },
    ],
  },
  'P003': {
    id: 'P003',
    name: 'Arjun Singh',
    age: 58,
    mrn: 'MRN-2024-003',
    dateOfBirth: '1966-11-05',
    allergies: [],
    conditions: [
      { name: 'Coronary Artery Disease', icd10: 'I25.10', onsetDate: '2019-08-20' },
      { name: 'Post-MI (2019)', icd10: 'I21.9', onsetDate: '2019-08-20' },
      { name: 'Heart Failure (HFrEF)', icd10: 'I50.20', onsetDate: '2020-03-15' },
    ],
    medications: [
      {
        name: 'Carvedilol',
        dose: '12.5mg',
        frequency: 'Twice daily',
        startDate: '2019-09-01',
        indications: ['Heart failure', 'Post-MI'],
        cautions: ['Hypotension risk, do not abruptly stop'],
      },
      {
        name: 'Lisinopril',
        dose: '20mg',
        frequency: 'Once daily',
        startDate: '2019-09-01',
        indications: ['Heart failure', 'BP control'],
        cautions: ['Cough, hyperkalemia'],
      },
      {
        name: 'Furosemide',
        dose: '40mg',
        frequency: 'Once daily',
        startDate: '2020-03-20',
        indications: ['Fluid overload', 'Heart failure'],
        cautions: ['Electrolyte imbalance, dehydration'],
      },
      {
        name: 'Clopidogrel',
        dose: '75mg',
        frequency: 'Once daily',
        startDate: '2019-08-25',
        indications: ['Post-MI, CAD'],
        cautions: ['Bleeding risk, do not stop without cardiology approval'],
      },
    ],
    labResults: [
      { name: 'BNP', value: 480, unit: 'pg/mL', normalRange: '<100', date: '2024-12-12', trend: 'worsening' },
      { name: 'BNP', value: 410, unit: 'pg/mL', normalRange: '<100', date: '2024-09-05', trend: 'worsening' },
      { name: 'BNP', value: 350, unit: 'pg/mL', normalRange: '<100', date: '2024-06-10', trend: 'stable' },
      { name: 'Ejection Fraction', value: 32, unit: '%', normalRange: '>50%', date: '2024-12-12', trend: 'stable' },
      { name: 'Ejection Fraction', value: 33, unit: '%', normalRange: '>50%', date: '2024-09-05', trend: 'stable' },
      { name: 'Ejection Fraction', value: 35, unit: '%', normalRange: '>50%', date: '2024-06-10', trend: 'stable' },
      { name: 'Troponin I', value: 0.02, unit: 'ng/mL', normalRange: '<0.04', date: '2024-12-12', trend: 'stable' },
      { name: 'Troponin I', value: 0.01, unit: 'ng/mL', normalRange: '<0.04', date: '2024-09-05', trend: 'stable' },
      { name: 'Creatinine', value: 1.2, unit: 'mg/dL', normalRange: '0.7-1.3', date: '2024-12-12', trend: 'stable' },
      { name: 'Creatinine', value: 1.1, unit: 'mg/dL', normalRange: '0.7-1.3', date: '2024-09-05', trend: 'stable' },
    ],
    recentVisits: [
      {
        date: '2024-12-12',
        chief_complaint: 'Heart failure follow-up',
        summary: 'BNP elevated to 480, EF 32%. Increased dyspnea. Optimized diuretics, refer for device evaluation.',
        provider: 'Dr. Vikram Reddy',
      },
      {
        date: '2024-09-05',
        chief_complaint: 'Cardiology checkup',
        summary: 'EF stable 32%, tolerating medications well. Continue current regimen.',
        provider: 'Dr. Vikram Reddy',
      },
    ],
    upcomingReminders: [
      { test: 'Echocardiogram', dueDate: '2025-03-12', provider: 'Apollo Hospitals' },
      { test: 'Troponin', dueDate: '2025-01-15', provider: '1mg' },
    ],
  },
};
