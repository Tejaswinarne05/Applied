"""
Analysis routes
  POST /api/analyze        – run analysis on provided grid data
  POST /api/upload-csv     – upload a CSV file and run analysis
"""
import io
import json
import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from sqlalchemy.orm import Session

from database.db import get_db, save_session
from calculations.flood_risk import full_flood_analysis, DEFAULT_WEIGHTS
from calculations.data_processing import validate_csv, dataframe_to_grids

router = APIRouter()

# ── shared in-memory result store (populated after each analysis) ─────────────
_result_store: Dict = {}


def get_result_store():
    return _result_store


# ── request schemas ───────────────────────────────────────────────────────────

class ManualInputRequest(BaseModel):
    rows:           int   = Field(10, ge=2, le=100)
    cols:           int   = Field(10, ge=2, le=100)
    rainfall:       float = Field(50.0, ge=0, le=500)
    water_level:    float = Field(2.0, ge=0, le=50)
    flow_velocity:  float = Field(1.5, ge=0, le=20)
    min_elevation:  float = Field(20.0)
    max_elevation:  float = Field(200.0)
    weights: Optional[Dict[str, float]] = None


class GridDataRequest(BaseModel):
    """Full grid supplied as flat list of cell dicts."""
    cells:   List[Dict]
    weights: Optional[Dict[str, float]] = None


# ── helpers ───────────────────────────────────────────────────────────────────

def _cells_to_grids(cells: List[Dict]):
    df = pd.DataFrame(cells)
    val = validate_csv(df)
    if not val["valid"]:
        raise HTTPException(status_code=422, detail=val["errors"])
    return dataframe_to_grids(df)


def _run_and_store(elevation, rainfall, water_level, flow_velocity, weights, db):
    result = full_flood_analysis(elevation, rainfall, water_level, flow_velocity, weights)
    _result_store.clear()
    _result_store.update(result)
    try:
        save_session(db, result)
    except Exception:
        pass   # DB failure should not block response
    return result


# ── endpoints ─────────────────────────────────────────────────────────────────

@router.post("/analyze")
def analyze(req: GridDataRequest, db: Session = Depends(get_db)):
    """Run flood risk analysis on a supplied grid."""
    elevation, rainfall, water_level, flow_velocity = _cells_to_grids(req.cells)
    weights = req.weights or DEFAULT_WEIGHTS

    result = _run_and_store(elevation, rainfall, water_level, flow_velocity, weights, db)

    # Return a slimmed summary + full arrays
    return {
        "risk_score":    result["risk_score"],
        "risk_level":    result["risk_level"],
        "stats":         result["stats"],
        "weights":       result["weights"],
        "rows":          result["rows"],
        "cols":          result["cols"],
        "elevation":     result["elevation"],
        "rainfall":      result["rainfall"],
        "water_level":   result["water_level"],
        "flow_velocity": result["flow_velocity"],
        "Vx":            result["Vx"],
        "Vy":            result["Vy"],
        "flow_magnitude":result["flow_magnitude"],
        "flow_direction":result["flow_direction"],
        "divergence":    result["divergence"],
        "accumulation":  result["accumulation"],
        "risk_map":      result["risk_map"],
        "x_coords":      result["x_coords"],
        "y_coords":      result["y_coords"],
        "cells":         result["cells"],
        "high_risk_areas": result["high_risk_areas"],
    }


@router.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Accept a CSV upload, validate, and run analysis."""
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:   # 5 MB limit
        raise HTTPException(status_code=413, detail="File too large (max 5 MB).")

    try:
        df = pd.read_csv(io.StringIO(content.decode("utf-8")))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV: {str(e)}")

    val = validate_csv(df)
    if not val["valid"]:
        raise HTTPException(status_code=422, detail=val["errors"])

    elevation, rainfall, water_level, flow_velocity = dataframe_to_grids(df)
    result = _run_and_store(elevation, rainfall, water_level, flow_velocity, DEFAULT_WEIGHTS, db)

    return {
        "message":       "CSV uploaded and analysed successfully.",
        "rows":          result["rows"],
        "cols":          result["cols"],
        "risk_score":    result["risk_score"],
        "risk_level":    result["risk_level"],
        "stats":         result["stats"],
        "weights":       result["weights"],
        "elevation":     result["elevation"],
        "rainfall":      result["rainfall"],
        "water_level":   result["water_level"],
        "flow_velocity": result["flow_velocity"],
        "Vx":            result["Vx"],
        "Vy":            result["Vy"],
        "flow_magnitude":result["flow_magnitude"],
        "flow_direction":result["flow_direction"],
        "divergence":    result["divergence"],
        "accumulation":  result["accumulation"],
        "risk_map":      result["risk_map"],
        "x_coords":      result["x_coords"],
        "y_coords":      result["y_coords"],
        "cells":         result["cells"],
        "high_risk_areas": result["high_risk_areas"],
    }
