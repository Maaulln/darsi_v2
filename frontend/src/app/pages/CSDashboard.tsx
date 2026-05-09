import React from 'react';
import { UserCheck, ShieldCheck, Map, CreditCard } from 'lucide-react';

export function CSDashboard() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Front Desk & Customer Service</h1>
        <p className="text-sm text-slate-500">Registrasi, Validasi BPJS, dan Navigasi Pasien</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Validasi BPJS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm col-span-1 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <ShieldCheck className="text-emerald-500" size={18} />
            Validasi Kepesertaan BPJS (V-Claim API)
          </h2>
          <div className="flex gap-3 mb-4">
            <input 
              type="text" 
              placeholder="Masukkan No. Kartu BPJS / NIK" 
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-emerald-500"
            />
            <button className="bg-emerald-500 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-emerald-600">
              Cek Status
            </button>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <p className="text-xs text-slate-400 text-center">Hasil validasi akan muncul di sini</p>
          </div>
        </div>

        {/* Indoor Navigation */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Map className="text-cyan-500" size={18} />
            Navigasi Ruangan (KiosK)
          </h2>
          <p className="text-xs text-slate-500 mb-4">Cetak QR Code rute untuk pasien menuju poli atau ruangan spesifik.</p>
          <select className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none mb-3">
            <option>Pilih Tujuan...</option>
            <option>Poli Anak (Lantai 2)</option>
            <option>Poli Penyakit Dalam (Lantai 1)</option>
            <option>Farmasi / Apotek (Lantai 1)</option>
            <option>Radiologi (Basement)</option>
          </select>
          <button className="w-full bg-cyan-50 text-cyan-600 border border-cyan-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-cyan-100">
            Generate QR Rute
          </button>
        </div>

        {/* Antrean Pendaftaran */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm col-span-1 lg:col-span-3">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <UserCheck className="text-blue-500" size={18} />
            Antrean Pendaftaran Baru
          </h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400">
                <th className="py-2">No. Antrean</th>
                <th className="py-2">Nama Pasien</th>
                <th className="py-2">Poli Tujuan</th>
                <th className="py-2">Jenis Bayar</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-50 text-sm">
                <td className="py-3 font-bold">A-012</td>
                <td className="py-3">Bp. Susanto</td>
                <td className="py-3">Poli Mata</td>
                <td className="py-3"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">BPJS</span></td>
                <td className="py-3"><button className="text-blue-500 text-xs font-semibold hover:underline">Proses</button></td>
              </tr>
              <tr className="border-b border-slate-50 text-sm">
                <td className="py-3 font-bold">B-005</td>
                <td className="py-3">Ibu Anisa</td>
                <td className="py-3">Poli Kandungan</td>
                <td className="py-3"><span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">Umum</span></td>
                <td className="py-3"><button className="text-blue-500 text-xs font-semibold hover:underline">Proses</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
