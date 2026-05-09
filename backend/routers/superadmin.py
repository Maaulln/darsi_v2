"""
routers/superadmin.py — Superadmin Dashboard API
=================================================
Endpoints untuk mengelola API configuration, users, dan audit logs.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from typing import Optional, List, Dict, Any
import hashlib
from datetime import datetime

from database import select, create, update, delete

router = APIRouter(
    prefix="/api/superadmin",
    tags=["superadmin"],
    responses={404: {"description": "Not found"}},
)


# ─────────────────────────────────────────────────────────────────────────────
# Authentication & Authorization
# ─────────────────────────────────────────────────────────────────────────────

def verify_superadmin(email: str, password: str):
    """Verify superadmin credentials"""
    hashed_pwd = hashlib.sha256(password.encode()).hexdigest()
    user = select("users", {
        "email": email,
        "password": hashed_pwd,
        "role": "superadmin"
    })
    return user[0] if user else None


# ─────────────────────────────────────────────────────────────────────────────
# Authentication Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/login")
def login(credentials: Dict[str, str]):
    """Login superadmin user"""
    email = credentials.get("email")
    password = credentials.get("password")
    
    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email dan password diperlukan"
        )
    
    user = verify_superadmin(email, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah"
        )
    
    # Log audit
    create("audit_logs", {
        "user_id": str(user.get("id")),
        "role": "superadmin",
        "action": "LOGIN",
        "resource": "auth",
        "details": {"email": email}
    })
    
    return {
        "status": "success",
        "message": "Login berhasil",
        "user": {
            "id": str(user.get("id")),
            "email": user.get("email"),
            "role": user.get("role")
        }
    }


# ─────────────────────────────────────────────────────────────────────────────
# API Configuration Management
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/config")
def get_all_config():
    """Ambil semua konfigurasi API"""
    configs = select("api_config")
    
    result = {}
    for config in configs:
        key = config.get("key")
        result[key] = config.get("value")
    
    return {
        "status": "success",
        "data": result
    }


@router.get("/config/{key}")
def get_config_by_key(key: str):
    """Ambil konfigurasi API berdasarkan key"""
    config = select("api_config", {
        "key": key
    })
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Konfigurasi '{key}' tidak ditemukan"
        )
    
    return {
        "status": "success",
        "data": config[0]
    }


@router.put("/config/{key}")
def update_config(key: str, data: Dict[str, Any], user_email: str = "admin"):
    """Update konfigurasi API"""
    value = data.get("value")
    
    existing = select("api_config", {"key": key})
    
    if existing:
        updated = update("api_config:" + key, {
            "value": value,
            "updated_by": user_email,
            "updated_at": datetime.now().isoformat()
        })
    else:
        updated = create("api_config", {
            "key": key,
            "value": value,
            "updated_by": user_email,
            "updated_at": datetime.now().isoformat()
        })
    
    # Log audit
    create("audit_logs", {
        "user_id": "superadmin",
        "role": "superadmin",
        "action": "UPDATE_CONFIG",
        "resource": f"api_config:{key}",
        "details": {"old_value": existing[0].get("value") if existing else None, "new_value": value}
    })
    
    return {
        "status": "success",
        "message": f"Konfigurasi '{key}' berhasil diupdate",
        "data": updated
    }


@router.post("/config")
def create_config(data: Dict[str, Any], user_email: str = "admin"):
    """Buat konfigurasi API baru"""
    key = data.get("key")
    value = data.get("value")
    
    if not key or value is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Key dan value diperlukan"
        )
    
    created = create("api_config", {
        "key": key,
        "value": value,
        "updated_by": user_email,
        "updated_at": datetime.now().isoformat()
    })
    
    # Log audit
    create("audit_logs", {
        "user_id": "superadmin",
        "role": "superadmin",
        "action": "CREATE_CONFIG",
        "resource": f"api_config:{key}",
        "details": {"value": value}
    })
    
    return {
        "status": "success",
        "message": "Konfigurasi baru berhasil dibuat",
        "data": created
    }


@router.delete("/config/{key}")
def delete_config(key: str, user_email: str = "admin"):
    """Hapus konfigurasi API"""
    delete("api_config:" + key)
    
    # Log audit
    create("audit_logs", {
        "user_id": "superadmin",
        "role": "superadmin",
        "action": "DELETE_CONFIG",
        "resource": f"api_config:{key}",
        "details": {}
    })
    
    return {
        "status": "success",
        "message": f"Konfigurasi '{key}' berhasil dihapus"
    }


# ─────────────────────────────────────────────────────────────────────────────
# Users Management
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/users")
def get_all_users():
    """Ambil semua pengguna"""
    users = select("users")
    
    # Hide passwords
    for user in users:
        user.pop("password", None)
    
    return {
        "status": "success",
        "data": users
    }


@router.post("/users")
def create_user(data: Dict[str, str]):
    """Buat pengguna baru"""
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "user")
    
    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email dan password diperlukan"
        )
    
    # Check if email already exists
    existing = select("users", {"email": email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email sudah terdaftar"
        )
    
    hashed_pwd = hashlib.sha256(password.encode()).hexdigest()
    
    created = create("users", {
        "email": email,
        "password": hashed_pwd,
        "role": role,
        "is_active": True
    })
    
    # Log audit
    create("audit_logs", {
        "user_id": "superadmin",
        "role": "superadmin",
        "action": "CREATE_USER",
        "resource": f"users:{email}",
        "details": {"email": email, "role": role}
    })
    
    if isinstance(created, dict):
        created.pop("password", None)
    elif isinstance(created, list) and len(created) > 0:
        created[0].pop("password", None)
        
    return {
        "status": "success",
        "message": "Pengguna baru berhasil dibuat",
        "data": created
    }


@router.put("/users/{user_id}")
def update_user(user_id: str, data: Dict[str, Any]):
    """Update data pengguna"""
    allowed_fields = ["email", "role", "is_active"]
    update_data = {k: v for k, v in data.items() if k in allowed_fields}
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tidak ada field yang valid untuk diupdate"
        )
    
    updated = update("users:" + user_id, update_data)
    
    # Log audit
    create("audit_logs", {
        "user_id": "superadmin",
        "role": "superadmin",
        "action": "UPDATE_USER",
        "resource": f"users:{user_id}",
        "details": update_data
    })
    
    if isinstance(updated, dict):
        updated.pop("password", None)
    elif isinstance(updated, list) and len(updated) > 0:
        updated[0].pop("password", None)
        
    return {
        "status": "success",
        "message": "Pengguna berhasil diupdate",
        "data": updated
    }


@router.delete("/users/{user_id}")
def delete_user(user_id: str):
    """Hapus pengguna"""
    delete("users:" + user_id)
    
    # Log audit
    create("audit_logs", {
        "user_id": "superadmin",
        "role": "superadmin",
        "action": "DELETE_USER",
        "resource": f"users:{user_id}",
        "details": {}
    })
    
    return {
        "status": "success",
        "message": "Pengguna berhasil dihapus"
    }


# ─────────────────────────────────────────────────────────────────────────────
# Audit Logs
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/audit-logs")
def get_audit_logs(limit: int = 100):
    """Ambil audit logs"""
    logs = select("audit_logs")
    
    # Sort by created_at descending and limit
    logs = sorted(logs, key=lambda x: x.get("created_at", ""), reverse=True)[:limit]
    
    return {
        "status": "success",
        "data": logs,
        "total": len(logs)
    }


@router.get("/dashboard-stats")
def get_dashboard_stats():
    """Ambil statistik dashboard superadmin"""
    try:
        users = select("users")
        patients = select("pasien")
        configs = select("api_config")
        logs = select("audit_logs")
        
        return {
            "status": "success",
            "data": {
                "total_users": len(users),
                "total_patients": len(patients),
                "total_configs": len(configs),
                "total_logs": len(logs),
                "recent_logs": sorted(logs, key=lambda x: x.get("created_at", ""), reverse=True)[:5]
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/health")
def superadmin_health():
    """Check superadmin API health"""
    return {
        "status": "ok",
        "module": "superadmin",
        "version": "2.0"
    }
