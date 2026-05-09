installHook.js:1 Error: useAuthentication must be used within an AuthProvider
    at Vd (head-BhIYt2W7.js:712:15304)
    at mX (input-Bt-1knRh.js:2:87638)
    at hy (head-BhIYt2W7.js:735:48033)
    at b6 (head-BhIYt2W7.js:735:70826)
    at wW (head-BhIYt2W7.js:735:81136)
    at HW (head-BhIYt2W7.js:735:116819)
    at H7e (head-BhIYt2W7.js:735:115858)
    at u$ (head-BhIYt2W7.js:735:115686)
    at NW (head-BhIYt2W7.js:735:112496)
    at OY (head-BhIYt2W7.js:735:124217)
overrideMethod @ installHook.js:1
# 🚀 QUICK START GUIDE - DARSI v2.0

**Start dari nol? Ikuti panduan ini step-by-step!**

---

## ⏱️ 5 Menit Setup (Pilih Salah Satu)

### ⭐ OPSI A: Run Everything in 1 Terminal (RECOMMENDED!)

**Tidak perlu 3 terminal lagi! Jalankan semuanya dalam 1 terminal:**

#### Windows:
```bash
cd C:\Users\ACER NITRO\Documents\DARSIDUMMY\darsi_v2
.\run_all.ps1
```

#### Mac/Linux:
```bash
cd /path/to/darsi_v2
chmod +x run_all.sh
./run_all.sh
```

#### Any Platform (if make installed):
```bash
make run
```

**= Semua services (Docker + Backend + Frontend) akan jalan dalam 1 terminal! 🎉**

---

### OPSI B: Traditional Way (3 Terminals)

Jika prefer cara manual dengan 3 terminal:

**Terminal 1:**
```bash
docker-compose up -d
```

**Terminal 2:**
```bash
cd backend
python main.py
```

**Terminal 3:**
```bash
cd frontend
npm run dev
```

### Step 3: Verifikasi Semua Berjalan

```bash
docker-compose ps
```

**Output harus:**
```
NAME                    STATUS
darsi_surrealdb         Up 10 seconds
darsi_backend           Up 5 seconds
```

(Untuk OPSI B manual, skip step ini)

### Step 4: Akses Aplikasi

| Aplikasi | URL |
|----------|-----|
| 🌐 Frontend | http://localhost:5173 |
| 📚 API Docs | http://localhost:8000/docs |
| 🗄️ Database | https://studio.surrealdb.com |

---

## 🔍 Cara Cek Database (Pilih 1)

### Opsi A: Visual (Paling Mudah)

1. Buka: https://studio.surrealdb.com
2. Input:
   - URL: `http://localhost:8000`
   - Namespace: `darsi`
   - Database: `hospital`
   - User: `root`
   - Password: `root`
3. Klik Connect → Lihat data

### Opsi B: Terminal

```bash
# Dari folder project
python check_database.py
```

**Output:**
```
✓ DATABASE CONNECTION STATUS
✓ Successfully connected to SurrealDB
📋 DATABASE TABLES
✓ users
✓ pasien
✓ resources
... dll
```

### Opsi C: Python Shell

```bash
cd backend
python

# Di Python shell:
from database import query
result = query('SELECT * FROM users')
print(result)
```

---

## ⏹️ Stopping Services

**Jika menggunakan OPSI A (run_all script):**
```
Tekan Ctrl+C di terminal
Semua services akan berhenti otomatis
```

**Jika menggunakan OPSI B (manual 3 terminals):**
```
Terminal 1-3: Tekan Ctrl+C di masing-masing
Lalu: docker-compose down
```

---

## 📚 Full Documentation

Untuk guide lengkap dengan troubleshooting & tips:
- **[RUN_ALL_SERVICES_GUIDE.md](./RUN_ALL_SERVICES_GUIDE.md)** ← Run everything in 1 terminal!
- **[DATABASE_GUIDE.md](./DATABASE_GUIDE.md)** ← Complete database guide
- **[DOCKER_COMMANDS_CHEATSHEET.md](./DOCKER_COMMANDS_CHEATSHEET.md)** ← Commands reference

---

## 📋 Struktur Database Singkat

| Tabel | Fungsi |
|-------|--------|
| **users** | Data pengguna sistem |
| **pasien** | Data pasien rumah sakit |
| **resources** | Ruangan, alat medis, dll |
| **cost_insurance** | Biaya & asuransi pasien |
| **api_config** | Konfigurasi sistem |
| **audit_logs** | Log aktivitas pengguna |

---

## ❌ Troubleshooting Cepat

### Problem: "Cannot connect to Docker daemon"

```bash
# Buka Docker Desktop (Windows/Mac)
# atau jalankan (Linux):
sudo service docker start
```

### Problem: "Port already in use"

```bash
# Edit docker-compose.yml
# Ubah port 8000 → 8001

docker-compose down
docker-compose up -d
```

### Problem: "Connection refused"

```bash
# Restart containers
docker-compose restart

# atau
docker-compose down
docker-compose up -d
```

### Problem: "Tables not created"

```bash
cd backend
python setup_tables.py
```

---

## 📚 Dokumentasi Lengkap

Lihat file-file berikut untuk info detail:

- 📖 **DATABASE_GUIDE.md** - Panduan database komprehensif untuk pemula
- 🔧 **SURREALDB_SETUP.md** - Setup SurrealDB dengan Docker
- 📋 **ARCHITECTURE.md** - Arsitektur sistem
- 🐳 **docker-compose.yml** - Konfigurasi container

---

## 🎯 Checklist Awal

- [ ] Docker sudah installed & running
- [ ] `docker-compose up -d` berjalan sukses
- [ ] Semua container running (`docker-compose ps`)
- [ ] Bisa akses Studio (https://studio.surrealdb.com)
- [ ] Bisa akses API (http://localhost:8000/docs)

---

## 💡 Tips

1. **Monitor logs real-time:**
   ```bash
   docker-compose logs -f
   ```

2. **Stop semua container:**
   ```bash
   docker-compose down
   ```

3. **Reset database (hapus semua data):**
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

4. **Backup database:**
   ```bash
   docker-compose exec surrealdb surreal export \
     --user root --pass root \
     --namespace darsi --database hospital \
     > backup.surql
   ```

---

## 🆘 Butuh Bantuan?

1. Baca **DATABASE_GUIDE.md** (most comprehensive)
2. Check troubleshooting section di dokumentasi
3. Lihat logs: `docker-compose logs`
4. Verify connection: `python check_database.py`

---

**Good luck! 🎉**
