# 🏥 DARSI v2.0 - Hospital Management System

> **DARSI** - Sistem Informasi Rumah Sakit Terintegrasi dengan SurrealDB, FastAPI, dan React

[![Version](https://img.shields.io/badge/version-2.0.0-blue)]()
[![Status](https://img.shields.io/badge/status-Ready-green)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

---

## 📋 Daftar Isi

- [✨ Features](#-features)
- [🔧 Requirements](#-requirements)
- [🚀 Quick Start](#-quick-start)
- [📚 Documentation](#-documentation)
- [🎯 File Structure](#-file-structure)
- [⚙️ Configuration](#️-configuration)
- [📊 API Endpoints](#-api-endpoints)
- [🐛 Troubleshooting](#-troubleshooting)
- [📞 Support](#-support)

---

## ✨ Features

### 🏥 Core Features
- **Dashboard:** Visualisasi data pasien dan statistik rumah sakit
- **Resource Management:** Manajemen sumber daya rumah sakit
- **Cost Insurance:** Tracking biaya dan asuransi pasien
- **Patient Experience:** Monitoring pengalaman pasien

### 🔐 Superadmin Dashboard (NEW)
- **Configuration Management:** Kelola API settings secara real-time
- **User Management:** Buat, edit, hapus pengguna dengan role berbeda
- **Audit Logging:** Track semua aktivitas sistem
- **Statistics:** Dashboard dengan metrik real-time

### 🗄️ Database
- **SurrealDB:** NoSQL database yang fleksibel dan powerful
- **Schema Support:** Predefined dan dynamic schemas
- **Real-time Queries:** Query execution yang cepat
- **Audit Trail:** Automatic tracking of all changes

### 🔄 Integration
- **RESTful API:** FastAPI dengan OpenAPI documentation
- **CORS Enabled:** Komunikasi antar origin yang aman
- **Async/Await:** High-performance async operations
- **Data Validation:** Pydantic untuk validasi data

---

## 🔧 Requirements

### Minimum Requirements
- **Python:** 3.9+
- **Node.js:** 16+
- **SurrealDB:** Latest stable
- **RAM:** 4GB minimum
- **Disk Space:** 2GB minimum

### Operating Systems
- ✅ Windows 10/11
- ✅ macOS 10.14+
- ✅ Linux (Ubuntu 20.04+, Debian 11+)

---

## 🚀 Quick Start

### ⭐ RECOMMENDED: Run Everything in 1 Terminal!

**Windows:**
```bash
.\run_all.ps1
```

**Mac/Linux:**
```bash
chmod +x run_all.sh
./run_all.sh
```

**Any Platform (if make installed):**
```bash
make run
```

### Traditional Way (Multiple Terminals)

If you prefer manual setup, see [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)

### 6. Access Application
- **Frontend:** http://localhost:5173
- **API Docs:** http://localhost:8000/docs
- **Database UI:** https://studio.surrealdb.com (namespace: darsi, database: hospital)

---

## 📚 Documentation

### 🎯 Start Here!

**Untuk pemula / orang awam:**
- � **[QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)** ⭐ **MULAI DARI SINI!**
  - 5 menit setup dengan Docker atau manual
  - Quick reference
  - Troubleshooting cepat

- 🎯 **[RUN_ALL_SERVICES_GUIDE.md](./RUN_ALL_SERVICES_GUIDE.md)** ⭐ **JALANKAN SEMUA DALAM 1 TERMINAL!**
  - PowerShell script untuk Windows
  - Bash script untuk Mac/Linux
  - Makefile untuk all platforms
  - Complete guide dengan tips & troubleshooting

- 📖 **[DATABASE_GUIDE.md](./DATABASE_GUIDE.md)** ⭐ **BACA INI UNTUK PAHAMI DATABASE!**
  - Penjelasan database untuk pemula
  - Cara menjalankan sistem lengkap
  - Cara mengecek database (5 cara berbeda)
  - Operasi database dasar
  - Troubleshooting komprehensif

### 🔧 Technical Documentation

| File | Purpose |
|------|---------|
| **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** | Complete installation & configuration guide |
| **[SURREALDB_SETUP.md](./SURREALDB_SETUP.md)** | SurrealDB dengan Docker (updated dengan Studio) |
| **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** | Detailed API endpoints reference |
| **[COMMANDS_REFERENCE.md](./COMMANDS_REFERENCE.md)** | Quick command cheat sheet |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | System architecture & diagrams |
| **[DOCKER_COMMANDS_CHEATSHEET.md](./DOCKER_COMMANDS_CHEATSHEET.md)** | Docker, SurrealDB, Python commands |
| **[COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md)** | What's been completed |

### 🛠️ Utility Scripts

| Script | Purpose |
|--------|---------|
| **[check_database.py](./check_database.py)** | Check database connection & status |
| **[setup_tables.py](./backend/setup_tables.py)** | Create database tables |
| **[migrate_to_surrealdb.py](./migrate_to_surrealdb.py)** | Migrate data from SQLite to SurrealDB |

### 🌐 Online Resources
- **SurrealDB Official:** https://surrealdb.com
- **SurrealDB Docs:** https://surrealdb.com/docs
- **SurrealDB Studio:** https://studio.surrealdb.com (UI untuk manage database)
- **FastAPI:** https://fastapi.tiangolo.com
- **React:** https://react.dev
- **Docker:** https://docs.docker.com

---

## 🎯 File Structure

```
darsi_v2/
│
├── backend/
│   ├── main.py                    # FastAPI entry point
│   ├── database.py                # SurrealDB connection
│   ├── requirements.txt           # Python dependencies
│   ├── .env                       # Configuration
│   ├── routers/
│   │   ├── superadmin.py         # NEW - Superadmin API
│   │   ├── dashboard.py
│   │   ├── resources.py
│   │   ├── cost_insurance.py
│   │   ├── patient.py
│   │   └── ai.py
│   └── data_pipeline/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   └── SuperadminDashboard.tsx  # NEW
│   │   │   ├── pages/
│   │   │   │   └── SuperadminPage.tsx       # NEW
│   │   │   └── routes.tsx                   # Updated
│   │   └── services/
│   ├── package.json
│   └── vite.config.ts
│
├── SETUP_GUIDE.md
├── API_DOCUMENTATION.md
├── COMMANDS_REFERENCE.md
├── ARCHITECTURE.md
├── COMPLETION_SUMMARY.md
├── migrate_to_surrealdb.py
├── quick_start.py
└── README.md
```

---

## ⚙️ Configuration

### Backend Configuration (`.env`)

```env
# SurrealDB
SURREALDB_HOST=http://localhost:8080
SURREALDB_USER=root
SURREALDB_PASS=root
SURREALDB_NS=darsi
SURREALDB_DB=hospital

# Superadmin
SUPERADMIN_EMAIL=admin@darsi.local
SUPERADMIN_PASSWORD=Admin@12345

# API
API_HOST=localhost
API_PORT=8000
API_ENV=development
```

### Important Notes
⚠️ **For Production:**
- Change default credentials
- Use HTTPS instead of HTTP
- Implement proper authentication
- Enable request validation
- Setup logging & monitoring

---

## 📊 API Endpoints

### Superadmin Endpoints

```
Authentication:
  POST   /api/superadmin/login

Configuration:
  GET    /api/superadmin/config
  GET    /api/superadmin/config/{key}
  POST   /api/superadmin/config
  PUT    /api/superadmin/config/{key}
  DELETE /api/superadmin/config/{key}

Users:
  GET    /api/superadmin/users
  POST   /api/superadmin/users
  PUT    /api/superadmin/users/{user_id}
  DELETE /api/superadmin/users/{user_id}

Audit:
  GET    /api/superadmin/audit-logs
  GET    /api/superadmin/dashboard-stats
  GET    /api/superadmin/health
```

### Other Endpoints

```
General:
  GET    /api/health

Dashboard:
  GET    /api/dashboard/*

Resources:
  GET    /api/resources/*

Cost & Insurance:
  GET    /api/cost-insurance/*

Patients:
  GET    /api/patient/*

AI:
  POST   /api/ai/*
```

---

## 🗄️ Database Schema

### Tables

#### `users`
```
- id (Primary Key)
- email (String, Unique)
- password (String - SHA256 hash)
- role (String: superadmin, admin, user)
- is_active (Boolean)
- created_at (DateTime)
```

#### `pasien`
```
- id (Primary Key)
- no_rm (String)
- nama (String)
- usia (Number)
- created_at (DateTime)
```

#### `api_config`
```
- id (Primary Key)
- key (String, Unique)
- value (Any)
- updated_by (String)
- updated_at (DateTime)
```

#### `audit_logs`
```
- id (Primary Key)
- user_id (String)
- action (String)
- resource (String)
- details (Any)
- created_at (DateTime)
```

---

## 🔄 Data Migration

### From SQLite to SurrealDB

```bash
# Run migration script
python migrate_to_surrealdb.py

# Script will:
# ✓ Connect to both databases
# ✓ Migrate patient data
# ✓ Verify migration
# ✓ Show statistics
```

---

## 🐛 Troubleshooting

### CORS Error
**Problem:** `Access to fetch blocked by CORS policy`

**Solution:** Ensure port 5174 is in allowed origins (✓ Already fixed)

### SurrealDB Connection Error
**Problem:** `Failed to connect to SurrealDB`

**Solution:** 
1. Ensure SurrealDB running: `surreal start ...`
2. Check host & port in `.env`
3. Verify credentials

### Database Not Found
**Problem:** `Table 'users' not found`

**Solution:**
1. Restart backend (initializes DB)
2. Or run: `python migrate_to_surrealdb.py`

### Frontend Can't Connect
**Problem:** Blank dashboard, network errors

**Solution:**
1. Check backend running: http://localhost:8000/docs
2. Check browser console (F12) for errors
3. Verify CORS headers
4. Restart services

### Port Already in Use
**Problem:** `Port 8000/5174 already in use`

**Solution:**
```bash
# Find process using port (Windows)
netstat -ano | findstr :8000

# Find process using port (macOS/Linux)
lsof -i :8000

# Kill process and restart
```

---

## 📞 Support

### Getting Help
1. **Check Documentation:** Review SETUP_GUIDE.md and API_DOCUMENTATION.md
2. **Check Terminal Output:** Look for error messages in terminal windows
3. **Check Browser Console:** Open DevTools (F12) for frontend errors
4. **Check Logs:** Review FastAPI Docs at http://localhost:8000/docs

### Common Issues Checklist
- [ ] Python version 3.9+
- [ ] Node.js version 16+
- [ ] SurrealDB installed and running
- [ ] All dependencies installed (`pip install -r requirements.txt`)
- [ ] `.env` file configured correctly
- [ ] Backend starting without errors
- [ ] Frontend can access http://localhost:5174
- [ ] CORS not blocking requests

---

## 🚀 Next Steps

### Development
1. Explore API documentation: http://localhost:8000/docs
2. Test superadmin dashboard features
3. Review audit logs
4. Create test configurations & users

### Production Deployment
1. Change default credentials
2. Setup proper authentication (JWT)
3. Configure HTTPS
4. Setup database backups
5. Enable logging & monitoring
6. Create deployment pipeline

### Enhancement Ideas
- [ ] Two-factor authentication
- [ ] Role-based permissions
- [ ] API key management
- [ ] Data export/import
- [ ] Advanced analytics
- [ ] Mobile application

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 👥 Contributors

- **Development:** Team DARSI
- **Version:** 2.0.0
- **Last Updated:** May 6, 2026

---

## 🙏 Acknowledgments

- **SurrealDB:** Modern database platform
- **FastAPI:** Modern Python web framework
- **React:** UI library
- **Vite:** Build tool

---

## 📞 Quick Links

| Resource | URL |
|----------|-----|
| Superadmin Dashboard | http://localhost:5174/superadmin |
| API Documentation | http://localhost:8000/docs |
| SurrealDB Console | http://localhost:8080 |
| GitHub Repository | [link] |
| Issues & Support | [link] |

---

## ⚡ Quick Commands

```bash
# Start everything (from project root)
# Terminal 1
surreal start --bind 127.0.0.1:8080 --user root --pass root memory

# Terminal 2
cd backend && uvicorn main:app --reload --port 8000

# Terminal 3
cd frontend && npm run dev

# Then visit: http://localhost:5174/superadmin
```

---

**🎉 DARSI v2.0 - Ready for Development!**

For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)
