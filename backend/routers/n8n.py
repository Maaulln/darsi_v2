from fastapi import APIRouter, Depends, HTTPException, status
from database import get_db, select, query, query_one

router = APIRouter(
    prefix="/api/n8n",
    tags=["n8n"],
    responses={404: {"description": "Not found"}},
)

@router.get("/pasien")
async def export_pasien_for_n8n(limit: int = 100):
    """API endpoint khusus untuk n8n mengambil data pasien"""
    try:
        pasien_data = select("pasien")
        return {
            "status": "success",
            "source": "DARSI",
            "data": pasien_data[:limit]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/tagihan")
async def export_tagihan_for_n8n(status_bayar: str = None):
    """API endpoint khusus untuk n8n mengambil data tagihan"""
    try:
        if status_bayar:
            tagihan = select("tagihan", {"status_bayar": status_bayar})
        else:
            tagihan = select("tagihan")
            
        return {
            "status": "success",
            "source": "DARSI",
            "data": tagihan
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/dashboard-summary")
async def export_summary_for_n8n():
    """API untuk n8n mendapatkan summary cepat (untuk notifikasi bot/telegram)"""
    try:
        kamar_penuh = query_one("SELECT count() AS cnt FROM kamar WHERE status='Penuh' OR status='Terisi' GROUP ALL")
        tagihan_belum = query_one("SELECT count() AS cnt FROM tagihan WHERE status_bayar='Belum Bayar' GROUP ALL")
        
        terisi = kamar_penuh.get('cnt', 0)
        belum_bayar = tagihan_belum.get('cnt', 0)
            
        return {
            "kamar_terisi": terisi,
            "tagihan_pending": belum_bayar,
            "pesan_alert": "Mohon cek sistem DARSI" if terisi > 5 or belum_bayar > 5 else "Sistem aman"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
