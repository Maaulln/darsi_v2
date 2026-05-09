"""
routers/external_api.py — API Masuk (Pihak Ketiga -> Data DARSI)
================================================================
Menerima data dari sumber eksternal (API rumah sakit lain, BPJS, SIMRS lama, dll),
membersihkan/transformasi data agar sesuai schema database DARSI,
lalu menyimpannya ke SurrealDB.

Fitur:
- Data cleaning & normalization otomatis
- Field mapping fleksibel
- Webhook tester untuk validasi koneksi
- Contoh konfigurasi bawaan untuk admin
"""
from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, List, Optional
from datetime import datetime
import re
import hashlib

from database import select, create, query

router = APIRouter(
    prefix="/api/external",
    tags=["external-api"],
    responses={404: {"description": "Not found"}},
)

# ─────────────────────────────────────────────────────────────────────────────
# Schema DARSI — definisi field standar yang diharapkan di database
# ─────────────────────────────────────────────────────────────────────────────

DARSI_PASIEN_SCHEMA = {
    "nama": {"type": "string", "required": True, "aliases": ["name", "patient_name", "nama_pasien", "nama_lengkap", "fullname", "full_name"]},
    "penjamin": {"type": "string", "required": False, "aliases": ["insurance", "asuransi", "jaminan", "payer", "guarantor"], "default": "Umum"},
    "umur": {"type": "int", "required": False, "aliases": ["age", "usia", "tahun", "years"], "default": 0},
    "no_rm": {"type": "string", "required": False, "aliases": ["medical_record", "mrn", "no_rekam_medis", "rekam_medis", "rm_number"], "default": ""},
    "jenis_kelamin": {"type": "string", "required": False, "aliases": ["gender", "sex", "kelamin", "jk"], "default": ""},
    "alamat": {"type": "string", "required": False, "aliases": ["address", "alamat_rumah", "domisili", "home_address"], "default": ""},
    "no_telp": {"type": "string", "required": False, "aliases": ["phone", "telephone", "telepon", "hp", "handphone", "phone_number"], "default": ""},
    "tanggal_lahir": {"type": "string", "required": False, "aliases": ["dob", "birth_date", "tgl_lahir", "birthdate", "date_of_birth"], "default": ""},
}

DARSI_KAMAR_SCHEMA = {
    "nama": {"type": "string", "required": True, "aliases": ["name", "room_name", "nama_kamar", "room"]},
    "status": {"type": "string", "required": False, "aliases": ["room_status", "status_kamar", "availability"], "default": "Kosong"},
}

DARSI_TAGIHAN_SCHEMA = {
    "pasien": {"type": "string", "required": True, "aliases": ["patient_id", "id_pasien", "patient"]},
    "total_tagihan": {"type": "int", "required": True, "aliases": ["amount", "total", "billing_amount", "jumlah", "biaya"]},
    "status_bayar": {"type": "string", "required": False, "aliases": ["payment_status", "status", "paid"], "default": "Belum Bayar"},
}

SCHEMA_MAP = {
    "pasien": DARSI_PASIEN_SCHEMA,
    "kamar": DARSI_KAMAR_SCHEMA,
    "tagihan": DARSI_TAGIHAN_SCHEMA,
}


# ─────────────────────────────────────────────────────────────────────────────
# Data Cleaning & Normalization Functions
# ─────────────────────────────────────────────────────────────────────────────

def normalize_key(key: str) -> str:
    """Ubah key apapun ke format snake_case lowercase"""
    key = key.strip().lower()
    key = re.sub(r'[\s\-\.]+', '_', key)
    key = re.sub(r'[^a-z0-9_]', '', key)
    return key


def clean_string(value: Any) -> str:
    """Bersihkan value string: trim, capitalize, hapus karakter aneh"""
    if value is None:
        return ""
    s = str(value).strip()
    # Hapus karakter non-printable
    s = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', s)
    # Hapus spasi ganda
    s = re.sub(r'\s+', ' ', s)
    return s


def clean_int(value: Any) -> int:
    """Konversi ke integer, termasuk menangani string"""
    if value is None:
        return 0
    try:
        # Hapus karakter non-numeric
        cleaned = re.sub(r'[^\d\.\-]', '', str(value))
        return int(float(cleaned)) if cleaned else 0
    except (ValueError, TypeError):
        return 0


def normalize_gender(value: str) -> str:
    """Standarisasi gender ke format DARSI"""
    v = clean_string(value).lower()
    if v in ['l', 'laki-laki', 'laki', 'male', 'm', 'pria', 'cowok']:
        return 'Laki-laki'
    elif v in ['p', 'perempuan', 'female', 'f', 'wanita', 'cewek']:
        return 'Perempuan'
    return v.title() if v else ""


