import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Lock, User, Shield, TrendingUp, Layers, Heart } from 'lucide-react';

const NAVY = '#1E3A5F';
const CYAN = '#0EA5E9';

function IslamicPattern() {
  return (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.06 }}>
      <defs>
        <pattern id="ip" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          {/* 8-pointed star */}
          <polygon
            points="50,6 56,32 76,14 62,36 88,36 67,50 88,64 62,64 76,86 56,68 50,94 44,68 24,86 38,64 12,64 33,50 12,36 38,36 24,14 44,32"
            fill="none" stroke="white" strokeWidth="1.2"
          />
          {/* Corner diamonds */}
          <polygon points="0,12 6,0 12,12 6,24" fill="none" stroke="white" strokeWidth="0.7" />
          <polygon points="88,12 94,0 100,12 94,24" fill="none" stroke="white" strokeWidth="0.7" />
          <polygon points="0,88 6,76 12,88 6,100" fill="none" stroke="white" strokeWidth="0.7" />
          <polygon points="88,88 94,76 100,88 94,100" fill="none" stroke="white" strokeWidth="0.7" />
          {/* Center small square rotated */}
          <rect x="46" y="46" width="8" height="8" fill="none" stroke="white" strokeWidth="0.7" transform="rotate(45 50 50)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ip)" />
    </svg>
  );
}

const features = [
  { icon: TrendingUp, text: 'Analitik real-time berbasis kecerdasan buatan' },
  { icon: Layers, text: 'Optimasi sumber daya & manajemen kamar' },
  { icon: Shield, text: 'Analisis biaya & verifikasi klaim asuransi' },
  { icon: Heart, text: 'Monitoring kepuasan & pengalaman pasien' },
];

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1100));
    setLoading(false);
    navigate('/');
  };

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
      className="min-h-screen flex"
    >
      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{
          width: '52%',
          background: `linear-gradient(150deg, #0D2442 0%, ${NAVY} 45%, #1a4a78 100%)`,
        }}
      >
        <IslamicPattern />

        {/* Glowing orb decorations */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)`,
            transform: 'translate(30%, -30%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)`,
            transform: 'translate(-30%, 30%)',
          }}
        />

        {/* Top branding */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${CYAN}, #0284C7)`,
              width: '46px', height: '46px',
              boxShadow: '0 8px 24px rgba(14,165,233,0.4)',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="white" />
            </svg>
          </div>
          <div>
            <div className="text-white font-bold text-xl tracking-widest">DARSI</div>
            <div className="text-xs tracking-wider" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Digital Assistant Rumah Sakit Islam
            </div>
          </div>
        </div>

        {/* Center headline */}
        <div className="relative z-10">
          <div
            className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-5"
            style={{ backgroundColor: 'rgba(14,165,233,0.2)', color: CYAN, border: `1px solid rgba(14,165,233,0.3)` }}
          >
            ✦ Sistem Manajemen RS Berbasis AI
          </div>
          <h1 className="text-white font-bold leading-tight mb-5" style={{ fontSize: '2.4rem' }}>
            Keputusan Strategis<br />Lebih Cepat &<br />
            <span style={{ color: CYAN }}>Lebih Akurat</span>
          </h1>
          <p className="leading-relaxed mb-8 max-w-sm" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem' }}>
            Platform pengambilan keputusan eksekutif untuk RSI Surabaya, didukung analitik
            prediktif dan kecerdasan buatan.
          </p>

          <div className="space-y-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.2)' }}
                >
                  <f.icon size={15} style={{ color: CYAN }} />
                </div>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div
          className="relative z-10 pt-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        >
          <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
            وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ
          </p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            "Barang siapa bertawakal kepada Allah, maka Dia akan mencukupinya" — QS. At-Thalaq: 3
          </p>
        </div>
      </div>

      {/* ── Right panel — login form ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${CYAN}, #0284C7)` }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="white" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-lg" style={{ color: NAVY }}>DARSI</div>
              <div className="text-xs text-gray-400">RSI Surabaya</div>
            </div>
          </div>

          {/* Greeting */}
          <div className="mb-8">
            <h2 className="font-bold text-slate-800" style={{ fontSize: '1.6rem' }}>Selamat Datang 👋</h2>
            <p className="text-slate-500 text-sm mt-1.5">
              Masuk ke dashboard manajemen RSI Surabaya
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none transition-all placeholder-slate-400"
                  style={{ color: '#1E293B' }}
                  onFocus={(e) => { e.target.style.borderColor = CYAN; e.target.style.boxShadow = `0 0 0 3px rgba(14,165,233,0.12)`; }}
                  onBlur={(e) => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm outline-none transition-all placeholder-slate-400"
                  style={{ color: '#1E293B' }}
                  onFocus={(e) => { e.target.style.borderColor = CYAN; e.target.style.boxShadow = `0 0 0 3px rgba(14,165,233,0.12)`; }}
                  onBlur={(e) => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-200" />
                <span className="text-sm text-slate-600">Ingat saya</span>
              </label>
              <button type="button" className="text-sm font-medium" style={{ color: CYAN }}>
                Lupa password?
              </button>
            </div>

            {error && (
              <div className="text-sm text-red-500 text-center py-2 bg-red-50 rounded-lg">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
              style={{
                background: `linear-gradient(135deg, ${CYAN}, #0284C7)`,
                boxShadow: '0 4px 14px rgba(14,165,233,0.35)',
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memverifikasi akses...
                </>
              ) : (
                'Masuk ke Dashboard'
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div
            className="mt-6 p-4 rounded-xl border"
            style={{ backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }}
          >
            <p className="text-xs font-semibold text-blue-600 mb-1">🔑 Demo Akses</p>
            <p className="text-xs text-blue-500">Username: <strong>admin</strong> | Password: <strong>darsi2026</strong></p>
            <p className="text-xs text-blue-400 mt-1">Klik "Masuk" untuk mengakses dashboard demo</p>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            DARSI v2.1.0 — RSI Surabaya © 2026 · Hak cipta dilindungi
          </p>
        </div>
      </div>
    </div>
  );
}
