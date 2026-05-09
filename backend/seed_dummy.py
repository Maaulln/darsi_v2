import random
from datetime import datetime, timedelta
from database import get_db, SurrealDBConnection

def seed_data():
    conn = SurrealDBConnection()
    db = conn.connect()
    
    print("[SEEDER] Memulai proses seeding data dummy...")
    
    # 1. Bersihkan data lama
    tables = ["kamar", "rawat_inap", "tagihan", "pasien", "klaim_asuransi"]
    for table in tables:
        try:
            db.delete(table)
            print(f"[SEEDER] Tabel {table} dibersihkan.")
        except Exception as e:
            pass

    # 2. Buat Pasien Dummy
    penjamin_options = ["Umum", "BPJS", "Asuransi Swasta"]
    for i in range(1, 21):
        db.create(f"pasien:p{i}", {
            "nama": f"Pasien Dummy {i}",
            "penjamin": random.choice(penjamin_options),
            "umur": random.randint(10, 70)
        })
    print("[SEEDER] 20 Pasien berhasil dibuat.")

    # 3. Buat Kamar Dummy
    status_kamar = ["Kosong", "Terisi", "Terisi", "Penuh"]
    for i in range(1, 11):
        db.create(f"kamar:k{i}", {
            "nama": f"Kamar VIP {i}",
            "status": random.choice(status_kamar)
        })
    print("[SEEDER] 10 Kamar berhasil dibuat.")

    # 4. Buat Rawat Inap & Trend
    today = datetime.now()
    for i in range(1, 31):
        masuk_date = (today - timedelta(days=random.randint(0, 29))).strftime("%Y-%m-%d")
        db.create(f"rawat_inap:ri{i}", {
            "pasien": f"pasien:p{random.randint(1,20)}",
            "kamar": f"kamar:k{random.randint(1,10)}",
            "status": random.choice(["Aktif", "Selesai"]),
            "lama_rawat": random.randint(1, 14),
            "tanggal_masuk": masuk_date
        })
    print("[SEEDER] 30 Rawat Inap berhasil dibuat.")

    # 5. Buat Tagihan
    for i in range(1, 16):
        bayar_date = (today - timedelta(days=random.randint(0, 10))).strftime("%Y-%m-%d")
        status_bayar = random.choice(["Lunas", "Lunas", "Belum Bayar"])
        db.create(f"tagihan:t{i}", {
            "pasien": f"pasien:p{random.randint(1,20)}",
            "total_tagihan": random.randint(500000, 5000000),
            "status_bayar": status_bayar,
            "tanggal_bayar": bayar_date if status_bayar == "Lunas" else None
        })
    print("[SEEDER] 15 Tagihan berhasil dibuat.")

    # 6. Buat Klaim Asuransi
    for i in range(1, 6):
        db.create(f"klaim_asuransi:ka{i}", {
            "tagihan": f"tagihan:t{random.randint(1,15)}",
            "status_klaim": random.choice(["Proses", "Ditolak", "Disetujui"])
        })
    print("[SEEDER] 5 Klaim Asuransi berhasil dibuat.")
    
    print("[SEEDER] Seeding selesai!")

if __name__ == "__main__":
    seed_data()
