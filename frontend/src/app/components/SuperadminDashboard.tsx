import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from './ui/table';
import { Alert, AlertDescription } from './ui/alert';

interface SuperadminDashboardProps {}
interface ApiConfig { [key: string]: any; }
interface User { id: string; email: string; role: string; is_active: boolean; created_at: string; }
interface AuditLog { id: string; user_id: string; action: string; resource: string; details: any; created_at: string; }
interface DashboardStats { total_users: number; total_patients: number; total_configs: number; total_logs: number; recent_logs: AuditLog[]; }

export const SuperadminDashboard: React.FC<SuperadminDashboardProps> = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [configs, setConfigs] = useState<ApiConfig>({});
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [newConfig, setNewConfig] = useState({ key: '', value: '' });
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'user' });

  // Webhook tester & example states
  const [webhookResult, setWebhookResult] = useState<any>(null);
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [exampleData, setExampleData] = useState<any>(null);

  const API_BASE_URL = 'http://localhost:8001/api/superadmin';
  const EXT_URL = 'http://localhost:8001/api/external';

  useEffect(() => { loadDashboardData(); }, [activeTab]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (activeTab === 'overview') {
        const r = await fetch(`${API_BASE_URL}/dashboard-stats`);
        if (r.ok) { const d = await r.json(); setStats(d.data); }
      } else if (activeTab === 'config') {
        const r = await fetch(`${API_BASE_URL}/config`);
        if (r.ok) { const d = await r.json(); setConfigs(d.data); }
      } else if (activeTab === 'users') {
        const r = await fetch(`${API_BASE_URL}/users`);
        if (r.ok) { const d = await r.json(); setUsers(d.data); }
      } else if (activeTab === 'logs') {
        const r = await fetch(`${API_BASE_URL}/audit-logs?limit=100`);
        if (r.ok) { const d = await r.json(); setAuditLogs(d.data); }
      }
    } catch (err) { setError('Gagal memuat data: ' + (err as Error).message); }
    finally { setIsLoading(false); }
  };

  const handleCreateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConfig.key || !newConfig.value) { setError('Key dan value harus diisi'); return; }
    try {
      const r = await fetch(`${API_BASE_URL}/config`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newConfig) });
      if (r.ok) { setMessage('Konfigurasi berhasil dibuat'); setNewConfig({ key: '', value: '' }); loadDashboardData(); }
      else { const d = await r.json(); setError(d.detail || 'Gagal'); }
    } catch (err) { setError('Error: ' + (err as Error).message); }
  };

  const handleDeleteConfig = async (key: string) => {
    if (!window.confirm(`Hapus konfigurasi '${key}'?`)) return;
    try {
      const r = await fetch(`${API_BASE_URL}/config/${key}`, { method: 'DELETE' });
      if (r.ok) { setMessage(`'${key}' dihapus`); loadDashboardData(); }
    } catch (err) { setError('Error: ' + (err as Error).message); }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password) { setError('Email dan password harus diisi'); return; }
    try {
      const r = await fetch(`${API_BASE_URL}/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUser) });
      if (r.ok) { setMessage('Pengguna baru berhasil dibuat'); setNewUser({ email: '', password: '', role: 'user' }); loadDashboardData(); }
      else { const d = await r.json(); setError(d.detail || 'Gagal'); }
    } catch (err) { setError('Error: ' + (err as Error).message); }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Hapus pengguna ini?')) return;
    try {
      const r = await fetch(`${API_BASE_URL}/users/${userId}`, { method: 'DELETE' });
      if (r.ok) { setMessage('Pengguna dihapus'); loadDashboardData(); }
    } catch (err) { setError('Error: ' + (err as Error).message); }
  };

  const handleWebhookTest = async () => {
    setWebhookLoading(true); setWebhookResult(null);
    try {
      const r = await fetch(`${EXT_URL}/webhook-test`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true, source: 'superadmin_dashboard', timestamp: new Date().toISOString() }),
      });
      const d = await r.json();
      setWebhookResult(d);
      setMessage('✅ Webhook test berhasil! Koneksi OK.');
    } catch (err) { setError('Webhook test gagal: ' + (err as Error).message); }
    finally { setWebhookLoading(false); }
  };

  const handleLoadExample = async () => {
    try {
      const r = await fetch(`${EXT_URL}/example`);
      const d = await r.json();
      setExampleData(d);
    } catch (err) { setError('Gagal memuat contoh: ' + (err as Error).message); }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">🔧 Superadmin Dashboard</h1>
        <p className="text-gray-600">Kelola API, Konfigurasi, dan Pengguna</p>
      </div>

      {message && (<Alert className="bg-green-50 border-green-200"><AlertDescription className="text-green-800">✓ {message}</AlertDescription></Alert>)}
      {error && (<Alert className="bg-red-50 border-red-200"><AlertDescription className="text-red-800">✗ {error}</AlertDescription></Alert>)}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="config">⚙️ API Integrations</TabsTrigger>
          <TabsTrigger value="users">👥 Users</TabsTrigger>
          <TabsTrigger value="logs">📝 Audit Logs</TabsTrigger>
        </TabsList>

        {/* ═══ Overview Tab ═══ */}
        <TabsContent value="overview" className="space-y-4">
          {isLoading ? (<Card><CardContent className="pt-6">Loading...</CardContent></Card>) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', val: stats.total_users },
                { label: 'Total Patients', val: stats.total_patients },
                { label: 'Configurations', val: stats.total_configs },
                { label: 'Audit Logs', val: stats.total_logs },
              ].map((s, i) => (
                <Card key={i}><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600">{s.label}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{s.val}</div></CardContent></Card>
              ))}
            </div>
          ) : null}
          <Card>
            <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
            <CardContent>
              <Table><TableHeader><TableRow><TableHead>Action</TableHead><TableHead>Resource</TableHead><TableHead>Timestamp</TableHead></TableRow></TableHeader>
                <TableBody>{(stats?.recent_logs || []).map((log, idx) => (
                  <TableRow key={idx}><TableCell className="font-medium">{log.action}</TableCell><TableCell>{log.resource}</TableCell><TableCell className="text-sm text-gray-600">{new Date(log.created_at).toLocaleString()}</TableCell></TableRow>
                ))}</TableBody></Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Configuration / API Integrations Tab ═══ */}
        <TabsContent value="config" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* API Keluar */}
            <Card className="border-green-200">
              <CardHeader className="bg-green-50/50">
                <CardTitle className="text-green-800">API Keluar (Data DARSI → Pihak Ketiga)</CardTitle>
                <CardDescription>Endpoint untuk n8n/Postman membaca data DARSI.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="bg-slate-50 p-3 rounded border text-sm">
                  <p className="font-semibold mb-2">Endpoint URL:</p>
                  <ul className="list-disc pl-5 space-y-2 text-slate-600 font-mono text-xs">
                    <li><a href="http://localhost:8001/api/n8n/pasien" target="_blank" className="text-blue-600 hover:underline">GET /api/n8n/pasien</a></li>
                    <li><a href="http://localhost:8001/api/n8n/tagihan" target="_blank" className="text-blue-600 hover:underline">GET /api/n8n/tagihan</a></li>
                    <li><a href="http://localhost:8001/api/n8n/dashboard-summary" target="_blank" className="text-blue-600 hover:underline">GET /api/n8n/dashboard-summary</a></li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* API Masuk */}
            <Card className="border-blue-200">
              <CardHeader className="bg-blue-50/50">
                <CardTitle className="text-blue-800">API Masuk (Pihak Ketiga → Data DARSI)</CardTitle>
                <CardDescription>Konfigurasi bagi DARSI untuk menarik/menerima data dari luar.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleCreateConfig} className="space-y-4">
                  <h4 className="font-medium text-sm">Simpan Kredensial Baru</h4>
                  <select className="w-full px-3 py-2 border rounded bg-white text-sm" value={newConfig.key} onChange={(e) => setNewConfig({ ...newConfig, key: e.target.value })}>
                    <option value="" disabled>-- Pilih Jenis API --</option>
                    <optgroup label="Integrasi AI & Bot">
                      <option value="ollama_url">Ollama Host URL</option>
                      <option value="telegram_bot_token">Telegram Bot Token</option>
                      <option value="whatsapp_api_key">WhatsApp API Key</option>
                    </optgroup>
                    <optgroup label="Integrasi Nasional">
                      <option value="bpjs_client_id">BPJS VClaim Client ID</option>
                      <option value="bpjs_secret_key">BPJS VClaim Secret Key</option>
                      <option value="satusehat_client_id">SatuSehat Client ID</option>
                      <option value="satusehat_client_secret">SatuSehat Client Secret</option>
                    </optgroup>
                    <optgroup label="Lainnya">
                      <option value="n8n_webhook_url">URL Webhook n8n (Push Event)</option>
                      <option value="custom_api_url">Custom API URL</option>
                    </optgroup>
                  </select>
                  <Input placeholder="Masukkan Value / Token di sini..." value={newConfig.value} onChange={(e) => setNewConfig({ ...newConfig, value: e.target.value })} />
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Simpan Konfigurasi</Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* ── Contoh API Masuk ── */}
          <Card className="border-amber-200">
            <CardHeader className="bg-amber-50/50">
              <CardTitle className="text-amber-800">📋 Contoh: Cara Memasukkan Data dari API Luar</CardTitle>
              <CardDescription>Klik tombol di bawah untuk melihat contoh bagaimana data dari RS lain dibersihkan otomatis oleh DARSI</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="bg-slate-50 p-4 rounded border text-sm space-y-3">
                <p className="font-semibold">Cara Kerja:</p>
                <ol className="list-decimal pl-5 space-y-1 text-slate-600 text-xs">
                  <li>API luar mengirim data (format bebas) ke <code className="bg-slate-200 px-1 rounded">POST /api/external/ingest/pasien</code></li>
                  <li>Sistem mengenali field otomatis (misal: <code className="bg-slate-200 px-1 rounded">patient_name</code> → <code className="bg-slate-200 px-1 rounded">nama</code>)</li>
                  <li>Data dibersihkan: trim spasi, normalisasi gender (L→Laki-laki), format telepon, dll</li>
                  <li>Data bersih tersimpan di database DARSI</li>
                </ol>
                <p className="font-semibold mt-3">Contoh Payload dari RS lain:</p>
                <pre className="bg-slate-800 text-green-300 p-3 rounded text-xs overflow-x-auto">{`POST /api/external/ingest/pasien
Content-Type: application/json

{
  "source": "RS Contoh Jakarta",
  "data": [
    {
      "patient_name": "AHMAD FAUZI",
      "age": "45 tahun",
      "gender": "L",
      "insurance": "bpjs kesehatan",
      "phone": "08123456789"
    },
    {
      "nama_lengkap": "siti nurhaliza",
      "usia": 32,
      "jk": "P",
      "jaminan": "umum"
    }
  ]
}`}</pre>
                <p className="text-xs text-gray-500 italic">*Meski field berbeda-beda (patient_name vs nama_lengkap), sistem akan mengenali otomatis!</p>
              </div>
              <Button variant="outline" className="border-amber-400 text-amber-700 hover:bg-amber-50" onClick={handleLoadExample}>
                🔍 Lihat Hasil Cleaning Contoh (Live Demo)
              </Button>
              {exampleData && (
                <div className="bg-white border rounded p-3 text-xs max-h-64 overflow-y-auto">
                  <p className="font-bold mb-2 text-green-700">✅ Hasil Cleaning:</p>
                  <pre className="whitespace-pre-wrap text-slate-700">{JSON.stringify(exampleData.hasil_cleaning, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Webhook Tester ── */}
          <Card className="border-purple-200">
            <CardHeader className="bg-purple-50/50">
              <CardTitle className="text-purple-800">🧪 Webhook Tester</CardTitle>
              <CardDescription>Test koneksi webhook dari n8n / service lain ke DARSI</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="bg-slate-50 p-3 rounded border text-xs space-y-1">
                <p><strong>URL Tester:</strong> <code className="bg-slate-200 px-1 rounded">POST http://localhost:8001/api/external/webhook-test</code></p>
                <p className="text-gray-500">Kirim payload apapun ke URL ini untuk test koneksi. Response akan berisi echo data + analisis otomatis.</p>
              </div>
              <Button onClick={handleWebhookTest} disabled={webhookLoading} className="bg-purple-600 hover:bg-purple-700">
                {webhookLoading ? '⏳ Testing...' : '🚀 Test Webhook Sekarang'}
              </Button>
              {webhookResult && (
                <div className="bg-white border border-green-200 rounded p-3 text-xs">
                  <p className="font-bold text-green-700 mb-1">{webhookResult.message}</p>
                  <p className="text-gray-500">Received at: {webhookResult.received_at}</p>
                  <pre className="mt-2 bg-slate-50 p-2 rounded whitespace-pre-wrap max-h-40 overflow-y-auto">{JSON.stringify(webhookResult.analysis, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Daftar Integrasi Aktif ── */}
          <Card>
            <CardHeader>
              <CardTitle>Daftar Integrasi Aktif</CardTitle>
              <CardDescription>Semua konfigurasi API dan token yang tersimpan di database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (<p>Loading...</p>) : Object.entries(configs).length === 0 ? (
                  <p className="text-gray-500">Tidak ada integrasi API yang aktif</p>
                ) : (
                  Object.entries(configs).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 border rounded hover:bg-slate-50">
                      <div>
                        <p className="font-bold text-slate-800">{key}</p>
                        <p className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded inline-block mt-1">{JSON.stringify(value).replace(/"/g, '')}</p>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteConfig(key)}>Hapus</Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Users Tab ═══ */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Add New User</CardTitle><CardDescription>Buat pengguna baru</CardDescription></CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                  <Input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                </div>
                <select className="w-full px-3 py-2 border rounded" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                  <option value="user">User</option><option value="admin">Admin</option><option value="superadmin">Superadmin</option>
                </select>
                <Button type="submit" className="w-full md:w-auto">Create User</Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Users List</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? (<p>Loading...</p>) : (
                <Table><TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                  <TableBody>{users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">{user.role}</span></TableCell>
                      <TableCell>{user.is_active ? <span className="text-green-600">✓ Active</span> : <span className="text-red-600">✗ Inactive</span>}</TableCell>
                      <TableCell className="text-sm">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell><Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user.id)}>Delete</Button></TableCell>
                    </TableRow>
                  ))}</TableBody></Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Audit Logs Tab ═══ */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Audit Logs</CardTitle><CardDescription>Riwayat semua aktivitas sistem</CardDescription></CardHeader>
            <CardContent>
              {isLoading ? (<p>Loading...</p>) : (
                <Table><TableHeader><TableRow><TableHead>Action</TableHead><TableHead>User</TableHead><TableHead>Resource</TableHead><TableHead>Timestamp</TableHead></TableRow></TableHeader>
                  <TableBody>{auditLogs.map((log, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell>{log.user_id}</TableCell>
                      <TableCell className="text-sm">{log.resource}</TableCell>
                      <TableCell className="text-sm">{new Date(log.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}</TableBody></Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
