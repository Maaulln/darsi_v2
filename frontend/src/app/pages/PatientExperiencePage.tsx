import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { Users, Clock, Activity, Star, TrendingDown, TrendingUp, ArrowRight } from 'lucide-react';
import { apiService } from '../services/api';

const NAVY = '#1E3A5F';
const CYAN = '#0EA5E9';

// ── Components ─────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    kritis: { bg: '#FEE2E2', color: '#DC2626', label: 'Kritis' },
    tinggi: { bg: '#FEF3C7', color: '#D97706', label: 'Tinggi' },
    normal: { bg: '#DBEAFE', color: '#2563EB', label: 'Normal' },
    baik: { bg: '#DCFCE7', color: '#16A34A', label: 'Baik' },
  };
  const s = map[status] || map.normal;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
      {s.label}
    </span>
  );
}

function ALOSTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-xl border border-slate-100 px-3.5 py-3 text-xs">
      <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: p.fill || p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-medium text-slate-700">{p.value} hari</span>
        </div>
      ))}
    </div>
  );
}

export function PatientExperiencePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await apiService.getPatientExperience();
        setData(res);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="p-6 flex items-center justify-center min-h-screen text-slate-500">Memuat analisis pasien...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  const kpis = [
    { label: 'Total Kunjungan', value: data.kpis.total_kunjungan, sub: 'basis data', icon: Users, iconColor: CYAN, bg: 'rgba(14,165,233,0.1)', trend: +8.2 },
    { label: 'Tingkat Readmisi', value: data.kpis.readmission_label, sub: 'target: ≤ 5%', icon: Activity, iconColor: data.kpis.readmission_rate <= 5 ? '#10B981' : '#EF4444', bg: data.kpis.readmission_rate <= 5 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)', trend: -0.6 },
    { label: 'Rata-rata Kepuasan', value: '4.2/5.0', sub: 'skor statis', icon: Star, iconColor: '#F59E0B', bg: 'rgba(245,158,11,0.1)', trend: +0.3 },
    { label: 'ALOS Keseluruhan', value: data.kpis.alos_label, sub: 'target: ≤ 4 hari', icon: Clock, iconColor: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', trend: -0.2 },
  ];

  const overallSatisfaction = (data.satisfaction.reduce((s: any, d: any) => s + d.score, 0) / data.satisfaction.length).toFixed(1);

  return (
    <div className="p-6" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-slate-800 font-bold" style={{ fontSize: '1.35rem' }}>Pengalaman Pasien</h1>
          <p className="text-sm text-slate-500 mt-0.5">Alur pasien, lama rawat, dan kepuasan — Real-time</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {kpis.map((k, i) => (
          <div key={i} className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: k.bg }}>
              <k.icon size={18} style={{ color: k.iconColor }} />
            </div>
            <div>
              <p className="text-xs text-slate-500">{k.label}</p>
              <p className="font-bold text-slate-800">{k.value}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {k.trend < 0
                  ? <TrendingDown size={10} className="text-emerald-500" />
                  : <TrendingUp size={10} className="text-emerald-500" />
                }
                <span className="text-xs font-medium text-emerald-600">
                  {k.trend > 0 ? '+' : ''}{k.trend}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5 mb-5">
        {/* ── Patient Flow Funnel ── */}
        <div className="col-span-1 bg-white rounded-2xl px-5 pt-5 pb-5"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Status Rawat Inap</h2>
            <p className="text-xs text-slate-400">Distribusi pasien berdasarkan status</p>
          </div>

          <div className="space-y-2">
            {data.funnel.map((f: any, i: number) => {
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600 font-medium truncate flex-1 mr-2">{f.stage}</span>
                    <span className="text-xs font-bold text-slate-700 flex-shrink-0">{f.count.toLocaleString()}</span>
                  </div>
                  <div className="relative h-7 rounded-lg overflow-hidden bg-slate-50">
                    <div
                      className="absolute left-0 top-0 h-full rounded-lg flex items-center px-2.5 transition-all"
                      style={{ width: `${f.pct}%`, backgroundColor: f.color, minWidth: '40px' }}
                    >
                      <span className="text-white text-xs font-semibold whitespace-nowrap">{f.pct}%</span>
                    </div>
                  </div>
                  {i < data.funnel.length - 1 && (
                    <div className="flex justify-start pl-3 my-0.5">
                      <ArrowRight size={10} className="text-slate-300 rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Readmission Rates ── */}
        <div className="col-span-1 bg-white rounded-2xl px-5 pt-5 pb-5 flex flex-col"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Tingkat Readmisi per Diagnosa</h2>
            <p className="text-xs text-slate-400">Pasien muncul &gt; 1x dalam rekam medis</p>
          </div>

          <div
            className="flex items-center gap-4 p-3.5 rounded-xl mb-4"
            style={{
              background: data.kpis.readmission_rate <= 5
                ? 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.04))'
                : 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.04))',
              border: `1px solid ${data.kpis.readmission_rate <= 5 ? '#DCFCE7' : '#FEE2E2'}`
            }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                border: `3px solid ${data.kpis.readmission_rate <= 5 ? '#10B981' : '#EF4444'}`,
                backgroundColor: data.kpis.readmission_rate <= 5 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'
              }}
            >
              <span className="font-bold text-sm" style={{ color: data.kpis.readmission_rate <= 5 ? '#10B981' : '#EF4444' }}>
                {data.kpis.readmission_rate}%
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Readmisi Keseluruhan</p>
              <p className="text-xs text-slate-500 mt-0.5">Target: ≤ 5.0%</p>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            {data.readmission_by_poli.map((d: any, i: number) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 truncate max-w-[120px]">{d.poli}</span>
                    <StatusBadge status={d.status} />
                  </div>
                  <span className="text-xs font-bold text-slate-700">{d.rate}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 relative">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${(d.rate / 10) * 100}%`,
                      backgroundColor: d.status === 'kritis' ? '#EF4444' : d.status === 'tinggi' ? '#F59E0B' : '#10B981',
                    }}
                  />
                  <div className="absolute top-0 h-2 w-0.5 bg-slate-400" style={{ left: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Satisfaction ── */}
        <div className="col-span-1 bg-white rounded-2xl px-5 pt-5 pb-5 flex flex-col"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Kepuasan Pasien</h2>
            <p className="text-xs text-slate-400">Skor rata-rata per kategori (skala 1–5)</p>
          </div>

          {/* Overall score */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${NAVY}, #2D5A8E)` }}
            >
              <Star size={14} fill="white" stroke="white" />
              <span className="text-white font-bold mt-0.5">{overallSatisfaction}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Skor Keseluruhan</p>
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={12}
                    fill={s <= Math.round(parseFloat(overallSatisfaction)) ? '#F59E0B' : '#E2E8F0'}
                    stroke={s <= Math.round(parseFloat(overallSatisfaction)) ? '#F59E0B' : '#E2E8F0'}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            {data.satisfaction.map((d: any, i: number) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-600">{d.category}</span>
                  <span className="text-xs font-bold" style={{ color: d.score >= 4.3 ? '#10B981' : d.score >= 4.0 ? '#F59E0B' : '#EF4444' }}>
                    {d.score}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${(d.score / 5) * 100}%`,
                      backgroundColor: d.score >= 4.3 ? '#10B981' : d.score >= 4.0 ? '#F59E0B' : '#EF4444',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ALOS per Poli Chart */}
      <div className="bg-white rounded-2xl px-5 pt-5 pb-3"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-700">Average Length of Stay (ALOS) per Diagnosa</h2>
            <p className="text-xs text-slate-400">Lama rawat aktual vs target (dalam hari)</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.alos_per_poli} margin={{ top: 2, right: 4, left: -20, bottom: 0 }} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="poli" tick={{ fontSize: 9.5, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} unit=" hr" />
            <Tooltip content={<ALOSTooltip />} />
            <Bar dataKey="alos" name="ALOS Aktual" radius={[4, 4, 0, 0]}>
              {data.alos_per_poli.map((entry: any, i: number) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
            <Bar dataKey="target" name="Target" fill="rgba(148,163,184,0.35)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ALOS Table */}
      <div className="bg-white rounded-2xl px-5 pt-5 pb-4 mt-5"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-slate-700">Detail ALOS per Diagnosa</h2>
          <p className="text-xs text-slate-400">Perbandingan dengan target standar</p>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '2px solid #F1F5F9' }}>
              {['Diagnosa', 'Kasus', 'ALOS Aktual', 'Target', 'Status'].map((h) => (
                <th key={h} className="text-left pb-3 text-xs font-semibold text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.alos_per_poli.map((d: any, i: number) => {
              return (
                <tr
                  key={i}
                  className="transition-colors hover:bg-slate-50"
                  style={{
                    backgroundColor: i % 2 === 0 ? 'transparent' : '#FAFAFA',
                    borderBottom: '1px solid #F8FAFC',
                  }}
                >
                  <td className="py-3 text-sm font-medium text-slate-700">{d.poli}</td>
                  <td className="py-3 text-sm text-slate-600">{d.cases}</td>
                  <td className="py-3 text-sm text-slate-600">{d.alos} hari</td>
                  <td className="py-3 text-sm text-slate-500">{d.target} hari</td>
                  <td className="py-3"><StatusBadge status={d.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
