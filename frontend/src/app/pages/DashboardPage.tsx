import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Users, BedDouble, DollarSign, Clock, TrendingUp, TrendingDown,
  AlertTriangle, AlertCircle, Info, Sparkles, RefreshCw, ChevronRight,
  Activity,
} from 'lucide-react';
import { apiService } from '../services/api';

const NAVY = '#1E3A5F';
const CYAN = '#0EA5E9';

// ── Custom Tooltip ──────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-xl border border-slate-100 px-3.5 py-3 text-xs">
      <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 mb-0.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-medium text-slate-700">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-xl border border-slate-100 px-3.5 py-3 text-xs">
      <p className="font-semibold text-slate-700">{payload[0].name}</p>
      <p className="text-slate-500 mt-0.5">{payload[0].value}% dari total kunjungan</p>
    </div>
  );
}

// ── AI Panel ────────────────────────────────────────────────
function AIPanel({ contextData }: { contextData: any }) {
  const [refreshing, setRefreshing] = useState(false);
  const [insights, setInsights] = useState<string>('Memuat analisis AI...');
  const [confidence, setConfidence] = useState(0);

  const fetchAI = async () => {
    setRefreshing(true);
    try {
      const res = await apiService.getAIRecommendation('dashboard', contextData);
      setInsights(res.recommendation);
      setConfidence(res.confidence || 87);
    } catch (err) {
      setInsights('**Gagal memuat analisis AI.**\n\nPastikan backend dan Ollama berjalan.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (contextData) fetchAI();
  }, [contextData]);

  const handleRefresh = () => {
    fetchAI();
  };

  const paragraphs = insights.split('\n\n');

  const renderParagraph = (text: string, i: number) => {
    if (text.startsWith('**') && text.endsWith('**')) {
      return (
        <p key={i} className="text-xs font-bold mt-2" style={{ color: NAVY }}>
          {text.replace(/\*\*/g, '')}
        </p>
      );
    }
    // Parse bold inline
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return (
      <p key={i} className="text-xs leading-relaxed mt-2" style={{ color: '#475569' }}>
        {parts.map((part, j) =>
          j % 2 === 1 ? <strong key={j} className="text-slate-700">{part}</strong> : part
        )}
      </p>
    );
  };

  return (
    <div
      className="flex flex-col h-full rounded-2xl overflow-hidden"
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid #E2E8F0' }}
    >
      {/* Header */}
      <div
        className="px-4 py-3.5 flex items-center justify-between flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${NAVY}, #2D5A8E)` }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(14,165,233,0.3)' }}
          >
            <Sparkles size={14} style={{ color: CYAN }} />
          </div>
          <div>
            <div className="text-white text-sm font-semibold">Analisis AI</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Gemma-4 · RSI Surabaya</div>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/20 disabled:opacity-50"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        >
          <RefreshCw
            size={13}
            className={refreshing ? 'animate-spin' : ''}
            style={{ color: 'rgba(255,255,255,0.7)' }}
          />
        </button>
      </div>

      {/* Status bar */}
      <div
        className="px-4 py-2 flex items-center gap-2 flex-shrink-0"
        style={{ backgroundColor: '#F0FDF4', borderBottom: '1px solid #DCFCE7' }}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${refreshing ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
        <span className="text-xs text-emerald-700">
          {refreshing ? 'Menganalisis data...' : 'Model aktif · diperbarui baru saja'}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-white">
        {paragraphs.map((p, i) => renderParagraph(p, i))}

        {/* Confidence indicator */}
        {confidence > 0 && (
          <div
            className="mt-4 p-3 rounded-xl"
            style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-500">Keyakinan analisis</span>
              <span className="text-xs font-semibold text-slate-700">{confidence}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200">
              <div
                className="h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${confidence}%`, background: `linear-gradient(90deg, ${CYAN}, #0284C7)` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="px-4 py-3 flex-shrink-0"
        style={{ borderTop: '1px solid #F1F5F9', backgroundColor: '#FAFAFA' }}
      >
        <button
          className="w-full py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 hover:bg-cyan-50"
          style={{ color: CYAN, backgroundColor: 'rgba(14,165,233,0.08)' }}
        >
          <Activity size={13} />
          Buat laporan lengkap
        </button>
      </div>
    </div>
  );
}

// ── KPI Card ────────────────────────────────────────────────
function KPICard({ label, value, sub, icon: Icon, trend, iconBg, iconColor }: any) {
  const isPositive = trend > 0;
  return (
    <div
      className="bg-white rounded-2xl px-5 py-4 flex items-start justify-between"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 truncate mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5 truncate">{sub}</p>
        <div className="flex items-center gap-1 mt-2">
          {isPositive
            ? <TrendingUp size={11} className="text-emerald-500" />
            : <TrendingDown size={11} className="text-red-400" />
          }
          <span className={`text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{trend}% vs bulan lalu
          </span>
        </div>
      </div>
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ml-3"
        style={{ backgroundColor: iconBg }}
      >
        <Icon size={20} style={{ color: iconColor }} />
      </div>
    </div>
  );
}

// ── Alert Card ──────────────────────────────────────────────
const alertStyles = {
  critical: { bg: '#FEF2F2', border: '#FECACA', dot: '#EF4444', text: '#7F1D1D' },
  warning: { bg: '#FFFBEB', border: '#FDE68A', dot: '#F59E0B', text: '#78350F' },
  info: { bg: '#EFF6FF', border: '#BFDBFE', dot: CYAN, text: '#1E40AF' },
};

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await apiService.getDashboard();
        setData(res);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="p-6 flex items-center justify-center min-h-screen text-slate-500">Memuat data operasional...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  const kpis = [
    {
      label: 'Total Pasien Aktif',
      value: data.kpis.total_pasien_aktif,
      sub: 'rawat inap saat ini',
      icon: Users,
      trend: +4.2,
      iconBg: 'rgba(14,165,233,0.1)',
      iconColor: CYAN,
    },
    {
      label: 'Tingkat Hunian (BOR)',
      value: data.kpis.bor_label,
      sub: 'target: ≥ 70%',
      icon: BedDouble,
      trend: +2.1,
      iconBg: 'rgba(16,185,129,0.1)',
      iconColor: '#10B981',
    },
    {
      label: 'Pendapatan Bulan Ini',
      value: data.kpis.pendapatan_label,
      sub: 'dari target Rp 4,5 M',
      icon: DollarSign,
      trend: -1.8,
      iconBg: 'rgba(139,92,246,0.1)',
      iconColor: '#8B5CF6',
    },
    {
      label: 'Rata-rata Lama Rawat',
      value: data.kpis.alos_label,
      sub: 'ALOS — target: ≤ 4 hari',
      icon: Clock,
      trend: -0.3,
      iconBg: 'rgba(245,158,11,0.1)',
      iconColor: '#F59E0B',
    },
  ];

  return (
    <div className="p-6 min-h-full" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-slate-800 font-bold" style={{ fontSize: '1.35rem' }}>Overview Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Ringkasan kinerja operasional RSI Surabaya — Real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="text-sm border border-slate-200 rounded-xl px-3 py-1.5 outline-none bg-white text-slate-600"
          >
            <option>30 Hari Terakhir</option>
            <option>7 Hari Terakhir</option>
            <option>Bulan Ini</option>
          </select>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-white"
            style={{ background: `linear-gradient(135deg, ${CYAN}, #0284C7)` }}
          >
            Unduh Laporan
          </button>
        </div>
      </div>

      <div className="flex gap-5 items-start">
        {/* ── Left / Center ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          {/* KPI Row */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {kpis.map((k, i) => <KPICard key={i} {...k} />)}
          </div>

          {/* Line chart */}
          <div
            className="bg-white rounded-2xl px-5 pt-5 pb-3"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-700">Tren Pasien — 30 Hari Terakhir</h2>
                <p className="text-xs text-slate-400">Rawat inap (dari database)</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 rounded" style={{ backgroundColor: CYAN, display: 'inline-block' }} />
                  <span className="text-slate-500">Rawat Inap</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={data.patient_trend} margin={{ top: 2, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CYAN} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={CYAN} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  tickLine={false}
                  axisLine={false}
                  interval={Math.ceil(data.patient_trend.length / 8)}
                />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone" dataKey="rawatInap" name="Rawat Inap"
                  stroke={CYAN} strokeWidth={2} fill="url(#gCyan)" dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Donut + Alerts row */}
          <div className="grid grid-cols-2 gap-5">
            {/* Donut chart */}
            <div
              className="bg-white rounded-2xl px-5 pt-5 pb-4"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}
            >
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-slate-700">Distribusi Penjamin</h2>
                <p className="text-xs text-slate-400">Berdasarkan data pasien aktif</p>
              </div>
              <div className="flex items-center gap-4">
                <div style={{ width: 130, height: 130 }}>
                  <PieChart width={130} height={130}>
                    <Pie
                      data={data.payment_dist}
                      cx="50%" cy="50%"
                      innerRadius={40} outerRadius={60}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {data.payment_dist.map((entry: any, i: number) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </div>
                <div className="flex-1 space-y-2.5">
                  {data.payment_dist.map((d: any, i: number) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                          <span className="text-xs text-slate-600">{d.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{d.value}%</span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-slate-100">
                        <div className="h-1 rounded-full" style={{ width: `${d.value}%`, backgroundColor: d.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Alerts */}
            <div
              className="bg-white rounded-2xl px-5 pt-5 pb-4 flex flex-col"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-700">Notifikasi & Anomali</h2>
                  <p className="text-xs text-slate-400">Deteksi otomatis sistem</p>
                </div>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}
                >
                  {data.alerts.filter((a: any) => a.type === 'critical').length} Kritis
                </span>
              </div>
              <div className="flex-1 space-y-2 overflow-auto">
                {data.alerts.map((a: any) => {
                  const s = alertStyles[a.type as keyof typeof alertStyles] || alertStyles.info;
                  return (
                    <div
                      key={a.id}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl"
                      style={{ backgroundColor: s.bg, border: `1px solid ${s.border}` }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: s.dot }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs leading-relaxed" style={{ color: s.text }}>{a.msg}</p>
                        <p className="text-xs mt-0.5" style={{ color: `${s.dot}99` }}>{a.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                className="mt-3 text-xs font-medium flex items-center justify-center gap-1 py-2 rounded-xl transition-colors hover:bg-cyan-50"
                style={{ color: CYAN, backgroundColor: 'rgba(14,165,233,0.06)' }}
              >
                Lihat semua notifikasi <ChevronRight size={11} />
              </button>
            </div>
          </div>
        </div>

        {/* ── AI Panel (right column) ── */}
        <div className="w-80 flex-shrink-0" style={{ minHeight: '600px' }}>
          <AIPanel contextData={data.ai_context} />
        </div>
      </div>
    </div>
  );
}