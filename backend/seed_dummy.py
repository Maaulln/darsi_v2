import random
import hashlib
from datetime import datetime, timedelta
from database import get_db, SurrealDBConnection

def seed_data():
    conn = SurrealDBConnection()
    db = conn.connect()
    
    print("[SEEDER] Memulai proses seeding data dummy...")
    
    # 1. Bersihkan data lama
    tables = ["kamar", "rawat_inap", "tagihan", "pasien", "klaim_asuransi", "users", "audit_logs", "api_config"]
    for table in tables:
        try:
            db.delete(table)
            print(f"[SEEDER] Tabel {table} dibersihkan.")
        except Exception:
            pass

    # 2. Buat Users dengan role masing-masing
    users_data = [
        {"email": "admin@darsi.local", "role": "superadmin", "password": "Admin@12345", "nama": "Admin DARSI"},
        {"email": "dokter@darsi.local", "role": "dokter", "password": "123", "nama": "Dr. Ahmad Fadhil"},
        {"email": "perawat@darsi.local", "role": "perawat", "password": "123", "nama": "Ns. Siti Aminah"},
        {"email": "apoteker@darsi.local", "role": "apoteker", "password": "123", "nama": "Budi Santoso, S.Farm"},
        {"email": "cs@darsi.local", "role": "cs", "password": "123", "nama": "Rina Wijaya"},
        {"email": "manager@darsi.local", "role": "manager", "password": "123", "nama": "Hendra Gunawan"},
    ]
    for u in users_data:
        hashed = hashlib.sha256(u["password"].encode()).hexdigest()
        db.create("users", {
            "email": u["email"],
            "password": hashed,
            "role": u["role"],
            "nama": u["nama"],
            "is_active": True,
            "created_at": datetime.now().isoformat()
        })
    print(f"[SEEDER] {len(users_data)} Users berhasil dibuat (dokter, perawat, apoteker, cs, manager, superadmin).")

    # 3. Buat Pasien Dummy
    penjamin_options = ["Umum", "BPJS", "Asuransi Swasta"]
    for i in range(1, 21):
        db.create(f"pasien:p{i}", {
            "nama": f"Pasien Dummy {i}",
            "penjamin": random.choice(penjamin_options),
            "umur": random.randint(10, 70)
        })
    print("[SEEDER] 20 Pasien berhasil dibuat.")

    # 4. Buat Kamar Dummy
    status_kamar = ["Kosong", "Terisi", "Terisi", "Penuh"]
    for i in range(1, 11):
        db.create(f"kamar:k{i}", {
            "nama": f"Kamar VIP {i}",
            "status": random.choice(status_kamar)
        })
    print("[SEEDER] 10 Kamar berhasil dibuat.")

    # 5. Buat Rawat Inap & Trend
    today = datetime.now()
    diagnosa_list = ["Demam Dengue", "ISPA", "Gastritis", "Diabetes Mellitus", "Hipertensi", "Pneumonia", "Asma", "Fraktur"]
    for i in range(1, 31):
        masuk_date = (today - timedelta(days=random.randint(0, 29))).strftime("%Y-%m-%d")
        db.create(f"rawat_inap:ri{i}", {
            "pasien": f"pasien:p{random.randint(1,20)}",
            "id_pasien": f"p{random.randint(1,20)}",
            "kamar": f"kamar:k{random.randint(1,10)}",
            "status": random.choice(["Aktif", "Selesai"]),
            "lama_rawat": random.randint(1, 14),
            "diagnosa": random.choice(diagnosa_list),
            "tanggal_masuk": masuk_date
        })
    print("[SEEDER] 30 Rawat Inap berhasil dibuat.")

    # 6. Buat Tagihan
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

    # 7. Buat Klaim Asuransi
    for i in range(1, 6):
        db.create(f"klaim_asuransi:ka{i}", {
            "tagihan": f"tagihan:t{random.randint(1,15)}",
            "status_klaim": random.choice(["Proses", "Ditolak", "Disetujui"])
        })
    print("[SEEDER] 5 Klaim Asuransi berhasil dibuat.")

    # 8. Buat Audit Logs dummy (simulasi aktivitas role)
    actions = [
        {"role": "dokter", "action": "VIEW_PATIENT", "resource": "pasien:p3", "details": {"halaman": "Workspace AI"}},
        {"role": "dokter", "action": "AI_DIAGNOSIS", "resource": "ai:icd10", "details": {"gejala": "demam tinggi, batuk"}},
        {"role": "dokter", "action": "VIEW_REKAM_MEDIS", "resource": "rawat_inap:ri5", "details": {"pasien": "Budi Santoso"}},
        {"role": "perawat", "action": "VIEW_MONITORING", "resource": "kamar:k2", "details": {"halaman": "Monitoring Pasien"}},
        {"role": "perawat", "action": "UPDATE_STATUS_KAMAR", "resource": "kamar:k4", "details": {"status": "Terisi"}},
        {"role": "perawat", "action": "CHECK_VITAL_SIGN", "resource": "pasien:p7", "details": {"tekanan_darah": "120/80"}},
        {"role": "apoteker", "action": "VIEW_RESEP", "resource": "resep:r1", "details": {"halaman": "Apotek & Resep"}},
        {"role": "apoteker", "action": "DISPENSE_OBAT", "resource": "obat:paracetamol", "details": {"qty": 10}},
        {"role": "cs", "action": "REGISTER_PASIEN", "resource": "pasien:p15", "details": {"nama": "Pasien Baru"}},
        {"role": "cs", "action": "CHECK_BPJS", "resource": "bpjs:verification", "details": {"no_bpjs": "001234567"}},
        {"role": "cs", "action": "VIEW_ANTRIAN", "resource": "antrian", "details": {"total": 12}},
        {"role": "manager", "action": "VIEW_DASHBOARD", "resource": "dashboard", "details": {"halaman": "Executive Dashboard"}},
        {"role": "manager", "action": "VIEW_RESOURCES", "resource": "resources", "details": {"halaman": "Optimasi Sumber Daya"}},
        {"role": "manager", "action": "VIEW_COST", "resource": "cost_insurance", "details": {"halaman": "Biaya & Asuransi"}},
        {"role": "manager", "action": "DOWNLOAD_REPORT", "resource": "laporan:bulanan", "details": {"bulan": "April 2026"}},
        {"role": "superadmin", "action": "CREATE_USER", "resource": "users:dokter", "details": {"email": "dokter@darsi.local"}},
        {"role": "superadmin", "action": "UPDATE_CONFIG", "resource": "api_config:ollama", "details": {"value": "http://localhost:11434"}},
    ]
    for i, act in enumerate(actions):
        log_time = (today - timedelta(hours=random.randint(1, 72), minutes=random.randint(0, 59)))
        db.create("audit_logs", {
            "user_id": act["role"],
            "role": act["role"],
            "action": act["action"],
            "resource": act["resource"],
            "details": act["details"],
            "created_at": log_time.isoformat()
        })
    print(f"[SEEDER] {len(actions)} Audit Logs berhasil dibuat (simulasi aktivitas per role).")

    print("[SEEDER] ✅ Seeding selesai!")

if __name__ == "__main__":
    seed_data()
