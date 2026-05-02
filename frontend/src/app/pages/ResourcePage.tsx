import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from 'recharts';
import { BedDouble, Sparkles, TrendingUp, TrendingDown, Info, ChevronRight } from 'lucide-react';
import { apiService } from '../services/api';

const NAVY = '#1E3A5F';
const CYAN = '#0EA5E9';

const shortDays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

// ── Helpers ────────────────────────────────────────────────
function getHeatColor(val: number | null): string {
  if (val === null) return '#F1F5F9';
  if (val >= 90) return '#FEE2E2';
  if (val >= 80) return '#FEF3C7';
  if (val >= 60) return '#DCFCE7';
  return '#F0FDF4';
}

function getHeatTextColor(val: number | null): string {
  if (val === null) return '#CBD5E1';
  if (val >= 90) return '#DC2626';
  if (val >= 80) return '#D97706';
  return '#15803D';
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    kritis: { bg: '#FEE2E2', color: '#DC2626', label: 'Kritis' },
    tinggi: { bg: '#FEF3C7', color: '#D97706', label: 'Tinggi' },
    normal: { bg: '#DBEAFE', color: '#2563EB', label: 'Normal' },
    baik: { bg: '#DCFCE7', color: '#16A34A', label: 'Baik' },
    aktif: { bg: '#DCFCE7', color: '#16A34A', label: 'Aktif' },
    cuti: { bg: '#FEF3C7', color: '#D97706', label: 'Cuti' },
  };
  const s = map[status] || map.normal;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
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
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: p.fill || p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-medium text-slate-700">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export function ResourcePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await apiService.getResources();
        setData(res);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="p-6 flex items-center justify-center min-h-screen text-slate-500">Memuat data sumber daya...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  const kpis = [
    { label: 'Total Tempat Tidur', value: data.room_summary.total_tt, sub: 'kapasitas terpasang', icon: BedDouble, iconColor: CYAN, bg: 'rgba(14,165,233,0.1)' },
    { label: 'Terisi Hari Ini', value: data.room_summary.terisi, sub: `${data.room_summary.bor}% dari kapasitas`, icon: TrendingUp, iconColor: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Tersedia Sekarang', value: data.room_summary.tersedia, sub: 'tempat tidur kosong', icon: TrendingDown, iconColor: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Ruangan Kritis', value: data.room_summary.kritis_count, sub: 'Okupansi ≥ 90%', icon: Info, iconColor: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  ];

  return (
    <div className="p-6" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-slate-800 font-bold" style={{ fontSize: '1.35rem' }}>Optimasi Sumber Daya</h1>
          <p className="text-sm text-slate-500 mt-0.5">Utilisasi kamar & penjadwalan tenaga medis — Real-time</p>
        </div>
      </div>

      <div className="flex gap-5">
        {/* ── Left / Center ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Summary KPIs */}
          <div className="grid grid-cols-4 gap-4">
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
                  <p className="text-xs text-slate-400">{k.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Heatmap */}
          <div className="bg-white rounded-2xl px-5 pt-5 pb-4"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-700">Heatmap Okupansi per Ruangan</h2>
                <p className="text-xs text-slate-400">Rata-rata hunian per hari dalam seminggu (dari database)</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 border border-red-200" /> ≥90%</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200" /> &lt;80%</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left py-2 pr-4 font-medium text-slate-500 w-24">Ruangan</th>
                    {shortDays.map((d, i) => (
                      <th key={i} className="text-center py-2 px-2 font-medium text-slate-500 min-w-[72px]">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.heatmap.map((row: any, ri: number) => (
                    <tr key={ri}>
                      <td className="py-1.5 pr-4">
                        <div className="font-semibold text-slate-700">{row.room}</div>
                      </td>
                      {row.days.map((val: any, di: number) => (
                        <td key={di} className="py-1.5 px-2 text-center">
                          <div
                            className="rounded-xl py-2 px-1 font-semibold"
                            style={{
                              backgroundColor: getHeatColor(val),
                              color: getHeatTextColor(val),
                            }}
                          >
                            {val !== null ? `${val}%` : '—'}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bar chart */}
          <div className="bg-white rounded-2xl px-5 pt-5 pb-3"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-slate-700">Utilisasi Kamar per Kelas</h2>
              <p className="text-xs text-slate-400">Perbandingan kapasitas vs terisi (hari ini)</p>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={data.room_by_class} margin={{ top: 2, right: 4, left: -15, bottom: 0 }} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="kelas" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="kapasitas" name="Kapasitas" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="terisi" name="Terisi" radius={[4, 4, 0, 0]}>
                  {data.room_by_class.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Doctor schedule table */}
          <div className="bg-white rounded-2xl px-5 pt-5 pb-4"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-slate-700">Tenaga Medis Aktif</h2>
              <p className="text-xs text-slate-400">Berdasarkan data rekam medis terakhir</p>
            </div>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  {['Nama Dokter', 'Kasus Ditangani', 'Jadwal', 'Status'].map((h) => (
                    <th key={h} className="text-left pb-3 text-xs font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.doctors.map((d: any, i: number) => (
                  <tr
                    key={i}
                    style={{
                      backgroundColor: i % 2 === 0 ? 'transparent' : '#FAFAFA',
                      borderBottom: '1px solid #F8FAFC',
                    }}
                  >
                    <td className="py-3 text-sm font-medium text-slate-700">{d.name}</td>
                    <td className="py-3 text-sm text-slate-500">{d.cases} kasus</td>
                    <td className="py-3 text-xs text-slate-500">{d.jadwal}</td>
                    <td className="py-3"><StatusBadge status={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── AI Recommendation Panel ── */}
        <div className="w-72 flex-shrink-0">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid #E2E8F0' }}
          >
            {/* Header */}
            <div
              className="px-4 py-4"
              style={{ background: `linear-gradient(135deg, ${NAVY}, #2D5A8E)` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(14,165,233,0.3)' }}>
                  <Sparkles size={14} style={{ color: CYAN }} />
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">Rekomendasi AI</div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Optimasi Sumber Daya</div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="bg-white px-4 py-4 space-y-3">
              {[
                {
                  priority: 'Kritis', priorityColor: '#EF4444', priorityBg: '#FEE2E2',
                  title: 'Utilisasi ICU',
                  desc: 'Okupansi ICU mencapai ambang kritis. Pertimbangkan percepatan discharge atau penambahan kapasitas sementara.',
                  action: 'Tinjau Pasien',
                },
                {
                  priority: 'Tinggi', priorityColor: '#D97706', priorityBg: '#FEF3C7',
                  title: 'Manajemen Bed',
                  desc: 'Kelas II beroperasi pada kapasitas penuh. Alokasikan ke Kelas I jika diperlukan overflow.',
                  action: 'Alokasi Bed',
                },
                {
                  priority: 'Info', priorityColor: CYAN, priorityBg: 'rgba(14,165,233,0.1)',
                  title: 'Audit VIP',
                  desc: 'Okupansi VIP di bawah rata-rata. Pertimbangkan evaluasi tarif atau fasilitas tambahan.',
                  action: 'Evaluasi',
                }
              ].map((rec, i) => (
                <div key={i} className="p-3 rounded-xl" style={{ backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: rec.priorityBg, color: rec.priorityColor }}
                    >
                      {rec.priority}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">{rec.title}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-2">{rec.desc}</p>
                  <button
                    className="text-xs font-medium flex items-center gap-1 hover:underline"
                    style={{ color: CYAN }}
                  >
                    {rec.action} <ChevronRight size={10} />
                  </button>
                </div>
              ))}
            </div>

            <div className="px-4 pb-4 bg-white">
              <button
                className="w-full py-2 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity"
                style={{ background: `linear-gradient(135deg, ${CYAN}, #0284C7)` }}
              >
                Optimasi Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
