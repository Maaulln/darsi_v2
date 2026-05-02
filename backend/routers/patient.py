"""
routers/patient.py — /api/patient-experience
ALOS, readmission proxy, patient funnel, satisfaction (static).
"""
from fastapi import APIRouter
try:
    from ..database import query, query_one
except ImportError:
    from database import query, query_one

router = APIRouter(prefix="/api/patient-experience", tags=["patient"])

STATUS_COLOR = {
    "kritis": "#EF4444",
    "tinggi": "#F59E0B",
    "normal": "#10B981",
    "baik":   "#10B981",
}


@router.get("")
def get_patient_experience():
    # ── Overall KPIs ──────────────────────────────────────────────────────────
    total_ri = query_one(
        "SELECT COUNT(*) AS cnt FROM rawat_inap"
    ).get("cnt", 0)

    alos_row = query_one(
        """SELECT ROUND(AVG(lama_rawat), 1) AS alos
           FROM rawat_inap
           WHERE lama_rawat IS NOT NULL AND status='Selesai'"""
    )
    alos = alos_row.get("alos") or 0.0

    # Readmission proxy: pasien yang muncul >1x dalam rawat_inap
    readmit_row = query_one(
        """SELECT COUNT(*) AS cnt FROM (
             SELECT id_pasien FROM rawat_inap
             GROUP BY id_pasien HAVING COUNT(*) > 1
           )"""
    )
    readmit_pasien = readmit_row.get("cnt", 0)
    total_pasien   = query_one("SELECT COUNT(DISTINCT id_pasien) AS cnt FROM rawat_inap").get("cnt", 1) or 1
    readmission_rate = round(readmit_pasien / total_pasien * 100, 1)

    # ── Patient funnel ─────────────────────────────────────────────────────────
    total_selesai = query_one(
        "SELECT COUNT(*) AS cnt FROM rawat_inap WHERE status='Selesai'"
    ).get("cnt", 0)
    total_aktif   = query_one(
        "SELECT COUNT(*) AS cnt FROM rawat_inap WHERE status='Aktif'"
    ).get("cnt", 0)

    funnel = [
        {
            "stage": "Total Rawat Inap",
            "count": total_ri,
            "pct":   100.0,
            "color": "#1E3A5F",
            "sub":   "Total seluruh rekam medis",
        },
        {
            "stage": "Sudah Selesai",
            "count": total_selesai,
            "pct":   round(total_selesai / (total_ri or 1) * 100, 1),
            "color": "#0EA5E9",
            "sub":   "Pasien keluar / discharge",
        },
        {
            "stage": "Masih Aktif",
            "count": total_aktif,
            "pct":   round(total_aktif / (total_ri or 1) * 100, 1),
            "color": "#10B981",
            "sub":   "Pasien masih dirawat",
        },
        {
            "stage": "Readmisi (proxy)",
            "count": readmit_pasien,
            "pct":   round(readmit_pasien / total_pasien * 100, 1),
            "color": "#F59E0B",
            "sub":   "Pasien rawat inap >1x",
        },
    ]

    # ── ALOS by diagnosa (top 10) ─────────────────────────────────────────────
    alos_rows = query(
        """SELECT diagnosa,
                  ROUND(AVG(lama_rawat), 1) AS alos,
                  COUNT(*) AS cases
           FROM rawat_inap
           WHERE lama_rawat IS NOT NULL AND diagnosa IS NOT NULL
           GROUP BY diagnosa
           ORDER BY alos DESC
           LIMIT 10"""
    )
    TARGET_ALOS = 4.0  # national standard target
    alos_per_poli = []
    for r in alos_rows:
        a    = r["alos"] or 0.0
        diff = round(a - TARGET_ALOS, 1)
        if a > TARGET_ALOS + 1:
            status = "kritis"
        elif a > TARGET_ALOS:
            status = "tinggi"
        else:
            status = "baik"
        alos_per_poli.append({
            "poli":   r["diagnosa"],
            "alos":   a,
            "target": TARGET_ALOS,
            "diff":   diff,
            "cases":  r["cases"],
            "status": status,
            "fill":   STATUS_COLOR[status],
        })

    # ── Readmission by diagnosa (top 5) ──────────────────────────────────────
    readmit_diag = query(
        """SELECT ri.diagnosa, COUNT(*) AS cnt
           FROM rawat_inap ri
           WHERE ri.id_pasien IN (
             SELECT id_pasien FROM rawat_inap
             GROUP BY id_pasien HAVING COUNT(*) > 1
           )
           AND ri.diagnosa IS NOT NULL
           GROUP BY ri.diagnosa
           ORDER BY cnt DESC
           LIMIT 5"""
    )
    max_cnt = max((r["cnt"] for r in readmit_diag), default=1) or 1
    readmission_by_poli = []
    for r in readmit_diag:
        rate   = round(r["cnt"] / total_pasien * 100, 1)
        status = "kritis" if rate > 6 else ("tinggi" if rate > 4 else ("normal" if rate > 2 else "baik"))
        readmission_by_poli.append({
            "poli":   r["diagnosa"],
            "rate":   rate,
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
            "total_kunjungan":   total_ri,
            "alos":              alos,
            "alos_label":        f"{alos} hr",
            "readmission_rate":  readmission_rate,
            "readmission_label": f"{readmission_rate}%",
        },
        "funnel":              funnel,
        "alos_per_poli":       alos_per_poli,
        "readmission_by_poli": readmission_by_poli,
        "satisfaction":        satisfaction,
    }
