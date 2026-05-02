"""
routers/dashboard.py — /api/dashboard
Aggregates KPIs, 30-day patient trend, payment distribution, and alerts.
"""
from fastapi import APIRouter
from datetime import datetime, timedelta
try:
    from ..database import query, query_one
except ImportError:
    from database import query, query_one

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


def _today() -> str:
    return datetime.now().strftime("%Y-%m-%d")

def _days_ago(n: int) -> str:
    return (datetime.now() - timedelta(days=n)).strftime("%Y-%m-%d")

def _month_start() -> str:
    d = datetime.now()
    return d.strftime("%Y-%m-01")


@router.get("")
def get_dashboard():
    today = _today()
    month_start = _month_start()
    thirty_ago = _days_ago(30)

    # ── KPIs ────────────────────────────────────────────────────────────────
    pasien_aktif = query_one(
        "SELECT COUNT(*) AS cnt FROM rawat_inap WHERE status='Aktif'"
    ).get("cnt", 0)

    bor_row = query_one(
        """SELECT
             COUNT(*) AS total,
             SUM(CASE WHEN status='Penuh' OR status='Terisi' THEN 1 ELSE 0 END) AS terisi
           FROM kamar"""
    )
    total_tt = bor_row.get("total", 1) or 1
    terisi_tt = bor_row.get("terisi", 0) or 0
    bor = round(terisi_tt / total_tt * 100, 1)

    pendapatan_row = query_one(
        """SELECT COALESCE(SUM(total_tagihan), 0) AS total
           FROM tagihan
           WHERE status_bayar='Lunas'
             AND tanggal_bayar >= ?""",
        (month_start,),
    )
    pendapatan_bulan = pendapatan_row.get("total", 0)

    alos_row = query_one(
        "SELECT ROUND(AVG(lama_rawat), 1) AS alos FROM rawat_inap WHERE lama_rawat IS NOT NULL"
    )
    alos = alos_row.get("alos") or 0.0

    # ── Patient trend (last 30 days) ─────────────────────────────────────────
    trend_rows = query(
        """SELECT tanggal_masuk AS date, COUNT(*) AS rawat_inap
           FROM rawat_inap
           WHERE tanggal_masuk >= ?
           GROUP BY tanggal_masuk
           ORDER BY tanggal_masuk""",
        (thirty_ago,),
    )
    # Format date labels to "D Mon" style
    def fmt_label(iso: str) -> str:
        try:
            d = datetime.strptime(iso, "%Y-%m-%d")
            return d.strftime("%-d %b")
        except Exception:
            return iso

    patient_trend = [
        {
            "date": fmt_label(r["date"]),
            "rawatInap": r["rawat_inap"],
            # rawat jalan not in DB — use 0 or omit
            "rawatJalan": 0,
        }
        for r in trend_rows
    ]

    # ── Payment distribution ─────────────────────────────────────────────────
    COLORS = {
        "BPJS": "#0EA5E9",
        "Asuransi Swasta": "#8B5CF6",
        "Umum": "#10B981",
    }
    pay_rows = query(
        """SELECT penjamin, COUNT(*) AS cnt
           FROM pasien
           WHERE penjamin IS NOT NULL
           GROUP BY penjamin"""
    )
    total_p = sum(r["cnt"] for r in pay_rows) or 1
    payment_dist = [
        {
            "name": r["penjamin"],
            "value": round(r["cnt"] / total_p * 100, 1),
            "color": COLORS.get(r["penjamin"], "#94A3B8"),
        }
        for r in pay_rows
    ]

    # ── Alerts (derived from live data) ─────────────────────────────────────
    alerts = []

    if bor >= 90:
        alerts.append({
            "id": 1, "type": "critical",
            "msg": f"BOR mencapai {bor}% — melebihi ambang batas 90%",
            "time": "Baru saja",
        })

    pending_klaim = query_one(
        "SELECT COUNT(*) AS cnt FROM klaim_asuransi WHERE status_klaim='Proses'"
    ).get("cnt", 0)
    if pending_klaim > 0:
        alerts.append({
            "id": 2, "type": "warning",
            "msg": f"{pending_klaim} klaim asuransi masih dalam proses verifikasi",
            "time": "Real-time",
        })

    belum_bayar = query_one(
        "SELECT COUNT(*) AS cnt FROM tagihan WHERE status_bayar='Belum Bayar'"
    ).get("cnt", 0)
    if belum_bayar > 0:
        alerts.append({
            "id": 3, "type": "warning",
            "msg": f"{belum_bayar} tagihan belum dibayar",
            "time": "Real-time",
        })

    if not alerts:
        alerts.append({
            "id": 4, "type": "info",
            "msg": "Semua sistem berjalan normal",
            "time": "Baru saja",
        })

    return {
        "kpis": {
            "total_pasien_aktif": pasien_aktif,
            "bor": bor,
            "bor_label": f"{bor}%",
            "pendapatan_bulan": pendapatan_bulan,
            "pendapatan_label": f"Rp {pendapatan_bulan / 1_000_000:.2f} Jt",
            "alos": alos,
            "alos_label": f"{alos} hari",
        },
        "patient_trend": patient_trend,
        "payment_dist": payment_dist,
        "alerts": alerts,
        # Context data for AI prompt
        "ai_context": {
            "pasien_aktif": pasien_aktif,
            "bor": bor,
            "kamar_kritis": 1 if bor >= 90 else 0,
            "tagihan_pending": belum_bayar,
            "klaim_pending": pending_klaim,
            "alos": alos,
            "pendapatan_bulan": pendapatan_bulan,
        },
    }
