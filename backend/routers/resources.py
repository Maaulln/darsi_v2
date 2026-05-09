"""
routers/resources.py — /api/resources
Room occupancy by class, doctor list derived from rawat_inap.
"""
from fastapi import APIRouter
from database import select
import random

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
    kamars = select("kamar")
    rawat_inaps = select("rawat_inap")
    
    total_tt = len(kamars) if kamars else 0
    terisi_tt = 0
    sedia_tt = 0
    
    class_stats = {}
    
    for k in (kamars or []):
        st = k.get("status", "")
        if st in ("Penuh", "Terisi"):
            terisi_tt += 1
        elif st in ("Tersedia", "Kosong"):
            sedia_tt += 1
            
        jenis = k.get("jenis_kamar", "Kelas 3")
        if jenis not in class_stats:
            class_stats[jenis] = {"kapasitas": 0, "terisi": 0}
        
        class_stats[jenis]["kapasitas"] += 1
        if st in ("Penuh", "Terisi"):
            class_stats[jenis]["terisi"] += 1

    room_by_class = []
    kritis_count = 0
    order_map = {"ICU": 1, "VIP": 2, "Kelas 1": 3, "Kelas 2": 4, "Kelas 3": 5}
    
    sorted_classes = sorted(class_stats.keys(), key=lambda x: order_map.get(x, 6))
    
    for c in sorted_classes:
        kap = class_stats[c]["kapasitas"] or 1
        ter = class_stats[c]["terisi"]
        pct = round(ter / kap * 100, 1)
        if pct >= 90:
            kritis_count += 1
            
        room_by_class.append({
            "kelas": c,
            "kapasitas": kap,
            "terisi": ter,
            "pct": pct,
            "color": COLOR_MAP.get(c, "#94A3B8")
        })

    # Heatmap (dummy based on data)
    heatmap = [
        {"room": "ICU", "days": [80, 85, 90, 92, 88, 75, 70]},
        {"room": "VIP", "days": [60, 65, 70, 75, 80, 85, 90]},
        {"room": "Kelas 1", "days": [70, 72, 75, 80, 85, 88, 90]},
        {"room": "Kelas 2", "days": [85, 88, 90, 95, 90, 85, 80]},
        {"room": "Kelas 3", "days": [90, 95, 98, 100, 98, 95, 90]}
    ]

    # Doctors list
    doc_counts = {}
    for ri in (rawat_inaps or []):
        doc = ri.get("dokter")
        if doc:
            doc_counts[doc] = doc_counts.get(doc, 0) + 1
            
    sorted_docs = sorted(doc_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    
    doctors = [
        {
            "name": d[0],
            "jadwal": "Sesuai jadwal",
            "cases": d[1],
            "status": "aktif",
        }
        for d in sorted_docs
    ]

    return {
        "room_summary": {
            "total_tt": total_tt,
            "terisi": terisi_tt,
            "tersedia": sedia_tt,
            "bor": round(terisi_tt / (total_tt or 1) * 100, 1),
            "kritis_count": kritis_count,
        },
        "room_by_class": room_by_class,
        "heatmap": heatmap,
        "doctors": doctors,
    }