def normalize_penjamin(value: str) -> str:
    """Standarisasi nama penjamin/asuransi"""
    v = clean_string(value).lower()
    if v in ['bpjs', 'bpjs kesehatan', 'jkn', 'bpjs-kes']:
        return 'BPJS'
    elif v in ['umum', 'general', 'cash', 'tunai', 'pribadi', 'mandiri']:
        return 'Umum'
    elif 'asuransi' in v or 'insurance' in v or 'swasta' in v:
        return 'Asuransi Swasta'
    return clean_string(value).title() if value else 'Umum'


def normalize_status_bayar(value: str) -> str:
    """Standarisasi status pembayaran"""
    v = clean_string(value).lower()
    if v in ['lunas', 'paid', 'settled', 'done', 'selesai', 'dibayar']:
        return 'Lunas'
    elif v in ['belum bayar', 'unpaid', 'pending', 'belum', 'open', 'outstanding']:
        return 'Belum Bayar'
    return 'Belum Bayar'


def normalize_status_kamar(value: str) -> str:
    """Standarisasi status kamar"""
    v = clean_string(value).lower()
    if v in ['kosong', 'empty', 'available', 'free', 'tersedia']:
        return 'Kosong'
    elif v in ['terisi', 'occupied', 'booked', 'dipakai']:
        return 'Terisi'
    elif v in ['penuh', 'full', 'habis']:
        return 'Penuh'
    return 'Kosong'


def clean_phone(value: str) -> str:
    """Standarisasi nomor telepon ke format Indonesia"""
    phone = re.sub(r'[^\d+]', '', str(value))
    if phone.startswith('0'):
        phone = '+62' + phone[1:]
    elif phone.startswith('62') and not phone.startswith('+'):
        phone = '+' + phone
    return phone


def map_fields(raw_data: Dict, schema: Dict) -> Dict:
    """
    Map field dari data mentah ke schema DARSI.
    Mencari kecocokan field berdasarkan aliases.
    """
    result = {}
    normalized_raw = {normalize_key(k): v for k, v in raw_data.items()}

    for darsi_field, field_def in schema.items():
        value = None

        # Cek nama field langsung
        if darsi_field in normalized_raw:
            value = normalized_raw[darsi_field]
        else:
            # Cek aliases
            for alias in field_def.get("aliases", []):
                if normalize_key(alias) in normalized_raw:
                    value = normalized_raw[normalize_key(alias)]
                    break

        # Terapkan cleaning berdasarkan tipe
        if value is not None:
            if field_def["type"] == "string":
                value = clean_string(value)
            elif field_def["type"] == "int":
                value = clean_int(value)
        elif field_def.get("default") is not None:
            value = field_def["default"]
        elif field_def.get("required"):
            # Field required tapi tidak ada — akan ditandai
            value = None

        if value is not None:
            result[darsi_field] = value

    return result


def clean_single_record(raw_data: Dict, target_table: str) -> Dict:
    """
    Bersihkan dan transformasi satu record data mentah ke format DARSI.
    """
    schema = SCHEMA_MAP.get(target_table)
    if not schema:
        return raw_data

    cleaned = map_fields(raw_data, schema)

    # Normalisasi khusus per field
    if target_table == "pasien":
        if "jenis_kelamin" in cleaned:
            cleaned["jenis_kelamin"] = normalize_gender(cleaned["jenis_kelamin"])
        if "penjamin" in cleaned:
            cleaned["penjamin"] = normalize_penjamin(cleaned["penjamin"])
        if "no_telp" in cleaned:
            cleaned["no_telp"] = clean_phone(cleaned["no_telp"])
        if "nama" in cleaned:
            cleaned["nama"] = cleaned["nama"].title()

    elif target_table == "kamar":
        if "status" in cleaned:
            cleaned["status"] = normalize_status_kamar(cleaned["status"])

    elif target_table == "tagihan":
        if "status_bayar" in cleaned:
            cleaned["status_bayar"] = normalize_status_bayar(cleaned["status_bayar"])

    # Tambahkan metadata
    cleaned["_imported_at"] = datetime.now().isoformat()
    cleaned["_source"] = "external_api"

    return cleaned


