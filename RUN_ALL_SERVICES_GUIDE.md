# 🚀 RUN ALL SERVICES - One Terminal Guide

**Jalankan semua services (Docker + Backend + Frontend) dalam 1 terminal!**

---

## 📋 Quick Summary

Sebelumnya Anda perlu:
- Terminal 1: Docker
- Terminal 2: Backend (Python)
- Terminal 3: Frontend (npm)

**Sekarang Anda bisa gunakan 1 terminal saja** ✓

---

## 🔧 3 Pilihan Cara

### **PILIHAN 1: PowerShell Script (Windows) ⭐ RECOMMENDED**

**Best untuk Windows users!**

#### Step 1: Buka PowerShell

```bash
# Windows: Buka PowerShell
# Navigate ke project folder
cd C:\Users\ACER NITRO\Documents\DARSIDUMMY\darsi_v2
```

#### Step 2: Jalankan Script

```powershell
# Run the script
.\run_all.ps1
```

**Jika error "cannot be loaded because running scripts is disabled":**

```powershell
# Jalankan command ini SATU KALI:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Lalu jalankan script lagi:
.\run_all.ps1
```

#### Output Expected:

```
=====================================
  DARSI v2.0 - Start All Services   
=====================================

ℹ Project root: C:\Users\...\darsi_v2
Step 1: Starting Docker services...
===================================
✓ Docker services started
✓ All containers are running

Step 2: Starting Frontend (npm)...
====================================
✓ Frontend starting (npm run dev)
ℹ Frontend will be available at: http://localhost:5173

Step 3: Starting Backend (Python)...
======================================
✓ Backend starting (python main.py)
ℹ Backend will be available at: http://localhost:8000

=====================================
  All Services Started!
=====================================

🌐 Frontend URL:
   http://localhost:5173

⚙️  Backend URL:
   http://localhost:8000
   API Docs: http://localhost:8000/docs

🗄️  Database:
   URL: http://localhost:8000
   Studio: https://studio.surrealdb.com

⏹️  To stop all services:
   Press Ctrl+C
```

---

### **PILIHAN 2: Bash Script (Mac/Linux) ⭐ RECOMMENDED**

**Best untuk Mac/Linux users!**

#### Step 1: Buka Terminal

```bash
# Navigate ke project folder
cd /path/to/darsi_v2
```

#### Step 2: Make Script Executable

```bash
# First time only
chmod +x run_all.sh
```

#### Step 3: Jalankan Script

```bash
./run_all.sh
```

#### Output Expected:

```
=====================================
  DARSI v2.0 - Start All Services   
=====================================

ℹ Project root: /Users/..../darsi_v2
Step 1: Starting Docker services...
=====================================
✓ Docker services started
✓ All containers are running

Step 2: Starting Frontend (npm)...
====================================
✓ Frontend started (npm run dev)
ℹ Frontend will be available at: http://localhost:5173

Step 3: Starting Backend (Python)...
======================================
✓ Backend started (python main.py)
ℹ Backend will be available at: http://localhost:8000

=====================================
  All Services Started!
=====================================

🌐 Frontend URL:
   http://localhost:5173

⚙️  Backend URL:
   http://localhost:8000
   API Docs: http://localhost:8000/docs

🗄️  Database:
   URL: http://localhost:8000
   Studio: https://studio.surrealdb.com

⏹️  To stop all services:
   Press Ctrl+C
```

---

### **PILIHAN 3: Makefile (Universal)**

**Works di Windows, Mac, dan Linux!**

#### Persiapan (First Time):

```bash
# Install 'make' command (if not already installed)
# Windows: choco install make
# Mac: brew install make
# Linux: sudo apt install make
```

#### Jalankan Services:

```bash
# Start semua services
make run

# Or individual commands:
make run-docker     # Start Docker only
make run-backend    # Start Backend only
make run-frontend   # Start Frontend only
```

#### Useful Make Commands:

```bash
make help           # Show all available commands
make setup          # Setup everything (first time)
make check          # Check database status
make logs           # View Docker logs
make stop           # Stop all services
make clean          # Clean up containers
```

---

## 🔄 Perbandingan 3 Pilihan

| Aspek | PowerShell | Bash | Makefile |
|-------|-----------|------|----------|
| **Platform** | Windows | Mac/Linux | All |
| **Kemudahan** | Very Easy | Very Easy | Easy |
| **Setup** | No setup | `chmod +x` once | Install make |
| **Commands** | 1 command | 1 command | 1 command |
| **Control** | Good | Good | Excellent |
| **Recommended** | ⭐ Windows | ⭐ Mac/Linux | Alternative |

---

## 📱 Cara Menggunakan Setelah Services Running

### Accessing Services

**Ketika script berjalan, buka browser:**

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:8000 |
| **API Documentation** | http://localhost:8000/docs |
| **Database UI** | https://studio.surrealdb.com |

### Monitoring Logs dalam Terminal Terpisah

Saat services running, buka terminal baru:

```bash
# View all logs real-time
docker-compose logs -f

# View specific service logs
docker-compose logs -f surrealdb
docker-compose logs -f backend

# Check running containers
docker-compose ps

# Check database status
python check_database.py
```

### Stopping All Services

```bash
# Di terminal yang menjalankan script:
Press Ctrl+C

# Semua services akan berhenti
# - Docker containers stop
# - Backend process stop
# - Frontend process stop
```

---

## ⚙️ What Each Script Does

