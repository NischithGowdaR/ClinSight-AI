'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, LogOut, Shield, ChevronRight, CheckCircle2, RotateCcw, AlertTriangle, UserCheck, HelpCircle } from 'lucide-react';
import { getPatientById, PatientRecord } from '@/lib/syntheticData';
import { useAuth } from '@/lib/useAuth';
import PreConsultationBrief from '@/components/doctor/PreConsultationBrief';
import PatientSearch from '@/components/doctor/PatientSearch';

interface AuditBlock {
  id: string;
  timestamp: string;
  eventType: string;
  description: string;
  hash: string;
}

// Simple deterministic hash generator
function generateHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padEnd(8, 'a') + 
              Math.abs(hash * 33).toString(16).padEnd(8, 'b');
  return '0x' + hex.substring(0, 16).toLowerCase();
}

export default function DoctorDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [patientId, setPatientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  // Modals state
  const [activeModal, setActiveModal] = useState<'second-opinion' | 'referral' | 'emergency' | null>(null);
  
  // Pipeline Animation State
  const [showTrace, setShowTrace] = useState(false);
  const [traceStep, setTraceStep] = useState(0);
  const [traceComplete, setTraceComplete] = useState(false);

  // Dynamic Audit State
  const [auditLogs, setAuditLogs] = useState<AuditBlock[]>([
    {
      id: '1',
      timestamp: '14:00:15',
      eventType: 'USER_LOGIN',
      description: 'Dr. Rajesh Kumar authenticated successfully (Role: Doctor)',
      hash: '0x4f8e2c39d9a1b8c7',
    },
    {
      id: '2',
      timestamp: '14:00:20',
      eventType: 'SYNC_REGISTRY',
      description: 'Clinical database registry synced successfully',
      hash: '0x9d8c7b6a5e4f3a2b',
    }
  ]);

  // Second Opinion State
  const [proposedDiagnosis, setProposedDiagnosis] = useState('');
  const [evaluatingOpinion, setEvaluatingOpinion] = useState(false);
  const [opinionResult, setOpinionResult] = useState<{
    verdict: 'CORROBORATED' | 'CONTRADICTED' | 'WARNING';
    confidence: number;
    evidence: string[];
  } | null>(null);

  // Referral State
  const [referralDept, setReferralDept] = useState('Cardiology');
  const [referralPriority, setReferralPriority] = useState('HIGH');
  const [referralNotes, setReferralNotes] = useState('');
  const [referralReceipt, setReferralReceipt] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const addAuditLog = (eventType: string, description: string) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const inputForHash = `${eventType}-${description}-${now.getTime()}-${Math.random()}`;
    const hash = generateHash(inputForHash);

    const newBlock: AuditBlock = {
      id: Date.now().toString(),
      timestamp: timeStr,
      eventType,
      description,
      hash,
    };

    setAuditLogs(prev => [newBlock, ...prev]);
  };

  const handleSearch = (id: string) => {
    setLoading(true);
    setSelectedPatient(null);
    setShowTrace(false);
    setTraceStep(0);
    setTraceComplete(false);

    setTimeout(() => {
      const patient = getPatientById(id.toUpperCase());
      if (patient) {
        setSelectedPatient(patient);
        setPatientId(id.toUpperCase());
        
        // Log Access
        addAuditLog('ACCESS_RECORD', `Opened health record for patient ${patient.name} (${id.toUpperCase()})`);
        
        // Start Pipeline Trace
        setShowTrace(true);
        setTraceStep(1);
        
        setTimeout(() => {
          setTraceStep(2);
          setTimeout(() => {
            setTraceStep(3);
            setTimeout(() => {
              setTraceStep(4);
              setTimeout(() => {
                setTraceStep(5);
                setTraceComplete(true);
                addAuditLog('FULL_PIPELINE_RUN', `7-agent orchestrator successfully generated pre-consultation brief for ${patient.name}`);
              }, 400);
            }, 400);
          }, 400);
        }, 400);

      } else {
        alert('Patient not found. Try P001, P002, or P003');
      }
      setLoading(false);
    }, 500);
  };

  const handleAiQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim() || !selectedPatient) return;

    const userQuery = aiQuery;
    setAiResponse('Analyzing patient charts and drug databases...');
    addAuditLog('AI_NLP_QUERY', `Submitted clinical query: "${userQuery.slice(0, 30)}..."`);

    setTimeout(() => {
      const mockResponses: Record<string, string> = {
        'kidney': `Based on ${selectedPatient.name}'s records: Creatinine is ${selectedPatient.labResults.find(l => l.name === 'Creatinine')?.value || 'N/A'} mg/dL (elevated/worsening). eGFR shows Stage 3 CKD (${selectedPatient.labResults.find(l => l.name === 'eGFR')?.value || 'N/A'} mL/min). Recommend monitoring K+ levels with ACE inhibitor use and limiting NSAIDs.`,
        'diabetes': `HbA1c trend is worsening at ${selectedPatient.labResults.find(l => l.name === 'HbA1c')?.value || 'N/A'}%. Fasting glucose is also elevated at 156 mg/dL. Consider therapy intensification - discuss adding a GLP-1 agonist or SGLT2 inhibitor (cardio/renal protective).`,
        'heart': `Patient has stable ejection fraction at ${selectedPatient.labResults.find(l => l.name === 'Ejection Fraction')?.value || '32'}%. BNP is elevated at ${selectedPatient.labResults.find(l => l.name === 'BNP')?.value || '480'} pg/mL (worsening). Continue current heart failure regimen, check volume status, monitor closely for dyspnea/fluid overload.`,
        'interaction': `Check completed: ${selectedPatient.name} has ${selectedPatient.medications.length} active prescriptions. Found critical drug-drug cautions. Metformin requires eGFR monitoring, and Lisinopril+Aspirin combination may accelerate renal decline.`,
        'default': `Clinical summary for query: "${userQuery}"\n\n- Active Conditions: ${selectedPatient.conditions.map(c => c.name).join(', ')}\n- Lab Findings: Latest HbA1c is ${selectedPatient.labResults.find(l => l.name === 'HbA1c')?.value || 'N/A'}%\n- Medications: ${selectedPatient.medications.map(m => m.name).join(', ')}\n- Triage Priority: Suggested review indicated in Triage tab.`,
      };

      const response = Object.entries(mockResponses).find(([key]) =>
        userQuery.toLowerCase().includes(key)
      )?.[1] || mockResponses['default'];

      setAiResponse(response);
      setAiQuery('');
    }, 1000);
  };

  const handleSecondOpinionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposedDiagnosis.trim() || !selectedPatient) return;

    setEvaluatingOpinion(true);
    setOpinionResult(null);
    addAuditLog('SECOND_OPINION_REQUEST', `Requested diagnostic corroboration for: "${proposedDiagnosis}"`);

    setTimeout(() => {
      const text = proposedDiagnosis.toLowerCase();
      let result: typeof opinionResult = {
        verdict: 'WARNING',
        confidence: 50,
        evidence: ['No direct diagnostic indicators found matching this proposal. Suggest further review.']
      };

      if (selectedPatient.id === 'P001') {
        if (text.includes('kidney') || text.includes('ckd') || text.includes('renal')) {
          result = {
            verdict: 'CORROBORATED',
            confidence: 92,
            evidence: [
              'Creatinine rose from 1.2 mg/dL (June) to 1.4 mg/dL (Sept) and is now abnormal at 1.6 mg/dL (normal: 0.7-1.3).',
              'eGFR has dropped to 42 mL/min/1.73m² (normal: >60), indicating CKD Stage 3b progression.',
              'Concurrent administration of Lisinopril and Aspirin elevates the risk of acute kidney injury (AKI).'
            ]
          };
        } else if (text.includes('diab') || text.includes('glyc') || text.includes('sugar')) {
          result = {
            verdict: 'CORROBORATED',
            confidence: 88,
            evidence: [
              'HbA1c level has worsened to 8.2% (abnormal, normal: <5.7%), indicating inadequate glycemic control.',
              'Fasting blood sugar is elevated at 156 mg/dL.',
              'Current Metformin (1000mg BID) requires dose adjustment or combination therapy (e.g. SGLT2i).'
            ]
          };
        }
      } else if (selectedPatient.id === 'P003') {
        if (text.includes('heart') || text.includes('failure') || text.includes('decompensation') || text.includes('hf')) {
          result = {
            verdict: 'CORROBORATED',
            confidence: 95,
            evidence: [
              'BNP has climbed steadily from 350 to 410, and is now critically elevated at 480 pg/mL (normal: <100 pg/mL).',
              'Left Ventricular Ejection Fraction (LVEF) is stable but low at 32% (normal: >50%).',
              'Symptoms of dyspnea and elevated BNP justify medical therapy optimization or device referral.'
            ]
          };
        } else if (text.includes('infarct') || text.includes('mi') || text.includes('coronary') || text.includes('attack')) {
          result = {
            verdict: 'CONTRADICTED',
            confidence: 15,
            evidence: [
              'Troponin I is stable and normal at 0.02 ng/mL (normal: <0.04 ng/mL), ruling out acute myocardial necrosis.',
              'Recent ECG/clinical history reports stable CAD without ischemic progression. Dyspnea is congestive.',
              'Patient is already compliant on double antiplatelet (Aspirin + Clopidogrel) and beta-blockers.'
            ]
          };
        }
      }

      setOpinionResult(result);
      setEvaluatingOpinion(false);
      addAuditLog('SECOND_OPINION_EVALUATION', `Second Opinion Agent processed proposed diagnosis. Verdict: ${result.verdict} (${result.confidence}% Confidence)`);
    }, 1200);
  };

  const handleReferralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const refId = `REF-${selectedPatient.id}-${Math.floor(1000 + Math.random() * 9000)}`;
    const hash = generateHash(refId + referralDept);
    
    const summary = `
CLINICAL HANDOFF SUMMARY
=========================
Referral ID : ${refId}
Target Dept : Department of ${referralDept}
Priority    : [${referralPriority}]
From        : Dr. Rajesh Kumar (General Medicine)
Date/Time   : ${new Date().toLocaleString()}

Patient Demographics:
- Name: ${selectedPatient.name}
- Age: ${selectedPatient.age}yo | Sex: M
- MRN: ${selectedPatient.mrn}

Primary Active Diagnoses:
${selectedPatient.conditions.map(c => `  * ${c.name} (${c.icd10})`).join('\n')}

Active Medications:
${selectedPatient.medications.map(m => `  * ${m.name} (${m.dose} ${m.frequency})`).join('\n')}

Key Diagnostic Highlights:
${selectedPatient.labResults.slice(0, 3).map(l => `  - ${l.name}: ${l.value} ${l.unit} (Trend: ${l.trend})`).join('\n')}

Referring Clinician Notes:
"${referralNotes || 'No specific notes provided.'}"

Handoff Signature Hash:
${hash} (Logged to Blockchain ledger)
    `.trim();

    setReferralReceipt(summary);
    addAuditLog('PATIENT_REFERRAL_FILED', `Transferred patient to ${referralDept} with ${referralPriority} priority. Ticket ID: ${refId}`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-900">
      {/* Header */}
      <div className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-cyan-400 rounded-lg transition"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent flex items-center gap-2">
                <Shield size={20} className="text-cyan-400 animate-pulse" />
                ClinSight AI <span className="text-xs bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded font-mono border border-cyan-800/40">DOCTOR DASHBOARD</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium">Real-Time Clinical Intelligence Agent Suite</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {selectedPatient && (
              <div className="text-right border-r border-slate-800 pr-6 hidden md:block">
                <p className="text-sm font-bold text-slate-200">{selectedPatient.name}</p>
                <p className="text-xs text-slate-500 font-mono">MRN: {selectedPatient.mrn}</p>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-300">{user?.name || 'Dr. Rajesh Kumar'}</p>
                <p className="text-[10px] text-slate-500 font-mono">{user?.email || 'dr.rajesh@clinsight.com'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 bg-slate-950 border border-slate-800 hover:bg-red-950 hover:border-red-900 rounded-lg transition-colors text-slate-400 hover:text-red-400"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {!selectedPatient ? (
          <div className="py-12">
            <PatientSearch onSearch={handleSearch} loading={loading} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Agent Execution Trace Animation */}
            {showTrace && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-teal-500" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-bold tracking-wider text-cyan-400 uppercase font-mono mb-1">
                      7-Agent Orchestrator Pipeline Trace
                    </h3>
                    <p className="text-sm text-slate-300 font-semibold">
                      Chaining specialized clinical agents in real-time...
                    </p>
                  </div>
                  {traceComplete && (
                    <span className="text-[10px] font-mono bg-emerald-950 border border-emerald-800 text-emerald-400 px-2 py-1 rounded font-bold animate-bounce">
                      ✓ PIPELINE EXECUTED SUCCESSFULLY
                    </span>
                  )}
                </div>

                {/* Steps Visualizer */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
                  {[
                    { id: 1, name: 'Orchestrator', desc: 'Case sheets validation & loader' },
                    { id: 2, name: 'Analysis Agent', desc: 'Labs trends & drug checks' },
                    { id: 3, name: 'Triage Agent', desc: 'Flag prioritization & routing' },
                    { id: 4, name: 'Second Opinion', desc: 'Corroboration readiness check' },
                    { id: 5, name: 'Blockchain Logger', desc: 'SHA-256 block registration' },
                  ].map((step) => {
                    const isPending = traceStep < step.id;
                    const isActive = traceStep === step.id && !traceComplete;
                    const isCompleted = traceStep > step.id || traceComplete;

                    return (
                      <div
                        key={step.id}
                        className={`relative rounded-lg p-3 border transition-all ${
                          isActive
                            ? 'bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-950/50 scale-[1.02]'
                            : isCompleted
                              ? 'bg-slate-950 border-emerald-800/40 text-slate-300'
                              : 'bg-slate-950/40 border-slate-900 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[9px] font-mono font-bold text-slate-500">STEP 0{step.id}</span>
                          {isActive && (
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                            </span>
                          )}
                          {isCompleted && <CheckCircle2 size={12} className="text-emerald-400" />}
                        </div>
                        <h4 className={`text-xs font-bold ${isActive ? 'text-cyan-400' : isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>
                          {step.name}
                        </h4>
                        <p className="text-[9px] text-slate-500 leading-tight mt-0.5">{step.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-4 gap-6">
              {/* Main Pre-consultation Brief Card */}
              <div className="lg:col-span-3 text-slate-900">
                <PreConsultationBrief patient={selectedPatient} />
              </div>

              {/* Sidebar: AI Query, Audit Trail, Actions */}
              <div className="space-y-6">
                
                {/* Reset Search / Patient Selection Info */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Patient</p>
                    <p className="text-sm font-extrabold text-slate-200">{selectedPatient.name}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPatient(null);
                      setPatientId('');
                      setAiResponse('');
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 transition"
                  >
                    <RotateCcw size={12} /> Reset
                  </button>
                </div>

                {/* AI Assistant */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-xs font-extrabold tracking-wider text-cyan-400 uppercase font-mono">
                      ClinSight Copilot AI
                    </h3>
                    <p className="text-[10px] text-slate-500">Natural language insights from clinical data</p>
                  </div>

                  <form onSubmit={handleAiQuery} className="space-y-3">
                    <textarea
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      placeholder="e.g. 'kidney function trends' or 'diabetes evaluation'"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 resize-none h-20"
                    />
                    <button
                      type="submit"
                      disabled={!aiQuery.trim()}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs py-2 px-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                    >
                      <Send size={12} /> Submit Query
                    </button>
                  </form>

                  {aiResponse && (
                    <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 space-y-1.5 animate-fadeIn">
                      <p className="text-[8px] font-mono text-cyan-400 uppercase font-extrabold tracking-widest">
                        Copilot Inference Output
                      </p>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
                    </div>
                  )}
                </div>

                {/* Quick Actions Panel */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-xs font-extrabold tracking-wider text-cyan-400 uppercase font-mono">
                      Clinical Agent Executions
                    </h3>
                    <p className="text-[10px] text-slate-500">Run specialised on-demand agents</p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setOpinionResult(null);
                        setProposedDiagnosis('');
                        setActiveModal('second-opinion');
                      }}
                      className="w-full flex items-center justify-between p-3 bg-slate-900 border border-slate-800 hover:border-cyan-500 rounded-lg text-left text-xs font-semibold text-slate-200 transition group"
                    >
                      <span className="flex items-center gap-2">
                        <span>📋</span> Second Opinion Agent
                      </span>
                      <ChevronRight size={14} className="text-slate-600 group-hover:text-cyan-400 transition" />
                    </button>

                    <button
                      onClick={() => {
                        setReferralReceipt(null);
                        setReferralNotes('');
                        setActiveModal('referral');
                      }}
                      className="w-full flex items-center justify-between p-3 bg-slate-900 border border-slate-800 hover:border-cyan-500 rounded-lg text-left text-xs font-semibold text-slate-200 transition group"
                    >
                      <span className="flex items-center gap-2">
                        <span>🔄</span> Referral Transfer Agent
                      </span>
                      <ChevronRight size={14} className="text-slate-600 group-hover:text-cyan-400 transition" />
                    </button>

                    <button
                      onClick={() => setActiveModal('emergency')}
                      className="w-full flex items-center justify-between p-3 bg-red-950/15 border border-red-950 hover:border-red-600 rounded-lg text-left text-xs font-semibold text-red-400 hover:text-red-300 transition group"
                    >
                      <span className="flex items-center gap-2">
                        <span>🚨</span> Emergency Department
                      </span>
                      <ChevronRight size={14} className="text-red-900 group-hover:text-red-400 transition" />
                    </button>
                  </div>
                </div>

                {/* Audit Trail Sidebar */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                  <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-extrabold tracking-wider text-cyan-400 uppercase font-mono">
                        Audit Log Ledger
                      </h3>
                      <p className="text-[10px] text-slate-500">Immutable SHA-256 state trail</p>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded font-mono border border-emerald-900">
                      LIVE
                    </span>
                  </div>

                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="p-2.5 bg-slate-900 border border-slate-800/80 rounded-lg space-y-1 hover:border-slate-700 transition animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-bold text-cyan-400 bg-cyan-950 px-1.5 py-0.2 rounded font-mono">
                            {log.eventType}
                          </span>
                          <span className="text-[8px] text-slate-500 font-mono">{log.timestamp}</span>
                        </div>
                        <p className="text-[10px] text-slate-300 font-medium leading-normal">{log.description}</p>
                        <p className="text-[8px] text-slate-500 font-mono font-semibold select-all cursor-pointer hover:text-slate-400">
                          hash: {log.hash}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Second Opinion Agent */}
      {activeModal === 'second-opinion' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <span>📋</span> Second Opinion Diagnostic Corroborator
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-200 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 transition"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSecondOpinionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase font-mono">
                  Proposed Physician Diagnosis
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={proposedDiagnosis}
                    onChange={(e) => setProposedDiagnosis(e.target.value)}
                    placeholder="e.g. 'CKD Progression' or 'Heart Failure Decompensation'"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
                  />
                  <button
                    type="submit"
                    disabled={evaluatingOpinion || !proposedDiagnosis.trim()}
                    className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 px-4 py-2 rounded-lg text-xs font-bold transition disabled:opacity-50"
                  >
                    {evaluatingOpinion ? 'Analyzing...' : 'Run Agent'}
                  </button>
                </div>
              </div>
            </form>

            {/* Quick Demo Pre-fills */}
            <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800 text-[10px] text-slate-400 space-y-2">
              <span className="font-bold text-slate-300 font-mono uppercase block">Demo Evaluation Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedPatient?.id === 'P001' ? (
                  <>
                    <button
                      onClick={() => setProposedDiagnosis('Chronic Kidney Disease (CKD) Progression')}
                      className="bg-slate-900 border border-slate-800 px-2 py-1 rounded hover:border-slate-700 hover:text-slate-300 text-slate-400"
                    >
                      "CKD Progression"
                    </button>
                    <button
                      onClick={() => setProposedDiagnosis('Worsening Glycemic Control / Diabetes')}
                      className="bg-slate-900 border border-slate-800 px-2 py-1 rounded hover:border-slate-700 hover:text-slate-300 text-slate-400"
                    >
                      "Worsening Glycemic Control"
                    </button>
                  </>
                ) : selectedPatient?.id === 'P003' ? (
                  <>
                    <button
                      onClick={() => setProposedDiagnosis('Acute Congestive Heart Failure Decompensation')}
                      className="bg-slate-900 border border-slate-800 px-2 py-1 rounded hover:border-slate-700 hover:text-slate-300 text-slate-400"
                    >
                      "HF Decompensation"
                    </button>
                    <button
                      onClick={() => setProposedDiagnosis('Acute Myocardial Infarction / Heart Attack')}
                      className="bg-slate-900 border border-slate-800 px-2 py-1 rounded hover:border-slate-700 hover:text-slate-300 text-slate-400"
                    >
                      "Myocardial Infarction"
                    </button>
                  </>
                ) : (
                  <span className="italic">No custom presets for this patient profile. Try typing.</span>
                )}
              </div>
            </div>

            {/* Second Opinion Result Presentation */}
            {opinionResult && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-3.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {opinionResult.verdict === 'CORROBORATED' ? (
                      <span className="text-[10px] font-extrabold bg-emerald-950 border border-emerald-900 text-emerald-400 px-2.5 py-1 rounded flex items-center gap-1 font-mono">
                        <UserCheck size={12} /> CORROBORATED
                      </span>
                    ) : opinionResult.verdict === 'CONTRADICTED' ? (
                      <span className="text-[10px] font-extrabold bg-red-950 border border-red-900 text-red-400 px-2.5 py-1 rounded flex items-center gap-1 font-mono">
                        <AlertTriangle size={12} /> CONTRADICTED
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold bg-yellow-950 border border-yellow-900 text-yellow-400 px-2.5 py-1 rounded flex items-center gap-1 font-mono">
                        <HelpCircle size={12} /> CLINICAL WARNING
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-bold">Diagnostic Verdict</span>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-semibold">Agent Confidence</p>
                    <p className={`text-base font-extrabold ${opinionResult.verdict === 'CORROBORATED' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {opinionResult.confidence}%
                    </p>
                  </div>
                </div>

                {/* Progress bar represent confidence */}
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      opinionResult.verdict === 'CORROBORATED' ? 'bg-emerald-500' : opinionResult.verdict === 'CONTRADICTED' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${opinionResult.confidence}%` }}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold tracking-wider text-slate-500 font-mono uppercase">
                    Cited Evidence & Laboratory Support
                  </p>
                  <ul className="space-y-1.5">
                    {opinionResult.evidence.map((ev, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                        <span className="text-cyan-500 mt-1 select-none font-bold">•</span>
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Referral Transfer Agent */}
      {activeModal === 'referral' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <span>🔄</span> Referral Transfer Agent & Clinical Handoff
              </h3>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setReferralReceipt(null);
                }}
                className="text-xs font-bold text-slate-400 hover:text-slate-200 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 transition"
              >
                ✕ Close
              </button>
            </div>

            {!referralReceipt ? (
              <form onSubmit={handleReferralSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 font-mono uppercase">
                      Target Department
                    </label>
                    <select
                      value={referralDept}
                      onChange={(e) => setReferralDept(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
                    >
                      <option value="Cardiology">Cardiology (Cardiac Care)</option>
                      <option value="Nephrology">Nephrology (Renal Care)</option>
                      <option value="Endocrinology">Endocrinology (Diabetes/Glycemic)</option>
                      <option value="Pulmonology">Pulmonology (Respiratory)</option>
                      <option value="Gastroenterology">Gastroenterology</option>
                      <option value="Neurology">Neurology</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 font-mono uppercase">
                      Priority Urgency
                    </label>
                    <select
                      value={referralPriority}
                      onChange={(e) => setReferralPriority(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
                    >
                      <option value="ROUTINE">Routine Follow-up</option>
                      <option value="MEDIUM">Medium / Escalated</option>
                      <option value="HIGH">High Priority (Urgent)</option>
                      <option value="CRITICAL">Critical Emergency (Immediate)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 font-mono uppercase">
                    Referring Clinician Notes & Diagnostics
                  </label>
                  <textarea
                    value={referralNotes}
                    onChange={(e) => setReferralNotes(e.target.value)}
                    placeholder="Provide diagnostic context, secondary complaints, and reason for specialist transfer..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 resize-none h-24"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs py-2.5 rounded-lg transition"
                >
                  Generate Summary & Route Handoff
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/60 p-3 rounded-lg border border-emerald-900">
                  <CheckCircle2 size={16} /> Handoff summary compiled successfully. Logged to blockchain audit trail.
                </div>

                <pre className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-[10px] text-slate-300 leading-normal overflow-x-auto whitespace-pre">
                  {referralReceipt}
                </pre>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(referralReceipt);
                      alert('Referral Handoff copied to clipboard.');
                    }}
                    className="bg-slate-900 border border-slate-800 text-slate-300 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition"
                  >
                    📋 Copy Handoff Text
                  </button>
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      setReferralReceipt(null);
                    }}
                    className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 px-4 py-2 rounded-lg text-xs font-bold transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: Emergency Department */}
      {activeModal === 'emergency' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-red-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-center">
            <div className="flex justify-center">
              <span className="p-4 bg-red-950/60 border border-red-800 rounded-full text-red-500 animate-bounce">
                🚨
              </span>
            </div>
            
            <h3 className="text-base font-extrabold text-red-400">
              ClinSight Emergency Action Protocol
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Immediate triage action triggered. Contact the emergency response line or dispatch the hospital code team.
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1">
              <p className="text-[10px] text-slate-500 font-bold uppercase font-mono">Ambulance Dispatch</p>
              <p className="text-lg font-extrabold text-red-400 font-mono">CALL 108 / DIRECT CODE BLUE</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1">
              <p className="text-[10px] text-slate-500 font-bold uppercase font-mono">ER Reception Desk</p>
              <p className="text-sm font-bold text-slate-300">+91-98765-43210</p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  addAuditLog('EMERGENCY_TRIGGER', 'Triggered direct Emergency Code blue protocol');
                  setActiveModal(null);
                }}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-2 rounded-lg transition"
              >
                Log Emergency Dispatch & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