# ─────────────────────────────────────────────────────────────────────────────
# API Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/ingest/{target_table}")
def ingest_external_data(target_table: str, payload: Dict[str, Any]):
    """
    Terima data dari API eksternal, bersihkan, lalu simpan ke tabel DARSI.

    **target_table**: pasien | kamar | tagihan

    **Payload Format**:
    ```json
    {
      "source": "Nama Sumber (opsional)",
      "data": [
        {"name": "John Doe", "age": 30, "insurance": "BPJS"},
        {"nama_pasien": "Jane", "usia": 25, "jaminan": "Umum"}
      ]
    }
    ```

    Sistem akan otomatis:
    1. Mapping field alias → field DARSI
    2. Cleaning & normalisasi data
    3. Menyimpan ke database
    """
    if target_table not in SCHEMA_MAP:
        raise HTTPException(
            status_code=400,
            detail=f"Tabel '{target_table}' tidak dikenali. Gunakan: {list(SCHEMA_MAP.keys())}"
        )

    raw_records = payload.get("data", [])
    source_name = payload.get("source", "unknown")

    if not raw_records:
        raise HTTPException(status_code=400, detail="Field 'data' kosong atau tidak ada")

    if not isinstance(raw_records, list):
        raw_records = [raw_records]

    results = {
        "total_received": len(raw_records),
        "total_cleaned": 0,
        "total_saved": 0,
        "total_skipped": 0,
        "cleaning_report": [],
        "errors": [],
    }

    for i, raw in enumerate(raw_records):
        try:
            # Clean & transform
            cleaned = clean_single_record(raw, target_table)
            cleaned["_source_name"] = source_name

            # Cek required fields
            schema = SCHEMA_MAP[target_table]
            missing_required = [
                f for f, d in schema.items()
                if d.get("required") and f not in cleaned
            ]

            if missing_required:
                results["total_skipped"] += 1
                results["errors"].append({
                    "index": i,
                    "reason": f"Missing required fields: {missing_required}",
                    "raw_data": raw
                })
                continue

            results["total_cleaned"] += 1

            # Report perubahan
            changes = []
            for key in cleaned:
                if key.startswith("_"):
                    continue
                original_value = raw.get(key)
                if original_value is not None and str(original_value) != str(cleaned[key]):
                    changes.append({
                        "field": key,
                        "original": str(original_value),
                        "cleaned": str(cleaned[key]),
                    })

            if changes:
                results["cleaning_report"].append({
                    "index": i,
                    "changes": changes
                })

            # Simpan ke database
            saved = create(target_table, cleaned)
            if saved:
                results["total_saved"] += 1

        except Exception as e:
            results["total_skipped"] += 1
            results["errors"].append({
                "index": i,
                "reason": str(e),
                "raw_data": raw
            })

    # Log aktivitas
    create("audit_logs", {
        "user_id": "external_api",
        "action": "INGEST_DATA",
        "resource": target_table,
        "details": {
            "source": source_name,
            "received": results["total_received"],
            "saved": results["total_saved"],
            "skipped": results["total_skipped"],
        },
        "created_at": datetime.now().isoformat()
    })

    return {
        "status": "success",
        "message": f"Data berhasil diproses: {results['total_saved']}/{results['total_received']} tersimpan",
        "results": results
    }


@router.post("/preview-clean/{target_table}")
def preview_cleaning(target_table: str, payload: Dict[str, Any]):
    """
    Preview hasil cleaning tanpa menyimpan ke database.
    Berguna untuk testing sebelum ingest sebenarnya.
    """
    if target_table not in SCHEMA_MAP:
        raise HTTPException(
            status_code=400,
            detail=f"Tabel '{target_table}' tidak dikenali. Gunakan: {list(SCHEMA_MAP.keys())}"
        )

    raw_records = payload.get("data", [])
    if not isinstance(raw_records, list):
        raw_records = [raw_records]

    previews = []
    for raw in raw_records:
        cleaned = clean_single_record(raw, target_table)
        previews.append({
            "original": raw,
            "cleaned": cleaned,
        })

    return {
        "status": "success",
        "message": f"Preview {len(previews)} record(s) — TIDAK disimpan ke database",
        "schema_used": target_table,
        "available_fields": list(SCHEMA_MAP[target_table].keys()),
        "previews": previews
    }


@router.get("/schema/{target_table}")
def get_table_schema(target_table: str):
    """
    Lihat schema DARSI untuk tabel tertentu.
    Menampilkan field yang diterima beserta alias-aliasnya.
    """
    if target_table not in SCHEMA_MAP:
        raise HTTPException(
            status_code=400,
            detail=f"Tabel '{target_table}' tidak dikenali. Gunakan: {list(SCHEMA_MAP.keys())}"
        )

    schema = SCHEMA_MAP[target_table]
    fields_info = []
    for field, definition in schema.items():
        fields_info.append({
            "field": field,
            "type": definition["type"],
            "required": definition.get("required", False),
            "aliases": definition.get("aliases", []),
            "default": definition.get("default"),
        })

    return {
        "status": "success",
        "table": target_table,
        "fields": fields_info,
        "tip": "Data dari API luar bisa menggunakan nama field alias apapun, akan di-mapping otomatis"
    }


@router.get("/schemas")
def get_all_schemas():
    """Lihat semua schema tabel yang didukung"""
    all_schemas = {}
    for table, schema in SCHEMA_MAP.items():
        all_schemas[table] = {
            field: {
                "type": d["type"],
                "required": d.get("required", False),
                "aliases": d.get("aliases", []),
            }
            for field, d in schema.items()
        }
    return {
        "status": "success",
        "tables": list(SCHEMA_MAP.keys()),
        "schemas": all_schemas
    }


