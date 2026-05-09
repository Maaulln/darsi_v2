# 🐳 Docker & Database Cheatsheet - DARSI v2.0

**Quick reference untuk perintah-perintah yang sering digunakan**

---

## Docker Commands

### Basic Container Management

| Command | Function |
|---------|----------|
| `docker-compose up -d` | Start all containers in background |
| `docker-compose down` | Stop and remove all containers |
| `docker-compose ps` | List running containers |
| `docker-compose logs` | Show container logs |
| `docker-compose logs -f` | Show logs real-time (Ctrl+C to exit) |
| `docker-compose restart` | Restart all containers |
| `docker-compose restart surrealdb` | Restart specific container |

### Container Inspection

| Command | Function |
|---------|----------|
| `docker ps` | List all running containers |
| `docker ps -a` | List all containers (running & stopped) |
| `docker logs <container_id>` | Show logs for container |
| `docker exec <container_id> <command>` | Execute command in container |
| `docker-compose exec surrealdb bash` | Open bash shell in surrealdb container |
| `docker stats` | Show resource usage (CPU, Memory) |

### Cleanup Commands

| Command | Function |
|---------|----------|
| `docker-compose down -v` | Stop containers & remove volumes (DELETE DATA!) |
| `docker system prune` | Remove unused images, containers, networks |
| `docker volume rm <volume_name>` | Remove specific volume |
| `docker rmi <image_id>` | Remove image |

---

## SurrealDB Commands

### Connect to SurrealDB Shell (dari Docker)

```bash
# Interactive shell
docker-compose exec surrealdb surreal sql \
  --username root \
  --password root \
  --namespace darsi \
  --database hospital
```

### Common SurrealQL Queries

```sql
-- SELECT
SELECT * FROM users;
SELECT email, role FROM users WHERE role = 'doctor';
SELECT COUNT() FROM pasien;

-- CREATE
CREATE users SET email = 'new@email.com', role = 'user';
CREATE pasien SET nama = 'Budi', usia = 45;

-- UPDATE
UPDATE users:user123 SET role = 'admin';
UPDATE pasien:P001 SET usia += 1;

-- DELETE
DELETE FROM users WHERE email = 'old@email.com';
DELETE pasien:P001;

-- INFO
INFO FOR DATABASE;
INFO FOR TABLE users;

-- AGGREGATE
SELECT role, COUNT() as total FROM users GROUP BY role;
SELECT * FROM pasien ORDER BY usia DESC LIMIT 10;
```

### Backup & Restore

```bash
# Export database
docker-compose exec surrealdb surreal export \
  --user root \
  --pass root \
  --namespace darsi \
  --database hospital \
  > backup.surql

# Import database
docker-compose exec surrealdb surreal import \
  --user root \
  --pass root \
  --namespace darsi \
  --database hospital \
  < backup.surql
```

---

## Python Database Commands

### Setup & Connection

```python
# Import database module
from backend.database import get_db, query, init_db

# Initialize database
init_db()

# Get connection
db = get_db()
```

### Execute Queries

```python
# Query with results
result = query('SELECT * FROM users')
print(result)

# Query one result
result = query_one('SELECT * FROM users LIMIT 1')
print(result)

# Create record
query("CREATE users SET email = 'test@email.com', role = 'user'")

# Update record
query("UPDATE users:user123 SET role = 'admin'")

# Delete record
query("DELETE FROM users WHERE email = 'test@email.com'")
```

---

## FastAPI Backend Commands

### Run Backend

```bash
# Change to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server
python main.py
# or
uvicorn main:app --reload

# Run on specific port
python main.py --port 8001
```

### Check API

```bash
# Health check
curl http://localhost:8000/health

# View API documentation
# Open browser: http://localhost:8000/docs

# List all routes
curl http://localhost:8000/openapi.json
```

---

## File Location Cheatsheet

| Item | Location |
|------|----------|
| Project Root | `/darsi_v2/` |
| Backend | `/darsi_v2/backend/` |
| Frontend | `/darsi_v2/frontend/` |
| Database Config | `/darsi_v2/backend/database.py` |
| Environment | `/darsi_v2/.env` |
| Docker Config | `/darsi_v2/docker-compose.yml` |
| Database Guide | `/darsi_v2/DATABASE_GUIDE.md` |
| Setup Script | `/darsi_v2/setup_tables.py` |
| Check Script | `/darsi_v2/check_database.py` |

---

## Environment Variables

```env
# SurrealDB Configuration
SURREALDB_HOST=http://localhost:8000
SURREALDB_USER=root
SURREALDB_PASS=root
SURREALDB_NS=darsi
SURREALDB_DB=hospital

# FastAPI Configuration
FASTAPI_ENV=development
FASTAPI_DEBUG=true

# Frontend Configuration
VITE_API_URL=http://localhost:8000
```

---

## Ports Reference

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend API | 8000 | http://localhost:8000 |
| Backend Docs | 8000/docs | http://localhost:8000/docs |
| SurrealDB | 8000 | http://localhost:8000 |
| Studio | Browser | https://studio.surrealdb.com |

---

## Problem Quick Fixes

### Container won't start
```bash
docker-compose logs
docker-compose down
docker-compose up -d
```

### Port in use
```bash
# Windows
netstat -ano | findstr :8000

# Mac/Linux
lsof -i :8000

# Kill process
taskkill /PID <PID> /F  # Windows
kill -9 <PID>  # Mac/Linux
```

### Database connection error
```bash
# Check container running
docker-compose ps

# Check logs
docker-compose logs surrealdb

# Restart database
docker-compose restart surrealdb
```

### Python import error
```bash
# Activate virtual environment first!
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Then reinstall
pip install -r requirements.txt
```

---

## Useful Links

- SurrealDB Docs: https://surrealdb.com/docs
- Docker Docs: https://docs.docker.com
- FastAPI Docs: https://fastapi.tiangolo.com
- Python Docs: https://docs.python.org
- SurrealDB Studio: https://studio.surrealdb.com

---

**Tips:** Save this file untuk quick reference saat coding! 💾
