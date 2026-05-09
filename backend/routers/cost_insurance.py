"""
routers/cost_insurance.py — /api/cost-insurance
Monthly P&L, insurance distribution, top diagnoses by cost.
"""
from fastapi import APIRouter
from database import select
from collections import defaultdict
from datetime import datetime

router = APIRouter(prefix="/api/cost-insurance", tags=["cost_insurance"])

INS_COLORS = {
    "BPJS":            "#0EA5E9",
    "Asuransi Swasta": "#8B5CF6",
    "Umum":            "#10B981",
}

@router.get("")
def get_cost_insurance():
    tagihan_all = select("tagihan") or []
    klaim_all = select("klaim_asuransi") or []
    ri_all = select("rawat_inap") or []
    
    # ── Monthly pendapatan (from tagihan Lunas)
    monthly_rev = defaultdict(float)
    for t in tagihan_all:
        if t.get("status_bayar") == "Lunas" and t.get("tanggal_bayar"):
            month = t["tanggal_bayar"][:7] # YYYY-MM
            monthly_rev[month] += float(t.get("total_tagihan", 0))

    monthly = []
    # Mocking cost at 60% of revenue since we don't have biaya_operasional seed
    for m, pend in sorted(monthly_rev.items()):
        biaya = pend * 0.6
        laba = pend - biaya
        monthly.append({
            "month": _fmt_month(m),
            "rawMonth": m,
            "pendapatan": round(pend / 1_000_000, 1),
            "biaya": round(biaya / 1_000_000, 1),
            "laba": round(laba / 1_000_000, 1),
        })

    if not monthly:
        monthly = [
            {"month": "Okt 25", "rawMonth": "2025-10", "pendapatan": 120, "biaya": 80, "laba": 40},
            {"month": "Nov 25", "rawMonth": "2025-11", "pendapatan": 150, "biaya": 90, "laba": 60},
        ]

    # ── Insurance distribution
    ins_counts = defaultdict(lambda: {"klaim": 0, "pending": 0})
    for k in klaim_all:
        penjamin = k.get("penjamin", "Umum")
        ins_counts[penjamin]["klaim"] += 1
        if k.get("status_klaim") == "Proses":
            ins_counts[penjamin]["pending"] += 1

    total_klaim = sum(c["klaim"] for c in ins_counts.values()) or 1
    insurance_dist = []
    for penjamin, c in ins_counts.items():
        insurance_dist.append({
            "name": penjamin,
            "value": round(c["klaim"] / total_klaim * 100, 1),
            "klaim": c["klaim"],
            "pending": c["pending"],
            "color": INS_COLORS.get(penjamin, "#94A3B8"),
        })

    # ── Top diagnoses by total cost
    # First map id_rawat -> diagnosa
    ri_map = {str(ri.get("id")): ri.get("diagnosa", "Umum") for ri in ri_all if ri.get("id")}
    ri_map.update({str(ri.get("id")).split(":")[1]: ri.get("diagnosa", "Umum") for ri in ri_all if ri.get("id") and ":" in str(ri.get("id"))})
    
    diag_stats = defaultdict(lambda: {"pasien": 0, "total_cost": 0})
    for t in tagihan_all:
        id_rawat = t.get("id_rawat")
        diagnosa = ri_map.get(id_rawat, "Lainnya")
        diag_stats[diagnosa]["pasien"] += 1
        diag_stats[diagnosa]["total_cost"] += float(t.get("total_tagihan", 0))

    top_diags = sorted(diag_stats.items(), key=lambda x: x[1]["total_cost"], reverse=True)[:10]
    max_cost = top_diags[0][1]["total_cost"] if top_diags else 1
    
    top_diagnoses = []
    for i, (diag, stats) in enumerate(top_diags):
        total = stats["total_cost"]
        avg = total / stats["pasien"] if stats["pasien"] else 0
        pct = total / max_cost if max_cost else 0
        status = "kritis" if pct > 0.8 else ("tinggi" if pct > 0.5 else "normal")
        
        top_diagnoses.append({
            "rank": i + 1,
            "diagnosa": diag,
            "pasien": stats["pasien"],
            "totalCost": round(total / 1_000_000, 1),
            "avgCost": round(avg / 1_000_000, 1),
            "status": status,
        })

    # ── Summary KPIs
    total_rev = sum(r["pendapatan"] for r in monthly)
    total_cost = sum(r["biaya"] for r in monthly)
    total_laba = sum(r["laba"] for r in monthly)
    margin = round(total_laba / total_rev * 100, 1) if total_rev else 0

    pending_klaim = sum(1 for k in klaim_all if k.get("status_klaim") == "Proses")

    return {
        "summary": {
            "total_pendapatan": total_rev,
            "total_biaya": total_cost,
            "total_laba": total_laba,
            "margin_pct": margin,
            "klaim_pending": pending_klaim,
        },
        "monthly": monthly,
        "insurance_dist": insurance_dist,
        "top_diagnoses": top_diagnoses,
    }


def _fmt_month(ym: str) -> str:
    try:
        d = datetime.strptime(ym, "%Y-%m")
        return d.strftime("%b %y")
    except Exception:
        return ym
