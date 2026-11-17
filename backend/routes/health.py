"""
Health / Reset routes
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.db import get_db, AnalysisSession

router = APIRouter()

# In-memory store for latest result (shared across requests)
_latest_result: dict = {}


def get_store() -> dict:
    return _latest_result


@router.get("/health")
def health():
    return {
        "status": "ok",
        "service": "Water Flow & Flood Risk Analysis API",
        "version": "1.0.0",
    }


@router.post("/reset")
def reset(db: Session = Depends(get_db)):
    """Clear all stored analysis sessions."""
    _latest_result.clear()
    db.query(AnalysisSession).delete()
    db.commit()
    return {"message": "All data cleared successfully."}