### PowerShell Script (run_all.ps1)

1. **Checks project structure**
   - Verifies backend & frontend folders exist

2. **Starts Docker**
   - `docker-compose up -d`
   - Waits for containers to start

3. **Starts Frontend**
   - Checks if node_modules exists
   - Installs if needed: `npm install`
   - Runs: `npm run dev`
   - Background process

4. **Starts Backend**
   - Checks if venv exists
   - Creates if needed: `python -m venv venv`
   - Activates virtual environment
   - Installs requirements if needed: `pip install -r requirements.txt`
   - Runs: `python main.py`
   - Background process

5. **Shows Summary**
   - Display URLs for all services
   - Show tips for monitoring

### Bash Script (run_all.sh)

Same as PowerShell, tapi:
- Uses bash commands instead of PowerShell
- Supports Linux/Mac
- Has cleanup function (on Ctrl+C)

### Makefile

Provides individual commands:
- `make run` - Run everything
- `make run-docker` - Docker only
- `make run-backend` - Backend only
- `make run-frontend` - Frontend only
- `make stop` - Stop everything
- `make check` - Database status
- `make logs` - View logs

---

## 🆘 Troubleshooting

### Problem: "cannot be loaded because running scripts is disabled"

**Solution (Windows PowerShell):**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\run_all.ps1
```

### Problem: "Permission denied: ./run_all.sh"

**Solution (Mac/Linux):**
```bash
chmod +x run_all.sh
./run_all.sh
```

### Problem: "Docker is not running"

**Solution:**
```bash
# Windows/Mac: Open Docker Desktop
# Linux: sudo systemctl start docker

# Then run script again
```

### Problem: "npm command not found"

**Solution:**
```bash
# Install Node.js from https://nodejs.org
# Or use package manager:
brew install node          # Mac
choco install nodejs       # Windows
sudo apt install nodejs    # Linux
```

### Problem: "Port already in use"

**Solution:**
```bash
# Check what's using the port
# Windows:
netstat -ano | findstr :5173   # for Frontend
netstat -ano | findstr :8000   # for Backend

# Kill the process
taskkill /PID <PID> /F

# Then run script again
```

### Problem: Processes not stopping with Ctrl+C

**Solution:**
```bash
# Force stop Docker
docker-compose down

# Kill npm processes
# Windows:
taskkill /F /IM node.exe
# Mac/Linux:
pkill -f "npm run dev"

# Kill Python processes
# Windows:
taskkill /F /IM python.exe
# Mac/Linux:
pkill -f "python main.py"
```

---

## 🎯 Workflow Recommendation

### Daily Development Workflow:

```bash
# 1. Start everything in morning
.\run_all.ps1              # Windows
# or
./run_all.sh               # Mac/Linux
# or
make run                   # Any platform

# 2. Open browser
# - Frontend: http://localhost:5173
# - Backend Docs: http://localhost:8000/docs
# - Database: https://studio.surrealdb.com

# 3. Monitor in separate terminal (while run_all is running)
docker-compose logs -f

# 4. When done, press Ctrl+C in run_all terminal
# All services stop automatically

# 5. Next day, repeat step 1
```

---

## 📊 Comparison: Before vs After

### BEFORE (Manual)

```bash
# Terminal 1
docker-compose up -d

# Terminal 2
cd backend
source venv/bin/activate  # or venv\Scripts\activate
python main.py

# Terminal 3
cd frontend
npm run dev

# Terminal 4 (for monitoring)
docker-compose logs -f
```

**= 4 Terminals needed** 😞

### AFTER (Automated)

```bash
# Terminal 1 (Windows)
.\run_all.ps1

# Terminal 1 (Mac/Linux)
./run_all.sh

# Terminal 1 (Any platform)
make run

# Optional - Terminal 2 (for monitoring only)
docker-compose logs -f
```

**= 1 Terminal needed** 🎉

---

## 🔑 Key Features

| Feature | PowerShell | Bash | Makefile |
|---------|-----------|------|----------|
| Auto-check deps | ✓ | ✓ | ✓ |
| Auto-install missing | ✓ | ✓ | ✓ |
| Colored output | ✓ | ✓ | ✓ |
| Error handling | ✓ | ✓ | Partial |
| Stop cleanup | Auto | Auto | Manual |
| Individual commands | ✗ | ✗ | ✓ |
| Service status | ✓ | ✓ | ✓ |

---

## 📚 Related Documentation

- [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md) - 5 minute setup
- [DATABASE_GUIDE.md](./DATABASE_GUIDE.md) - Database guide
- [DOCKER_COMMANDS_CHEATSHEET.md](./DOCKER_COMMANDS_CHEATSHEET.md) - Commands reference

---

## ✨ Summary

| Task | Command |
|------|---------|
| **Windows users** | `.\run_all.ps1` |
| **Mac/Linux users** | `./run_all.sh` |
| **Any platform** | `make run` (if make installed) |
| **Individual services** | `make run-docker` / `make run-backend` / `make run-frontend` |
| **Stop everything** | `Ctrl+C` |
| **Check status** | `docker-compose ps` or `make ps` |
| **View logs** | `docker-compose logs -f` or `make logs` |

---

**Sekarang Anda bisa menjalankan SEMUA services dalam 1 terminal! 🚀**

**Next time, just use:**
- Windows: `.\run_all.ps1`
- Mac/Linux: `./run_all.sh`
- Any: `make run`

**That's it! No more multiple terminals needed!** ✨