# ─────────────────────────────────────────────────────────────────────────────
# Webhook Tester
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/webhook-test")
def test_webhook(payload: Dict[str, Any]):
    """
    Endpoint tester untuk menerima webhook dari n8n, Postman, atau service lain.
    Menerima payload apapun dan mengembalikan echo + analisis.
    Berguna untuk testing koneksi sebelum integrasi sesungguhnya.
    """
    now = datetime.now().isoformat()

    # Analisis payload
    analysis = {
        "total_keys": len(payload),
        "keys": list(payload.keys()),
        "data_types": {k: type(v).__name__ for k, v in payload.items()},
        "has_data_array": isinstance(payload.get("data"), list),
        "data_count": len(payload.get("data", [])) if isinstance(payload.get("data"), list) else 0,
    }

    # Cek apakah bisa di-mapping ke salah satu schema DARSI
    suggestions = []
    if isinstance(payload.get("data"), list) and len(payload["data"]) > 0:
        sample = payload["data"][0]
        sample_keys = {normalize_key(k) for k in sample.keys()}

        for table, schema in SCHEMA_MAP.items():
            match_count = 0
            total_fields = len(schema)
            for field, definition in schema.items():
                all_names = {field} | {normalize_key(a) for a in definition.get("aliases", [])}
                if sample_keys & all_names:
                    match_count += 1
            if match_count > 0:
                suggestions.append({
                    "table": table,
                    "match": f"{match_count}/{total_fields} fields",
                    "confidence": f"{round(match_count / total_fields * 100)}%",
                    "ingest_url": f"/api/external/ingest/{table}"
                })

    # Log test
    create("audit_logs", {
        "user_id": "webhook_tester",
        "action": "WEBHOOK_TEST",
        "resource": "external_api",
        "details": {"keys": list(payload.keys()), "timestamp": now},
        "created_at": now
    })

    return {
        "status": "success",
        "message": "✅ Webhook diterima! Koneksi berhasil.",
        "received_at": now,
        "echo": payload,
        "analysis": analysis,
        "schema_suggestions": suggestions,
        "next_steps": [
            "Jika data sudah sesuai, gunakan POST /api/external/ingest/{table} untuk menyimpan",
            "Gunakan POST /api/external/preview-clean/{table} untuk preview cleaning tanpa menyimpan",
            "Lihat schema DARSI di GET /api/external/schemas"
        ]
    }


@router.get("/example")
def get_example_payload():
    """
    Contoh payload untuk admin:
    Menampilkan contoh data dari berbagai format API rumah sakit lain,
    dan bagaimana DARSI akan membersihkannya.
    """
    example_external_api = {
        "source": "RS Contoh Jakarta",
        "data": [
            {
                "patient_name": "AHMAD FAUZI",
                "age": "45 tahun",
                "gender": "L",
                "insurance": "bpjs kesehatan",
                "phone": "08123456789",
                "address": "Jl. Merdeka No. 10, Surabaya"
            },
            {
                "nama_lengkap": "siti nurhaliza",
                "usia": 32,
                "jk": "P",
                "jaminan": "umum",
                "hp": "0856-1234-5678",
                "alamat_rumah": "Jl. Pahlawan 5"
            },
            {
                "full_name": "  budi  santoso  ",
                "years": "28",
                "sex": "male",
                "payer": "Asuransi Prudential",
                "telephone": "+6281234567890"
            }
        ]
    }

    # Simulasi cleaning
    cleaned_results = []
    for raw in example_external_api["data"]:
        cleaned = clean_single_record(raw, "pasien")
        cleaned_results.append({
            "sebelum": raw,
            "sesudah": cleaned,
        })

    return {
        "status": "success",
        "title": "📋 Contoh: Cara Memasukkan Data dari API Luar",
        "description": "Lihat bagaimana data dengan format berbeda-beda dibersihkan otomatis menjadi format DARSI",
        "contoh_payload": example_external_api,
        "hasil_cleaning": cleaned_results,
        "cara_pakai": {
            "step_1": "Kirim data ke POST /api/external/ingest/pasien dengan payload seperti contoh di atas",
            "step_2": "Sistem akan otomatis mengenali field meskipun namanya berbeda (name, patient_name, nama_lengkap, dll)",
            "step_3": "Data akan dibersihkan: trim spasi, normalisasi gender, format telepon, dll",
            "step_4": "Data yang sudah bersih langsung tersimpan di database DARSI",
            "preview": "Gunakan POST /api/external/preview-clean/pasien untuk melihat hasil cleaning tanpa menyimpan",
        },
        "supported_tables": list(SCHEMA_MAP.keys()),
    }
