import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router';
import {
  LayoutDashboard, BedDouble, DollarSign, Users, BarChart2,
  Settings, LogOut, Bell, ChevronLeft, ChevronRight,
  Search, Calendar, ChevronDown, Activity, X,
  BrainCircuit, HeartPulse, Stethoscope, Video, Map, Pill, ShieldCheck, UserCheck, Headset
} from 'lucide-react';

const NAVY = '#1E3A5F';
const CYAN = '#0EA5E9';

const rolesConfig: Record<string, any> = {
  dokter: {
    name: 'Dr. Ahmad Fadhil',
    title: 'Dokter Spesialis Anak',
    menus: [
      { path: '/doctor', icon: BrainCircuit, label: 'Workspace AI (ICD)' },
      { path: '/patient-experience', icon: Stethoscope, label: 'Pasien & Rekam Medis' }
    ]
  },
  perawat: {
    name: 'Ns. Siti Aminah',
    title: 'Kepala Ruangan ICU',
    menus: [
      { path: '/nurse', icon: HeartPulse, label: 'Monitoring (Elderly & AI)' }
    ]
  },
  apoteker: {
    name: 'Budi Santoso, S.Farm',
    title: 'Apoteker Kepala',
    menus: [
      { path: '/pharmacist', icon: Pill, label: 'Apotek & Resep' }
    ]
  },
  cs: {
    name: 'Rina Wijaya',
    title: 'Customer Service & Pendaftaran',
    menus: [
      { path: '/cs', icon: Headset, label: 'Front Desk & BPJS' }
    ]
  },
  manager: {
    name: 'Hendra Gunawan',
    title: 'Direktur Operasional',
    menus: [
      { path: '/', icon: LayoutDashboard, label: 'Executive Dashboard', exact: true },
      { path: '/resources', icon: BedDouble, label: 'Optimasi Sumber Daya' },
      { path: '/cost-insurance', icon: DollarSign, label: 'Biaya & Asuransi' },
      { path: '/patient-experience', icon: Users, label: 'Pengalaman Pasien' },
    ]
  }
};

