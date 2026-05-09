"""
routers/ai.py — /api/ai/recommend
Builds a prompt from live DB data and calls Ollama (gemma4:e2b).
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
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
        return {
            "recommendation": "**Ollama belum terinstall.**\n\nSistem AI lokal tidak aktif. Silakan install ollama dan jalankan `ollama serve` untuk mengaktifkan fitur ini.",
            "confidence": 0,
            "model": OLLAMA_MODEL,
            "generated_at": datetime.now().isoformat(),
            "context": req.context,
        }

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
        return {
            "recommendation": f"**Ollama gagal memproses.**\n\nPastikan service Ollama berjalan (`ollama serve`) dan model `{OLLAMA_MODEL}` sudah di-pull. Error: {str(e)}",
            "confidence": 0,
            "model": OLLAMA_MODEL,
            "generated_at": datetime.now().isoformat(),
            "context": req.context,
        }

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
    """Pull key metrics from DB for prompt context using python aggregation."""
    from database import select
    from collections import defaultdict
    
    rawat_inap = select("rawat_inap") or []
    kamar = select("kamar") or []
    tagihan = select("tagihan") or []
    klaim = select("klaim_asuransi") or []

    pasien_aktif = 0
    total_lama_rawat = 0
    ri_dengan_lama = 0
    diag_counts = defaultdict(int)

    for ri in rawat_inap:
        if ri.get("status") == "Aktif":
            pasien_aktif += 1
        lama = float(ri.get("lama_rawat", 0) or 0)
        if lama > 0:
            total_lama_rawat += lama
            ri_dengan_lama += 1
        diag = ri.get("diagnosa")
        if diag:
            diag_counts[diag] += 1

    alos = round(total_lama_rawat / ri_dengan_lama, 1) if ri_dengan_lama else 0.0
    
    top_diagnosa = max(diag_counts.items(), key=lambda x: x[1]) if diag_counts else ("-", 0)

    total_tt = len(kamar) or 1
    terisi = sum(1 for k in kamar if k.get("status") in ("Penuh", "Terisi"))
    bor = round(terisi / total_tt * 100, 1)

    belum_bayar = sum(1 for t in tagihan if t.get("status_bayar") == "Belum Bayar")
    klaim_pending = sum(1 for k in klaim if k.get("status_klaim") == "Proses")
    pendapatan = sum(float(t.get("total_tagihan", 0)) for t in tagihan if t.get("status_bayar") == "Lunas")

    return {
        "pasien_aktif":   pasien_aktif,
        "bor":            bor,
        "alos":           alos,
        "tagihan_pending": belum_bayar,
        "klaim_pending":  klaim_pending,
        "pendapatan_bulan": pendapatan,
        "top_diagnosa": top_diagnosa[0],
        "top_diagnosa_cnt": top_diagnosa[1],
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
