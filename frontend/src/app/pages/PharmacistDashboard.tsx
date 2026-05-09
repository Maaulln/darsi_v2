import React from 'react';
import { Pill, Search, CheckCircle, Clock } from 'lucide-react';

export function PharmacistDashboard() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Apotek & Farmasi</h1>
        <p className="text-sm text-slate-500">Manajemen antrean resep dan stok obat</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Pill className="text-indigo-500" size={18} />
            Antrean E-Resep Hari Ini
          </h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase">
                <th className="py-3 px-2">ID Resep</th>
                <th className="py-3 px-2">Pasien</th>
                <th className="py-3 px-2">Dokter</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'RSP-001', px: 'Ahmad Yani', dr: 'Dr. Fadhil', status: 'Menunggu', color: 'bg-amber-100 text-amber-700' },
                { id: 'RSP-002', px: 'Siti Aminah', dr: 'Dr. Rani', status: 'Diracik', color: 'bg-blue-100 text-blue-700' },
                { id: 'RSP-003', px: 'Budi Santoso', dr: 'Dr. Fadhil', status: 'Siap Ambil', color: 'bg-emerald-100 text-emerald-700' },
              ].map((r, i) => (
                <tr key={i} className="border-b border-slate-50 text-sm hover:bg-slate-50">
                  <td className="py-3 px-2 font-medium text-slate-700">{r.id}</td>
                  <td className="py-3 px-2">{r.px}</td>
                  <td className="py-3 px-2">{r.dr}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${r.color}`}>{r.status}</span>
                  </td>
                  <td className="py-3 px-2">
                    <button className="text-indigo-600 hover:underline text-xs font-medium">Lihat Detail</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Search className="text-rose-500" size={18} />
            Alert Stok Menipis
          </h2>
          <div className="space-y-3">
            {[
              { obat: 'Paracetamol 500mg', sisa: 12 },
              { obat: 'Amoxicillin 500mg', sisa: 5 },
              { obat: 'Omeprazole 20mg', sisa: 8 },
            ].map((o, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-red-50 border border-red-100 rounded-xl">
                <span className="text-sm font-medium text-red-800">{o.obat}</span>
                <span className="text-xs font-bold text-white bg-red-500 px-2 py-1 rounded-full">{o.sisa} box</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
