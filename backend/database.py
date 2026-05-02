"""
database.py — SQLite connection helper for DARSI backend
"""
import sqlite3
import os
from typing import List, Dict, Any

DB_PATH = os.path.join(os.path.dirname(__file__), "darsi_clean.db")


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def query(sql: str, params: tuple = ()) -> List[Dict[str, Any]]:
    """Execute a SELECT and return list of dicts."""
    conn = get_connection()
    try:
        cur = conn.execute(sql, params)
        rows = cur.fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def query_one(sql: str, params: tuple = ()) -> Dict[str, Any]:
    """Execute a SELECT and return first row as dict, or {}."""
    conn = get_connection()
    try:
        cur = conn.execute(sql, params)
        row = cur.fetchone()
        return dict(row) if row else {}
    finally:
        conn.close()
