"""
routers/cost_insurance.py — /api/cost-insurance
Monthly P&L, insurance distribution, top diagnoses by cost.
"""
from fastapi import APIRouter
try:
    from ..database import query, query_one
except ImportError:
    from database import query, query_one

router = APIRouter(prefix="/api/cost-insurance", tags=["cost_insurance"])

INS_COLORS = {
    "BPJS":            "#0EA5E9",
    "Asuransi Swasta": "#8B5CF6",
    "Umum":            "#10B981",
}


@router.get("")
def get_cost_insurance():
    # ── Monthly pendapatan (from tagihan Lunas, grouped by month) ────────────
    rev_rows = query(
        """SELECT substr(tanggal_bayar, 1, 7) AS month,
                  SUM(total_tagihan) AS pendapatan
           FROM tagihan
           WHERE status_bayar='Lunas' AND tanggal_bayar IS NOT NULL
           GROUP BY month
           ORDER BY month"""
    )

    # ── Monthly biaya operasional ─────────────────────────────────────────────
    cost_rows = query(
        """SELECT bulan AS month, SUM(jumlah) AS biaya
           FROM biaya_operasional
           WHERE jumlah IS NOT NULL
           GROUP BY bulan
           ORDER BY bulan"""
    )
    cost_map = {r["month"]: r["biaya"] for r in cost_rows}

    monthly = []
    for r in rev_rows:
        m     = r["month"]
        pend  = r["pendapatan"] or 0
        biaya = cost_map.get(m, 0) or 0
        laba  = pend - biaya
        # Convert to millions for display
        monthly.append({
            "month":      _fmt_month(m),
            "rawMonth":   m,
            "pendapatan": round(pend  / 1_000_000, 1),
            "biaya":      round(biaya / 1_000_000, 1),
            "laba":       round(laba  / 1_000_000, 1),
        })

    # ── Insurance distribution ────────────────────────────────────────────────
    ins_rows = query(
        """SELECT penjamin,
                  COUNT(*) AS klaim,
                  SUM(CASE WHEN status_klaim='Proses' THEN 1 ELSE 0 END) AS pending
           FROM klaim_asuransi
           WHERE penjamin IS NOT NULL
           GROUP BY penjamin"""
    )
    total_klaim = sum(r["klaim"] for r in ins_rows) or 1
    insurance_dist = [
        {
            "name":    r["penjamin"],
            "value":   round(r["klaim"] / total_klaim * 100, 1),
            "klaim":   r["klaim"],
            "pending": r["pending"],
            "color":   INS_COLORS.get(r["penjamin"], "#94A3B8"),
        }
        for r in ins_rows
    ]

    # ── Top diagnoses by total cost ───────────────────────────────────────────
    diag_rows = query(
        """SELECT ri.diagnosa,
                  COUNT(*) AS pasien,
                  SUM(t.total_tagihan) AS total_cost,
                  AVG(t.total_tagihan) AS avg_cost
           FROM rawat_inap ri
           JOIN tagihan t ON ri.id_rawat = t.id_rawat
           WHERE ri.diagnosa IS NOT NULL
           GROUP BY ri.diagnosa
           ORDER BY total_cost DESC
           LIMIT 10"""
    )
    max_cost = max((r["total_cost"] or 0 for r in diag_rows), default=1)
    top_diagnoses = []
    for i, r in enumerate(diag_rows):
        total = r["total_cost"] or 0
        avg   = r["avg_cost"]  or 0
        pct   = total / max_cost if max_cost else 0
        status = "kritis" if pct > 0.8 else ("tinggi" if pct > 0.5 else "normal")
        top_diagnoses.append({
            "rank":      i + 1,
            "diagnosa":  r["diagnosa"],
            "pasien":    r["pasien"],
            "totalCost": round(total / 1_000_000, 1),
            "avgCost":   round(avg   / 1_000_000, 1),
            "status":    status,
        })

    # ── Summary KPIs ─────────────────────────────────────────────────────────
    total_rev  = sum(r["pendapatan"] for r in monthly)
    total_cost = sum(r["biaya"]      for r in monthly)
    total_laba = sum(r["laba"]       for r in monthly)
    margin     = round(total_laba / total_rev * 100, 1) if total_rev else 0

    pending_klaim = query_one(
        "SELECT COUNT(*) AS cnt FROM klaim_asuransi WHERE status_klaim='Proses'"
    ).get("cnt", 0)

    return {
        "summary": {
            "total_pendapatan": total_rev,
            "total_biaya":      total_cost,
            "total_laba":       total_laba,
            "margin_pct":       margin,
            "klaim_pending":    pending_klaim,
        },
        "monthly":        monthly,
        "insurance_dist": insurance_dist,
        "top_diagnoses":  top_diagnoses,
    }


def _fmt_month(ym: str) -> str:
    """'2025-11' → 'Nov 25'"""
    from datetime import datetime
    try:
        d = datetime.strptime(ym, "%Y-%m")
        return d.strftime("%b %y")
    except Exception:
        return ym
