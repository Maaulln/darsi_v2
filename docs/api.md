# 📡 DARSI API — Panduan Lengkap

## Daftar Isi
- [Base URL](#base-url)
- [API Keluar (DARSI → Pihak Ketiga)](#api-keluar)
- [API Masuk (Pihak Ketiga → DARSI)](#api-masuk)
- [Cara Memasukkan API Luar](#cara-memasukkan-api-luar)
- [Webhook Tester](#webhook-tester)
- [Superadmin API](#superadmin-api)
- [Dashboard & Data API](#dashboard--data-api)

---

## Base URL

| Service | URL |
|---------|-----|
| Backend API | `http://localhost:8001` |
| API Docs (Swagger) | `http://localhost:8001/docs` |
| Frontend | `http://localhost:5173` |

---

## API Keluar

Endpoint yang bisa dipanggil oleh pihak ketiga (n8n, Postman, dll) untuk **membaca** data DARSI.

### GET /api/n8n/pasien
Ambil data pasien.
```bash
curl http://localhost:8001/api/n8n/pasien?limit=10
```
**Response:**
```json
{
  "status": "success",
  "source": "DARSI",
  "data": [
    { "nama": "Pasien Dummy 1", "penjamin": "BPJS", "umur": 45 }
  ]
}
```

### GET /api/n8n/tagihan
Ambil data tagihan. Filter opsional: `?status_bayar=Lunas`
```bash
curl http://localhost:8001/api/n8n/tagihan
curl http://localhost:8001/api/n8n/tagihan?status_bayar=Belum%20Bayar
```

### GET /api/n8n/dashboard-summary
Summary cepat untuk notifikasi bot/telegram.
```bash
curl http://localhost:8001/api/n8n/dashboard-summary
```

---

## API Masuk

Endpoint untuk **menerima** data dari API luar dan menyimpannya ke database DARSI. Sistem otomatis membersihkan data agar sesuai schema DARSI.

### POST /api/external/ingest/{table}
Masukkan data ke tabel DARSI. Tabel yang didukung: `pasien`, `kamar`, `tagihan`.

```bash
curl -X POST http://localhost:8001/api/external/ingest/pasien \
  -H "Content-Type: application/json" \
  -d '{
    "source": "RS Contoh Jakarta",
    "data": [
      {
        "patient_name": "AHMAD FAUZI",
        "age": "45 tahun",
        "gender": "L",
        "insurance": "bpjs kesehatan",
        "phone": "08123456789"
      }
    ]
  }'
```

**Response:**
```json
{
  "status": "success",
  "message": "Data berhasil diproses: 1/1 tersimpan",
  "results": {
    "total_received": 1,
    "total_cleaned": 1,
    "total_saved": 1,
    "total_skipped": 0,
    "cleaning_report": [
      {
        "index": 0,
        "changes": [
          { "field": "nama", "original": "AHMAD FAUZI", "cleaned": "Ahmad Fauzi" }
        ]
      }
    ]
  }
}
```

### POST /api/external/preview-clean/{table}
Preview hasil cleaning **tanpa menyimpan** ke database.
```bash
curl -X POST http://localhost:8001/api/external/preview-clean/pasien \
  -H "Content-Type: application/json" \
  -d '{"data": [{"patient_name": "john doe", "age": "30", "gender": "m"}]}'
```

### GET /api/external/schemas
Lihat semua schema tabel yang didukung beserta alias field-nya.

### GET /api/external/example
Lihat contoh lengkap payload + hasil cleaning.

---

## Cara Memasukkan API Luar

### Langkah 1: Kenali Format Data Sumber
Misal data dari RS lain punya format:
```json
{
  "patient_name": "AHMAD",
  "age": "45 tahun",
  "gender": "L",
  "insurance": "bpjs"
}
```

### Langkah 2: Kirim ke Endpoint Ingest
Bungkus dalam format `{"source": "...", "data": [...]}`:
```bash
curl -X POST http://localhost:8001/api/external/ingest/pasien \
  -H "Content-Type: application/json" \
  -d '{
    "source": "RS Contoh",
    "data": [
      {"patient_name": "AHMAD", "age": "45 tahun", "gender": "L", "insurance": "bpjs"}
    ]
  }'
```

### Langkah 3: Sistem Otomatis Membersihkan
| Data Asli | Hasil Cleaning |
|-----------|---------------|
| `patient_name: "AHMAD"` | `nama: "Ahmad"` |
| `age: "45 tahun"` | `umur: 45` |
| `gender: "L"` | `jenis_kelamin: "Laki-laki"` |
| `insurance: "bpjs"` | `penjamin: "BPJS"` |

### Langkah 4: Preview Dulu (Opsional)
Gunakan `/preview-clean/` untuk cek tanpa simpan:
```bash
curl -X POST http://localhost:8001/api/external/preview-clean/pasien \
  -H "Content-Type: application/json" \
  -d '{"data": [{"patient_name": "AHMAD", "age": "45"}]}'
```

### Field Alias yang Dikenali

#### Tabel `pasien`
| Field DARSI | Alias yang dikenali |
|------------|---------------------|
| `nama` | name, patient_name, nama_pasien, nama_lengkap, fullname |
| `umur` | age, usia, tahun, years |
| `penjamin` | insurance, asuransi, jaminan, payer, guarantor |
| `jenis_kelamin` | gender, sex, kelamin, jk |
| `no_rm` | medical_record, mrn, no_rekam_medis |
| `alamat` | address, alamat_rumah, domisili |
| `no_telp` | phone, telephone, telepon, hp, handphone |

---

## Webhook Tester

Test koneksi webhook dari n8n atau service lain ke DARSI.

### POST /api/external/webhook-test
```bash
curl -X POST http://localhost:8001/api/external/webhook-test \
  -H "Content-Type: application/json" \
  -d '{"test": true, "message": "Hello DARSI"}'
```
Response akan berisi:
- Echo payload yang dikirim
- Analisis struktur data
- Saran tabel mana yang cocok untuk data tersebut

---

## Superadmin API

### POST /api/superadmin/login
```bash
curl -X POST http://localhost:8001/api/superadmin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@darsi.local", "password": "Admin@12345"}'
```

### Config Management
```
GET    /api/superadmin/config          # Semua config
GET    /api/superadmin/config/{key}    # Config by key
POST   /api/superadmin/config          # Buat config baru
PUT    /api/superadmin/config/{key}    # Update config
DELETE /api/superadmin/config/{key}    # Hapus config
```

### User Management
```
GET    /api/superadmin/users           # Semua user
POST   /api/superadmin/users           # Buat user baru
PUT    /api/superadmin/users/{id}      # Update user
DELETE /api/superadmin/users/{id}      # Hapus user
```

### Monitoring
```
GET /api/superadmin/audit-logs         # Audit logs
GET /api/superadmin/dashboard-stats    # Statistik
GET /api/superadmin/health             # Health check
```

---

## Dashboard & Data API

```
GET /api/health                        # Health check utama
GET /api/dashboard/*                   # Data dashboard
GET /api/resources/*                   # Data resources/kamar
GET /api/cost-insurance/*              # Data biaya & asuransi
GET /api/patient-experience            # Data patient experience
POST /api/ai/*                         # AI endpoints
```

---

## Tips
- Gunakan Swagger UI di `http://localhost:8001/docs` untuk coba semua endpoint interaktif
- Semua endpoint menerima/mengembalikan JSON
- Untuk integrasi n8n, gunakan node **HTTP Request** dengan URL endpoint di atas
