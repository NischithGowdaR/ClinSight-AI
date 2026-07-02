'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Phone, MapPin, Calendar, FileText, AlertCircle, Pill, MessageCircle, LogOut, Upload, ShieldAlert, Sparkles, Check, ChevronRight } from 'lucide-react';
import { getPatientById } from '@/lib/syntheticData';
import { useAuth } from '@/lib/useAuth';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isWidget?: boolean;
  widgetType?: 'dept-select' | 'date-select' | 'slot-select' | 'confirm-ticket' | 'emergency-card';
  widgetData?: any;
}

export default function PatientPortal() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [patientId, setPatientId] = useState('P001'); // Default to P001 Rajesh Kumar for ease of demo
  const [patientData, setPatientData] = useState<any>(getPatientById('P001'));
  const [activeTab, setActiveTab] = useState<'home' | 'health' | 'reminders' | 'nutrition' | 'receptionist' | 'meds' | 'ocr'>('home');

  // Appointments State
  const [appointments, setAppointments] = useState<Array<{
    id: string;
    dept: string;
    doctor: string;
    date: string;
    time: string;
  }>>([
    {
      id: 'APP-1029',
      dept: 'Endocrinology',
      doctor: 'Dr. Priya Sharma',
      date: '2026-07-15',
      time: '10:30 AM'
    }
  ]);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello! 👋 Welcome to ClinSight Patient Portal. I'm your AI Receptionist. Type 'hey' or select 'Book Appointment' below to schedule a consultation."
    }
  ]);

  // Booking Flow Steps in Chat
  const [bookingDept, setBookingDept] = useState('');
  const [bookingDate, setBookingDate] = useState('');

  // OCR Upload State
  const [selectedDoc, setSelectedDoc] = useState<'lipid' | 'prescription' | null>(null);
  const [parsingDoc, setParsingDoc] = useState(false);
  const [parseSteps, setParseSteps] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<{
    medications: Array<{ name: string; dose: string; frequency: string }>;
    labs: Array<{ name: string; value: number; unit: string; trend: 'stable' | 'worsening' | 'improving'; normalRange: string }>;
  } | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  // Nutrition State
  const [foodQuery, setFoodQuery] = useState('');
  const [analyzingNutrition, setAnalyzingNutrition] = useState(false);
  const [nutritionAnalysis, setNutritionAnalysis] = useState<{
    advice: string[];
    nutritionValues: Array<{ name: string; value: number; max: number; unit: string; color: string }>;
  } | null>(null);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const handleHealthSummaryLoad = () => {
    if (patientId.trim()) {
      const patient = getPatientById(patientId.toUpperCase());
      if (patient) {
        setPatientData(patient);
        setActiveTab('health');
      } else {
        alert('Patient not found. Try P001, P002, or P003');
      }
    }
  };

  // Chat Submission & Booking logic
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');

    setTimeout(() => {
      processChatResponse(userMsg);
    }, 600);
  };

  const processChatResponse = (text: string) => {
    const msg = text.toLowerCase();
    
    if (msg.includes('hey') || msg.includes('hello') || msg.includes('hi')) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: "Hi there! How can I assist you today?\n\n• Type 'book' to schedule an appointment\n• Type 'emergency' for critical lines\n• Type 'summary' to view health data."
      }]);
    } else if (msg.includes('book') || msg.includes('sched') || msg.includes('appoint')) {
      // Trigger Department Select Widget
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sure! Let's schedule an appointment. Please select a department:",
        isWidget: true,
        widgetType: 'dept-select'
      }]);
    } else if (msg.includes('emergency')) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: "CRITICAL ALERT: For life-threatening emergencies call 108 immediately.",
        isWidget: true,
        widgetType: 'emergency-card'
      }]);
    } else if (msg.includes('summary') || msg.includes('health')) {
      if (patientData) {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: `Here is your active health summary for patient ${patientData.name}:\n\n• Active conditions: ${patientData.conditions.map((c: any) => c.name).join(', ')}\n• Active Medications: ${patientData.medications.length} prescriptions\n• Triage level: ${patientData.labResults.some((l: any) => l.trend === 'worsening') ? 'HIGH RISK' : 'STABLE'}`
        }]);
      } else {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: "Please load your health summary by entering your Patient ID on the Home or Health tab first."
        }]);
      }
    } else {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `I'm your AI Receptionist helper. I can schedule appointments, direct you to emergency services, and detail hospital clinics.\n\nType 'book' or 'emergency' to see these widgets.`
      }]);
    }
  };

  const selectDepartment = (dept: string) => {
    setBookingDept(dept);
    setChatMessages(prev => [
      ...prev,
      { role: 'user', content: `Select: ${dept}` },
      {
        role: 'assistant',
        content: "Please select an appointment date:",
        isWidget: true,
        widgetType: 'date-select'
      }
    ]);
  };

  const selectDate = (dateStr: string) => {
    setBookingDate(dateStr);
    setChatMessages(prev => [
      ...prev,
      { role: 'user', content: `Date: ${dateStr}` },
      {
        role: 'assistant',
        content: "Select a preferred time slot:",
        isWidget: true,
        widgetType: 'slot-select'
      }
    ]);
  };

  const selectTimeSlot = (timeStr: string) => {
    const doctorMap: Record<string, string> = {
      'Cardiology': 'Dr. Vikram Reddy',
      'Endocrinology': 'Dr. Priya Sharma',
      'Nephrology': 'Dr. Deepak Kumar',
      'Pulmonology': 'Dr. Amit Patel',
      'General Medicine': 'Dr. Priya Sharma'
    };
    const docName = doctorMap[bookingDept] || 'Dr. Priya Sharma';
    const apptId = `APP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAppt = {
      id: apptId,
      dept: bookingDept,
      doctor: docName,
      date: bookingDate,
      time: timeStr
    };

    setAppointments(prev => [...prev, newAppt]);

    setChatMessages(prev => [
      ...prev,
      { role: 'user', content: `Time slot: ${timeStr}` },
      {
        role: 'assistant',
        content: "Excellent! Your appointment has been booked. Here is your digital receipt:",
        isWidget: true,
        widgetType: 'confirm-ticket',
        widgetData: newAppt
      }
    ]);
  };

  // OCR Parsing Action
  const triggerOcrParsing = () => {
    if (!selectedDoc) return;
    setParsingDoc(true);
    setParseSteps([]);
    setParsedData(null);
    setImportSuccess(false);

    const steps = [
      'Scanning document structure and bounding boxes...',
      'Running Tesseract OCR text extraction engine...',
      'Named Entity Recognition (NER) identifying laboratory biomarkers and drug entities...',
      'Mapping structured JSON variables via LLM parsing agent...'
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setParseSteps(prev => [...prev, step]);
      }, (index + 1) * 400);
    });

    setTimeout(() => {
      if (selectedDoc === 'lipid') {
        setParsedData({
          medications: [],
          labs: [
            {
              name: 'Cholesterol (Total)',
              value: 215,
              unit: 'mg/dL',
              trend: 'worsening',
              normalRange: '<200'
            },
            {
              name: 'LDL Cholesterol',
              value: 128,
              unit: 'mg/dL',
              trend: 'worsening',
              normalRange: '<100'
            }
          ]
        });
      } else {
        setParsedData({
          medications: [
            {
              name: 'Jardiance',
              dose: '10mg',
              frequency: 'Once daily in morning'
            }
          ],
          labs: []
        });
      }
      setParsingDoc(false);
    }, 2000);
  };

  // Merge OCR data into patient health record
  const handleImportOcrData = () => {
    if (!parsedData || !patientData) return;

    const updatedMeds = [...patientData.medications];
    parsedData.medications.forEach(newMed => {
      if (!updatedMeds.some(m => m.name.toLowerCase() === newMed.name.toLowerCase())) {
        updatedMeds.push({
          name: newMed.name,
          dose: newMed.dose,
          frequency: newMed.frequency,
          startDate: new Date().toISOString().split('T')[0],
          indications: ['Extracted via OCR document scan'],
          cautions: ['Validate clinical indications with pharmacy']
        });
      }
    });

    const updatedLabs = [...patientData.labResults];
    parsedData.labs.forEach(newLab => {
      updatedLabs.push({
        name: newLab.name,
        value: newLab.value,
        unit: newLab.unit,
        normalRange: newLab.normalRange,
        date: new Date().toISOString().split('T')[0],
        trend: newLab.trend
      });
    });

    setPatientData({
      ...patientData,
      medications: updatedMeds,
      labResults: updatedLabs
    });

    setImportSuccess(true);
    setTimeout(() => {
      setImportSuccess(false);
      setParsedData(null);
      setSelectedDoc(null);
      setActiveTab('health');
    }, 1500);
  };

  // Nutrition Analysis Action
  const handleNutritionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodQuery.trim() || !patientData) return;

    setAnalyzingNutrition(true);
    setNutritionAnalysis(null);

    setTimeout(() => {
      const text = foodQuery.toLowerCase();
      let advice: string[] = [];
      let values = [
        { name: 'Carbohydrates (Glycemic Load)', value: 40, max: 100, unit: 'g', color: 'bg-emerald-500' },
        { name: 'Sodium (Salt)', value: 400, max: 2000, unit: 'mg', color: 'bg-emerald-500' },
        { name: 'Potassium', value: 350, max: 3500, unit: 'mg', color: 'bg-emerald-500' },
        { name: 'Protein', value: 15, max: 60, unit: 'g', color: 'bg-cyan-500' }
      ];

      // Custom clinical alerts depending on conditions
      const hasDiabetes = patientData.conditions.some((c: any) => c.name.toLowerCase().includes('diab'));
      const hasHTN = patientData.conditions.some((c: any) => c.name.toLowerCase().includes('hyperten'));
      const hasCKD = patientData.conditions.some((c: any) => c.name.toLowerCase().includes('kidney') || c.name.toLowerCase().includes('ckd'));

      if (text.includes('pizza') || text.includes('burger') || text.includes('samosa') || text.includes('chip') || text.includes('fries')) {
        values = [
          { name: 'Carbohydrates (Glycemic Load)', value: 85, max: 100, unit: 'g', color: 'bg-red-500' },
          { name: 'Sodium (Salt)', value: 1650, max: 2000, unit: 'mg', color: 'bg-red-500' },
          { name: 'Potassium', value: 820, max: 3500, unit: 'mg', color: 'bg-orange-500' },
          { name: 'Protein', value: 12, max: 60, unit: 'g', color: 'bg-cyan-500' }
        ];

        advice.push("Saturated fat & carbohydrate content is extremely elevated.");
        if (hasHTN) {
          advice.push("WARNING: High Sodium content (1,650mg) will trigger blood pressure elevation. Limit salt intake.");
        }
        if (hasCKD) {
          advice.push("WARNING: High sodium puts metabolic stress on filtration rate. Elevated potassium in chips is dangerous in Stage 3 CKD.");
        }
        if (hasDiabetes) {
          advice.push("CRITICAL: Refined carbohydrates will cause instant blood sugar spike. Avoid this meal profile.");
        }
      } else if (text.includes('salad') || text.includes('oat') || text.includes('fruit') || text.includes('soup') || text.includes('vegetable')) {
        values = [
          { name: 'Carbohydrates (Glycemic Load)', value: 25, max: 100, unit: 'g', color: 'bg-emerald-500' },
          { name: 'Sodium (Salt)', value: 180, max: 2000, unit: 'mg', color: 'bg-emerald-500' },
          { name: 'Potassium', value: 480, max: 3500, unit: 'mg', color: 'bg-emerald-500' },
          { name: 'Protein', value: 10, max: 60, unit: 'g', color: 'bg-cyan-500' }
        ];

        advice.push("Excellent low glycemic index choice. Nutrient profile matches healthy standards.");
        if (hasHTN) {
          advice.push("Hypertension Control: Low-sodium content complies with strict DASH diet standards.");
        }
        if (hasCKD) {
          advice.push("Renal-friendly profile. Saturated fats and phosphorus are kept at safe therapeutic thresholds.");
        }
        if (hasDiabetes) {
          advice.push("Diabetes Control: Complex fibers allow steady glucose conversion, preventing glycemic spikes.");
        }
      } else {
        // Fallback
        values = [
          { name: 'Carbohydrates (Glycemic Load)', value: 55, max: 100, unit: 'g', color: 'bg-yellow-500' },
          { name: 'Sodium (Salt)', value: 750, max: 2000, unit: 'mg', color: 'bg-yellow-500' },
          { name: 'Potassium', value: 380, max: 3500, unit: 'mg', color: 'bg-emerald-500' },
          { name: 'Protein', value: 18, max: 60, unit: 'g', color: 'bg-cyan-500' }
        ];
        advice.push("Moderate macro-nutrient profile. Exercise standard calorie control.");
        if (hasDiabetes) advice.push("Diabetes: Monitor total carbohydrates to remain within daily allowances.");
        if (hasHTN) advice.push("Hypertension: Salt content is moderate; balance other meals today accordingly.");
      }

      setNutritionAnalysis({
        advice,
        nutritionValues: values
      });
      setAnalyzingNutrition(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="p-1 bg-emerald-600 rounded text-white"><Calendar size={16} /></span>
                ClinSight Patient Portal
              </h1>
              <p className="text-xs text-slate-500">Your Unified Medical Center Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {patientData && (
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-800">{patientData.name}</p>
                <p className="text-xs text-slate-500 font-mono">Patient ID: {patientData.id}</p>
              </div>
            )}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-700">{user?.name || 'Jane Doe'}</p>
                <p className="text-[10px] text-slate-400 font-mono">{user?.email || 'patient@clinsight.com'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Display Pane (Col span 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header Tabs Navigation */}
            <div className="flex bg-white rounded-lg p-1.5 border border-slate-200 overflow-x-auto shadow-sm gap-1">
              {[
                { id: 'home', label: '🏠 Dashboard' },
                { id: 'health', label: '📋 Health Summary' },
                { id: 'ocr', label: '📤 Upload Reports' },
                { id: 'nutrition', label: '🥗 Nutrition Agent' },
                { id: 'reminders', label: '🔔 Reminders' },
                { id: 'meds', label: '💊 Medication Tracker' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB: Home Hub Dashboard */}
            {activeTab === 'home' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-emerald-700 to-teal-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-12 -translate-y-12" />
                  <div className="relative space-y-2">
                    <h2 className="text-2xl font-bold">Good Day, {patientData?.name || 'Health Seeker'}</h2>
                    <p className="text-emerald-100 text-sm max-w-lg leading-relaxed">
                      Welcome to your clinical dashboard. Review health logs, upload laboratory documents, and speak to our AI receptionist 24/7.
                    </p>
                  </div>
                </div>

                {/* Primary Feature cards Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveTab('receptionist')}
                    className="p-5 text-left bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all space-y-2"
                  >
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg w-fit"><MessageCircle size={20} /></div>
                    <p className="font-bold text-slate-800 text-sm">Consult AI Receptionist</p>
                    <p className="text-xs text-slate-500">Book clinics, trigger codes, ask medical guidelines</p>
                  </button>

                  <button
                    onClick={() => setActiveTab('ocr')}
                    className="p-5 text-left bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all space-y-2"
                  >
                    <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-lg w-fit"><Upload size={20} /></div>
                    <p className="font-bold text-slate-800 text-sm">OCR Document Scan</p>
                    <p className="text-xs text-slate-500">Parse laboratory sheets and prescription notes automatically</p>
                  </button>

                  <button
                    onClick={() => setActiveTab('nutrition')}
                    className="p-5 text-left bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all space-y-2"
                  >
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg w-fit"><Sparkles size={20} /></div>
                    <p className="font-bold text-slate-800 text-sm">Diet &amp; Nutrition Analyser</p>
                    <p className="text-xs text-slate-500">Check foods against diabetes and renal condition profiles</p>
                  </button>

                  <button
                    onClick={() => setActiveTab('health')}
                    className="p-5 text-left bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all space-y-2"
                  >
                    <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg w-fit"><FileText size={20} /></div>
                    <p className="font-bold text-slate-800 text-sm">Clinical Health History</p>
                    <p className="text-xs text-slate-500">View diagnostic summaries, active ICD codes, and drug cautions</p>
                  </button>
                </div>

                {/* Upcoming Booked Consultations */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Upcoming Appointments
                  </h3>
                  {appointments.length === 0 ? (
                    <p className="text-xs text-slate-500">No scheduled visits. Ask AI Receptionist to book.</p>
                  ) : (
                    <div className="space-y-3">
                      {appointments.map((appt) => (
                        <div key={appt.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-3">
                            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                              📅
                            </span>
                            <div>
                              <p className="text-xs font-bold text-slate-800">
                                Department of {appt.dept}
                              </p>
                              <p className="text-[10px] text-slate-500 font-medium">
                                Lead Practitioner: {appt.doctor}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-slate-800">{appt.date}</p>
                            <p className="text-[10px] text-slate-500 font-mono font-semibold">{appt.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: Health Summary */}
            {activeTab === 'health' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-sm">
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-800">Active Patient Health Registry</h2>
                    <p className="text-xs text-slate-500">Diagnoses, prescriptions, and allergen registers</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value.toUpperCase())}
                      placeholder="e.g. P001"
                      className="border border-slate-300 rounded px-2.5 py-1 text-xs focus:outline-none text-slate-700 w-24 font-mono font-bold"
                    />
                    <button
                      onClick={handleHealthSummaryLoad}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded"
                    >
                      Sync
                    </button>
                  </div>
                </div>

                {patientData ? (
                  <div className="space-y-6">
                    {/* Patient Info Bar */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase font-mono">Patient Name</p>
                        <p className="text-xs font-bold text-slate-800">{patientData.name}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase font-mono">Age / Dob</p>
                        <p className="text-xs font-bold text-slate-800">{patientData.age}yo ({patientData.dateOfBirth})</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase font-mono">Medical Record Number</p>
                        <p className="text-xs font-bold text-slate-800 font-mono">{patientData.mrn}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase font-mono">Allergy Cautions</p>
                        <p className="text-xs font-bold text-red-600">
                          {patientData.allergies.length > 0 ? patientData.allergies.join(', ') : 'None Reported'}
                        </p>
                      </div>
                    </div>

                    {/* Active Diagnoses List */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-extrabold text-slate-700 uppercase font-mono tracking-wider">
                        Active ICD-10 Diagnoses
                      </h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {patientData.conditions.map((cond: any, idx: number) => (
                          <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                            <div>
                              <p className="text-xs font-bold text-slate-800">{cond.name}</p>
                              <p className="text-[9px] text-slate-400 font-semibold font-mono">Onset: {cond.onsetDate}</p>
                            </div>
                            <span className="text-[9px] font-bold bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded font-mono">
                              ICD: {cond.icd10}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Active Prescriptions list */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-extrabold text-slate-700 uppercase font-mono tracking-wider">
                        Active Prescriptions & Dosages
                      </h3>
                      <div className="space-y-2">
                        {patientData.medications.map((med: any, idx: number) => (
                          <div key={idx} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-extrabold text-slate-800">{med.name}</p>
                              <p className="text-[10px] text-slate-500 font-semibold">Dosage: {med.dose} • Frequency: {med.frequency}</p>
                            </div>
                            <div className="flex gap-2">
                              <a
                                href={`https://www.1mg.com/search/all?name=${med.name}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded transition"
                              >
                                Order Pharmacy Refill →
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Labs Results List */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-extrabold text-slate-700 uppercase font-mono tracking-wider">
                        Synchronized Laboratory Registers
                      </h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {patientData.labResults.slice(-4).map((lab: any, idx: number) => (
                          <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                            <div>
                              <p className="text-xs font-bold text-slate-800">{lab.name}</p>
                              <p className="text-[9px] text-slate-400 font-semibold">Normal: {lab.normalRange} | Date: {lab.date}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-extrabold text-slate-800">{lab.value} {lab.unit}</span>
                              <p className="text-[8px] text-slate-400 uppercase font-bold font-mono font-semibold">Trend: {lab.trend}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-6 text-center">Please search/sync a Patient ID above.</p>
                )}
              </div>
            )}

            {/* TAB: OCR Document Scanner */}
            {activeTab === 'ocr' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-sm">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800">Medical Document OCR Scan</h2>
                  <p className="text-xs text-slate-500">Scan reports & prescriptions to update health logs automatically</p>
                </div>

                {/* Upload Panels */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 bg-slate-50/50">
                    <Upload size={32} className="text-slate-400" />
                    <p className="text-xs font-bold text-slate-700">Drag &amp; drop files here</p>
                    <p className="text-[10px] text-slate-400">PDF, PNG, JPG, up to 10MB</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                      Select Demo Laboratory Sheets
                    </h3>
                    
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setSelectedDoc('lipid');
                          setParsedData(null);
                        }}
                        className={`w-full text-left p-3 border rounded-lg text-xs font-bold transition flex items-center justify-between ${
                          selectedDoc === 'lipid'
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span>📄 Thyrocare Lipid Profile Lab Report</span>
                        <ChevronRight size={14} />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedDoc('prescription');
                          setParsedData(null);
                        }}
                        className={`w-full text-left p-3 border rounded-lg text-xs font-bold transition flex items-center justify-between ${
                          selectedDoc === 'prescription'
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span>📄 Fortis Clinic Prescription Note</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>

                    <button
                      onClick={triggerOcrParsing}
                      disabled={!selectedDoc || parsingDoc}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {parsingDoc ? 'Running AI Parser...' : 'Upload & Scan Document'}
                    </button>
                  </div>
                </div>

                {/* Parsing steps logs */}
                {parsingDoc && (
                  <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-[10px] space-y-1.5 shadow-inner">
                    <p className="text-cyan-400 font-bold uppercase tracking-widest text-[9px] mb-2 animate-pulse flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                      </span>
                      OCR OCR_AGENT INTERFERENCE RUNNING
                    </p>
                    {parseSteps.map((step, idx) => (
                      <p key={idx} className="text-slate-300 animate-fadeIn font-semibold">
                        ✓ {step}
                      </p>
                    ))}
                  </div>
                )}

                {/* Scanned result outputs */}
                {parsedData && (
                  <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4 animate-fadeIn">
                    <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-slate-800 uppercase font-mono">
                          OCR Extracted JSON Schema
                        </h3>
                        <p className="text-[10px] text-slate-500">Structured telemetry generated via parsing agents</p>
                      </div>
                      <span className="text-[9px] bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded">
                        Confidence 99.4%
                      </span>
                    </div>

                    <div className="space-y-3">
                      {parsedData.labs.length > 0 && (
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase font-mono mb-2">Detected Lab Biomarkers</p>
                          <div className="space-y-2">
                            {parsedData.labs.map((lab, i) => (
                              <div key={i} className="bg-white border border-slate-200 p-2.5 rounded-lg text-xs flex justify-between font-semibold">
                                <span className="text-slate-700">{lab.name}</span>
                                <span className="text-slate-900">{lab.value} {lab.unit} (Normal Range: {lab.normalRange})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {parsedData.medications.length > 0 && (
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase font-mono mb-2">Detected Medication Regimens</p>
                          <div className="space-y-2">
                            {parsedData.medications.map((med, i) => (
                              <div key={i} className="bg-white border border-slate-200 p-2.5 rounded-lg text-xs flex justify-between font-semibold">
                                <span className="text-slate-700">{med.name}</span>
                                <span className="text-slate-900">{med.dose} • {med.frequency}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        onClick={handleImportOcrData}
                        disabled={importSuccess}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-4 rounded-lg transition shadow-md flex items-center gap-1.5"
                      >
                        {importSuccess ? (
                          <>
                            <Check size={14} /> Imported!
                          </>
                        ) : (
                          'Merge & Import to Health Registry'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Nutrition Analyser */}
            {activeTab === 'nutrition' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-sm">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800">Diet &amp; Nutrition Intelligence Agent</h2>
                  <p className="text-xs text-slate-500">Describe your food to evaluate glycemic, sodium, and potassium risks</p>
                </div>

                <form onSubmit={handleNutritionSubmit} className="space-y-3">
                  <textarea
                    value={foodQuery}
                    onChange={(e) => setFoodQuery(e.target.value)}
                    placeholder="Describe your meal (e.g. 'I had two slices of sausage pizza, french fries, and a can of cola')"
                    className="w-full border border-slate-300 rounded-lg p-3 text-xs focus:outline-none focus:border-emerald-500 resize-none h-20 text-slate-800 placeholder:text-slate-400 font-medium"
                  />
                  <div className="flex gap-2 text-[10px] text-slate-400">
                    <span className="font-bold">Try presets:</span>
                    <button
                      type="button"
                      onClick={() => setFoodQuery("Salty cheese pizza, French fries, and soda cola")}
                      className="underline text-slate-500 hover:text-slate-800 font-semibold"
                    >
                      "High-Sodium Fast Food"
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setFoodQuery("Oatmeal porridge with fresh honey and berries")}
                      className="underline text-slate-500 hover:text-slate-800 font-semibold"
                    >
                      "Low-glycemic breakfast"
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={analyzingNutrition || !foodQuery.trim()}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {analyzingNutrition ? 'Calculating nutritional matrices...' : 'Run Nutrition Analysis'}
                  </button>
                </form>

                {/* Nutrition Output Panel */}
                {nutritionAnalysis && (
                  <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-5 animate-fadeIn">
                    <h3 className="text-xs font-bold text-slate-800 uppercase font-mono border-b border-slate-200 pb-2">
                      Clinical Dietary Analysis Summary
                    </h3>

                    {/* Progress bars representing values */}
                    <div className="space-y-3.5">
                      {nutritionAnalysis.nutritionValues.map((nv, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span>{nv.name}</span>
                            <span className="font-mono text-slate-900">{nv.value} / {nv.max} {nv.unit}</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${nv.color}`}
                              style={{ width: `${Math.min(100, (nv.value / nv.max) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Alerts and advice warnings */}
                    <div className="space-y-2 pt-2">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        Clinical Warnings &amp; Guidance
                      </p>
                      <div className="space-y-2">
                        {nutritionAnalysis.advice.map((adv, idx) => {
                          const isWarning = adv.includes('WARNING') || adv.includes('CRITICAL');
                          return (
                            <div
                              key={idx}
                              className={`p-3 rounded-lg border text-xs leading-relaxed font-semibold flex items-start gap-2 ${
                                isWarning
                                  ? 'bg-red-50 border-red-200 text-red-800'
                                  : 'bg-emerald-50 border-emerald-100 text-emerald-800'
                              }`}
                            >
                              {isWarning ? <ShieldAlert size={16} className="text-red-600 mt-0.5 flex-shrink-0" /> : <Check size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />}
                              <span>{adv}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Test Reminders */}
            {activeTab === 'reminders' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-sm">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800">Preventative Screening Reminders</h2>
                  <p className="text-xs text-slate-500">Overdue lab screenings and direct booking facilities</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-orange-200 text-orange-950 font-bold px-2 py-0.5 rounded">OVERDUE</span>
                        <p className="font-bold text-slate-800 text-sm">HbA1c Blood Test</p>
                      </div>
                      <p className="text-xs text-slate-500">Due: January 20, 2025 (worsening trends demand glycemic review)</p>
                    </div>
                    <a
                      href="https://www.1mg.com/diagnostics"
                      target="_blank"
                      rel="noreferrer"
                      className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs py-2 px-4 rounded-lg text-center transition"
                    >
                      Book Home Sample (1mg) →
                    </a>
                  </div>

                  <div className="p-4 bg-yellow-50 border-2 border-yellow-100 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-yellow-200 text-yellow-900 font-bold px-2 py-0.5 rounded">DUE SOON</span>
                        <p className="font-bold text-slate-800 text-sm">Lipid Profile Screening</p>
                      </div>
                      <p className="text-xs text-slate-500">Due: February 5, 2025 (Required for cardiovascular medication monitoring)</p>
                    </div>
                    <a
                      href="https://www.thyrocare.com"
                      target="_blank"
                      rel="noreferrer"
                      className="bg-yellow-600 hover:bg-yellow-500 text-slate-900 font-bold text-xs py-2 px-4 rounded-lg text-center transition"
                    >
                      Book Clinic Visit (Thyrocare) →
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Medication Tracker */}
            {activeTab === 'meds' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-sm">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800">Prescription Medication Tracker</h2>
                  <p className="text-xs text-slate-500">View current schedules, timings, and refills</p>
                </div>

                <div className="space-y-3">
                  {patientData?.medications.map((med: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-extrabold text-slate-800 text-sm">{med.name}</p>
                        <p className="text-xs text-slate-600 font-semibold">Dosage: {med.dose} • Timing: {med.frequency}</p>
                        {med.cautions && (
                          <p className="text-[10px] text-orange-600 font-bold font-mono">⚠️ Warning: {med.cautions.join(', ')}</p>
                        )}
                      </div>
                      <a
                        href={`https://www.1mg.com/search/all?name=${med.name}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs py-2 px-4 rounded-lg text-center transition"
                      >
                        Purchase Refills →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* AI Receptionist Conversational Sidebar (Col span 1) */}
          <div className="bg-white border border-slate-200 rounded-2xl flex flex-col h-[650px] shadow-lg overflow-hidden sticky top-24">
            
            {/* Sidebar header */}
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-4 text-white">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <MessageCircle size={18} className="text-emerald-300 animate-pulse" />
                AI Receptionist Chatbot
              </h3>
              <p className="text-[10px] text-emerald-100">Appointment Bookings &amp; Triage routing</p>
            </div>

            {/* Chat Messages display area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1`}>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed font-medium max-w-[85%] ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-none shadow-sm shadow-emerald-700/20'
                        : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* RENDER INLINE WIDGETS */}
                    {msg.isWidget && msg.widgetType === 'dept-select' && (
                      <div className="mt-3 grid gap-2 pt-2 border-t border-slate-200">
                        {['Cardiology', 'Endocrinology', 'Nephrology', 'Pulmonology', 'General Medicine'].map((dept) => (
                          <button
                            key={dept}
                            onClick={() => selectDepartment(dept)}
                            className="w-full text-left bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
                          >
                            Department of {dept}
                          </button>
                        ))}
                      </div>
                    )}

                    {msg.isWidget && msg.widgetType === 'date-select' && (
                      <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                        {['2026-07-06', '2026-07-07', '2026-07-08', '2026-07-09'].map((date) => (
                          <button
                            key={date}
                            onClick={() => selectDate(date)}
                            className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 px-2 py-1 rounded text-center text-[10px] font-bold transition shadow-sm font-mono"
                          >
                            {date}
                          </button>
                        ))}
                      </div>
                    )}

                    {msg.isWidget && msg.widgetType === 'slot-select' && (
                      <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                        {['09:30 AM', '11:00 AM', '02:30 PM', '04:15 PM'].map((slot) => (
                          <button
                            key={slot}
                            onClick={() => selectTimeSlot(slot)}
                            className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 px-2 py-1 rounded text-center text-[10px] font-bold transition shadow-sm font-mono"
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}

                    {msg.isWidget && msg.widgetType === 'confirm-ticket' && msg.widgetData && (
                      <div className="mt-3 bg-emerald-950 text-emerald-300 border border-emerald-800 p-3 rounded-lg text-[10px] font-mono leading-normal shadow-inner space-y-1">
                        <p className="font-bold text-center border-b border-emerald-900 pb-1 mb-1 tracking-wider">APPOINTMENT CONFIRMED</p>
                        <p>ID: {msg.widgetData.id}</p>
                        <p>Clinic: {msg.widgetData.dept}</p>
                        <p>Doctor: {msg.widgetData.doctor}</p>
                        <p>Date: {msg.widgetData.date}</p>
                        <p>Time: {msg.widgetData.time}</p>
                      </div>
                    )}

                    {msg.isWidget && msg.widgetType === 'emergency-card' && (
                      <div className="mt-3 bg-red-950 text-red-200 border border-red-900 p-3 rounded-lg text-[10px] font-semibold space-y-2">
                        <p className="font-extrabold text-center border-b border-red-900 pb-1 tracking-wider text-xs">EMERGENCY ACTIVE PROTOCOL</p>
                        <p>1. Call ambulance dispatch: 108</p>
                        <p>2. Direct Line ER Reception: +91-98765-43210</p>
                        <a
                          href="tel:108"
                          className="block text-center bg-red-600 hover:bg-red-500 text-white font-bold py-1.5 rounded text-[10px] transition"
                        >
                          ☎ Dial Ambulance (108)
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Conversational input form */}
            <div className="border-t border-slate-200 p-3">
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type scheduling requests or emergency..."
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg transition disabled:opacity-50"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>

            {/* Quick Helper buttons */}
            <div className="bg-slate-50 border-t border-slate-200 p-3 grid grid-cols-3 gap-1 text-[10px] font-bold text-slate-600">
              <button
                onClick={() => selectDepartment('General Medicine')}
                className="bg-white border border-slate-300 hover:border-emerald-500 p-1 text-center rounded shadow-sm transition"
              >
                📅 Book Clinic
              </button>
              <button
                onClick={() => processChatResponse('emergency')}
                className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 p-1 text-center rounded shadow-sm transition"
              >
                🚨 Emergency
              </button>
              <button
                onClick={() => processChatResponse('summary')}
                className="bg-white border border-slate-300 hover:border-emerald-500 p-1 text-center rounded shadow-sm transition"
              >
                📊 Summary
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
