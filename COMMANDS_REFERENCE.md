# 🎯 DARSI Quick Commands Reference

## 📋 Prerequisites Check

```bash
# Check Python
python --version          # Should be 3.9+

# Check Node.js
node --version           # Should be 16+
npm --version

# Install SurrealDB
# Windows/macOS/Linux: https://surrealdb.com/install
surreal --version
```

---

## 🚀 QUICK START (All-in-One)

### Option 1: Automatic Setup Script
```bash
# From project root
python quick_start.py
# Follow prompts - will setup and start all services
```

### Option 2: Manual Setup & Start

**Terminal 1 - SurrealDB:**
```bash
surreal start --bind 127.0.0.1:8080 --user root --pass root memory
```

**Terminal 2 - Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 📚 Setup Steps (Detailed)

### 1. Install Backend Dependencies
```bash
cd backend
pip install fastapi uvicorn surrealdb python-dotenv pydantic ollama
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 3. Start SurrealDB
```bash
# Windows
surreal start --bind 127.0.0.1:8080 --user root --pass root memory

# macOS/Linux
surreal start --bind 127.0.0.1:8080 --user root --pass root memory

# Or with Docker
docker run -p 8080:8080 surrealdb/surrealdb:latest start \
  --user root --pass root memory
```

### 4. Start Backend
```bash
cd backend
uvicorn main:app --reload --port 8000
```

### 5. Start Frontend
```bash
cd frontend
npm run dev
```

---

## 🔄 Data Migration

### From SQLite to SurrealDB
```bash
# Run migration script from project root
python migrate_to_surrealdb.py

# This will:
# ✓ Connect to SurrealDB
# ✓ Connect to SQLite
# ✓ Migrate patient data
# ✓ Verify migration
```

### Manual SurrealDB Query (if needed)
```bash
# Access SurrealDB console
surreal sql --conn http://localhost:8080 --user root --pass root --ns darsi --db hospital

# Then run SQL queries directly
SELECT * FROM users;
SELECT * FROM pasien;
SELECT * FROM api_config;
```

---

## 🌐 Access URLs

### Services
- **SurrealDB Console:** http://localhost:8080
- **API Documentation:** http://localhost:8000/docs
- **API Health:** http://localhost:8000/api/health
- **Frontend:** http://localhost:5174
- **Superadmin Dashboard:** http://localhost:5174/superadmin

### Default Credentials
```
Email:    admin@darsi.local
Password: Admin@12345
```

---

## 📝 Common Tasks

### Restart Backend
```bash
# Stop current process (Ctrl+C in terminal)
# Then restart:
cd backend
uvicorn main:app --reload --port 8000
```

### Restart Frontend
```bash
# Stop current process (Ctrl+C in terminal)
# Then restart:
cd frontend
npm run dev
```

### Check Backend Health
```bash
# Using curl
curl http://localhost:8000/api/health

# Or visit in browser
http://localhost:8000/api/health
```

### Check SurrealDB Connection
```bash
# Using curl
curl http://localhost:8080/health

# Or in browser
http://localhost:8080
```

---

## 🗄️ Database Queries

### Using SurrealDB CLI
```bash
# Connect to SurrealDB
surreal sql --conn http://localhost:8080 \
  --user root --pass root \
  --ns darsi --db hospital
```

### Common Queries

**List All Tables:**
```sql
INFO FOR DB;
```

**View Users:**
```sql
SELECT * FROM users;
```

**View Configurations:**
```sql
SELECT * FROM api_config;
```

**View Patients:**
```sql
SELECT * FROM pasien;
```

**View Audit Logs:**
```sql
SELECT * FROM audit_logs;
```

**Create User:**
```sql
CREATE users SET
  email = 'user@example.com',
  password = sha256('password'),
  role = 'admin',
  is_active = true;
```

**Create Configuration:**
```sql
CREATE api_config SET
  key = 'new_config',
  value = 'some_value',
  updated_by = 'admin';
