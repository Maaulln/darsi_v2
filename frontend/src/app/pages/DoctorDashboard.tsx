import React from 'react';
import { Search, BrainCircuit, Activity, Stethoscope, FileText } from 'lucide-react';

export function DoctorDashboard() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Workspace Dokter (ICD & AI)</h1>
        <p className="text-sm text-slate-500">Pencarian ICD-10 otomatis & Analisis Diagnosa Berbasis AI</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Smart Input */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <BrainCircuit className="text-cyan-500" size={18} />
              Input Gejala Otomatis (AI)
            </h2>
            <textarea 
              className="w-full h-32 p-4 border border-slate-200 rounded-xl outline-none focus:border-cyan-500 transition-colors bg-slate-50"
              placeholder="Ketikan keluhan pasien secara natural di sini... (Contoh: Pasien mengeluh demam tinggi sejak 3 hari lalu, disertai batuk berdahak dan sesak napas ringan)"
            ></textarea>
            <div className="flex justify-end mt-4">
              <button className="bg-cyan-500 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-cyan-600 transition-colors">
                Analisis Diagnosa (ICD-10)
              </button>
            </div>
          </div>

          {/* ICD Recommendations */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Search className="text-indigo-500" size={18} />
              Rekomendasi Kode ICD-10
            </h2>
            <div className="space-y-3">
              {[
                { code: 'J06.9', desc: 'Acute upper respiratory infection, unspecified', conf: '94%' },
                { code: 'R50.9', desc: 'Fever, unspecified', conf: '88%' },
                { code: 'R05', desc: 'Cough', conf: '85%' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md text-sm">{item.code}</span>
                    <span className="text-sm text-slate-700">{item.desc}</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-500">Akurasi: {item.conf}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pasien Aktif */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Activity className="text-rose-500" size={18} />
            Antrean Pasien Anda
          </h2>
          <div className="space-y-4">
            {[
              { nama: 'Budi Santoso', umur: '45 Th', status: 'Menunggu' },
              { nama: 'Siti Aminah', umur: '32 Th', status: 'Diperiksa' },
              { nama: 'Ahmad Yani', umur: '60 Th', status: 'Selesai' },
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-3 border-b border-slate-50 pb-3 last:border-0">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <Stethoscope size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">{p.nama}</p>
                  <p className="text-xs text-slate-400">{p.umur} - {p.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