const notifications = [
  { id: 1, type: 'critical', message: 'BOR ICU mencapai 94% — melebihi batas aman', time: '10 mnt lalu' },
  { id: 2, type: 'warning', message: 'Klaim BPJS bulan ini belum diverifikasi (127 klaim)', time: '32 mnt lalu' },
  { id: 3, type: 'info', message: 'Sistem diperbarui ke versi v2.1.0', time: '2 jam lalu' },
];

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const navigate = useNavigate();

  const today = new Date('2026-05-02').toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const roleKey = localStorage.getItem('darsi_role') || 'manager';
  const currentUser = rolesConfig[roleKey] || rolesConfig['manager'];
  const navItems = currentUser.menus;

  React.useEffect(() => {
    if (!localStorage.getItem('darsi_role')) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('darsi_role');
    navigate('/login');
  };

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
      className="flex h-screen overflow-hidden bg-slate-50"
    >
      {/* ── Sidebar ── */}
      <aside
        style={{
          backgroundColor: NAVY,
          width: collapsed ? '72px' : '252px',
          minWidth: collapsed ? '72px' : '252px',
          transition: 'width 0.3s ease, min-width 0.3s ease',
        }}
        className="flex flex-col shadow-xl relative z-20 flex-shrink-0"
      >
        {/* Logo */}
        <div
          className="flex items-center px-4 py-5 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div
            className="flex items-center justify-center rounded-xl flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${CYAN}, #0284C7)`,
              width: '38px', height: '38px', boxShadow: '0 4px 12px rgba(14,165,233,0.4)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="white" fillOpacity="0.95" />
            </svg>
          </div>
          {!collapsed && (
            <div className="ml-3 overflow-hidden">
              <div className="text-white font-bold text-base tracking-widest">DARSI</div>
              <div className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>RSI Surabaya</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-hidden">
          {!collapsed && (
            <div
              className="text-xs uppercase px-3 mb-3 tracking-widest"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              Menu Utama
            </div>
          )}
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.disabled ? '#' : item.path}
              end={item.exact}
              onClick={(e) => item.disabled && e.preventDefault()}
              className={({ isActive }) => [
                'flex items-center rounded-xl transition-all duration-200 group relative',
                collapsed ? 'justify-center px-0 py-3.5' : 'px-3 py-2.5',
                item.disabled ? 'opacity-35 cursor-not-allowed' : 'cursor-pointer',
              ].join(' ')}
              style={({ isActive }) => ({
                backgroundColor: isActive ? 'rgba(14, 165, 233, 0.18)' : 'transparent',
                color: isActive ? CYAN : 'rgba(255,255,255,0.6)',
              })}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                      style={{ backgroundColor: CYAN }}
                    />
                  )}
                  <item.icon size={19} className="flex-shrink-0" style={{ color: isActive ? CYAN : undefined }} />
                  {!collapsed && (
                    <span className="ml-3 text-sm truncate">{item.label}</span>
                  )}
                  {!collapsed && isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CYAN }} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-3 pb-4 pt-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {!collapsed && (
            <div className="px-3 py-2.5 mb-2 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Masuk sebagai</div>
              <div className="text-sm text-white font-medium truncate mt-0.5">{currentUser.name}</div>
              <div className="text-xs mt-0.5" style={{ color: CYAN }}>{currentUser.title}</div>
            </div>
          )}
          <button
            className={`flex items-center w-full rounded-xl transition-all duration-200 hover:bg-red-500/15 hover:text-red-400 ${collapsed ? 'justify-center py-3.5' : 'px-3 py-2.5'}`}
            style={{ color: 'rgba(255,255,255,0.45)' }}
            onClick={handleLogout}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!collapsed && <span className="ml-3 text-sm">Keluar</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-24 w-6 h-6 rounded-full flex items-center justify-center shadow-md border border-gray-200 bg-white z-30"
        >
          {collapsed
            ? <ChevronRight size={11} style={{ color: NAVY }} />
            : <ChevronLeft size={11} style={{ color: NAVY }} />
          }
        </button>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Navbar */}
        <header className="bg-white shadow-sm border-b border-gray-100 px-6 py-3 flex items-center justify-between flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5" style={{ color: '#64748B' }}>
              <Activity size={14} style={{ color: CYAN }} />
              <span className="text-sm">Status Sistem: </span>
              <span className="text-sm font-medium text-emerald-600">Online</span>
            </div>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-1.5 text-sm" style={{ color: '#94A3B8' }}>
              <Calendar size={13} />
              <span>{today}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
              <Search size={13} className="text-slate-400" />
              <input
                type="text"
                placeholder="Cari pasien, laporan..."
                className="bg-transparent text-sm outline-none w-40 placeholder-slate-400"
                style={{ color: '#334155' }}
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotif(!showNotif)}
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors relative border border-slate-100"
              >
                <Bell size={17} className="text-slate-500" />
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white"
                  style={{ backgroundColor: '#EF4444' }}
                />
              </button>

              {/* Notification dropdown */}
              {showNotif && (
                <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <span className="text-sm font-semibold text-slate-700">Notifikasi</span>
                    <button onClick={() => setShowNotif(false)}>
                      <X size={14} className="text-slate-400" />
                    </button>
                  </div>
                  {notifications.map((n) => (
                    <div key={n.id} className="px-4 py-3 hover:bg-slate-50 transition-colors" style={{ borderBottom: '1px solid #F8FAFC' }}>
                      <div className="flex items-start gap-2.5">
                        <span
                          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                          style={{
                            backgroundColor: n.type === 'critical' ? '#EF4444' : n.type === 'warning' ? '#F59E0B' : CYAN
                          }}
                        />
                        <div>
                          <p className="text-xs text-slate-700">{n.message}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="px-4 py-2.5 text-center">
                    <button className="text-xs font-medium" style={{ color: CYAN }}>Lihat semua notifikasi</button>
                  </div>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-2.5 cursor-pointer pl-1">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${NAVY}, #2D5A8E)` }}
              >
                AF
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-slate-700">{currentUser.name}</div>
                <div className="text-xs text-slate-400">{currentUser.title}</div>
              </div>
              <ChevronDown size={13} className="text-slate-400" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