```

---

## 🐍 Python Tasks

### Run Migration Script
```bash
python migrate_to_surrealdb.py
```

### Access Python REPL in Backend
```bash
cd backend
python
>>> from database import get_db, init_db
>>> import asyncio
>>> asyncio.run(init_db())
```

---

## 📦 Package Management

### Update Python Dependencies
```bash
cd backend
pip install -U -r requirements.txt
```

### Update npm Packages
```bash
cd frontend
npm update
```

---

## 🐛 Debugging

### View Backend Logs
```bash
# Terminal running backend (already showing logs)
# Look for errors or warnings
```

### View Frontend Console
```bash
# Open Browser DevTools: F12 or Cmd+Option+I
# Check Console tab for JavaScript errors
```

### View Network Requests
```bash
# Browser DevTools > Network tab
# Check API calls and CORS headers
```

### Test API Endpoints
```bash
# Using FastAPI Swagger UI
http://localhost:8000/docs

# Or using curl
curl http://localhost:8000/api/superadmin/users

# Or using Postman
Import the collection from API_DOCUMENTATION.md
```

---

## 🔧 Configuration

### Change SurrealDB Credentials
Edit `backend/.env`:
```env
SURREALDB_USER=newuser
SURREALDB_PASS=newpassword
```

### Change Superadmin Credentials
Edit `backend/.env`:
```env
SUPERADMIN_EMAIL=newemail@darsi.local
SUPERADMIN_PASSWORD=NewPassword123
```

### Change API Port
```bash
# In terminal, instead of:
uvicorn main:app --reload --port 8000

# Use different port:
uvicorn main:app --reload --port 8001
```

---

## 📦 Docker Support

### Run SurrealDB in Docker
```bash
docker run -d -p 8080:8080 \
  -e SURREALDB_USER=root \
  -e SURREALDB_PASS=root \
  surrealdb/surrealdb:latest start memory
```

### Run Backend in Docker
```bash
cd backend
docker build -t darsi-backend .
docker run -p 8000:8000 \
  -e SURREALDB_HOST=http://host.docker.internal:8080 \
  darsi-backend
```

---

## ⚙️ Environment Setup

### Windows

**PowerShell:**
```powershell
# Install Python 3.9+
# Install Node.js 16+
# Install SurrealDB

# Then setup:
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

cd ..\frontend
npm install
```

### macOS/Linux

**Bash/Zsh:**
```bash
# Install Python 3.9+
# Install Node.js 16+
# Install SurrealDB

# Then setup:
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cd ../frontend
npm install
```

---

## 📋 Troubleshooting Commands

### Reset Database
```bash
# Stop SurrealDB and restart with:
surreal start --bind 127.0.0.1:8080 --user root --pass root memory
# This starts fresh (in-memory, no persistence)
```

### Clear Python Cache
```bash
# Remove pycache and other cache files
find . -type d -name __pycache__ -exec rm -r {} +
find . -type f -name "*.pyc" -delete
```

### Clear npm Cache
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### Check Ports in Use

**Windows:**
```bash
netstat -ano | findstr :8080
netstat -ano | findstr :8000
netstat -ano | findstr :5174
```

**macOS/Linux:**
```bash
lsof -i :8080
lsof -i :8000
lsof -i :5174
```

---

## 📚 Documentation Files

- **SETUP_GUIDE.md** - Complete setup guide with screenshots
- **API_DOCUMENTATION.md** - API endpoints and examples
- **README.md** - Project overview
- **requirements.txt** - Python dependencies
- **package.json** - Frontend dependencies

---

## 🆘 Getting Help

1. **Check logs** in respective terminal windows
2. **Check browser console** (F12) for frontend errors
3. **Visit FastAPI docs** at http://localhost:8000/docs
4. **Check SurrealDB console** at http://localhost:8080
5. **Review documentation** files in project root

---

**Last Updated:** May 6, 2026
**DARSI Version:** 2.0.0
