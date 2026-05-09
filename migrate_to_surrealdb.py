#!/usr/bin/env python
"""
migrate_to_surrealdb.py - Migrate data from SQLite to SurrealDB
========================================================================
Usage: python migrate_to_surrealdb.py
"""

import asyncio
import sqlite3
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

try:
    from surrealdb import Surreal
except ImportError:
    print("❌ surrealdb module not found. Install with: pip install surrealdb")
    exit(1)


class Migration:
    def __init__(self):
        self.db = None
        self.sqlite_conn = None
        self.migrated_count = {}
    
    async def connect_surrealdb(self):
        """Connect to SurrealDB"""
        try:
            url = os.getenv("SURREALDB_HOST", "http://localhost:8080")
            username = os.getenv("SURREALDB_USER", "root")
            password = os.getenv("SURREALDB_PASS", "root")
            namespace = os.getenv("SURREALDB_NS", "darsi")
            database = os.getenv("SURREALDB_DB", "hospital")
            
            self.db = Surreal(url)
            await self.db.connect()
            await self.db.signin({"user": username, "pass": password})
            await self.db.use(namespace, database)
            print(f"✓ Connected to SurrealDB: {url}/{namespace}/{database}")
            return True
        except Exception as e:
            print(f"❌ Failed to connect to SurrealDB: {e}")
            return False
    
    def connect_sqlite(self):
        """Connect to SQLite"""
        try:
            db_path = os.path.join(os.path.dirname(__file__), "backend", "darsi_clean.db")
            if not os.path.exists(db_path):
                print(f"❌ SQLite database not found: {db_path}")
                return False
            
            self.sqlite_conn = sqlite3.connect(db_path)
            self.sqlite_conn.row_factory = sqlite3.Row
            print(f"✓ Connected to SQLite: {db_path}")
            return True
        except Exception as e:
            print(f"❌ Failed to connect to SQLite: {e}")
            return False
    
    async def migrate_patients(self):
        """Migrate patient data from SQLite to SurrealDB"""
        try:
            cursor = self.sqlite_conn.cursor()
            cursor.execute("SELECT * FROM pasien")
            patients = cursor.fetchall()
            
            if not patients:
                print("ℹ No patients to migrate")
                return
            
            print(f"\n📋 Migrating {len(patients)} patients...")
            
            for idx, patient in enumerate(patients, 1):
                patient_data = dict(patient)
                
                # Handle datetime if needed
                if 'created_at' in patient_data and patient_data['created_at']:
                    # Keep as is or convert if needed
                    pass
                
                try:
                    await self.db.create("pasien", patient_data)
                    if idx % 100 == 0:
                        print(f"  - Migrated {idx}/{len(patients)} patients")
                except Exception as e:
                    print(f"  ⚠ Warning for patient {patient_data}: {e}")
            
            self.migrated_count['patients'] = len(patients)
            print(f"✓ Successfully migrated {len(patients)} patients")
            
        except Exception as e:
            print(f"❌ Migration error: {e}")
    
    async def migrate_other_tables(self):
        """Migrate other SQLite tables"""
        try:
            cursor = self.sqlite_conn.cursor()
            
            # Get list of tables
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [row[0] for row in cursor.fetchall()]
            
            skip_tables = {'pasien', 'sqlite_sequence'}  # Already migrated or system tables
            tables_to_migrate = [t for t in tables if t not in skip_tables]
            
            if not tables_to_migrate:
                print("ℹ No other tables to migrate")
                return
            
            print(f"\n📋 Found {len(tables_to_migrate)} additional tables: {', '.join(tables_to_migrate)}")
            print("⚠ Manual migration recommended for other tables")
            print("  You can export them as JSON and import manually if needed")
            
        except Exception as e:
            print(f"⚠ Warning reading tables: {e}")
    
    async def verify_migration(self):
        """Verify migrated data"""
        try:
            print("\n✅ Verifying migration...")
            
            # Check patients count
            result = await self.db.query("SELECT count() as total FROM pasien")
            patient_count = result[0][0]['total'] if result else 0
            print(f"  - Total patients in SurrealDB: {patient_count}")
            
            # Check users
            result = await self.db.query("SELECT count() as total FROM users")
            user_count = result[0][0]['total'] if result else 0
            print(f"  - Total users in SurrealDB: {user_count}")
            
            # Check configs
            result = await self.db.query("SELECT count() as total FROM api_config")
            config_count = result[0][0]['total'] if result else 0
            print(f"  - Total configurations: {config_count}")
            
        except Exception as e:
            print(f"⚠ Verification warning: {e}")
    
    async def run(self):
        """Run migration"""
        print("=" * 70)
        print("🔄 DARSI Database Migration: SQLite → SurrealDB")
        print("=" * 70)
        
        # Connect to databases
        if not await self.connect_surrealdb():
            return
        
        if not self.connect_sqlite():
            return
        
        # Run migrations
        await self.migrate_patients()
        await self.migrate_other_tables()
        
        # Verify
        await self.verify_migration()
        
        # Cleanup
        if self.db:
            await self.db.close()
        if self.sqlite_conn:
            self.sqlite_conn.close()
        
        print("\n" + "=" * 70)
        print("✓ Migration completed!")
        print("=" * 70)
        print("\n💡 Next steps:")
        print("  1. Verify data in SurrealDB: http://localhost:8080")
        print("  2. Update your routers to use SurrealDB")
        print("  3. Restart backend: uvicorn main:app --reload")
        print("  4. Test application thoroughly")


async def main():
    migration = Migration()
    await migration.run()


if __name__ == "__main__":
    asyncio.run(main())
