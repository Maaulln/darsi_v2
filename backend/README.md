# DARSI v2 — Data Cleaning Pipeline

## Overview

Pipeline pembersihan data DARSI SIMRS dengan alur: JSON (kotor) → SQLite3 (mentah) → SQLite3 (bersih).

| Komponen     | Deskripsi                                                             |
| ------------ | --------------------------------------------------------------------- |
| Python       | 3.9+ (stdlib only — no pip install needed)                            |
| Tiga Skrip   | generate dirty JSON, konversi ke SQLite3, pembersihan data            |
| Output Utama | `darsi_clean.db` (database bersih) + `cleaning_report.json` (laporan) |

---

## Struktur Folder

```
backend/
├── api/                          # FastAPI backend
│   ├── main.py                   # Entry point ASGI
│   ├── database.py               # SQLite connection helper
│   └── routers/                  # API endpoint routes
│
├── data_pipeline/                # Database generation & cleaning
│   ├── generate_dirty_json.py    # Generate JSON dengan data kotor
│   ├── json_to_sqlite.py         # Konversi JSON ke SQLite3
│   └── cleaning_pipeline.py      # Normalisasi & cleaning
│
├── requirements.txt              # Python dependencies
├── README.md                     # Dokumentasi ini
└── .gitignore                    # File patterns to ignore
```

---

## Alur Kerja Lengkap

### 1️⃣ Generate Data Kotor (JSON)

```bash
cd Darsi_v2/backend
python3 data_pipeline/generate_dirty_json.py --output darsi_dirty.json
```

Atau dari folder backend:

```bash
python3 data_pipeline/generate_dirty_json.py --output darsi_dirty.json
```

**Opsi CLI:**

- `--output` — Nama file JSON output (default: `darsi_dirty.json`)
- `--seed` — Seed acak untuk hasil yang bisa diulang (default: `42`)
- `--patients` — Jumlah pasien (default: `24`)
- `--rooms` — Jumlah kamar (default: `18`)
- `--admissions` — Jumlah rawat inap (default: `36`)
- `--procedures` — Jumlah tindakan (default: `32`)
- `--medications` — Jumlah obat (default: `34`)
- `--tariffs` — Jumlah tarif (default: `20`)
- `--operations` — Jumlah biaya operasional (default: `16`)

**Contoh dengan custom parameter:**

```bash
python3 data_pipeline/generate_dirty_json.py --seed 123 --patients 50 --rooms 30 --admissions 80
```

**Output:** File JSON dengan struktur `metadata` + `tables[]`, berisi data sengaja kotor:

- Format tanggal campur aduk (ISO, slash, Indonesian, English)
- Nilai noise seperti `N/A`, `-`, `?`, `null`
- Label kategori tidak konsisten (`BPJS`, `bpjs`, `JKN`, `asuransi swasta`)
- Angka negatif pada field biaya
- Nama dengan spasi berlebih, uppercase, lowercase, typo

---

### 2️⃣ Konversi JSON ke SQLite3

```bash
python3 data_pipeline/json_to_sqlite.py --input darsi_dirty.json --output darsi_dirty.db --replace
```

**Opsi CLI:**

- `--input` — File JSON sumber (default: `darsi_dirty.json`)
- `--output` — File SQLite output (default: `darsi_dirty.db`)
- `--replace` — Timpa file output jika sudah ada (flag)

**Output:** Database SQLite3 mentah dengan 9 tabel:

- `pasien`, `kamar`, `rawat_inap`, `tagihan`
- `klaim_asuransi`, `detail_tindakan`, `detail_obat`
- `tarif_layanan`, `biaya_operasional`

Semua kolom bertipe TEXT, data disimpan apa adanya tanpa normalisasi (siap dibersihkan).

---

### 3️⃣ Pembersihan Data (Cleaning Pipeline)

```bash
python3 data_pipeline/cleaning_pipeline.py --input darsi_dirty.db --output darsi_clean.db
```

**Opsi CLI:**

- `--input` — File SQLite sumber (default: `darsi_simrs.db`)
- `--output` — File SQLite output (default: `darsi_clean.db`)

**Output:**

- `darsi_clean.db` — Database bersih dengan normalisasi diterapkan di semua tabel
- `cleaning_report.json` — Laporan statistik: berapa baris, tanggal dinormalisasi, noise dihapus, nilai invalid ditandai

---

## Normalisasi yang Diterapkan

### Per Tabel

| Tabel               | Normalisasi                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------- |
| `pasien`            | Tanggal lahir ISO, jenis_kelamin canonical, penjamin canonical, nama title-case, noise→NULL, deteksi duplikat |
| `kamar`             | jenis_kamar canonical (VIP/Kelas 1-3/ICU), status canonical, tarif negatif→NULL                               |
| `rawat_inap`        | Tanggal masuk/keluar ISO, lama_rawat ≤ 0→NULL, noise text→NULL                                                |
| `tagihan`           | Biaya negatif→NULL, tanggal ISO, status bayar canonical, text noise→NULL                                      |
| `klaim_asuransi`    | Tanggal ISO, amount negatif→NULL, penjamin canonical                                                          |
| `detail_tindakan`   | Tanggal ISO, biaya negatif→NULL, text noise→NULL                                                              |
| `detail_obat`       | Tanggal ISO, numerik negatif→NULL                                                                             |
| `tarif_layanan`     | Tanggal berlaku ISO, tarif negatif→NULL, text noise→NULL                                                      |
| `biaya_operasional` | Jumlah negatif→NULL, text noise→NULL                                                                          |

### Format Tanggal yang Dikenali

Pipeline dapat mengenali dan mengonversi ke format ISO `YYYY-MM-DD`:

- `YYYY-MM-DD` — Pass-through (sudah ISO)
- `dd/mm/yyyy`, `dd-mm-yyyy` — Format DD/MM/YYYY
- `yyyymmdd` — Compact format
- `15 Jan 2023`, `Jan 15, 2023` — English month abbreviation
- `15 Januari 2023` — Indonesian full month
- `15 Ags 2023` — Indonesian abbreviation (Jan Feb Mar Apr Mei Jun Jul Ags Sep Okt Nov Des)
- `NULL`, `N/A`, `null`, `-`, `?` — Disimpan sebagai SQL NULL

---

## Output Files

### `darsi_clean.db`

Database bersih hasil cleaning, siap digunakan oleh backend API. Tabel `pasien` akan memiliki kolom tambahan:

- `is_duplicate INTEGER` — Flag untuk near-duplicates yang terdeteksi

### `cleaning_report.json`

Laporan statistik perubahan per tabel:

```json
{
  "generated_at": "2026-05-02 09:45:00",
  "source_db": "darsi_dirty.db",
  "output_db": "darsi_clean.db",
  "tables": {
    "pasien": {
      "total_rows": 24,
      "dates_normalized": 8,
      "ids_normalized": 12,
      "invalid_values_nulled": 3,
      "duplicates_flagged": 2,
      "noise_replaced": 5
    }
  }
}
```

Laporan ini membantu mengidentifikasi berapa banyak data yang dirubah dan jenis perubahan apa yang dilakukan.
