# 🗄️ Panduan Integrasi SurrealDB dengan Docker

## 📋 Daftar Isi
1. [Prerequisite](#prerequisite)
2. [Quick Start](#quick-start)
3. [Konfigurasi](#konfigurasi)
4. [Migrasi Data](#migrasi-data)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## 📦 Prerequisite

Pastikan Anda sudah menginstall:
- **Docker** (v20.10+) - [Download Docker](https://www.docker.com/products/docker-desktop)
- **Docker Compose** (v1.29+)
- **Python** (v3.9+)
- **Git**

### Verifikasi Instalasi
```bash
docker --version
docker-compose --version
python --version
```

---

## 🚀 Quick Start

### 1. Clone Repository & Setup Environment
```bash
# Navigate ke project directory
cd darsi_v2

# Copy environment file
cp .env.example .env

# Edit .env sesuai kebutuhan (opsional)
# SURREALDB_HOST=http://localhost:8080
# SURREALDB_USER=root
# SURREALDB_PASS=root
```

### 2. Jalankan SurrealDB dengan Docker
```bash
# Start SurrealDB container
docker-compose up -d surrealdb

# Verifikasi SurrealDB running
docker-compose ps

# Check logs
docker-compose logs -f surrealdb
```

**Expected Output:**
```
✓ Connected to SurrealDB at http://localhost:8080
```

### 3. Install Python Dependencies
```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

### 4. Jalankan Backend
```bash
# Windows
python main.py

# Linux/Mac
python main.py
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## ⚙️ Konfigurasi

### Environment Variables

Edit file `.env`:

```env
# SurrealDB Configuration
SURREALDB_HOST=http://localhost:8080      # URL SurrealDB
SURREALDB_USER=root                        # Username
SURREALDB_PASS=root                        # Password
SURREALDB_NS=darsi                        # Namespace
SURREALDB_DB=hospital                     # Database name

# FastAPI
FASTAPI_ENV=development
FASTAPI_DEBUG=true

# Frontend
VITE_API_URL=http://localhost:8000
```

### Docker Compose Configuration

File `docker-compose.yml` menyediakan:

```yaml
services:
  surrealdb:
    image: surrealdb/surrealdb:latest
    ports:
      - "8080:8080"
    volumes:
      - surrealdb_data:/data
    command: start --user root --pass root file:/data/surreal.db
```

**Opsi Command SurrealDB:**

| Mode | Command | Use Case |
|------|---------|----------|
| File-based | `start file:/data/surreal.db` | Production (persisten) |
| Memory | `start --log trace memory` | Development/Testing |
| TLS | `start --crt cert.pem --key key.pem` | Secure Connection |

---

## 📊 Migrasi Data

### Opsi 1: Dari SQLite ke SurrealDB

```bash
# Run migration script
python migrate_to_surrealdb.py
```

Script ini akan:
1. Membaca data dari SQLite
2. Transform data format
3. Insert ke SurrealDB

### Opsi 2: Manual Migration

```python
# backend/main.py
from database import SurrealDBConnection

# Di startup
@app.on_event("startup")
async def startup():
    db = await SurrealDBConnection().connect()
    
    # Create tables
    await db.query("""
        DEFINE TABLE users SCHEMAFULL;
        DEFINE FIELD email ON users TYPE string;
        DEFINE FIELD password ON users TYPE string;
        DEFINE FIELD role ON users TYPE string;
    """)
    
    print("✓ Database schema created")
```

### Opsi 3: Menggunakan SurrealQL

```bash
# Access SurrealDB shell via Docker
docker-compose exec surrealdb surreal sql \
  --username root \
  --password root \
  --namespace darsi \
  --database hospital

# Di SurrealQL shell:
> USE ns darsi db hospital;
> DEFINE TABLE users SCHEMAFULL;
> INSERT INTO users {
    email: 'admin@darsi.local',
    password: 'hashed_password',
    role: 'admin',
    created_at: time::now()
  };
```

---

## ✅ Testing

### 1. Test SurrealDB Connection

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs surrealdb

# Access SurrealDB web interface
# Browser: http://localhost:8080
```

### 2. Test Backend Connection

```bash
cd backend

# Run connection test
python -c "
import asyncio
from database import SurrealDBConnection

async def test():
    db = await SurrealDBConnection().connect()
    print('✓ Connected to SurrealDB')
    await db.disconnect()

asyncio.run(test())
"
```

### 3. Test API Endpoints

```bash
# Get users
curl http://localhost:8000/api/users

# Create user
curl -X POST http://localhost:8000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@darsi.local","role":"user"}'
```

### 4. Test dengan Postman

1. Import collection (jika tersedia)
2. Test endpoints:
   - `GET /api/health` - Health check
   - `GET /api/users` - List users
   - `POST /api/users` - Create user

### 5. Test dengan SurrealDB Studio (GUI) ⭐ RECOMMENDED

**SurrealDB Studio** adalah graphical interface resmi untuk mengelola database (seperti phpMyAdmin untuk MySQL).

#### Akses Studio:

1. **Buka browser ke:** https://studio.surrealdb.com
2. **Input connection details:**
   ```
   URL: http://localhost:8000
   Namespace: darsi
   Database: hospital
   Username: root
   Password: root
   ```
3. **Klik "Connect"**

#### Fitur Studio:

```
┌─────────────────────────────────────────────────────┐
│  SurrealDB Studio                                   │
├─────────────────────────────────────────────────────┤
│  Left Sidebar (Tables):          │  Right Panel:     │
│  ├─ users                        │  View/Edit Data   │
│  ├─ pasien                       │  Run Queries      │
│  ├─ resources                    │  Export/Import    │
│  ├─ cost_insurance               │  Settings         │
│  ├─ api_config                   │                   │
│  ├─ audit_logs                   │                   │
└─────────────────────────────────────────────────────┘
```

#### Common Tasks di Studio:

| Task | Steps |
|------|-------|
| **Lihat data tabel** | Klik table name di sidebar → Lihat data di kanan |
| **Query custom** | Tab "Query" → Ketik SurrealQL → Click "Run" |
| **Tambah record** | Tab "Insert" → Isi field → Click "Submit" |
| **Edit record** | Klik row → Edit fields → Save |
| **Delete record** | Klik row → Delete button |
| **Export data** | Tab "Export" → Choose format → Download |
| **Import data** | Tab "Import" → Upload file → Confirm |

#### Example Queries di Studio:

```sql
-- Lihat semua users
SELECT * FROM users;

-- Lihat pasien dengan usia > 40
SELECT * FROM pasien WHERE usia > 40;

-- Hitung total resources
SELECT COUNT() FROM resources;

-- Group by role dan hitung
SELECT role, COUNT() as total FROM users GROUP BY role;

-- Update data
UPDATE users:user123 SET role = 'admin';

-- Delete data
DELETE FROM pasien WHERE usia < 18;
```

---

## 🐛 Troubleshooting

### SurrealDB tidak bisa connect

```bash
# Check jika container sudah running
docker-compose ps

# Lihat error logs
docker-compose logs surrealdb

# Restart container
docker-compose restart surrealdb

# Reset (warning: hapus data)
docker-compose down -v
docker-compose up -d surrealdb
```

### Port 8080 sudah terpakai

```bash
# Lihat proses di port 8080
# Windows
netstat -ano | findstr :8080

# Linux/Mac
lsof -i :8080

# Ubah port di docker-compose.yml
ports:
  - "8081:8080"  # Map ke 8081
```

### Memory issue

```yaml
# Kurangi resource usage di docker-compose.yml
services:
  surrealdb:
    deploy:
      resources:
        limits:
          memory: 512M
```

### Python surrealdb module tidak found

```bash
# Install ulang
pip install --upgrade surrealdb

# Verify
python -c "import surrealdb; print(surrealdb.__version__)"
```

### Cannot connect dari backend ke SurrealDB

```bash
# Verify network connection
docker-compose exec backend ping surrealdb

# Check SurrealDB listening
docker-compose exec surrealdb netstat -tlnp | grep 8080

# Verify environment variables
docker-compose exec backend env | grep SURREALDB
```

---

## 📝 Best Practices

### 1. Security
```env
# ❌ Jangan gunakan default credentials di production
SURREALDB_USER=root
SURREALDB_PASS=root

# ✅ Gunakan strong password
SURREALDB_PASS=your_strong_password_here
```

### 2. Backup & Restore
```bash
# Backup data
docker-compose exec surrealdb surreal export \
  --user root \
  --pass root \
  --namespace darsi \
  --database hospital \
  > backup.surql

# Restore data
docker-compose exec surrealdb surreal import \
  --user root \
  --pass root \
  --namespace darsi \
  --database hospital \
  < backup.surql
```

### 3. Monitoring
```bash
# Monitor resource usage
docker stats darsi_surrealdb

# View real-time logs
docker-compose logs -f --tail=100 surrealdb
```

### 4. Production Setup
```yaml
# docker-compose.prod.yml
services:
  surrealdb:
    image: surrealdb/surrealdb:latest
    restart: always
    volumes:
      - surrealdb_data:/data
    environment:
      - SURREAL_USER=${SURREALDB_USER}
      - SURREAL_PASS=${SURREALDB_PASS}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Run: `docker-compose -f docker-compose.prod.yml up -d`

---

## 📚 Referensi Berguna

- [SurrealDB Official Docs](https://surrealdb.com/docs)
- [SurrealDB Docker Hub](https://hub.docker.com/r/surrealdb/surrealdb)
- [SurrealDB Python SDK](https://github.com/surrealdb/surrealdb.py)
- [SurrealQL Documentation](https://surrealdb.com/docs/surrealql)

---

## 🎯 Next Steps

1. ✅ Setup Docker dan docker-compose.yml
2. ✅ Jalankan SurrealDB container
3. ✅ Configure backend untuk connect ke SurrealDB
4. ✅ Migrasi data dari SQLite (jika ada)
5. ✅ Test semua endpoints
6. ✅ Deploy ke production

**Butuh bantuan?** Lihat section Troubleshooting atau refer ke dokumentasi resmi.
