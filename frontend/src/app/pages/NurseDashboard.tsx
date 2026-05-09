import React from 'react';
import { Activity, Video, AlertTriangle, Users, HeartPulse } from 'lucide-react';

export function NurseDashboard() {
  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Nurse Station (Elderly & Pose AI)</h1>
          <p className="text-sm text-slate-500">Monitoring kondisi pasien lansia dan deteksi jatuh (Pose Estimation)</p>
        </div>
        <div className="flex gap-2">
          <span className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Kamera AI Aktif (4 Ruangan)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pose Estimation Monitors */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Video className="text-blue-500" size={18} />
            Live Pose Estimation (AI Camera)
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { kamar: 'VIP 1', status: 'Aman (Tidur)', color: 'border-emerald-200 bg-emerald-50 text-emerald-600' },
              { kamar: 'VIP 2', status: 'Aman (Duduk)', color: 'border-emerald-200 bg-emerald-50 text-emerald-600' },
              { kamar: 'ICU 1', status: 'PERINGATAN JATUH!', color: 'border-red-400 bg-red-50 text-red-600 shadow-md animate-pulse' },
              { kamar: 'VIP 4', status: 'Aman (Berjalan)', color: 'border-emerald-200 bg-emerald-50 text-emerald-600' },
            ].map((cam, i) => (
              <div key={i} className={`h-32 rounded-xl border-2 flex flex-col items-center justify-center relative overflow-hidden ${cam.color}`}>
                <div className="absolute top-2 left-2 text-[10px] font-bold opacity-70 px-2 py-0.5 rounded bg-black/10">Cam {i+1}</div>
                <Activity size={24} className="mb-2 opacity-50" />
                <span className="text-xs font-bold text-center px-2">{cam.status}</span>
                <span className="text-[10px] mt-1 opacity-70">{cam.kamar}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Elderly Monitoring Vitals */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <HeartPulse className="text-rose-500" size={18} />
            Vitals Monitoring Lansia (IoT)
          </h2>
          <div className="space-y-4">
            {[
              { nama: 'Bpk. Soedirman (78 Th)', bp: '130/85', hr: '72 bpm', spo2: '98%', status: 'Normal' },
              { nama: 'Ibu Fatimah (82 Th)', bp: '145/90', hr: '88 bpm', spo2: '95%', status: 'Warning' },
              { nama: 'Bpk. Hasan (69 Th)', bp: '120/80', hr: '65 bpm', spo2: '99%', status: 'Normal' },
              { nama: 'Ibu Ratna (75 Th)', bp: '160/95', hr: '105 bpm', spo2: '92%', status: 'Critical' },
            ].map((p, i) => (
              <div key={i} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-slate-700">{p.nama}</p>
                  <div className="flex gap-3 text-xs text-slate-500 mt-1">
                    <span title="Blood Pressure">BP: {p.bp}</span>
                    <span title="Heart Rate">HR: {p.hr}</span>
                    <span title="SpO2">SpO2: {p.spo2}</span>
                  </div>
                </div>
                {p.status === 'Critical' ? (
                  <AlertTriangle className="text-red-500 animate-bounce" size={20} />
                ) : p.status === 'Warning' ? (
                  <Activity className="text-amber-500" size={20} />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
