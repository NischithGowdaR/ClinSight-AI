'use client';

import { PatientRecord } from '@/lib/syntheticData';
import { checkDrugInteractions, getSeverityColor } from '@/lib/drugInteractions';
import { AlertCircle, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { useState } from 'react';

interface PreConsultationBriefProps {
  patient: PatientRecord;
}

export default function PreConsultationBrief({ patient }: PreConsultationBriefProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'labs' | 'interactions' | 'visits' | 'triage'>('overview');

  const interactions = checkDrugInteractions(patient.medications.map(m => m.name));
  const criticalInteractions = interactions.filter(i => i.severity === 'critical' || i.severity === 'high');

  // Determine triage level
  const getClinicalFlags = () => {
    const flags = [];
    
    if (interactions.some(i => i.severity === 'critical')) {
      flags.push({ severity: 'critical', message: 'Critical drug interaction detected' });
    }
    
    const hba1c = patient.labResults.find(l => l.name === 'HbA1c');
    if (hba1c && hba1c.value > 8) {
      flags.push({ severity: 'high', message: 'Worsening glycemic control (HbA1c > 8%)' });
    }

    const creatinine = patient.labResults.find(l => l.name === 'Creatinine');
    if (creatinine && creatinine.value > 1.5) {
      flags.push({ severity: 'high', message: 'Rising creatinine - kidney function declining' });
    }

    const bnp = patient.labResults.find(l => l.name === 'BNP');
    if (bnp && bnp.value > 400) {
      flags.push({ severity: 'high', message: 'Elevated BNP - heart failure decompensation risk' });
    }

    return flags;
  };

  const getTriage = () => {
    const flags = getClinicalFlags();
    if (flags.some(f => f.severity === 'critical')) return { level: 'CRITICAL', color: 'bg-red-900 text-white' };
    if (flags.some(f => f.severity === 'high')) return { level: 'HIGH', color: 'bg-orange-600 text-white' };
    return { level: 'ROUTINE', color: 'bg-green-600 text-white' };
  };

  const triage = getTriage();
  const flags = getClinicalFlags();

  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
      {/* Header with flags */}
      <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold">{patient.name}</h2>
            <p className="text-cyan-100">Age: {patient.age} | MRN: {patient.mrn}</p>
          </div>
          <div className={`${triage.color} px-4 py-2 rounded-lg font-bold text-lg`}>
            {triage.level}
          </div>
        </div>

        {/* Key alerts */}
        {flags.length > 0 && (
          <div className="space-y-2 mt-4 pt-4 border-t border-cyan-500">
            {flags.map((flag, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <AlertCircle size={18} />
                <span>{flag.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex overflow-x-auto">
        {(['overview', 'labs', 'interactions', 'visits', 'triage'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-semibold text-sm whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'text-cyan-600 border-b-2 border-cyan-600 bg-slate-50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Allergies */}
            {patient.allergies.length > 0 && (
              <div>
                <h3 className="font-bold text-slate-900 mb-2">⚠️ Allergies</h3>
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.map((allergy, idx) => (
                    <span key={idx} className="px-3 py-1 bg-red-100 text-red-900 rounded-full text-sm font-semibold">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Active Conditions */}
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Active Conditions</h3>
              <div className="space-y-2">
                {patient.conditions.map((cond, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 bg-slate-50 rounded">
                    <span className="text-cyan-600 font-bold">•</span>
                    <div>
                      <p className="font-semibold text-slate-900">{cond.name}</p>
                      <p className="text-xs text-slate-500">{cond.icd10} • Since {cond.onsetDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Medications */}
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Current Medications ({patient.medications.length})</h3>
              <div className="space-y-2">
                {patient.medications.map((med, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{med.name}</p>
                        <p className="text-sm text-slate-600">{med.dose} • {med.frequency}</p>
                        {med.cautions && med.cautions.length > 0 && (
                          <p className="text-xs text-orange-600 mt-1">⚠️ {med.cautions.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'labs' && (() => {
          // Group labs by name
          const groupedLabs: Record<string, typeof patient.labResults> = {};
          patient.labResults.forEach(r => {
            if (!groupedLabs[r.name]) {
              groupedLabs[r.name] = [];
            }
            groupedLabs[r.name].push(r);
          });

          // Helper to check abnormality
          const checkIsAbnormal = (val: number, rangeStr: string): boolean => {
            if (rangeStr.startsWith('<')) {
              const limit = parseFloat(rangeStr.replace('<', '').trim());
              return val >= limit;
            }
            if (rangeStr.startsWith('>')) {
              const limit = parseFloat(rangeStr.replace('>', '').trim());
              return val <= limit;
            }
            const parts = rangeStr.split('-');
            if (parts.length === 2) {
              const minLimit = parseFloat(parts[0]);
              const maxLimit = parseFloat(parts[1]);
              return val < minLimit || val > maxLimit;
            }
            return false;
          };

          return (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(groupedLabs).map(([labName, history], idx) => {
                  // Sort history chronologically: oldest to newest
                  const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                  const latest = sortedHistory[sortedHistory.length - 1];
                  const isAbnormal = checkIsAbnormal(latest.value, latest.normalRange);

                  // Setup values for SVG
                  const values = sortedHistory.map(h => h.value);
                  const minVal = Math.min(...values);
                  const maxVal = Math.max(...values);
                  const valRange = maxVal - minVal === 0 ? 1 : maxVal - minVal;
                  
                  // Add 25% padding on top and bottom of value range
                  const padMin = minVal - valRange * 0.25;
                  const padMax = maxVal + valRange * 0.25;
                  const scaleRange = padMax - padMin;

                  const width = 300;
                  const height = 120;
                  const padLeft = 40;
                  const padRight = 40;
                  const padTop = 30;
                  const padBottom = 30;

                  const getX = (index: number) => {
                    if (sortedHistory.length <= 1) return width / 2;
                    return padLeft + (index / (sortedHistory.length - 1)) * (width - padLeft - padRight);
                  };

                  const getY = (val: number) => {
                    const ratio = (val - padMin) / scaleRange;
                    return height - padBottom - ratio * (height - padTop - padBottom);
                  };

                  // Parse normal range to draw green shading
                  let shadingY1 = 0;
                  let shadingHeight = 0;
                  const rangeStr = latest.normalRange;
                  if (rangeStr.startsWith('<')) {
                    const limit = parseFloat(rangeStr.replace('<', '').trim());
                    const limitY = getY(limit);
                    shadingY1 = limitY;
                    shadingHeight = height - padBottom - limitY;
                  } else if (rangeStr.startsWith('>')) {
                    const limit = parseFloat(rangeStr.replace('>', '').trim());
                    const limitY = getY(limit);
                    shadingY1 = padTop;
                    shadingHeight = limitY - padTop;
                  } else {
                    const parts = rangeStr.split('-');
                    if (parts.length === 2) {
                      const low = parseFloat(parts[0]);
                      const high = parseFloat(parts[1]);
                      const lowY = getY(low);
                      const highY = getY(high);
                      shadingY1 = Math.min(lowY, highY);
                      shadingHeight = Math.abs(lowY - highY);
                    }
                  }

                  // Path calculation
                  let pathD = '';
                  if (sortedHistory.length > 1) {
                    const points = sortedHistory.map((h, i) => `${getX(i)},${getY(h.value)}`);
                    pathD = `M ${points.join(' L ')}`;
                  }

                  // Color scheme
                  const strokeColor = latest.trend === 'worsening'
                    ? 'stroke-red-500'
                    : latest.trend === 'improving'
                      ? 'stroke-emerald-500'
                      : 'stroke-cyan-500';

                  const dotBgColor = latest.trend === 'worsening'
                    ? 'fill-red-500'
                    : latest.trend === 'improving'
                      ? 'fill-emerald-500'
                      : 'fill-cyan-500';

                  return (
                    <div key={idx} className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${isAbnormal ? 'bg-red-50/50 border-red-200' : 'bg-green-50/30 border-green-100'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{labName}</p>
                          <p className="text-[10px] text-slate-500">Normal Range: {latest.normalRange}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <span className={`text-base font-extrabold ${isAbnormal ? 'text-red-700' : 'text-emerald-700'}`}>
                              {latest.value}
                            </span>
                            <span className="text-[10px] text-slate-600 font-semibold">{latest.unit}</span>
                            {latest.trend === 'worsening' && <TrendingDown className="text-red-600" size={14} />}
                            {latest.trend === 'improving' && <TrendingUp className="text-emerald-600" size={14} />}
                            {latest.trend === 'stable' && <Minus className="text-blue-500" size={14} />}
                          </div>
                          <p className="text-[9px] text-slate-400 font-medium">As of {latest.date}</p>
                        </div>
                      </div>

                      {/* SVG Trend Chart */}
                      <div className="bg-white rounded-lg border border-slate-100 p-2 flex justify-center items-center shadow-inner relative overflow-hidden">
                        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                          {/* Normal Range Shading */}
                          {shadingHeight > 0 && (
                            <rect
                              x={padLeft - 5}
                              y={shadingY1}
                              width={width - padLeft - padRight + 10}
                              height={shadingHeight}
                              fill="rgba(16, 185, 129, 0.08)"
                              rx="4"
                            />
                          )}

                          {/* Zero or Reference Line */}
                          <line
                            x1={padLeft}
                            y1={height - padBottom}
                            x2={width - padRight}
                            y2={height - padBottom}
                            stroke="#e2e8f0"
                            strokeWidth="1.5"
                            strokeDasharray="2 2"
                          />

                          {/* Historical Line */}
                          {pathD && (
                            <path
                              d={pathD}
                              fill="none"
                              className={`${strokeColor} transition-all duration-500`}
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          )}

                          {/* Data points */}
                          {sortedHistory.map((point, pIdx) => {
                            const x = getX(pIdx);
                            const y = getY(point.value);

                            return (
                              <g key={pIdx} className="group/point">
                                <circle
                                  cx={x}
                                  cy={y}
                                  r="3.5"
                                  className={`${dotBgColor} stroke-white stroke-2 transition-all duration-200 group-hover/point:r-5 cursor-pointer`}
                                />
                                {/* Value Label */}
                                <text
                                  x={x}
                                  y={y - 8}
                                  textAnchor="middle"
                                  className="text-[8px] font-extrabold fill-slate-700 pointer-events-none opacity-90"
                                >
                                  {point.value}
                                </text>
                                {/* Date Label */}
                                <text
                                  x={x}
                                  y={height - 8}
                                  textAnchor="middle"
                                  className="text-[8px] font-medium fill-slate-400 pointer-events-none"
                                >
                                  {point.date.slice(5)}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {activeTab === 'interactions' && (
          <div className="space-y-4">
            {interactions.length === 0 ? (
              <p className="text-slate-600">No drug interactions detected.</p>
            ) : (
              interactions.map((interaction, idx) => (
                <div key={idx} className={`p-4 rounded-lg border-2 border-opacity-50 ${getSeverityColor(interaction.severity)}`}>
                  <p className="font-bold mb-2">{interaction.drug1} + {interaction.drug2}</p>
                  <p className="text-sm mb-2">{interaction.description}</p>
                  <p className="text-xs font-semibold">💡 {interaction.recommendation}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'visits' && (
          <div className="space-y-4">
            {patient.recentVisits.map((visit, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-bold text-slate-900">{visit.chief_complaint}</p>
                  <span className="text-xs text-slate-500">{visit.date}</span>
                </div>
                <p className="text-sm text-slate-700 mb-2">{visit.summary}</p>
                <p className="text-xs text-slate-500">Provider: {visit.provider}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'triage' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${triage.color.replace('text-white', 'text-white bg-opacity-20')} border-2 border-current`}>
              <p className="font-bold text-lg">Triage Level: {triage.level}</p>
            </div>

            {flags.length > 0 ? (
              <>
                <h4 className="font-bold text-slate-900">Clinical Flags:</h4>
                <div className="space-y-2">
                  {flags.map((flag, idx) => (
                    <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded">
                      <p className="font-semibold text-red-900">{flag.message}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-slate-600">No major clinical flags detected.</p>
            )}

            {/* Routing suggestion */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-bold text-slate-900 mb-2">Suggested Routing:</p>
              <div className="space-y-1 text-sm">
                {patient.conditions.length > 0 && (
                  <p className="text-slate-700">
                    Primary: {patient.conditions[0].name.split('(')[0].trim()}
                  </p>
                )}
                {criticalInteractions.length > 0 && (
                  <p className="text-slate-700 text-red-700 font-semibold">⚠️ Pharmacy Review: Critical interactions</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
