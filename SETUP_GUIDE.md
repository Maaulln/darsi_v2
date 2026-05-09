# 🚀 DARSI SurrealDB Setup & Migration Guide

## 📋 Daftar Isi
1. [Install Dependencies](#install-dependencies)
2. [SurrealDB Installation](#surrealdb-installation)
3. [Backend Configuration](#backend-configuration)
4. [Database Migration](#database-migration)
5. [SurrealDB Queries](#surrealdb-queries)
6. [Access Superadmin Dashboard](#access-superadmin-dashboard)
7. [Troubleshooting](#troubleshooting)

---

## 1️⃣ Install Dependencies

### Backend
```bash
cd backend
pip install -r requirements.txt
```

### Frontend
```bash
cd frontend
npm install
```

---

## 2️⃣ SurrealDB Installation

### Option A: Download Binary (Recommended)

**Windows:**
1. Download dari: https://surrealdb.com/install
2. Extract ke folder (misal: `C:\surrealdb`)
3. Tambah ke PATH environment variable

**macOS:**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://install.surrealdb.com | sh
```

**Linux:**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://install.surrealdb.com | sh
```

### Option B: Using Docker

```bash
docker run --rm -p 8080:8080 surrealdb/surrealdb:latest start \
  --user root --pass root \
  memory
```

### Option C: Build from Source

```bash
git clone https://github.com/surrealdb/surrealdb.git
cd surrealdb
cargo build --release
```

---

## 3️⃣ Backend Configuration

### Step 1: Create `.env` file

File sudah ada di `backend/.env`, pastikan konfigurasi:

```env
# SurrealDB Configuration
SURREALDB_HOST=http://localhost:8080
SURREALDB_USER=root
SURREALDB_PASS=root
SURREALDB_NS=darsi
SURREALDB_DB=hospital

# Superadmin Default
SUPERADMIN_EMAIL=admin@darsi.local
SUPERADMIN_PASSWORD=Admin@12345

# API Configuration
API_HOST=localhost
API_PORT=8000
API_ENV=development
```

### Step 2: Update existing routers untuk SurrealDB

Jika Anda memiliki routers yang masih menggunakan SQLite, update seperti ini:

**Old (SQLite):**
```python
from database import query

def get_patients():
    return query("SELECT * FROM pasien")
```

**New (SurrealDB):**
```python
from fastapi import Depends
from database import get_db

async def get_patients(db = Depends(get_db)):
    patients = await db.select("pasien")
    return patients
```

---

## 4️⃣ Database Migration

### Step 1: Start SurrealDB Server

**Terminal 1 (Windows):**
```bash
surreal start --bind 127.0.0.1:8080 --user root --pass root memory
```

**Terminal 1 (macOS/Linux):**
```bash
surreal start --bind 127.0.0.1:8080 --user root --pass root memory
```

Atau dengan Docker:
```bash
docker run -p 8080:8080 surrealdb/surrealdb:latest start \
  --user root --pass root memory
```

**Output yang diharapkan:**
```
✓ Started web server on 0.0.0.0:8080
✓ Started database engine
```

### Step 2: Start Backend

**Terminal 2:**
```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Output yang diharapkan:**
```
✓ Connected to SurrealDB: darsi/hospital
✓ Superadmin user created: admin@darsi.local
✓ Database initialized successfully
✓ Uvicorn running on http://0.0.0.0:8000
```

### Step 3: Verify Database

Akses SurrealDB Console di: http://localhost:8080

```sql
-- Lihat semua tables
INFO FOR DB;

-- Lihat struktur table users
INFO FOR TABLE users;

-- Cek superadmin user
SELECT * FROM users WHERE role = 'superadmin';

-- Cek configs
SELECT * FROM api_config;
```

---

## 5️⃣ SurrealDB Queries

### Users Management

```sql
-- Create new user
CREATE users SET 
  email = 'user@example.com',
  password = sha256('password123'),
  role = 'admin',
  is_active = true;

-- Get all users
SELECT * FROM users;

-- Get user by email
SELECT * FROM users WHERE email = 'admin@darsi.local';

-- Update user
UPDATE users:your_user_id SET role = 'superadmin', is_active = false;

-- Delete user
DELETE FROM users WHERE email = 'old@example.com';

-- Get active users only
SELECT * FROM users WHERE is_active = true;

-- Count users by role
SELECT role, count() FROM users GROUP BY role;
```

### API Configuration

```sql
-- Get all configurations
SELECT * FROM api_config;

-- Get specific config
SELECT * FROM api_config WHERE key = 'api_title';

-- Update config
UPDATE api_config:api_title SET value = 'DARSI SIMRS v2.0';

-- Create new config
CREATE api_config SET
  key = 'enable_auth',
  value = true,
  updated_by = 'admin@darsi.local';

-- Delete config
DELETE FROM api_config WHERE key = 'deprecated_setting';

-- List all maintenance configs
SELECT * FROM api_config WHERE key CONTAINS 'maintenance';
```

### Patients Data

```sql
-- Migrate dari SQLite ke SurrealDB
-- (Lakukan sebelumnya di SQLite, export ke CSV/JSON)

-- Create patient
CREATE pasien SET
  no_rm = 'RM001',
  nama = 'John Doe',
  usia = 35;

-- Get all patients
SELECT * FROM pasien;

-- Find patient by RM number
SELECT * FROM pasien WHERE no_rm = 'RM001';

-- Update patient
UPDATE pasien:patient_id SET usia = 36;

-- Get patients by age range
SELECT * FROM pasien WHERE usia >= 20 AND usia <= 50;

-- Count patients
SELECT count() FROM pasien;
```

### Audit Logs

```sql
-- Get all audit logs
SELECT * FROM audit_logs;

-- Get recent logs (last 24 hours)
SELECT * FROM audit_logs 
WHERE created_at > time::now() - 24h
ORDER BY created_at DESC;

-- Get logs by user
SELECT * FROM audit_logs WHERE user_id = 'superadmin';

-- Get logs by action
SELECT * FROM audit_logs WHERE action = 'CREATE_USER';

-- Get logs by resource
SELECT * FROM audit_logs WHERE resource CONTAINS 'api_config';

-- Clear old logs (older than 30 days)
DELETE FROM audit_logs WHERE created_at < time::now() - 30d;
```

### Advanced Queries

```sql
-- Get user statistics
SELECT 
  role,
  count() as total,
  count(WHERE is_active = true) as active,
  count(WHERE is_active = false) as inactive
FROM users
GROUP BY role;

-- Get audit summary by action
SELECT 
  action,
  count() as count,
  max(created_at) as last_action
FROM audit_logs
GROUP BY action
ORDER BY count DESC;

-- Find users with recent activity
SELECT users.*, count(audit_logs) as activity_count
FROM users
LEFT JOIN audit_logs ON users.id = audit_logs.user_id
GROUP BY users.id
LIMIT 10;

-- Export users as JSON
SELECT {
  id,
  email,
  role,
  is_active,
  created_at
} as user
FROM users;
```

---

## 6️⃣ Access Superadmin Dashboard

### Start Frontend

**Terminal 3:**
```bash
cd frontend
npm run dev
```

**Output yang diharapkan:**
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5174/
  ➜  press h to show help
```

### Login to Superadmin

1. Kunjungi: `http://localhost:5174/superadmin`
2. Login dengan credentials default:
   - **Email:** `admin@darsi.local`
   - **Password:** `Admin@12345`

### Dashboard Features

**📊 Overview Tab:**
- Total users, patients, configurations
- Recent activity logs
- System statistics

**⚙️ Configuration Tab:**
- View all API configurations
- Add new configuration
- Update existing configuration
- Delete configuration

**👥 Users Tab:**
- View all users with roles
- Create new user
- Delete user
- View user status

**📝 Audit Logs Tab:**
- View all system activities
- Filter by action, user, resource
- Timestamp dan details untuk setiap action

---

## 7️⃣ Data Migration from SQLite to SurrealDB

### Option A: Using Python Script

```python
# migrate_to_surrealdb.py
import sqlite3
import asyncio
import json
from surrealdb import Surreal

async def migrate():
    # Connect to SurrealDB
    db = Surreal("http://localhost:8080")
    await db.connect()
    await db.signin({"user": "root", "pass": "root"})
    await db.use("darsi", "hospital")
    
    # Connect to SQLite
    sqlite_conn = sqlite3.connect("backend/darsi_clean.db")
    sqlite_cursor = sqlite_conn.cursor()
    
    # Migrate Patients
    sqlite_cursor.execute("SELECT * FROM pasien")
    patients = sqlite_cursor.fetchall()
    
    for patient in patients:
        await db.create("pasien", {
            "no_rm": patient[0],
            "nama": patient[1],
            "usia": patient[2]
        })
    
    print(f"✓ Migrated {len(patients)} patients")
    
    await db.close()
    sqlite_conn.close()

# Run migration
asyncio.run(migrate())
```

**Jalankan:**
```bash
python migrate_to_surrealdb.py
```

### Option B: Export/Import menggunakan Surreal CLI

```bash
# Export dari SQLite ke JSON
sqlite3 backend/darsi_clean.db \
  "SELECT * FROM pasien;" | \
  jq -R 'split("|") | {no_rm: .[0], nama: .[1], usia: .[2]}' \
  > patients.json

# Import ke SurrealDB
surreal import --conn http://localhost:8080 \
  --user root --pass root \
  --ns darsi --db hospital \
  patients.json
```

---

## 8️⃣ Troubleshooting

### ❌ CORS Error

**Problem:** 
```
Access to fetch at 'http://localhost:8000/api/dashboard' from origin 'http://localhost:5174' has been blocked by CORS policy
```

**Solution:**
Pastikan `backend/main.py` memiliki port 5174:
```python
allow_origins=[
    "http://localhost:5173",
    "http://localhost:5174",  # ← Add this
    ...
]
```

Restart backend.

---

### ❌ SurrealDB Connection Error

**Problem:**
```
✗ Failed to connect to SurrealDB: Connection refused
```

**Solution:**
1. Pastikan SurrealDB server berjalan di port 8080
2. Check `.env` file untuk konfigurasi yang benar
3. Restart SurrealDB server

```bash
# Test connection
curl http://localhost:8080/health
```

---

### ❌ Module Import Error

**Problem:**
```
ModuleNotFoundError: No module named 'surrealdb'
```

**Solution:**
```bash
pip install surrealdb python-dotenv
```

---

### ❌ Superadmin Dashboard Blank

**Problem:** Dashboard tidak menampilkan data

**Solution:**
1. Check browser console untuk error
2. Verify backend running: `http://localhost:8000/docs`
3. Check CORS headers di network tab
4. Restart backend dengan: `uvicorn main:app --reload`

---

### ❌ Database Tables Not Found

**Problem:**
```
Table 'users' not found
```

**Solution:**
1. Ensure backend started berhasil (check console)
2. Database initialization akan otomatis membuat tables
3. Jika masih error, run initialization manual:

```python
# Dari Python REPL
from backend.database import init_db
import asyncio

asyncio.run(init_db())
```

---

## ✅ Verification Checklist

- [ ] SurrealDB server berjalan di port 8080
- [ ] Backend connected ke SurrealDB (check console logs)
- [ ] Superadmin user created
- [ ] Frontend dapat diakses di port 5174
- [ ] CORS tidak error
- [ ] Superadmin dashboard bisa login
- [ ] Dapat membuat/update/delete configurations
- [ ] Audit logs terekam

---

## 📚 Useful Resources

- **SurrealDB Documentation:** https://surrealdb.com/docs
- **SurrealDB SQL Reference:** https://surrealdb.com/docs/surrealql
- **FastAPI Documentation:** https://fastapi.tiangolo.com
- **React Router:** https://reactrouter.com

---

## 🆘 Need Help?

1. Check SurrealDB console: http://localhost:8080
2. Check FastAPI docs: http://localhost:8000/docs
3. Check browser console untuk frontend errors
4. Check terminal output untuk backend logs

---

**Last Updated:** May 6, 2026
**DARSI Version:** 2.0.0
**SurrealDB:** Latest Stable
