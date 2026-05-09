"""
routers/patient.py — /api/patient-experience
ALOS, readmission proxy, patient funnel, satisfaction (static).
"""
from fastapi import APIRouter
from database import select
from collections import defaultdict

router = APIRouter(prefix="/api/patient-experience", tags=["patient"])

STATUS_COLOR = {
    "kritis": "#EF4444",
    "tinggi": "#F59E0B",
    "normal": "#10B981",
    "baik":   "#10B981",
}


@router.get("")
def get_patient_experience():
    ri_all = select("rawat_inap") or []
    
    total_ri = len(ri_all)
    
    # Calculate ALOS (Average Length of Stay)
    total_selesai = 0
    total_aktif = 0
    total_lama_rawat = 0
    selesai_with_lama = 0
    
    # Readmission proxy: Group by id_pasien
    pasien_counts = defaultdict(int)
    diag_stats = defaultdict(lambda: {"lama_rawat": 0, "cases": 0})
    readmit_diag_counts = defaultdict(int)
    
    for ri in ri_all:
        status = ri.get("status", "")
        lama_rawat = float(ri.get("lama_rawat", 0) or 0)
        diagnosa = ri.get("diagnosa", "Umum")
        id_pasien = ri.get("id_pasien")
        
        if id_pasien:
            pasien_counts[id_pasien] += 1
            
        if status == "Selesai":
            total_selesai += 1
            if lama_rawat > 0:
                total_lama_rawat += lama_rawat
                selesai_with_lama += 1
        elif status == "Aktif":
            total_aktif += 1
            
        if lama_rawat > 0:
            diag_stats[diagnosa]["lama_rawat"] += lama_rawat
            diag_stats[diagnosa]["cases"] += 1

    alos = round(total_lama_rawat / selesai_with_lama, 1) if selesai_with_lama else 0.0

    readmit_pasien = sum(1 for count in pasien_counts.values() if count > 1)
    total_pasien = len(pasien_counts) or 1
    readmission_rate = round(readmit_pasien / total_pasien * 100, 1)
    
    # Readmission by diagnosa
    for ri in ri_all:
        if pasien_counts[ri.get("id_pasien")] > 1:
            readmit_diag_counts[ri.get("diagnosa", "Umum")] += 1

    # ── Patient funnel ─────────────────────────────────────────────────────────
    funnel = [
        {
            "stage": "Total Rawat Inap",
            "count": total_ri,
            "pct": 100.0,
            "color": "#1E3A5F",
            "sub": "Total seluruh rekam medis",
        },
        {
            "stage": "Sudah Selesai",
            "count": total_selesai,
            "pct": round(total_selesai / (total_ri or 1) * 100, 1),
            "color": "#0EA5E9",
            "sub": "Pasien keluar / discharge",
        },
        {
            "stage": "Masih Aktif",
            "count": total_aktif,
            "pct": round(total_aktif / (total_ri or 1) * 100, 1),
            "color": "#10B981",
            "sub": "Pasien masih dirawat",
        },
        {
            "stage": "Readmisi (proxy)",
            "count": readmit_pasien,
            "pct": round(readmit_pasien / total_pasien * 100, 1),
            "color": "#F59E0B",
            "sub": "Pasien rawat inap >1x",
        },
    ]

    # ── ALOS by diagnosa (top 10) ─────────────────────────────────────────────
    TARGET_ALOS = 4.0
    alos_per_poli = []
    
    for diag, stats in sorted(diag_stats.items(), key=lambda x: (x[1]["lama_rawat"]/x[1]["cases"] if x[1]["cases"] else 0), reverse=True)[:10]:
        a = round(stats["lama_rawat"] / stats["cases"], 1) if stats["cases"] else 0.0
        diff = round(a - TARGET_ALOS, 1)
        if a > TARGET_ALOS + 1:
            status = "kritis"
        elif a > TARGET_ALOS:
            status = "tinggi"
        else:
            status = "baik"
            
        alos_per_poli.append({
            "poli": diag,
            "alos": a,
            "target": TARGET_ALOS,
            "diff": diff,
            "cases": stats["cases"],
            "status": status,
            "fill": STATUS_COLOR[status],
        })

    # ── Readmission by diagnosa (top 5) ──────────────────────────────────────
    readmission_by_poli = []
    for diag, count in sorted(readmit_diag_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
        rate = round(count / total_pasien * 100, 1)
        status = "kritis" if rate > 6 else ("tinggi" if rate > 4 else ("normal" if rate > 2 else "baik"))
        readmission_by_poli.append({
            "poli": diag,
            "rate": rate,
            "target": 5.0,
            "status": status,
        })

    # ── Satisfaction (static — no survey table in DB) ──────────────────────
    satisfaction = [
        {"category": "Pelayanan Dokter",    "score": 4.6},
        {"category": "Pelayanan Perawat",   "score": 4.4},
        {"category": "Kebersihan Ruangan",  "score": 4.2},
        {"category": "Waktu Tunggu",        "score": 3.8},
        {"category": "Fasilitas & Sarana",  "score": 4.1},
        {"category": "Makanan & Gizi",      "score": 3.9},
    ]

    return {
        "kpis": {
            "total_kunjungan": total_ri,
            "alos": alos,
            "alos_label": f"{alos} hr",
            "readmission_rate": readmission_rate,
            "readmission_label": f"{readmission_rate}%",
        },
        "funnel": funnel,
        "alos_per_poli": alos_per_poli,
        "readmission_by_poli": readmission_by_poli,
        "satisfaction": satisfaction,
    }
