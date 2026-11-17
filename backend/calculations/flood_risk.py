"""
Flood Risk Model
================
Educational/simulation flood-risk scoring model.

Formula:
  Risk = 0.35·R + 0.25·W + 0.20·E + 0.20·A

where:
  R = normalized rainfall score
  W = normalized water-level score
  E = normalized low-elevation factor  (1 - norm_elevation)
  A = normalized accumulation score

Risk levels:
   0–30  → LOW
  31–60  → MEDIUM
  61–80  → HIGH
  81–100 → VERY HIGH

NOTE: This is a project-specific simulation model, NOT an official
flood forecasting or emergency alert system.
"""

import numpy as np
from typing import Dict, Any

from calculations.vector_calculus import normalize, run_full_analysis

# ── configurable weights ──────────────────────────────────────────────────────
DEFAULT_WEIGHTS: Dict[str, float] = {
    "rainfall":    0.35,
    "water_level": 0.25,
    "elevation":   0.20,
    "accumulation": 0.20,
}


def classify_risk(score: float) -> str:
    if score <= 30:
        return "LOW"
    elif score <= 60:
        return "MEDIUM"
    elif score <= 80:
        return "HIGH"
    else:
        return "VERY HIGH"


def compute_risk_grid(
    elevation:    np.ndarray,
    rainfall:     np.ndarray,
    water_level:  np.ndarray,
    accumulation: np.ndarray,
    weights: Dict[str, float] = None,
) -> np.ndarray:
    """
    Returns a 2-D array of risk scores (0–100) for every grid cell.
    """
    if weights is None:
        weights = DEFAULT_WEIGHTS

    r_norm = normalize(rainfall)
    w_norm = normalize(water_level)
    e_norm = 1 - normalize(elevation)   # low elevation = high risk
    a_norm = accumulation               # already [0,1]

    raw = (
        weights["rainfall"]    * r_norm  +
        weights["water_level"] * w_norm  +
        weights["elevation"]   * e_norm  +
        weights["accumulation"] * a_norm
    )
    return np.clip(raw * 100, 0, 100)


def full_flood_analysis(
    elevation:      np.ndarray,
    rainfall:       np.ndarray,
    water_level:    np.ndarray,
    flow_velocity:  np.ndarray,
    weights: Dict[str, float] = None,
) -> Dict[str, Any]:
    """
    Runs complete vector calculus analysis then computes the flood risk map.
    Returns a comprehensive result dictionary ready for JSON serialisation.
    """
    calc = run_full_analysis(elevation, rainfall, water_level, flow_velocity)

    risk_grid  = compute_risk_grid(
        elevation, rainfall, water_level, calc["accumulation"], weights
    )

    rows, cols = elevation.shape
    x_coords   = np.arange(cols)
    y_coords   = np.arange(rows)
    X, Y       = np.meshgrid(x_coords, y_coords)

    # Build per-cell record list (used for heatmap hover data)
    cells = []
    for i in range(rows):
        for j in range(cols):
            cells.append({
                "x":             int(j),
                "y":             int(i),
                "elevation":     round(float(elevation[i, j]),    2),
                "rainfall":      round(float(rainfall[i, j]),     2),
                "water_level":   round(float(water_level[i, j]),  2),
                "flow_velocity": round(float(flow_velocity[i, j]),2),
                "Vx":            round(float(calc["Vx"][i, j]),   4),
                "Vy":            round(float(calc["Vy"][i, j]),   4),
                "flow_magnitude":round(float(calc["flow_magnitude"][i, j]), 4),
                "flow_direction":round(float(calc["flow_direction"][i, j]), 2),
                "divergence":    round(float(calc["divergence"][i, j]),     4),
                "accumulation":  round(float(calc["accumulation"][i, j]),   4),
                "risk_score":    round(float(risk_grid[i, j]),    2),
                "risk_level":    classify_risk(float(risk_grid[i, j])),
            })

    overall_risk = float(np.mean(risk_grid))

    # top 5 highest risk cells
    sorted_cells = sorted(cells, key=lambda c: c["risk_score"], reverse=True)
    high_risk_areas = sorted_cells[:5]

    stats = {
        "mean_risk":          round(overall_risk, 2),
        "max_risk":           round(float(risk_grid.max()), 2),
        "min_risk":           round(float(risk_grid.min()), 2),
        "mean_rainfall":      round(float(rainfall.mean()), 2),
        "max_rainfall":       round(float(rainfall.max()), 2),
        "mean_water_level":   round(float(water_level.mean()), 2),
        "max_water_level":    round(float(water_level.max()), 2),
        "mean_flow_velocity": round(float(flow_velocity.mean()), 2),
        "max_flow_velocity":  round(float(flow_velocity.max()), 2),
        "mean_gradient_mag":  round(float(calc["flow_magnitude"].mean()), 4),
        "max_gradient_mag":   round(float(calc["flow_magnitude"].max()),  4),
        "mean_divergence":    round(float(calc["divergence"].mean()),     4),
        "max_accumulation":   round(float(calc["accumulation"].max()),    4),
        "high_risk_count":    int((risk_grid > 60).sum()),
        "very_high_risk_count": int((risk_grid > 80).sum()),
    }

    return {
        # scalar summaries
        "risk_score":  round(overall_risk, 2),
        "risk_level":  classify_risk(overall_risk),
        "stats":       stats,
        "weights":     weights or DEFAULT_WEIGHTS,

        # 2D arrays serialised as nested lists (JSON-safe)
        "elevation":      elevation.tolist(),
        "rainfall":       rainfall.tolist(),
        "water_level":    water_level.tolist(),
        "flow_velocity":  flow_velocity.tolist(),
        "Vx":             calc["Vx"].tolist(),
        "Vy":             calc["Vy"].tolist(),
        "flow_magnitude": calc["flow_magnitude"].tolist(),
        "flow_direction": calc["flow_direction"].tolist(),
        "divergence":     calc["divergence"].tolist(),
        "accumulation":   calc["accumulation"].tolist(),
        "risk_map":       risk_grid.tolist(),

        # coordinate grids
        "x_coords":  x_coords.tolist(),
        "y_coords":  y_coords.tolist(),

        # per-cell records
        "cells":          cells,
        "high_risk_areas": high_risk_areas,

        # grid dimensions
        "rows": rows,
        "cols": cols,
    }
