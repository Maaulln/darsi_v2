import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Alert, AlertDescription } from './ui/alert';

interface SuperadminDashboardProps {}

interface ApiConfig {
  [key: string]: any;
}

interface User {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  details: any;
  created_at: string;
}

interface DashboardStats {
  total_users: number;
  total_patients: number;
  total_configs: number;
  total_logs: number;
  recent_logs: AuditLog[];
}

export const SuperadminDashboard: React.FC<SuperadminDashboardProps> = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // State untuk data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [configs, setConfigs] = useState<ApiConfig>({});
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // State untuk form
  const [newConfig, setNewConfig] = useState({ key: '', value: '' });
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'user' });

  const API_BASE_URL = 'http://localhost:8001/api/superadmin';

  // Fetch data
  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      if (activeTab === 'overview') {
        const statsRes = await fetch(`${API_BASE_URL}/dashboard-stats`);
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.data);
        }
      } else if (activeTab === 'config') {
        const configRes = await fetch(`${API_BASE_URL}/config`);
        if (configRes.ok) {
          const data = await configRes.json();
          setConfigs(data.data);
        }
      } else if (activeTab === 'users') {
        const usersRes = await fetch(`${API_BASE_URL}/users`);
        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(data.data);
        }
      } else if (activeTab === 'logs') {
        const logsRes = await fetch(`${API_BASE_URL}/audit-logs?limit=100`);
        if (logsRes.ok) {
          const data = await logsRes.json();
          setAuditLogs(data.data);
        }
      }
    } catch (err) {
      setError('Gagal memuat data: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new config
  const handleCreateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newConfig.key || !newConfig.value) {
      setError('Key dan value harus diisi');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });

      if (res.ok) {
        setMessage('Konfigurasi berhasil dibuat');
        setNewConfig({ key: '', value: '' });
        loadDashboardData();
      } else {
        const data = await res.json();
        setError(data.detail || 'Gagal membuat konfigurasi');
      }
    } catch (err) {
      setError('Error: ' + (err as Error).message);
    }
  };

  // Update config
  const handleUpdateConfig = async (key: string, value: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/config/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });

      if (res.ok) {
        setMessage(`Konfigurasi '${key}' berhasil diupdate`);
        loadDashboardData();
      }
    } catch (err) {
      setError('Error: ' + (err as Error).message);
    }
  };

  // Delete config
  const handleDeleteConfig = async (key: string) => {
    if (!window.confirm(`Hapus konfigurasi '${key}'?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/config/${key}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMessage(`Konfigurasi '${key}' berhasil dihapus`);
        loadDashboardData();
      }
    } catch (err) {
      setError('Error: ' + (err as Error).message);
    }
  };

  // Create new user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUser.email || !newUser.password) {
      setError('Email dan password harus diisi');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (res.ok) {
        setMessage('Pengguna baru berhasil dibuat');
        setNewUser({ email: '', password: '', role: 'user' });
        loadDashboardData();
      } else {
        const data = await res.json();
        setError(data.detail || 'Gagal membuat pengguna');
      }
    } catch (err) {
      setError('Error: ' + (err as Error).message);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Hapus pengguna ini?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMessage('Pengguna berhasil dihapus');
        loadDashboardData();
      }
    } catch (err) {
      setError('Error: ' + (err as Error).message);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">🔧 Superadmin Dashboard</h1>
        <p className="text-gray-600">Kelola API, Konfigurasi, dan Pengguna</p>
      </div>

      {message && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">✓ {message}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertDescription className="text-red-800">✗ {error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="config">⚙️ API Integrations</TabsTrigger>
          <TabsTrigger value="users">👥 Users</TabsTrigger>
          <TabsTrigger value="logs">📝 Audit Logs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="pt-6">Loading...</CardContent>
            </Card>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_users}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Patients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_patients}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Configurations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_configs}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Audit Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_logs}</div>
                </CardContent>
              </Card>
            </div>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(stats?.recent_logs || []).map((log, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell>{log.resource}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-green-200">
              <CardHeader className="bg-green-50/50">
                <CardTitle className="text-green-800">API Keluar (Data DARSI -&gt; Pihak Ketiga)</CardTitle>
                <CardDescription>
                  Layanan pihak ketiga (seperti n8n/Postman) yang membaca data dari DARSI.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="bg-slate-50 p-3 rounded border text-sm">
                  <p className="font-semibold mb-2">Endpoint URL untuk di-test di Postman/n8n:</p>
                  <ul className="list-disc pl-5 space-y-2 text-slate-600 font-mono text-xs">
                    <li><a href="http://localhost:8001/api/n8n/pasien" target="_blank" className="text-blue-600 hover:underline">GET http://localhost:8001/api/n8n/pasien</a></li>
                    <li><a href="http://localhost:8001/api/n8n/tagihan" target="_blank" className="text-blue-600 hover:underline">GET http://localhost:8001/api/n8n/tagihan</a></li>
                    <li><a href="http://localhost:8001/api/n8n/dashboard-summary" target="_blank" className="text-blue-600 hover:underline">GET http://localhost:8001/api/n8n/dashboard-summary</a></li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-3 italic">*Gunakan URL di atas di aplikasi Postman atau node HTTP Request di n8n.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader className="bg-blue-50/50">
                <CardTitle className="text-blue-800">API Masuk (Pihak Ketiga -&gt; Data DARSI)</CardTitle>
                <CardDescription>
                  Konfigurasi bagi DARSI untuk menarik data dari pihak luar (BPJS, Ollama, dll).
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={(e) => { e.preventDefault(); handleCreateConfig(e); }} className="space-y-4">
                  <h4 className="font-medium text-sm">Simpan Kredensial Baru</h4>
                  <div>
                    <select
                      className="w-full px-3 py-2 border rounded bg-white text-sm"
                      value={newConfig.key}
                      onChange={(e) => setNewConfig({ ...newConfig, key: e.target.value })}
                    >
                      <option value="" disabled>-- Pilih Jenis API --</option>
                      <optgroup label="Integrasi AI & Bot">
                        <option value="ollama_url">Ollama Host URL (Default: http://localhost:11434)</option>
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
                      </optgroup>
                    </select>
                  </div>
                  <Input
                    placeholder="Masukkan Value / Token Rahasia di sini..."
                    value={newConfig.value}
                    onChange={(e) => setNewConfig({ ...newConfig, value: e.target.value })}
                  />
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Simpan Konfigurasi</Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daftar Integrasi Aktif</CardTitle>
              <CardDescription>Semua konfigurasi API dan token yang tersimpan di database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <p>Loading...</p>
                ) : Object.entries(configs).length === 0 ? (
                  <p className="text-gray-500">Tidak ada integrasi API yang aktif</p>
                ) : (
                  Object.entries(configs).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 border rounded hover:bg-slate-50"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{key}</p>
                        <p className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded inline-block mt-1">
                          {JSON.stringify(value).replace(/"/g, '')}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteConfig(key)}
                      >
                        Hapus
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New User</CardTitle>
              <CardDescription>Buat pengguna baru</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                  />
                </div>
                <div>
                  <select
                    className="w-full px-3 py-2 border rounded"
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>
                <Button type="submit" className="w-full md:w-auto">
                  Create User
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Users List</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          {user.is_active ? (
                            <span className="text-green-600">✓ Active</span>
                          ) : (
                            <span className="text-red-600">✗ Inactive</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>Riwayat semua aktivitas sistem</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{log.action}</TableCell>
                        <TableCell>{log.user_id}</TableCell>
                        <TableCell className="text-sm">{log.resource}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(log.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
