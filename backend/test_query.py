import asyncio
from database import get_db

db = get_db()
print(db.query("SELECT count() AS cnt FROM rawat_inap WHERE status='Aktif' GROUP ALL"))
print(db.query("SELECT * FROM rawat_inap"))
