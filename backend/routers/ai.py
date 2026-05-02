"""
routers/ai.py — /api/ai/recommend
Builds a prompt from live DB data and calls Ollama (gemma4:e2b).
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
try:
    from ..database import query_one
except ImportError:
    from database import query_one

router = APIRouter(prefix="/api/ai", tags=["ai"])

OLLAMA_MODEL = "gemma4:e2b"


class RecommendRequest(BaseModel):
    context: str = "dashboard"
    # Optional: pass pre-fetched context data from frontend to avoid double query
    data: dict = {}


@router.post("/recommend")
def get_recommendation(req: RecommendRequest):
    try:
        import ollama
    except ImportError:
        raise HTTPException(
            status_code=503,
            detail="Ollama library not installed. Run: pip install ollama",
        )

    # ── Gather live context from DB ──────────────────────────────────────────
    ctx = req.data if req.data else _gather_context()

    # ── Build prompt ─────────────────────────────────────────────────────────
    prompt = _build_prompt(ctx, req.context)

    # ── Call Ollama ──────────────────────────────────────────────────────────
    try:
        response = ollama.chat(
            model=OLLAMA_MODEL,
            messages=[{"role": "user", "content": prompt}],
        )
        text = response["message"]["content"]
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Ollama error: {str(e)}. Pastikan Ollama berjalan: `ollama serve`",
        )

    return {
        "recommendation": text,
        "confidence": 87,
        "model": OLLAMA_MODEL,
        "generated_at": datetime.now().isoformat(),
        "context": req.context,
    }


@router.get("/health")
def ai_health():
    """Check if Ollama is reachable."""
    try:
        import ollama
        models = ollama.list()
        available = [m["name"] for m in models.get("models", [])]
        model_ready = any(OLLAMA_MODEL in m for m in available)
        return {
            "ollama_reachable": True,
            "model": OLLAMA_MODEL,
            "model_ready": model_ready,
            "available_models": available,
        }
    except Exception as e:
        return {
            "ollama_reachable": False,
            "error": str(e),
            "hint": "Jalankan: ollama serve && ollama pull gemma4:e2b",
        }


def _gather_context() -> dict:
    """Pull key metrics from DB for prompt context."""
    pasien_aktif = query_one(
        "SELECT COUNT(*) AS cnt FROM rawat_inap WHERE status='Aktif'"
    ).get("cnt", 0)

    bor_row = query_one(
        """SELECT
             COUNT(*) AS total,
             SUM(CASE WHEN status IN ('Penuh','Terisi') THEN 1 ELSE 0 END) AS terisi
           FROM kamar"""
    )
    total_tt = bor_row.get("total", 1) or 1
    terisi   = bor_row.get("terisi", 0) or 0
    bor      = round(terisi / total_tt * 100, 1)

    alos = query_one(
        "SELECT ROUND(AVG(lama_rawat),1) AS v FROM rawat_inap WHERE lama_rawat IS NOT NULL"
    ).get("v", 0.0)

    belum_bayar = query_one(
        "SELECT COUNT(*) AS cnt FROM tagihan WHERE status_bayar='Belum Bayar'"
    ).get("cnt", 0)

    klaim_pending = query_one(
        "SELECT COUNT(*) AS cnt FROM klaim_asuransi WHERE status_klaim='Proses'"
    ).get("cnt", 0)

    pendapatan = query_one(
        """SELECT COALESCE(SUM(total_tagihan),0) AS v
           FROM tagihan WHERE status_bayar='Lunas'
             AND tanggal_bayar >= date('now','start of month')"""
    ).get("v", 0)

    top_diag = query_one(
        """SELECT diagnosa, COUNT(*) AS cnt FROM rawat_inap
           WHERE diagnosa IS NOT NULL GROUP BY diagnosa ORDER BY cnt DESC LIMIT 1"""
    )

    return {
        "pasien_aktif":   pasien_aktif,
        "bor":            bor,
        "alos":           alos,
        "tagihan_pending": belum_bayar,
        "klaim_pending":  klaim_pending,
        "pendapatan_bulan": pendapatan,
        "top_diagnosa":   top_diag.get("diagnosa", "-"),
        "top_diagnosa_cnt": top_diag.get("cnt", 0),
    }


def _build_prompt(ctx: dict, context_page: str) -> str:
    date_now = datetime.now().strftime("%d %B %Y")
    return f"""Kamu adalah AI analis senior rumah sakit DARSI RSI Surabaya.
Berikan analisis eksekutif singkat dan rekomendasi dalam **Bahasa Indonesia**.

**Data Real-time — {date_now}**
- Pasien rawat inap aktif : {ctx.get('pasien_aktif', '-')} pasien
- Bed Occupancy Rate (BOR): {ctx.get('bor', '-')}%
- Rata-rata lama rawat (ALOS): {ctx.get('alos', '-')} hari
- Tagihan belum dibayar : {ctx.get('tagihan_pending', '-')} tagihan
- Klaim asuransi pending : {ctx.get('klaim_pending', '-')} klaim
- Pendapatan bulan ini  : Rp {ctx.get('pendapatan_bulan', 0) / 1_000_000:.1f} Juta
- Diagnosa terbanyak    : {ctx.get('top_diagnosa', '-')} ({ctx.get('top_diagnosa_cnt', 0)} kasus)

Halaman konteks: {context_page}

Berikan dalam format markdown:
1. **Ringkasan Eksekutif** (2-3 kalimat kondisi umum)
2. **Temuan Kritis** (jika BOR > 85% atau ALOS > 5 hari atau tagihan pending banyak)
3. **Rekomendasi** (3 poin spesifik dan actionable)
4. **Proyeksi** (1 kalimat prediksi singkat)

Singkat, padat, profesional.
"""
