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
import { 
  ShieldAlert, Users, Settings, Activity, Server, 
  Database, Search, Bell, Shield, Zap, Lock, Filter,
  CheckCircle2, XCircle, Clock
} from 'lucide-react';

interface SuperadminDashboardProps {}
interface ApiConfig { [key: string]: any; }
interface User { id: string; email: string; role: string; is_active: boolean; created_at: string; }
interface AuditLog { id: string; user_id: string; role?: string; action: string; resource: string; details: any; created_at: string; }
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
  
  const [logFilterRole, setLogFilterRole] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

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
        const r = await fetch(`${API_BASE_URL}/audit-logs?limit=500`);
        if (r.ok) { const d = await r.json(); setAuditLogs(d.data); }
      }
    } catch (err) { setError('Failed to load data: ' + (err as Error).message); }
    finally { setIsLoading(false); }
  };

  const handleCreateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConfig.key || !newConfig.value) { setError('Key and value required'); return; }
    try {
      const r = await fetch(`${API_BASE_URL}/config`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newConfig) });
      if (r.ok) { setMessage('Configuration created successfully'); setNewConfig({ key: '', value: '' }); loadDashboardData(); }
      else { const d = await r.json(); setError(d.detail || 'Failed'); }
    } catch (err) { setError('Error: ' + (err as Error).message); }
  };

  const handleDeleteConfig = async (key: string) => {
    if (!window.confirm(`Delete configuration '${key}'?`)) return;
    try {
      const r = await fetch(`${API_BASE_URL}/config/${key}`, { method: 'DELETE' });
      if (r.ok) { setMessage(`'${key}' deleted`); loadDashboardData(); }
    } catch (err) { setError('Error: ' + (err as Error).message); }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password) { setError('Email and password required'); return; }
    try {
      const r = await fetch(`${API_BASE_URL}/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUser) });
      if (r.ok) { setMessage('User created successfully'); setNewUser({ email: '', password: '', role: 'user' }); loadDashboardData(); }
      else { const d = await r.json(); setError(d.detail || 'Failed'); }
    } catch (err) { setError('Error: ' + (err as Error).message); }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      const r = await fetch(`${API_BASE_URL}/users/${userId}`, { method: 'DELETE' });
      if (r.ok) { setMessage('User deleted'); loadDashboardData(); }
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
      setMessage('✅ Webhook connection test successful!');
    } catch (err) { setError('Webhook test failed: ' + (err as Error).message); }
    finally { setWebhookLoading(false); }
  };

  const handleLoadExample = async () => {
    try {
      const r = await fetch(`${EXT_URL}/example`);
      const d = await r.json();
      setExampleData(d);
    } catch (err) { setError('Failed to load example: ' + (err as Error).message); }
  };

  const getRoleBadgeColor = (role: string = '') => {
    switch (role.toLowerCase()) {
      case 'superadmin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'dokter': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'perawat': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'apoteker': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'manager': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cs': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesRole = logFilterRole === 'All' || (log.role && log.role.toLowerCase() === logFilterRole.toLowerCase()) || (!log.role && logFilterRole === 'Other');
    const searchString = searchQuery.toLowerCase();
    const matchesSearch = log.action.toLowerCase().includes(searchString) || 
                          log.resource.toLowerCase().includes(searchString) || 
                          (log.user_id && log.user_id.toLowerCase().includes(searchString));
    return matchesRole && matchesSearch;
  });

  const uniqueRoles = ['All', 'Superadmin', 'Dokter', 'Perawat', 'Apoteker', 'Manager', 'CS', 'Other'];

  return (
    <div className="space-y-6 p-6 min-h-screen bg-slate-50 font-sans">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
              <ShieldAlert className="w-8 h-8 text-indigo-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
                Superadmin Control Center
              </h1>
              <p className="text-indigo-200 mt-1 flex items-center text-sm">
                <Server className="w-4 h-4 mr-1 opacity-70" /> System Governance & API Management
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-3 bg-black/30 px-4 py-2 rounded-lg border border-white/10 backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-sm font-medium text-emerald-100">System Secure & Online</span>
          </div>
        </div>
      </div>

      {message && (
        <Alert className="bg-emerald-50 border-emerald-200 shadow-sm animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <AlertDescription className="text-emerald-800 ml-2 font-medium">{message}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert className="bg-red-50 border-red-200 shadow-sm animate-in fade-in slide-in-from-top-4">
          <XCircle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800 ml-2 font-medium">{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white p-1 rounded-xl shadow-sm border border-slate-100 mb-6">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm transition-all duration-200">
            <Activity className="w-4 h-4 mr-2" /> Overview
          </TabsTrigger>
          <TabsTrigger value="config" className="rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm transition-all duration-200">
            <Zap className="w-4 h-4 mr-2" /> API Integrations
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm transition-all duration-200">
            <Users className="w-4 h-4 mr-2" /> Users
          </TabsTrigger>
          <TabsTrigger value="logs" className="rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm transition-all duration-200">
            <Shield className="w-4 h-4 mr-2" /> Audit Logs
          </TabsTrigger>
        </TabsList>

        {/* ═══ Overview Tab ═══ */}
        <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {isLoading ? (
            <div className="flex justify-center p-12"><Activity className="w-8 h-8 text-indigo-500 animate-spin" /></div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', val: stats.total_users, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                { label: 'Total Patients', val: stats.total_patients, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                { label: 'API Configs', val: stats.total_configs, icon: Database, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                { label: 'Audit Events', val: stats.total_logs, icon: ShieldAlert, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
              ].map((s, i) => (
                <Card key={i} className={`overflow-hidden border ${s.border} shadow-sm hover:shadow-md transition-shadow`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">{s.label}</p>
                        <h3 className="text-3xl font-bold text-slate-800">{s.val}</h3>
                      </div>
                      <div className={`p-3 rounded-xl ${s.bg}`}>
                        <s.icon className={`w-6 h-6 ${s.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}
          
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg font-semibold text-slate-800">
                  <Clock className="w-5 h-5 mr-2 text-indigo-500" /> Recent System Activity
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('logs')} className="text-xs">
                  View All Logs
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="w-[100px] text-xs uppercase text-slate-500">Role</TableHead>
                    <TableHead className="text-xs uppercase text-slate-500">Action</TableHead>
                    <TableHead className="text-xs uppercase text-slate-500">Resource</TableHead>
                    <TableHead className="text-right text-xs uppercase text-slate-500">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(stats?.recent_logs || []).map((log, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeColor(log.role)}`}>
                          {log.role || 'System'}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-slate-700">{log.action}</TableCell>
                      <TableCell className="text-slate-600 font-mono text-xs bg-slate-100/50 py-1 px-2 rounded inline-block mt-2">
                        {log.resource}
                      </TableCell>
                      <TableCell className="text-right text-sm text-slate-500">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ API Integrations Tab ═══ */}
        <TabsContent value="config" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-emerald-200 shadow-sm overflow-hidden flex flex-col">
              <CardHeader className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-b border-emerald-100">
                <CardTitle className="text-emerald-800 flex items-center">
                  <Activity className="w-5 h-5 mr-2" /> Outbound API (Data Export)
                </CardTitle>
                <CardDescription className="text-emerald-600">
                  Endpoints for n8n or 3rd parties to securely pull DARSI data.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 flex-grow">
                <div className="space-y-4">
                  <div className="bg-white border border-emerald-100 p-4 rounded-xl shadow-sm">
                    <p className="font-semibold text-sm mb-3 text-slate-700 flex items-center">
                      <Lock className="w-4 h-4 mr-2 text-emerald-500" /> Available Endpoints:
                    </p>
                    <div className="space-y-3">
                      {['/api/n8n/pasien', '/api/n8n/tagihan', '/api/n8n/dashboard-summary'].map((path) => (
                        <div key={path} className="flex items-center justify-between group">
                          <code className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-1.5 rounded border border-slate-200 flex-grow">
                            GET {path}
                          </code>
                          <a href={`http://localhost:8001${path}`} target="_blank" rel="noreferrer" 
                             className="ml-3 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                            Test ↗
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-indigo-200 shadow-sm overflow-hidden flex flex-col">
              <CardHeader className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-b border-indigo-100">
                <CardTitle className="text-indigo-800 flex items-center">
                  <Database className="w-5 h-5 mr-2" /> Inbound API & Webhooks
                </CardTitle>
                <CardDescription className="text-indigo-600">
                  Configure external credentials for DARSI to ingest or connect to data.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 flex-grow">
                <form onSubmit={handleCreateConfig} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Integration Type</label>
                    <select className="w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-white text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                            value={newConfig.key} onChange={(e) => setNewConfig({ ...newConfig, key: e.target.value })}>
                      <option value="" disabled>-- Select Integration Type --</option>
                      <optgroup label="AI & Bots">
                        <option value="ollama_url">Ollama Host URL</option>
                        <option value="telegram_bot_token">Telegram Bot Token</option>
                        <option value="whatsapp_api_key">WhatsApp API Key</option>
                      </optgroup>
                      <optgroup label="National Health">
                        <option value="bpjs_client_id">BPJS VClaim Client ID</option>
                        <option value="bpjs_secret_key">BPJS VClaim Secret Key</option>
                        <option value="satusehat_client_id">SatuSehat Client ID</option>
                        <option value="satusehat_client_secret">SatuSehat Client Secret</option>
                      </optgroup>
                      <optgroup label="Webhooks & Custom">
                        <option value="n8n_webhook_url">n8n Webhook URL (Push Event)</option>
                        <option value="custom_api_url">Custom API URL</option>
                      </optgroup>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Secret Value / Token</label>
                    <Input className="border-slate-200 shadow-sm" placeholder="Enter secure value here..." 
                           value={newConfig.value} onChange={(e) => setNewConfig({ ...newConfig, value: e.target.value })} />
                  </div>
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                    Save Configuration
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-white border-b border-slate-100">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Settings className="w-5 h-5 mr-2 text-slate-500" /> Active Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {isLoading ? (<div className="h-20 flex items-center justify-center text-slate-400">Loading configurations...</div>) : Object.entries(configs).length === 0 ? (
                  <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Database className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p>No active API integrations found.</p>
                  </div>
                ) : (
                  Object.entries(configs).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mr-4 group-hover:bg-indigo-100 transition-colors">
                          <Zap className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{key}</p>
                          <div className="flex items-center mt-1">
                            <Lock className="w-3 h-3 text-slate-400 mr-1" />
                            <p className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded truncate max-w-[200px] sm:max-w-[400px]">
                              {JSON.stringify(value).replace(/"/g, '')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" size="sm" onClick={() => handleDeleteConfig(key)}>
                        Remove
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Users Tab ═══ */}
        <TabsContent value="users" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Users className="w-5 h-5 mr-2 text-slate-500" /> System Users
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 bg-slate-50 border-b border-slate-100">
                <form onSubmit={handleCreateUser} className="flex flex-col sm:flex-row gap-3 items-end">
                  <div className="w-full sm:w-1/3 space-y-1">
                    <label className="text-xs font-medium text-slate-600">Email Address</label>
                    <Input type="email" placeholder="user@darsi.local" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="bg-white" />
                  </div>
                  <div className="w-full sm:w-1/4 space-y-1">
                    <label className="text-xs font-medium text-slate-600">Password</label>
                    <Input type="password" placeholder="••••••••" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="bg-white" />
                  </div>
                  <div className="w-full sm:w-1/4 space-y-1">
                    <label className="text-xs font-medium text-slate-600">System Role</label>
                    <select className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white text-sm" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                      <option value="user">User</option>
                      <option value="dokter">Dokter</option>
                      <option value="perawat">Perawat</option>
                      <option value="apoteker">Apoteker</option>
                      <option value="cs">Customer Service</option>
                      <option value="manager">Manager</option>
                      <option value="superadmin">Superadmin</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white">Add User</Button>
                </form>
              </div>
              
              {isLoading ? (<div className="p-8 text-center text-slate-500">Loading users...</div>) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Email / Identity</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-slate-800">{user.email}</TableCell>
                        <TableCell>
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          {user.is_active ? 
                            <span className="inline-flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full"><CheckCircle2 className="w-3 h-3 mr-1"/> Active</span> : 
                            <span className="inline-flex items-center text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full"><XCircle className="w-3 h-3 mr-1"/> Inactive</span>
                          }
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                            Revoke
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

        {/* ═══ Audit Logs Tab ═══ */}
        <TabsContent value="logs" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-slate-200 shadow-sm overflow-hidden flex flex-col h-[800px]">
            <CardHeader className="bg-white border-b border-slate-100 pb-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center text-slate-800">
                    <Shield className="w-6 h-6 mr-2 text-indigo-600" /> Comprehensive Audit Log
                  </CardTitle>
                  <CardDescription>
                    All system activities are securely captured and immutably logged.
                  </CardDescription>
                </div>
                
                <div className="relative w-full md:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <Input 
                    placeholder="Search logs..." 
                    className="pl-9 bg-slate-50 border-slate-200 focus:bg-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Role Filters */}
              <div className="flex flex-wrap gap-2 pb-4">
                <div className="flex items-center mr-2 text-sm font-medium text-slate-500">
                  <Filter className="w-4 h-4 mr-1" /> Filter by Role:
                </div>
                {uniqueRoles.map(role => (
                  <button
                    key={role}
                    onClick={() => setLogFilterRole(role)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                      logFilterRole === role 
                        ? 'bg-slate-800 text-white border-slate-800 shadow-md transform scale-105' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {role === 'All' ? 'General Log (All)' : role}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-grow overflow-auto bg-slate-50/30">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <Activity className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
                  <p>Decrypting and loading audit logs...</p>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                  <ShieldAlert className="w-12 h-12 text-slate-300 mb-4" />
                  <p className="text-lg font-medium">No audit logs found</p>
                  <p className="text-sm text-slate-400">Try adjusting your filters or search query.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-white sticky top-0 z-10 shadow-sm">
                    <TableRow>
                      <TableHead className="w-[120px] font-semibold text-slate-700">Actor Role</TableHead>
                      <TableHead className="w-[180px] font-semibold text-slate-700">Action</TableHead>
                      <TableHead className="font-semibold text-slate-700">Resource Target</TableHead>
                      <TableHead className="hidden md:table-cell font-semibold text-slate-700">Actor ID</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log, idx) => (
                      <TableRow key={idx} className="hover:bg-white transition-colors group">
                        <TableCell>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-md border ${getRoleBadgeColor(log.role)}`}>
                            {log.role || 'Unknown'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-slate-800 bg-slate-100 px-2 py-1 rounded text-xs group-hover:bg-indigo-50 group-hover:text-indigo-700 transition-colors">
                            {log.action}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm font-mono text-slate-600">
                          {log.resource}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-slate-500">
                          {log.user_id}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-medium text-slate-700">
                              {new Date(log.created_at).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(log.created_at).toLocaleTimeString()}
                            </span>
                          </div>
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
