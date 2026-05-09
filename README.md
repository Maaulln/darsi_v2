# 🏥 DARSI v2.0 — Hospital Management System

> **DARSI** — Digital Assistant Rumah Sakit Islam Surabaya  
> Sistem Informasi Manajemen RS terintegrasi dengan SurrealDB, FastAPI, dan React.

---

## ✨ Fitur Utama

| Modul | Deskripsi |
|-------|-----------|
| **Dashboard** | Visualisasi statistik RS real-time |
| **Resources** | Manajemen kamar & sumber daya |
| **Cost & Insurance** | Tracking biaya & klaim asuransi |
| **Patient Experience** | Monitoring ALOS, readmission, kepuasan pasien |
| **Superadmin** | Kelola API, users, audit logs, integrasi pihak ketiga |
| **API Ingest** | Terima data dari RS lain dengan auto-cleaning |
| **Webhook Tester** | Test koneksi n8n/webhook dari dashboard |

### Role-Based Dashboard
- 👨‍⚕️ **Dokter** — Ringkasan pasien & jadwal
- 👩‍⚕️ **Perawat** — Status ruangan & rawat inap
- 💊 **Apoteker** — Stok & resep
- 📞 **CS** — Antrian & feedback pasien
- 📊 **Manager** — Full dashboard analitik

---

## 🚀 Quick Start

```bash
# 1. Pastikan Docker Desktop sudah running

# 2. Jalankan SurrealDB
docker-compose up -d

# 3. Seed data (pertama kali saja)
cd backend && python seed_dummy.py && cd ..

# 4. Jalankan semua service
npm start
```

**Akses:**
| Aplikasi | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| API Docs | http://localhost:8001/docs |
| Superadmin | http://localhost:5173/superadmin |
| SurrealDB Studio | https://surrealist.app |

**Login:** Username `dokter`/`perawat`/`apoteker`/`cs`/`manager`, Password: `123`

---

## 🛠 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React + TypeScript + Vite + TailwindCSS |
| Backend | Python + FastAPI |
| Database | SurrealDB (via Docker) |
| Infra | Docker Compose |

---

## 📚 Dokumentasi

| Dokumen | Isi |
|---------|-----|
| [docs/setup.md](./docs/setup.md) | Panduan lengkap setup dari nol, menjalankan service, SurrealDB, troubleshooting |
| [docs/api.md](./docs/api.md) | Referensi semua API endpoint, cara memasukkan API luar, webhook tester |

---

## 📁 Struktur Project

```
darsi_v2/
├── backend/                 # FastAPI backend
│   ├── main.py              # Entry point
│   ├── database.py          # Koneksi SurrealDB
│   ├── seed_dummy.py        # Seed data dummy
│   └── routers/             # API endpoints
│       ├── dashboard.py
│       ├── resources.py
│       ├── cost_insurance.py
│       ├── patient.py
│       ├── superadmin.py
│       ├── n8n.py
│       ├── external_api.py  # API ingest + webhook tester
│       └── ai.py
├── frontend/                # React frontend
│   └── src/app/
│       ├── pages/           # Halaman per role
│       └── components/      # Komponen UI
├── docs/                    # Dokumentasi
│   ├── api.md              # Panduan API
│   └── setup.md            # Panduan setup
├── docker-compose.yml       # SurrealDB container
├── package.json            # npm start script
└── README.md               # File ini
```

---

## ⚙️ Konfigurasi

File `backend/.env`:
```env
SURREALDB_HOST=http://localhost:8000
SURREALDB_USER=root
SURREALDB_PASS=root
SURREALDB_NS=darsi
SURREALDB_DB=hospital
```

---

## 📄 Lisensi

MIT License — Tim DARSI © 2026
