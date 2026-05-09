#!/usr/bin/env python
"""
Setup database tables for DARSI system
"""
from database import query

# Create tables
tables_sql = [
    'CREATE users',
    'CREATE pasien',
    'CREATE resources',
    'CREATE cost_insurance',
    'CREATE api_config',
    'CREATE audit_logs',
]

print("Creating tables...\n")

for sql in tables_sql:
    try:
        result = query(sql)
        print(f'[OK] {sql}')
    except Exception as e:
        print(f'[ERROR] {sql}: {e}')

# Verify tables created
print("\n" + "="*50)
result = query('INFO FOR DATABASE')
if result and 'tables' in result:
    tables = list(result['tables'].keys())
    print(f'[OK] Tables created: {tables}')
else:
    print("[ERROR] Could not verify tables")
