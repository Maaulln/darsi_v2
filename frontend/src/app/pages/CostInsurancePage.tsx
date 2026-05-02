import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Filter, Download, ChevronUp, ChevronDown } from 'lucide-react';
import { apiService } from '../services/api';

const NAVY = '#1E3A5F';
const CYAN = '#0EA5E9';

// ── Helpers ────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    kritis: { bg: '#FEE2E2', color: '#DC2626', label: 'Kritis' },
    tinggi: { bg: '#FEF3C7', color: '#D97706', label: 'Tinggi' },
    normal: { bg: '#DCFCE7', color: '#16A34A', label: 'Normal' },
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

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-xl border border-slate-100 px-3.5 py-3 text-xs">
      <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 mb-0.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: p.fill || p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-medium text-slate-700">Rp {p.value.toLocaleString('id-ID')} Jt</span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white rounded-xl shadow-xl border border-slate-100 px-3.5 py-3 text-xs">
      <p className="font-semibold text-slate-700">{d.name}</p>
      <p className="text-slate-500 mt-0.5">{d.value}% — {d.klaim.toLocaleString()} klaim</p>
      {d.pending > 0 && <p className="text-amber-600 mt-0.5">{d.pending} pending verifikasi</p>}
    </div>
  );
}

export function CostInsurancePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await apiService.getCostInsurance();
        setData(res);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortCol !== col) return <ChevronDown size={11} className="text-slate-300" />;
    return sortDir === 'asc'
      ? <ChevronUp size={11} style={{ color: CYAN }} />
      : <ChevronDown size={11} style={{ color: CYAN }} />;
  };

  if (loading) return <div className="p-6 flex items-center justify-center min-h-screen text-slate-500">Memuat analisis biaya...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  const kpis = [
    { label: 'Total Pendapatan', value: `Rp ${data.summary.total_pendapatan.toFixed(1)} Jt`, sub: 'total kumulatif', icon: DollarSign, iconColor: CYAN, bg: 'rgba(14,165,233,0.1)', trend: +6.3 },
    { label: 'Total Biaya', value: `Rp ${data.summary.total_biaya.toFixed(1)} Jt`, sub: 'biaya operasional', icon: TrendingDown, iconColor: '#EF4444', bg: 'rgba(239,68,68,0.08)', trend: +4.1 },
    { label: 'Laba Kotor', value: `Rp ${data.summary.total_laba.toFixed(1)} Jt`, sub: `margin ${data.summary.margin_pct}%`, icon: TrendingUp, iconColor: '#10B981', bg: 'rgba(16,185,129,0.1)', trend: +12.4 },
    { label: 'Klaim Pending', value: data.summary.klaim_pending, sub: 'proses verifikasi', icon: Filter, iconColor: '#F59E0B', bg: 'rgba(245,158,11,0.1)', trend: -8.2 },
  ];

  return (
    <div className="p-6" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-slate-800 font-bold" style={{ fontSize: '1.35rem' }}>Biaya & Analisis Asuransi</h1>
          <p className="text-sm text-slate-500 mt-0.5">Pendapatan, biaya operasional, dan klaim asuransi — Real-time</p>
        </div>
        <button
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <Download size={13} />
          Ekspor CSV
        </button>
      </div>

      {/* KPI Summary */}
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
              <p className="font-bold text-slate-800 text-sm">{k.value}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {k.trend > 0
                  ? <TrendingUp size={10} className="text-emerald-500" />
                  : <TrendingDown size={10} className="text-red-400" />
                }
                <span className={`text-xs font-medium ${k.trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {k.trend > 0 ? '+' : ''}{k.trend}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-5 mb-5">
        {/* Stacked bar chart */}
        <div className="col-span-2 bg-white rounded-2xl px-5 pt-5 pb-3"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-700">Pendapatan vs Biaya per Bulan</h2>
              <p className="text-xs text-slate-400">Dalam juta Rupiah (Rp Jt)</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: CYAN }} />Pendapatan
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: '#1E3A5F' }} />Biaya
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: '#10B981' }} />Laba
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.monthly} margin={{ top: 2, right: 4, left: -10, bottom: 0 }} barSize={18} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="pendapatan" name="Pendapatan" fill={CYAN} radius={[4, 4, 0, 0]} />
              <Bar dataKey="biaya" name="Biaya" fill={NAVY} radius={[4, 4, 0, 0]} />
              <Bar dataKey="laba" name="Laba" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Insurance pie */}
        <div className="bg-white rounded-2xl px-5 pt-5 pb-4 flex flex-col"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-slate-700">Proporsi Klaim Asuransi</h2>
            <p className="text-xs text-slate-400">Distribusi penjamin pasien</p>
          </div>
          <div className="flex justify-center mb-3">
            <ResponsiveContainer width={150} height={150}>
              <PieChart>
                <Pie data={data.insurance_dist} cx="50%" cy="50%"
                  innerRadius={38} outerRadius={65} paddingAngle={2} dataKey="value">
                  {data.insurance_dist.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-1.5">
            {data.insurance_dist.map((d: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-slate-600 truncate max-w-[110px]">{d.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">{d.value}%</span>
                  {d.pending > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">{d.pending}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Diagnoses Table */}
      <div className="bg-white rounded-2xl px-5 pt-5 pb-4"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-700">Top 10 Diagnosa Berdasarkan Biaya</h2>
            <p className="text-xs text-slate-400">Kumulatif seluruh rekam medis</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '2px solid #F1F5F9' }}>
                {[
                  { key: 'rank', label: '#' },
                  { key: 'diagnosa', label: 'Diagnosa' },
                  { key: 'pasien', label: 'Jml Pasien' },
                  { key: 'avgCost', label: 'Avg. Biaya (Jt)' },
                  { key: 'totalCost', label: 'Total Biaya (Jt)' },
                  { key: 'status', label: 'Risk Level' },
                ].map((h) => (
                  <th
                    key={h.key}
                    className="text-left pb-3 text-xs font-semibold text-slate-500 cursor-pointer select-none"
                    onClick={() => handleSort(h.key)}
                  >
                    <div className="flex items-center gap-1">
                      {h.label}
                      <SortIcon col={h.key} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.top_diagnoses.map((d: any, i: number) => (
                <tr
                  key={i}
                  className="transition-colors hover:bg-slate-50"
                  style={{
                    backgroundColor: i % 2 === 0 ? 'transparent' : '#FAFAFA',
                    borderBottom: '1px solid #F8FAFC',
                  }}
                >
                  <td className="py-3 text-xs font-bold text-slate-400">#{d.rank}</td>
                  <td className="py-3 text-sm text-slate-700 font-medium">{d.diagnosa}</td>
                  <td className="py-3 text-sm text-slate-600">{d.pasien.toLocaleString()}</td>
                  <td className="py-3 text-sm text-slate-600">Rp {d.avgCost.toFixed(1)}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700">Rp {d.totalCost.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="py-3"><StatusBadge status={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
