"""
database.py — SurrealDB Connection Management
==============================================
Handles connection to SurrealDB instance and provides database operations.
"""
import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    from surrealdb import Surreal
except ImportError:
    Surreal = None


class SurrealDBConnection:
    """Singleton SurrealDB connection manager"""
    
    _instance: Optional['SurrealDBConnection'] = None
    _db: Optional[Surreal] = None
    _connection_attempts = 0
    _max_retries = 10
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def connect(self, retry=True) -> Surreal:
        """Establish connection to SurrealDB with retry logic"""
        if self._db is not None:
            return self._db
        
        try:
            url = os.getenv("SURREALDB_HOST", "http://localhost:8000")
            if url.startswith("http://"):
                url = url.replace("http://", "ws://") + "/rpc"
            elif url.startswith("https://"):
                url = url.replace("https://", "wss://") + "/rpc"
            username = os.getenv("SURREALDB_USER", "root")
            password = os.getenv("SURREALDB_PASS", "root")
            namespace = os.getenv("SURREALDB_NS", "darsi")
            database = os.getenv("SURREALDB_DB", "hospital")
            
            # Create connection to SurrealDB (HTTP)
            self._db = Surreal(url)
            
            # Signin with credentials
            self._db.signin({
                "user": username,
                "pass": password
            })
            
            # Use namespace and database
            self._db.use(namespace, database)
            
            self._connection_attempts = 0
            print(f"[OK] Connected to SurrealDB: {namespace}/{database}")
            return self._db
        except Exception as e:
            self._db = None
            print(f"[ERROR] SurrealDB connection failed: {e}")
            raise
    
    def disconnect(self):
        """Close connection to SurrealDB"""
        if self._db:
            try:
                self._db.close()
            except:
                pass
            self._db = None
            print("[OK] Disconnected from SurrealDB")
    
    def get_db(self) -> Optional[Surreal]:
        """Get current database connection"""
        return self._db


# Global connection instance
db_connection = SurrealDBConnection()


def get_db() -> Surreal:
    """Get database connection"""
    return db_connection.connect()


def init_db():
    """Initialize database (tables already exist in SurrealDB)"""
    try:
        db = get_db()
        print("[OK] Database initialized successfully")
        return db
    except Exception as e:
        print(f"[ERROR] Failed to initialize database: {e}")
        raise


# ============================================================================
# Query Helper Functions for Easy Database Access
# ============================================================================

def query(surrealql: str, params=None):
    """
    Execute a SurrealQL query and return list of results
    """
    try:
        db = get_db()
        # Very naive ? replacement for SQLite-like queries
        if params:
            for p in params:
                surrealql = surrealql.replace("?", f"'{p}'" if isinstance(p, str) else str(p), 1)
        
        result = db.query(surrealql)
        
        # Depending on SurrealDB version and python client, result could be:
        # 1. [{ "status": "OK", "time": "1ms", "result": [...] }] (Raw HTTP response style)
        # 2. [...] (Direct array of objects)
        
        if result and isinstance(result, list):
            if len(result) > 0 and isinstance(result[0], dict) and 'result' in result[0]:
                return result[0].get('result', [])
            return result
        return []
    except Exception as e:
        print(f"Query error: {e}")
        return []


def query_one(surrealql: str, params=None):
    """
    Execute a SurrealQL query and return first result
    """
    try:
        res = query(surrealql, params)
        return res[0] if res and len(res) > 0 else {}
    except Exception as e:
        print(f"Query_one error: {e}")
        return {}


def select(table: str, filters: dict = None):
    """
    Select records from a table
    
    Args:
        table: Table name
        filters: Optional filter dictionary
    
    Returns:
        List of records
    """
    try:
        db = get_db()
        if filters:
            result = db.select(table, filters)
        else:
            result = db.select(table)
        return result
    except Exception as e:
        print(f"Select error: {e}")
        return []


def create(table: str, record: dict):
    """
    Create a new record
    
    Args:
        table: Table name
        record: Record data dictionary
    
    Returns:
        Created record or None on error
    """
    try:
        db = get_db()
        result = db.create(table, record)
        return result
    except Exception as e:
        print(f"Create error: {e}")
        return None


def update(table_id: str, record: dict):
    """
    Update a record
    
    Args:
        table_id: Table record ID (e.g., "users:1")
        record: Record data dictionary
    
    Returns:
        Updated record or None on error
    """
    try:
        db = get_db()
        result = db.update(table_id, record)
        return result
    except Exception as e:
        print(f"Update error: {e}")
        return None


def delete(table_id: str):
    """
    Delete a record
    
    Args:
        table_id: Table record ID (e.g., "users:1")
    
    Returns:
        True if successful
    """
    try:
        db = get_db()
        db.delete(table_id)
        return True
    except Exception as e:
        print(f"Delete error: {e}")
        return False
