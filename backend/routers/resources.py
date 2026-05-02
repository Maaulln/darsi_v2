"""
routers/resources.py — /api/resources
Room occupancy by class, doctor list derived from rawat_inap.
"""
from fastapi import APIRouter
try:
    from ..database import query, query_one
except ImportError:
    from database import query, query_one

router = APIRouter(prefix="/api/resources", tags=["resources"])

COLOR_MAP = {
    "ICU":     "#EF4444",
    "VIP":     "#10B981",
    "Kelas 1": "#F59E0B",
    "Kelas 2": "#EF4444",
    "Kelas 3": "#10B981",
}


@router.get("")
def get_resources():
    # ── Room summary ─────────────────────────────────────────────────────────
    summary = query_one(
        """SELECT
             COUNT(*) AS total,
             SUM(CASE WHEN status IN ('Penuh','Terisi') THEN 1 ELSE 0 END) AS terisi,
             SUM(CASE WHEN status IN ('Tersedia','Kosong') THEN 1 ELSE 0 END) AS tersedia
           FROM kamar"""
    )
    total_tt  = summary.get("total", 0) or 0
    terisi_tt = summary.get("terisi", 0) or 0
    sedia_tt  = summary.get("tersedia", 0) or 0

    # ── Room by class ─────────────────────────────────────────────────────────
    class_rows = query(
        """SELECT
             jenis_kamar AS kelas,
             COUNT(*) AS kapasitas,
             SUM(CASE WHEN status IN ('Penuh','Terisi') THEN 1 ELSE 0 END) AS terisi
           FROM kamar
           WHERE jenis_kamar IS NOT NULL
           GROUP BY jenis_kamar
           ORDER BY CASE jenis_kamar
             WHEN 'ICU'     THEN 1
             WHEN 'VIP'     THEN 2
             WHEN 'Kelas 1' THEN 3
             WHEN 'Kelas 2' THEN 4
             WHEN 'Kelas 3' THEN 5
             ELSE 6 END"""
    )
    room_by_class = []
    kritis_count  = 0
    for r in class_rows:
        kap   = r["kapasitas"] or 1
        ter   = r["terisi"]    or 0
        pct   = round(ter / kap * 100, 1)
        if pct >= 90:
            kritis_count += 1
        room_by_class.append({
            "kelas":     r["kelas"],
            "kapasitas": kap,
            "terisi":    ter,
            "pct":       pct,
            "color":     COLOR_MAP.get(r["kelas"], "#94A3B8"),
        })

    # ── Heatmap placeholder (weekly BOR per room type) ────────────────────────
    # We don't have per-day room data, so derive from rawat_inap tanggal_masuk
    # For each jenis_kamar, compute average occupancy across weekdays
    heatmap = _compute_heatmap()

    # ── Doctor list from rawat_inap ───────────────────────────────────────────
    doc_rows = query(
        """SELECT dokter, COUNT(*) AS cases
           FROM rawat_inap
           WHERE dokter IS NOT NULL
           GROUP BY dokter
           ORDER BY cases DESC
           LIMIT 10"""
    )
    doctors = [
        {
            "name":   r["dokter"],
            "jadwal": "Sesuai jadwal",
            "cases":  r["cases"],
            "status": "aktif",
        }
        for r in doc_rows
    ]

    return {
        "room_summary": {
            "total_tt":    total_tt,
            "terisi":      terisi_tt,
            "tersedia":    sedia_tt,
            "bor":         round(terisi_tt / (total_tt or 1) * 100, 1),
            "kritis_count": kritis_count,
        },
        "room_by_class": room_by_class,
        "heatmap":       heatmap,
        "doctors":       doctors,
    }


def _compute_heatmap():
    """
    Build a simple heatmap: for each jenis_kamar × weekday,
    compute % of rawat_inap records whose tanggal_masuk fell on that weekday.
    Returns list of {room, days:[val,val,...]} for 7 weekdays.
    """
    from datetime import datetime
    rows = query(
        """SELECT ri.tanggal_masuk, k.jenis_kamar
           FROM rawat_inap ri
           JOIN kamar k ON ri.no_kamar = k.no_kamar
           WHERE ri.tanggal_masuk IS NOT NULL AND k.jenis_kamar IS NOT NULL"""
    )

    # Build count matrix: {jenis_kamar: [Mon,Tue,Wed,Thu,Fri,Sat,Sun]}
    from collections import defaultdict
    counts = defaultdict(lambda: [0] * 7)
    totals = defaultdict(int)

    for r in rows:
        try:
            d = datetime.strptime(r["tanggal_masuk"], "%Y-%m-%d")
            wd = d.weekday()  # 0=Mon … 6=Sun
            counts[r["jenis_kamar"]][wd] += 1
            totals[r["jenis_kamar"]] += 1
        except Exception:
            pass

    order = ["ICU", "VIP", "Kelas 1", "Kelas 2", "Kelas 3"]
    heatmap = []
    for jenis in order:
        if jenis not in counts:
            continue
        total = totals[jenis] or 1
        vals = [round(c / total * 100 * 7, 1) for c in counts[jenis]]
        heatmap.append({"room": jenis, "days": vals})

    return heatmap
