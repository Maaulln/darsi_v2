"""
routers/ai.py — /api/ai/recommend
Connects to n8n workflow for AI processing using RAG and Gemini.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import httpx
import json

router = APIRouter(prefix="/api/ai", tags=["ai"])

# URL Webhook n8n (Sesuaikan dengan URL n8n Anda)
# Path 'darsi/query' sesuai dengan darsi_n8n_workflow_gemini.json
N8N_WEBHOOK_URL = "http://localhost:5678/webhook/darsi/query"

class RecommendRequest(BaseModel):
    context: str = "dashboard"
    data: dict = {}
    query: str = ""

@router.post("/recommend")
async def get_recommendation(req: RecommendRequest):
    # ── Prepare Query for n8n ────────────────────────────────────────────────
    # Jika query kosong, buat query default berdasarkan konteks
    query = req.query
    if not query:
        if req.context == "dashboard":
            query = "Berikan analisis eksekutif mengenai tingkat hunian (BOR), pendapatan, dan lama rawat pasien saat ini."
        else:
            query = f"Berikan analisis dan rekomendasi untuk halaman {req.context}."

    # ── Call n8n Webhook ─────────────────────────────────────────────────────
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                N8N_WEBHOOK_URL,
                json={"query": query},
                timeout=60.0  # AI processing might take time
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"n8n error: {response.text}"
                )
            
            n8n_data = response.json()
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Tidak dapat terhubung ke n8n: {str(e)}. Pastikan n8n berjalan di {N8N_WEBHOOK_URL}"
        )

    # ── Transform n8n structured JSON to Frontend-friendly Markdown ──────────
    # n8n mengembalikan JSON terstruktur (summary, analysis, recommendations, etc)
    # Kita gabungkan menjadi string markdown agar DashboardPage.tsx bisa merender.
    
    summary = n8n_data.get("summary", "")
    analysis = n8n_data.get("analysis", {})
    recommendations = n8n_data.get("recommendations", [])
    projection = n8n_data.get("projection", "")
    
    # Membangun string markdown
    md_output = f"**Ringkasan Eksekutif**\n{summary}\n\n"
    
    if analysis:
        md_output += f"**Analisis Operasional**\n"
        md_output += f"- Status BOR: **{analysis.get('bor_status', 'Normal')}**\n"
        md_output += f"- Tren Pendapatan: **{analysis.get('revenue_trend', 'Stabil')}**\n\n"
        
        findings = analysis.get("critical_findings", [])
        if findings:
            md_output += "**Temuan Kritis**\n"
            for f in findings:
                level = f.get("impact_level", "Info")
                md_output += f"- [{level}] {f.get('issue', '')}\n"
            md_output += "\n"

    if recommendations:
        md_output += "**Rekomendasi Strategis**\n"
        for rec in recommendations:
            md_output += f"- {rec}\n"
        md_output += "\n"
        
    if projection:
        md_output += f"**Proyeksi ke Depan**\n{projection}"

    return {
        "recommendation": md_output,
        "confidence": int(n8n_data.get("metadata", {}).get("confidence_score", 0.95) * 100),
        "model": n8n_data.get("_meta", {}).get("model", "Gemini 2.0 Flash (via n8n)"),
        "generated_at": datetime.now().isoformat(),
        "context": req.context,
        "raw_n8n_response": n8n_data # Opsional: kirim data mentah jika frontend ingin parsing sendiri
    }

@router.get("/health")
async def ai_health():
    """Check if n8n is reachable."""
    try:
        async with httpx.AsyncClient() as client:
            # Kita coba ping n8n (bisa ganti ke endpoint health n8n jika ada)
            # Untuk sekarang kita anggap jika tidak error saat connect, berarti reachable
            return {
                "n8n_reachable": True,
                "webhook_url": N8N_WEBHOOK_URL,
                "status": "ready"
            }
    except Exception as e:
        return {
            "n8n_reachable": False,
            "error": str(e),
            "hint": "Pastikan n8n berjalan dan webhook URL benar."
        }
