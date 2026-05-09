"""
main.py — DARSI FastAPI Backend
================================
Start: uvicorn main:app --reload --port 8000
Docs : http://localhost:8000/docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from routers import dashboard, resources, cost_insurance, patient, ai, superadmin, n8n, external_api
from database import init_db, db_connection

# ── Lifespan Events ───────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup - don't block on database connection
    try:
        # Try to initialize DB, but don't fail if SurrealDB isn't ready yet
        # It will retry on first request
        print("[OK] Application started (database will connect on first request)")
    except Exception as e:
        print(f"[WARN] Startup note: {e}")
    
    yield
    
    # Shutdown
    try:
        await db_connection.disconnect()
        print("[OK] Application shut down gracefully")
    except Exception as e:
        print(f"[ERROR] Shutdown error: {e}")


app = FastAPI(
    title="DARSI SIMRS API",
    description="Backend API for DARSI RSI Surabaya — dengan SurrealDB dan Superadmin Dashboard",
    version="2.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:5174",   # Vite dev server (default)
        "http://localhost:4173",   # Vite preview
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(dashboard.router)
app.include_router(resources.router)
app.include_router(cost_insurance.router)
app.include_router(patient.router)
app.include_router(ai.router)
app.include_router(superadmin.router)
app.include_router(n8n.router)
app.include_router(external_api.router)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    """Mengembalikan status kesehatan API dan konektivitas database.

    Returns:
        dict: Status layanan, database engine, keterjangkauan database, dan statistik.
    """
    try:
        from database import db_connection, select
        db = db_connection.get_db()
        db_ok = db is not None
        
        if db_ok:
            try:
                users = select("users")
                pasien = select("pasien")
                rows = len(pasien) if isinstance(pasien, list) else 0
            except Exception:
                db_ok = False
                rows = 0
        else:
            rows = 0
            
    except Exception:
        db_ok = False
        rows = 0
    
    return {
        "status": "ok",
        "version": "2.0.0",
        "database": "SurrealDB",
        "db_reachable": db_ok,
        "pasien_count": rows,
    }
