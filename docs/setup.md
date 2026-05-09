# 🚀 DARSI — Panduan Setup & Menjalankan Sistem

Panduan lengkap untuk orang yang **pertama kali** mencoba DARSI, dari nol hingga sistem berjalan.

---

## Prasyarat

Pastikan sudah terinstall:

| Software | Versi Minimum | Cara Cek |
|----------|--------------|----------|
| **Node.js** | 16+ | `node -v` |
| **Python** | 3.9+ | `python --version` |
| **Docker Desktop** | Latest | `docker --version` |
| **pip** | Latest | `pip --version` |

---

## Step-by-Step dari Nol

### 1. Clone / Buka Project

```bash
cd C:\Users\ACER NITRO\Documents\DARSIDUMMY\darsi_v2
```

### 2. Install Dependencies

**Backend (Python):**
```bash
cd backend
pip install -r requirements.txt
cd ..
```

**Frontend (Node.js):**
```bash
cd frontend
npm install
cd ..
```

**Root (untuk concurrently):**
```bash
npm install
```

### 3. Pastikan Docker Desktop Berjalan

Buka aplikasi Docker Desktop dan tunggu sampai statusnya **"Running"**.

Verifikasi:
```bash
docker --version
docker-compose --version
```

### 4. Jalankan SurrealDB via Docker

```bash
docker-compose up -d
```

Cek statusnya:
```bash
docker-compose ps
```

Output yang diharapkan:
```
NAME                STATUS
darsi_surrealdb     Up
```

### 5. Seed Data Dummy (Pertama Kali)

```bash
cd backend
python seed_dummy.py
cd ..
```

### 6. Jalankan Semua Service

**Cara Cepat (1 Terminal):**
```bash
npm start
```

Ini akan menjalankan:
- ✅ SurrealDB (Docker) di port 8000 (catatan : docker harus sudah berjalan terlebih dahulu)
- ✅ Backend FastAPI di port 8001
- ✅ Frontend Vite di port 5173

**Cara Manual (3 Terminal):**

| Terminal | Perintah | Port |
|----------|---------|------|
| 1 | `docker-compose up -d` | 8000 (SurrealDB) |
| 2 | `cd backend && python main.py` | 8001 (FastAPI) |
| 3 | `cd frontend && npm run dev` | 5173 (Vite) |

### 7. Akses Aplikasi

| Aplikasi | URL |
|----------|-----|
| 🌐 Frontend | http://localhost:5173 |
| 📚 Swagger API Docs | http://localhost:8001/docs |
| 🗄️ SurrealDB Studio | https://surrealist.app |

### 8. Login

- **Username:** `dokter` / `perawat` / `apoteker` / `cs` / `manager`
- **Password:** `123`
- **Superadmin:** Akses langsung di http://localhost:5173/superadmin

---

## SurrealDB — Setup & Testing

### Mengecek Database via Studio

1. Buka https://surrealist.app
2. Klik **"Connect"**
3. Isi koneksi:
   - **Protocol:** HTTP
   - **Hostname:** `localhost:8000`
   - **Namespace:** `darsi`
   - **Database:** `hospital`
   - **Username:** `root`
   - **Password:** `root`
4. Klik **Connect**
5. Di tab **Explorer**, kamu bisa lihat tabel: `pasien`, `kamar`, `rawat_inap`, `tagihan`, dll

### Query Manual di Studio

```sql
-- Lihat semua pasien
SELECT * FROM pasien;

-- Hitung total pasien
SELECT count() FROM pasien GROUP ALL;

-- Lihat kamar yang terisi
SELECT * FROM kamar WHERE status = 'Terisi';

-- Lihat tagihan belum bayar
SELECT * FROM tagihan WHERE status_bayar = 'Belum Bayar';
```

### Reset Database (Hapus Semua Data)

```bash
docker-compose down -v
docker-compose up -d
cd backend
python seed_dummy.py
```

### Konfigurasi Koneksi

File: `backend/.env`
```env
SURREALDB_HOST=http://localhost:8000
SURREALDB_USER=root
SURREALDB_PASS=root
SURREALDB_NS=darsi
SURREALDB_DB=hospital
```

> ⚠️ Port SurrealDB (8000) berbeda dengan port Backend API (8001). Jangan tertukar!

---

## Stop Semua Service

```bash
# Jika pakai npm start → tekan Ctrl+C
# Lalu matikan Docker:
docker-compose down
```

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| "Cannot connect to Docker" | Buka Docker Desktop, pastikan running |
| "Port 8000 already in use" | `docker-compose down` lalu `docker-compose up -d` |
| "Module not found" (Python) | `cd backend && pip install -r requirements.txt` |
| "npm ERR!" | `cd frontend && npm install` |
| Tabel kosong di Studio | `cd backend && python seed_dummy.py` |
| Backend error saat start | Pastikan SurrealDB sudah running dulu (`docker-compose ps`) |
| Frontend blank | Cek browser console (F12), pastikan backend jalan di 8001 |

---

## Struktur File Penting

```
darsi_v2/
├── backend/
│   ├── main.py              # Entry point FastAPI
│   ├── database.py           # Koneksi SurrealDB
│   ├── seed_dummy.py         # Seed data dummy
│   ├── .env                  # Konfigurasi
│   └── routers/
│       ├── dashboard.py      # API dashboard
│       ├── patient.py        # API patient experience
│       ├── resources.py      # API resources
│       ├── cost_insurance.py # API biaya & asuransi
│       ├── superadmin.py     # API superadmin
│       ├── n8n.py            # API untuk n8n
│       ├── external_api.py   # API ingest dari luar
│       └── ai.py             # API AI
├── frontend/
│   └── src/app/
│       ├── pages/            # Halaman-halaman
│       ├── components/       # Komponen UI
│       └── routes.tsx        # Routing
├── docs/                     # Dokumentasi
│   ├── api.md               # Panduan API lengkap
│   └── setup.md             # Panduan setup (file ini)
├── docker-compose.yml        # Konfigurasi Docker
└── package.json             # Script npm start
```
