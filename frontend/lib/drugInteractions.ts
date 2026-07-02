export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'critical' | 'high' | 'moderate' | 'mild';
  description: string;
  recommendation: string;
}

export const drugInteractionDatabase: DrugInteraction[] = [
  {
    drug1: 'Lisinopril',
    drug2: 'Aspirin',
    severity: 'moderate',
    description: 'NSAIDs (including aspirin) can reduce the effectiveness of ACE inhibitors and increase renal dysfunction risk.',
    recommendation: 'Monitor renal function and BP. Use lowest effective dose of aspirin.',
  },
  {
    drug1: 'Metformin',
    drug2: 'Lisinopril',
    severity: 'moderate',
    description: 'Both drugs may cause renal impairment. Combined use requires careful monitoring in CKD.',
    recommendation: 'Monitor eGFR regularly. May need dose adjustment if eGFR <45.',
  },
  {
    drug1: 'Atorvastatin',
    drug2: 'Aspirin',
    severity: 'mild',
    description: 'Increased bleeding risk with combination. Aspirin may enhance statin effects.',
    recommendation: 'Monitor for signs of bleeding. Routine combination in CAD patients is acceptable.',
  },
  {
    drug1: 'Carvedilol',
    drug2: 'Lisinopril',
    severity: 'moderate',
    description: 'Combination increases hypotension and hyperkalemia risk.',
    recommendation: 'Monitor BP and K+ levels regularly. Educate patient on hypotension symptoms.',
  },
  {
    drug1: 'Furosemide',
    drug2: 'Lisinopril',
    severity: 'high',
    description: 'Both affect fluid and electrolyte balance. Risk of hyperkalemia (especially with Lisinopril) and acute kidney injury.',
    recommendation: 'Monitor electrolytes and creatinine closely. Educate on signs of hyperkalemia.',
  },
  {
    drug1: 'Clopidogrel',
    drug2: 'Aspirin',
    severity: 'high',
    description: 'Dual antiplatelet therapy increases bleeding risk significantly.',
    recommendation: 'This is intentional post-MI for 12 months. Monitor for bleeding, advise on GI bleeding symptoms.',
  },
  {
    drug1: 'Metformin',
    drug2: 'Contrast Media',
    severity: 'critical',
    description: 'Risk of metformin-associated lactic acidosis (MALA) after contrast injection.',
    recommendation: 'Hold metformin 48 hours before and after imaging with contrast. Monitor renal function.',
  },
  {
    drug1: 'Cetirizine',
    drug2: 'Albuterol',
    severity: 'mild',
    description: 'No significant interaction. Both commonly used together.',
    recommendation: 'Safe combination. No dose adjustment needed.',
  },
];

export function checkDrugInteractions(medications: string[]): DrugInteraction[] {
  const interactions: DrugInteraction[] = [];
  
  for (let i = 0; i < medications.length; i++) {
    for (let j = i + 1; j < medications.length; j++) {
      const interaction = drugInteractionDatabase.find(
        (d) =>
          (d.drug1.toLowerCase().includes(medications[i].toLowerCase()) &&
            d.drug2.toLowerCase().includes(medications[j].toLowerCase())) ||
          (d.drug1.toLowerCase().includes(medications[j].toLowerCase()) &&
            d.drug2.toLowerCase().includes(medications[i].toLowerCase()))
      );
      
      if (interaction) {
        interactions.push(interaction);
      }
    }
  }
  
  return interactions;
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-900 text-white';
    case 'high':
      return 'bg-orange-600 text-white';
    case 'moderate':
      return 'bg-yellow-500 text-black';
    case 'mild':
      return 'bg-blue-400 text-black';
    default:
      return 'bg-gray-300';
  }
}
