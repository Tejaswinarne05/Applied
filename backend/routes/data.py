"""
Data routes
  POST /api/generate-sample-data
  GET  /api/results
  GET  /api/statistics
  GET  /api/high-risk-areas
"""
import io
import csv
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional
from sqlalchemy.orm import Session

from database.db import get_db, AnalysisSession
from calculations.data_processing import generate_sample_data, dataframe_to_grids
from calculations.flood_risk import full_flood_analysis, DEFAULT_WEIGHTS
from routes.analysis import _result_store, _run_and_store

router = APIRouter()


class SampleDataRequest(BaseModel):
    rows: int = Field(30, ge=5, le=100)
    cols: int = Field(30, ge=5, le=100)
    run_analysis: bool = True


@router.post("/generate-sample-data")
def generate_sample(req: SampleDataRequest, db: Session = Depends(get_db)):
    """Generate a synthetic terrain dataset and optionally run analysis."""
    df = generate_sample_data(req.rows, req.cols)
    cells = df.to_dict(orient="records")

    if not req.run_analysis:
        return {"cells": cells, "rows": req.rows, "cols": req.cols}

    elevation, rainfall, water_level, flow_velocity = dataframe_to_grids(df)
    result = _run_and_store(elevation, rainfall, water_level, flow_velocity, DEFAULT_WEIGHTS, db)

    return {
        "message":     "Sample data generated and analysed.",
        "rows":        result["rows"],
        "cols":        result["cols"],
        "risk_score":  result["risk_score"],
        "risk_level":  result["risk_level"],
        "stats":       result["stats"],
        "weights":     result["weights"],
        "elevation":   result["elevation"],
        "rainfall":    result["rainfall"],
        "water_level": result["water_level"],
        "flow_velocity": result["flow_velocity"],
        "Vx":          result["Vx"],
        "Vy":          result["Vy"],
        "flow_magnitude": result["flow_magnitude"],
        "flow_direction": result["flow_direction"],
        "divergence":  result["divergence"],
        "accumulation":result["accumulation"],
        "risk_map":    result["risk_map"],
        "x_coords":    result["x_coords"],
        "y_coords":    result["y_coords"],
        "cells":       result["cells"],
        "high_risk_areas": result["high_risk_areas"],
    }


@router.get("/results")
def get_results():
    """Return the most recently computed analysis result."""
    if not _result_store:
        raise HTTPException(status_code=404, detail="No analysis results available. Run an analysis first.")
    return {k: v for k, v in _result_store.items()}


@router.get("/statistics")
def get_statistics():
    """Return aggregated statistics for the latest analysis."""
    if not _result_store:
        raise HTTPException(status_code=404, detail="No analysis results available.")
    return _result_store.get("stats", {})


@router.get("/high-risk-areas")
def get_high_risk_areas():
    """Return the top high-risk grid locations from the latest analysis."""
    if not _result_store:
        raise HTTPException(status_code=404, detail="No analysis results available.")
    return {
        "high_risk_areas": _result_store.get("high_risk_areas", []),
        "stats": {
            "high_risk_count":      _result_store["stats"].get("high_risk_count", 0),
            "very_high_risk_count": _result_store["stats"].get("very_high_risk_count", 0),
        }
    }


@router.get("/export-csv")
def export_csv():
    """Stream the per-cell results as a downloadable CSV."""
    if not _result_store:
        raise HTTPException(status_code=404, detail="No analysis results available.")

    cells = _result_store.get("cells", [])
    if not cells:
        raise HTTPException(status_code=404, detail="No cell data available.")

    output = io.StringIO()
    fieldnames = list(cells[0].keys())
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(cells)
    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=flood_analysis_results.csv"},
    )
