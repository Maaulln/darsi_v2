# 📚 Panduan Database DARSI v2.0 untuk Pemula

**Dokumen ini adalah panduan lengkap tentang database dalam sistem DARSI v2.0. Sangat cocok untuk yang baru pertama kali menggunakan SurrealDB!**

---

## 📖 Daftar Isi

1. [Apa itu SurrealDB?](#apa-itu-surrealdb)
2. [Persiapan Awal](#persiapan-awal)
3. [Menjalankan Sistem Lengkap](#menjalankan-sistem-lengkap)
4. [Struktur Database](#struktur-database)
5. [Cara Mengecek Database](#cara-mengecek-database)
6. [Operasi Database Dasar](#operasi-database-dasar)
7. [Troubleshooting](#troubleshooting)
8. [Resource & Links Berguna](#resource--links-berguna)

---

## Apa itu SurrealDB?

### 🤔 Penjelasan Sederhana

**SurrealDB** adalah database modern yang dapat menyimpan data seperti halnya database lain (MySQL, PostgreSQL), tapi dengan fitur yang lebih canggih dan fleksibel.

**Analogi:**
- Database itu seperti **lemari arsip digital**
- SurrealDB seperti **lemari arsip pintar** yang bisa:
  - Menyimpan berbagai jenis data (dokumen, tabel, grafik)
  - Mencari data dengan cepat
  - Bekerja dengan berbagai format data
  - Dapat diakses melalui HTTP (seperti website)

### ✅ Keuntungan SurrealDB untuk DARSI

1. **Fleksibel** - Bisa menyimpan data terstruktur maupun tidak terstruktur
2. **Real-time** - Dapat mengirim update data secara langsung
3. **Scalable** - Mudah di-expand ketika data bertambah
4. **HTTP API** - Langsung bisa diakses dari web/aplikasi
5. **Schema-less** - Bisa tambah field baru tanpa ribet

### 📊 Diagram Konsep Database DARSI

```
┌─────────────────────────────────────────────────────┐
│         APLIKASI DARSI (Frontend)                   │
│         (Website/Antarmuka)                         │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ Kirim/Terima Data (HTTP)
                   │
┌──────────────────▼──────────────────────────────────┐
│    BACKEND (FastAPI) - Main Server                  │
│    Alamat: http://localhost:8000                    │
│    - Proses logika bisnis                           │
│    - Validasi data                                  │
│    - Atur akses & keamanan                          │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ Query/Perintah Database
                   │
┌──────────────────▼──────────────────────────────────┐
│    DATABASE (SurrealDB)                             │
│    Alamat: http://localhost:8000                    │
│    ┌─────────────────────────────────────────┐    │
│    │  Namespace: darsi                       │    │
│    │  Database: hospital                     │    │
│    │  ┌──────────────────────────────────┐   │    │
│    │  │ TABLE: users (Pengguna Sistem)   │   │    │
│    │  │ TABLE: pasien (Data Pasien)      │   │    │
│    │  │ TABLE: resources (Resource)      │   │    │
│    │  │ TABLE: cost_insurance (Asuransi) │   │    │
│    │  │ TABLE: api_config (Konfigurasi)  │   │    │
│    │  │ TABLE: audit_logs (Log Aktivitas)│   │    │
│    │  └──────────────────────────────────┘   │    │
│    └─────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

---

## Persiapan Awal

### Langkah 1️⃣: Install Aplikasi yang Diperlukan

Sebelum menjalankan sistem, pastikan Anda sudah install:

#### **Windows:**

1. **Docker Desktop** (untuk menjalankan SurrealDB)
   - Download: https://www.docker.com/products/docker-desktop
   - Install dan restart komputer

2. **Python 3.9+** (untuk backend)
   - Download: https://www.python.org/downloads/
   - Saat install, **CENTANG** opsi "Add Python to PATH"
   - Restart command prompt

3. **Git** (untuk clone project) - Opsional
   - Download: https://git-scm.com/

#### **Mac:**

```bash
# Install menggunakan Homebrew
brew install docker python3

# Atau download Docker Desktop dari: https://www.docker.com/products/docker-desktop
```

#### **Linux (Ubuntu/Debian):**

```bash
sudo apt update
sudo apt install docker.io python3 python3-pip
sudo usermod -aG docker $USER
```

### Langkah 2️⃣: Verifikasi Instalasi

Buka **Command Prompt** atau **Terminal**, ketik perintah berikut:

```bash
docker --version
python --version
```

**Contoh output yang benar:**
```
Docker version 24.0.0, build abcdef
Python 3.11.0
```

Jika sudah muncul versi, berarti instalasi berhasil! ✓

---

## Menjalankan Sistem Lengkap

### 🎯 3 Cara Menjalankan Sistem

Ada 3 cara untuk menjalankan sistem DARSI. Pilih salah satu:

---

### **CARA 1: Menggunakan Docker Compose (Recommended untuk Pemula) ⭐**

**Keuntungan:**
- Paling mudah
- Semua otomatis
- Database & Backend berjalan bersamaan
- Cocok untuk development & testing

**Langkah-langkah:**

1. **Buka folder project:**
   ```bash
   cd C:\Users\ACER NITRO\Documents\DARSIDUMMY\darsi_v2
   # atau
   cd /path/to/darsi_v2
   ```

2. **Jalankan Docker Compose:**
   ```bash
   docker-compose up -d
   ```

   **Output yang akan Anda lihat:**
   ```
   Creating network "darsi_darsi_network" with driver "bridge"
   Creating darsi_surrealdb ... done
   Creating darsi_backend ... done
   ```

3. **Tunggu sekitar 10-15 detik untuk semua container siap**

4. **Verifikasi semuanya sudah jalan:**
   ```bash
   docker-compose ps
   ```

   **Output yang benar:**
   ```
   NAME                    STATUS
   darsi_surrealdb         Up 10 seconds
   darsi_backend           Up 5 seconds
   ```

5. **Selesai!** Sistem sudah running:
   - 🌐 Frontend: http://localhost:5173 (buka di browser)
   - ⚙️ Backend API: http://localhost:8000
   - 🗄️ Database: http://localhost:8000 (SurrealDB)

---

### **CARA 2: Menjalankan SurrealDB & Backend Terpisah**

**Keuntungan:**
- Lebih kontrol
- Lebih mudah debug
- Cocok untuk development

**Langkah A: Jalankan SurrealDB saja**

```bash
# Start SurrealDB di Docker
docker-compose up -d surrealdb

# Tunggu 5 detik, lalu cek status
docker-compose ps
```

**Langkah B: Setup Backend (Python)**

```bash
# Masuk ke folder backend
cd backend

# Buat virtual environment (lingkungan Python terisolasi)
python -m venv venv

# Aktifkan virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup database tables (hanya dilakukan 1x)
python setup_tables.py

# Jalankan backend
python main.py
```

**Output backend yang benar:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

---

### **CARA 3: Menjalankan SurrealDB Manual (Advanced)**

Jika Docker tidak mau berjalan, bisa manual:

```bash
# Install SurrealDB CLI
# Windows: Download dari https://surrealdb.com/install
# Mac: brew install surrealdb
# Linux: cargo install surrealdb

# Jalankan SurrealDB dalam memory
surreal start --user root --pass root memory

# Di terminal lain, jalankan backend seperti CARA 2
```

---

## Struktur Database

### 📋 Tabel-tabel dalam Database DARSI

Database DARSI terdiri dari **6 tabel** utama. Mari kita pelajari masing-masing:

#### **1. TABLE: users (Pengguna Sistem)**

```
Fungsi: Menyimpan data pengguna yang bisa login ke sistem

Struktur Data:
┌─────────────────────────────────────────────────────┐
│ ID             : users:user123 (unique identifier)  │
│ email          : admin@darsi.com (email unik)       │
│ password       : hashed_password (enkripsi)         │
│ role           : admin, doctor, nurse (peran)       │
│ is_active      : true/false (aktif atau tidak)      │
│ created_at     : 2024-01-15T10:30:00Z (waktu buat)  │
└─────────────────────────────────────────────────────┘

Contoh data:
{
  "id": "users:user123",
  "email": "dokter@rumahsakit.com",
  "password": "$2b$12$...",
  "role": "doctor",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### **2. TABLE: pasien (Data Pasien)**

```
Fungsi: Menyimpan data pasien di rumah sakit

Struktur Data:
┌─────────────────────────────────────────────────────┐
│ ID             : pasien:P001 (nomor rekam medis)    │
│ no_rm          : RM20240115001 (no rekam medis)     │
│ nama           : Budi Santoso (nama pasien)         │
│ usia           : 45 (umur)                          │
│ jenis_kelamin  : Pria/Wanita                        │
│ alamat         : Jl. Raya No. 123                   │
│ created_at     : 2024-01-15T10:30:00Z               │
│ updated_at     : 2024-01-16T14:20:00Z               │
└─────────────────────────────────────────────────────┘

Contoh data:
{
  "id": "pasien:P001",
  "no_rm": "RM20240115001",
  "nama": "Budi Santoso",
  "usia": 45,
  "jenis_kelamin": "Pria",
  "alamat": "Jl. Raya No. 123",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-16T14:20:00Z"
}
```

#### **3. TABLE: resources (Sumber Daya)**

```
Fungsi: Menyimpan data resource (ruangan, peralatan, dll)

Struktur Data:
┌─────────────────────────────────────────────────────┐
│ ID             : resources:R001 (ID resource)       │
│ name           : ICU Room 101 (nama resource)       │
│ type           : room, equipment, staff (tipe)      │
│ status         : available, occupied (status)       │
│ capacity       : 4 (kapasitas untuk room)           │
│ cost_per_day   : 500000 (biaya/hari dalam Rp)       │
│ created_at     : 2024-01-15T10:30:00Z               │
└─────────────────────────────────────────────────────┘

Contoh data:
{
  "id": "resources:R001",
  "name": "ICU Room 101",
  "type": "room",
  "status": "available",
  "capacity": 4,
  "cost_per_day": 500000,
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### **4. TABLE: cost_insurance (Asuransi & Biaya)**

```
Fungsi: Menyimpan data biaya & asuransi pasien

Struktur Data:
┌─────────────────────────────────────────────────────┐
│ ID             : cost_insurance:C001                │
│ pasien_id      : pasien:P001 (link ke pasien)       │
│ insurance_type : BPJS, Asuransi Swasta, Umum        │
│ insurance_no   : BP123456789 (nomor asuransi)       │
│ cost           : 5000000 (total biaya Rp)           │
│ status         : pending, approved, rejected        │
│ created_at     : 2024-01-15T10:30:00Z               │
└─────────────────────────────────────────────────────┘

Contoh data:
{
  "id": "cost_insurance:C001",
  "pasien_id": "pasien:P001",
  "insurance_type": "BPJS",
  "insurance_no": "BP123456789",
  "cost": 5000000,
  "status": "approved",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### **5. TABLE: api_config (Konfigurasi Sistem)**

```
Fungsi: Menyimpan konfigurasi & setting sistem

Struktur Data:
┌─────────────────────────────────────────────────────┐
│ ID             : api_config:config_key (key config) │
│ key            : APP_NAME, VERSION, MODE (key)      │
│ value          : DARSI, 2.0, production (value)     │
│ updated_by     : users:user123 (siapa ubah)         │
│ updated_at     : 2024-01-15T10:30:00Z               │
└─────────────────────────────────────────────────────┘

Contoh data:
{
  "id": "api_config:app_mode",
  "key": "APP_MODE",
  "value": "production",
  "updated_by": "users:user123",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

#### **6. TABLE: audit_logs (Log Aktivitas)**

```
Fungsi: Mencatat setiap aktivitas user di sistem (untuk audit)

Struktur Data:
┌─────────────────────────────────────────────────────┐
│ ID             : audit_logs:log_123 (ID log)        │
│ user_id        : users:user123 (siapa)              │
│ action         : CREATE, UPDATE, DELETE, VIEW       │
│ resource       : pasien, resources, users (objek)   │
│ resource_id    : pasien:P001 (ID objek)             │
│ details        : {...} (detail perubahan)           │
│ created_at     : 2024-01-15T10:30:00Z               │
└─────────────────────────────────────────────────────┘

Contoh data:
{
  "id": "audit_logs:log_123",
  "user_id": "users:user123",
  "action": "CREATE",
  "resource": "pasien",
  "resource_id": "pasien:P001",
  "details": {
    "nama": "Budi Santoso",
    "usia": 45
  },
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

## Cara Mengecek Database

### 🔍 5 Cara Melihat & Memeriksa Database

---

### **CARA 1: Menggunakan SurrealDB Studio (GUI - Paling Mudah) ⭐**

**Studio adalah interface grafis untuk melihat database (seperti phpMyAdmin untuk MySQL)**

**Langkah-langkah:**

1. **Buka browser dan kunjungi:**
   ```
   https://studio.surrealdb.com
   ```

2. **Di bagian "URL", masukkan:**
   ```
   http://localhost:8000
   ```

3. **Di bagian "Auth", masukkan:**
   ```
   Namespace: darsi
   Database: hospital
   Username: root
   Password: root
   ```

4. **Klik Connect**

5. **Sekarang Anda bisa:**
   - 👀 Lihat semua table
   - 📊 Lihat data di setiap table
   - ➕ Tambah data baru
   - ✏️ Edit data
   - 🗑️ Hapus data
   - 🔍 Query database dengan SurrealQL

**Visualisasi:**
```
┌─────────────────────────────────────────────────┐
│  SurrealDB Studio (Browser)                     │
│  https://studio.surrealdb.com                   │
├─────────────────────────────────────────────────┤
│  Connection Info:                               │
│  ┌─────────────────────────────────────────┐   │
│  │ URL: http://localhost:8000              │   │
│  │ Namespace: darsi                        │   │
│  │ Database: hospital                      │   │
│  │ Username: root                          │   │
│  │ Password: root                          │   │
│  │                                         │   │
│  │ [Connect]                               │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Tables (di sebelah kiri):                      │
│  ✓ users          ✓ pasien                      │
│  ✓ resources      ✓ cost_insurance              │
│  ✓ api_config     ✓ audit_logs                  │
│                                                 │
│  Data Preview (di tengah):                      │
│  [Users Data ditampilkan di sini]               │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### **CARA 2: Menggunakan Terminal/Command Prompt**

**Untuk yang suka command line:**

1. **Buka terminal/command prompt di folder project:**
   ```bash
   cd C:\Users\ACER NITRO\Documents\DARSIDUMMY\darsi_v2
   ```

2. **Masuk ke backend:**
   ```bash
   cd backend
   ```

3. **Buka Python shell:**
   ```bash
   python
   ```

4. **Import database dan query:**
   ```python
   from database import get_db, query
   
   # Lihat semua users
   result = query('SELECT * FROM users')
   print(result)
   
   # Lihat semua pasien
   result = query('SELECT * FROM pasien')
   print(result)
   
   # Lihat 5 pasien pertama
   result = query('SELECT * FROM pasien LIMIT 5')
   print(result)
   
   # Keluar dari Python
   exit()
   ```

---

### **CARA 3: Menggunakan Python Script**

**Buat file `check_database.py` untuk melihat data:**

```python
# File: check_database.py
from backend.database import query

print("\n" + "="*60)
print("STATISTIK DATABASE DARSI")
print("="*60 + "\n")

# 1. Jumlah Users
users = query('SELECT * FROM users')
print(f"📊 Total Users: {len(users)}")
for user in users:
    print(f"   - {user.get('email')} ({user.get('role')})")

# 2. Jumlah Pasien
pasien = query('SELECT * FROM pasien')
print(f"\n📊 Total Pasien: {len(pasien)}")
for p in pasien:
    print(f"   - {p.get('nama')} (usia: {p.get('usia')})")

# 3. Jumlah Resources
resources = query('SELECT * FROM resources')
print(f"\n📊 Total Resources: {len(resources)}")
for r in resources:
    print(f"   - {r.get('name')} ({r.get('type')})")

# 4. Jumlah Cost Insurance
costs = query('SELECT * FROM cost_insurance')
print(f"\n📊 Total Cost Insurance: {len(costs)}")

# 5. Jumlah Audit Logs
logs = query('SELECT * FROM audit_logs')
print(f"\n📊 Total Audit Logs: {len(logs)}")

print("\n" + "="*60 + "\n")
```

**Jalankan:**
```bash
python check_database.py
```

---

### **CARA 4: Menggunakan API Endpoint**

**Buka browser atau gunakan curl:**

```bash
# Lihat info database
curl -X GET http://localhost:8000/api/health

# (Endpoint ini bisa Anda buat untuk check database status)
```

---

### **CARA 5: Melihat Docker Container Logs**

**Untuk debug masalah database:**

```bash
# Lihat log SurrealDB
docker-compose logs surrealdb

# Lihat log Backend
docker-compose logs backend

# Lihat log real-time (tekan Ctrl+C untuk keluar)
docker-compose logs -f
```

---

## Operasi Database Dasar

### 📝 Perintah-perintah SurrealQL Umum

SurrealQL adalah bahasa query untuk SurrealDB (mirip SQL).

#### **SELECT (Membaca/Mencari Data)**

```sql
-- Lihat semua data dalam tabel
SELECT * FROM users;

-- Lihat hanya email dan role dari users
SELECT email, role FROM users;

-- Cari user dengan email tertentu
SELECT * FROM users WHERE email = 'admin@darsi.com';

-- Lihat 5 pasien pertama
SELECT * FROM pasien LIMIT 5;

-- Cari pasien berdasarkan nama
SELECT * FROM pasien WHERE nama CONTAINS 'Budi';

-- Urutkan pasien berdasarkan usia (descending)
SELECT * FROM pasien ORDER BY usia DESC;
```

#### **CREATE (Membuat/Menambah Data Baru)**

```sql
-- Tambah user baru
CREATE users:new_user SET 
  email = 'dokter2@rumahsakit.com',
  password = 'hashed_password_here',
  role = 'doctor',
  is_active = true;

-- Tambah pasien baru
CREATE pasien:P002 SET
  no_rm = 'RM20240116001',
  nama = 'Siti Nurhaliza',
  usia = 32,
  jenis_kelamin = 'Wanita',
  alamat = 'Jl. Merdeka No. 456';
```

#### **UPDATE (Mengubah Data Existing)**

```sql
-- Ubah role user
UPDATE users:user123 SET role = 'admin';

-- Ubah status resource menjadi occupied
UPDATE resources:R001 SET status = 'occupied';

-- Increment usia pasien
UPDATE pasien:P001 SET usia += 1;
```

#### **DELETE (Menghapus Data)**

```sql
-- Hapus user tertentu
DELETE FROM users WHERE email = 'old_user@rumahsakit.com';

-- Hapus semua data dalam tabel (HATI-HATI!)
DELETE FROM audit_logs;
```

#### **INFO & STAT (Melihat Statistik)**

```sql
-- Lihat info database
INFO FOR DATABASE;

-- Lihat semua tabel yang ada
INFO FOR TABLE users;

-- Hitung jumlah data dalam tabel
SELECT COUNT() FROM users;
```

---

## Troubleshooting

### ❌ Masalah & Solusi

#### **Masalah 1: "Cannot connect to Docker daemon"**

**Penyebab:** Docker tidak berjalan

**Solusi:**
```bash
# Jalankan Docker Desktop (Windows/Mac)
# Atau start Docker daemon (Linux)
sudo service docker start

# Cek status Docker
docker ps
```

---

#### **Masalah 2: "Port 8000 already in use"**

**Penyebab:** Port 8000 sudah dipakai aplikasi lain

**Solusi:**

```bash
# Opsi 1: Stop aplikasi lain yang menggunakan port 8000
# Opsi 2: Ubah port di docker-compose.yml

# File: docker-compose.yml
# Ubah baris ini:
# ports:
#   - "8000:8000"
# Menjadi:
# ports:
#   - "8001:8000"

# Kemudian:
docker-compose down
docker-compose up -d
```

---

#### **Masalah 3: "SurrealDB connection failed"**

**Penyebab:** Backend tidak bisa connect ke SurrealDB

**Solusi:**

```bash
# 1. Cek apakah SurrealDB container berjalan
docker-compose ps

# 2. Lihat log SurrealDB
docker-compose logs surrealdb

# 3. Cek .env file
cat .env

# Output harus ada:
# SURREALDB_HOST=http://surrealdb:8000
# SURREALDB_USER=root
# SURREALDB_PASS=root

# 4. Restart container
docker-compose restart surrealdb
```

---

#### **Masalah 4: "Tables not created"**

**Penyebab:** setup_tables.py tidak dijalankan

**Solusi:**

```bash
cd backend

# Jalankan setup
python setup_tables.py

# Harus output:
# Creating tables...
# ✓ CREATE users
# ✓ CREATE pasien
# ... dll
```

---

#### **Masalah 5: "Module 'surrealdb' not found"**

**Penyebab:** Python package belum diinstall

**Solusi:**

```bash
# Pastikan virtual environment aktif
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Install packages
pip install -r requirements.txt

# Atau install langsung
pip install surrealdb
```

---

## Resource & Links Berguna

### 📚 Dokumentasi Resmi

- **SurrealDB Official**: https://surrealdb.com
- **SurrealDB Documentation**: https://surrealdb.com/docs
- **SurrealDB Studio**: https://studio.surrealdb.com
- **SurrealQL Reference**: https://surrealdb.com/docs/surrealql

### 🎓 Tutorial & Pembelajaran

- **SurrealDB YouTube**: https://www.youtube.com/@surrealdb
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Docker Docs**: https://docs.docker.com
- **Python Docs**: https://docs.python.org

### 🛠️ Tools Berguna

- **SurrealDB CLI**: https://surrealdb.com/install
- **Postman** (untuk test API): https://www.postman.com
- **Visual Studio Code**: https://code.visualstudio.com
- **Docker Desktop**: https://www.docker.com/products/docker-desktop

### 📱 CheatSheet SurrealQL

```sql
-- SELECT
SELECT * FROM users;
SELECT email, role FROM users WHERE role = 'doctor';

-- CREATE
CREATE pasien SET nama = 'Budi', usia = 45;

-- UPDATE
UPDATE users:123 SET role = 'admin';

-- DELETE
DELETE FROM users WHERE email = 'old@email.com';

-- COUNT
SELECT COUNT() FROM pasien;

-- GROUP BY
SELECT role, COUNT() as total FROM users GROUP BY role;

-- ORDER & LIMIT
SELECT * FROM pasien ORDER BY usia DESC LIMIT 10;
```

---

## 🎯 Checklist untuk Memulai

Gunakan checklist ini untuk memastikan semuanya berjalan:

- [ ] Docker sudah install dan berjalan
- [ ] Python 3.9+ sudah install
- [ ] Folder project sudah dicopy
- [ ] Virtual environment sudah dibuat
- [ ] `pip install -r requirements.txt` sudah dijalankan
- [ ] Database tables sudah dibuat (`python setup_tables.py`)
- [ ] Backend running (`python main.py` atau `docker-compose up`)
- [ ] Bisa connect ke SurrealDB Studio (https://studio.surrealdb.com)
- [ ] Bisa akses Frontend (http://localhost:5173)
- [ ] Bisa akses API (http://localhost:8000/docs)

---

## 💡 Tips & Trik

### ✅ Best Practices

1. **Selalu backup data**
   ```bash
   docker-compose exec surrealdb surreal export file://backup.surql
   ```

2. **Gunakan virtual environment Python**
   - Jangan install packages di Python global
   - Gunakan `venv` untuk setiap project

3. **Monitor logs saat development**
   ```bash
   docker-compose logs -f
   ```

4. **Bersihkan container lama**
   ```bash
   docker system prune
   ```

5. **Jangan commit .env ke Git**
   - Tambahkan `.env` ke `.gitignore`
   - Gunakan `.env.example` untuk template

---

## ❓ FAQ (Pertanyaan Umum)

**Q: Apakah perlu restart computer setelah install?**
A: Ya, terutama saat first time install Docker dan Python.

**Q: Bisakah saya gunakan database lain selain SurrealDB?**
A: Ya, tapi harus ubah code di `database.py`. Tidak recommended untuk project ini.

**Q: Apakah data akan hilang saat restart container?**
A: Tergantung storage type di `docker-compose.yml`. Dengan `volumes: surrealdb_data`, data akan bertahan.

**Q: Bagaimana cara export data dari SurrealDB?**
A: Bisa menggunakan SurrealDB Studio atau command: `surreal export`

**Q: Apakah bisa akses database dari komputer lain?**
A: Ya, ubah `SURREALDB_HOST` ke IP address komputer (misal: `http://192.168.1.100:8000`)

---

**Semoga dokumentasi ini membantu! Jika ada pertanyaan, hubungi developer team. 🚀**

*Last Updated: May 2024*
*Version: 1.0*
