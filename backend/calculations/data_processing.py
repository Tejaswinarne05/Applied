"""
Data Processing Utilities
==========================
Sample-data generation and CSV validation.
"""

import io
import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any


REQUIRED_COLUMNS = {"x", "y", "elevation", "rainfall", "water_level", "flow_velocity"}


def generate_sample_data(rows: int = 30, cols: int = 30) -> pd.DataFrame:
    """
    Generate a realistic synthetic 30×30 terrain dataset.

    Terrain model:
      - Gaussian mountain peak in top-left quadrant
      - Low-elevation basin in bottom-right quadrant
      - Gradual slope everywhere else
    Rainfall is higher over the basin and lower slopes.
    Water level is correlated with low elevation + rainfall.
    Flow velocity is correlated with gradient magnitude.
    """
    rng = np.random.default_rng(42)

    x_idx = np.arange(cols)
    y_idx = np.arange(rows)
    X, Y = np.meshgrid(x_idx, y_idx)   # shape (rows, cols)

    # ── elevation ──────────────────────────────────────────────────────────
    # Two Gaussian features: a peak and a valley/basin
    cx_peak, cy_peak   = cols * 0.25, rows * 0.25
    cx_basin, cy_basin = cols * 0.70, rows * 0.70

    peak  = 80 * np.exp(-((X - cx_peak)  ** 2 / (cols * 3) +
                           (Y - cy_peak)  ** 2 / (rows * 3)))
    basin = -40 * np.exp(-((X - cx_basin) ** 2 / (cols * 4) +
                            (Y - cy_basin) ** 2 / (rows * 4)))

    # base slope from top-left (high) to bottom-right (low)
    slope = 100 - (X / cols + Y / rows) * 50

    elevation = slope + peak + basin
    elevation += rng.normal(0, 3, elevation.shape)    # terrain roughness
    elevation = np.clip(elevation, 20, 200)

    # ── rainfall ───────────────────────────────────────────────────────────
    # More rain in basin / low-elevation areas + random variation
    base_rain = 40 + 60 * (1 - (elevation - elevation.min()) /
                                (elevation.max() - elevation.min()))
    rainfall  = base_rain + rng.normal(0, 8, base_rain.shape)
    rainfall  = np.clip(rainfall, 5, 120)

    # ── water level ────────────────────────────────────────────────────────
    water_level = (
        0.5 + 4.5 * (1 - (elevation - elevation.min()) /
                          (elevation.max() - elevation.min()))
        + 0.02 * (rainfall - rainfall.min())
        + rng.normal(0, 0.3, elevation.shape)
    )
    water_level = np.clip(water_level, 0.1, 7.0)

    # ── flow velocity ──────────────────────────────────────────────────────
    grad_y, grad_x = np.gradient(elevation)
    grad_mag = np.sqrt(grad_x ** 2 + grad_y ** 2)
    flow_velocity = 0.3 + 2.5 * (grad_mag / (grad_mag.max() + 1e-9))
    flow_velocity += rng.normal(0, 0.15, flow_velocity.shape)
    flow_velocity = np.clip(flow_velocity, 0.05, 4.0)

    records = []
    for i in range(rows):
        for j in range(cols):
            records.append({
                "x":             j,
                "y":             i,
                "elevation":     round(float(elevation[i, j]),     2),
                "rainfall":      round(float(rainfall[i, j]),      2),
                "water_level":   round(float(water_level[i, j]),   2),
                "flow_velocity": round(float(flow_velocity[i, j]), 2),
            })

    return pd.DataFrame(records)


def validate_csv(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Validate that a user-supplied DataFrame has the required columns
    and reasonable numeric values.

    Returns:
      {"valid": True/False, "errors": [...]}
    """
    errors = []

    # column presence
    missing = REQUIRED_COLUMNS - set(df.columns.str.lower())
    if missing:
        errors.append(f"Missing required columns: {', '.join(sorted(missing))}")
        return {"valid": False, "errors": errors}

    # Normalise column names to lowercase
    df.columns = df.columns.str.lower()

    # numeric check
    for col in REQUIRED_COLUMNS:
        if not pd.api.types.is_numeric_dtype(df[col]):
            errors.append(f"Column '{col}' must contain numeric values.")

    if errors:
        return {"valid": False, "errors": errors}

    # range checks
    if (df["rainfall"] < 0).any():
        errors.append("Rainfall values must be non-negative.")
    if (df["water_level"] < 0).any():
        errors.append("Water level values must be non-negative.")
    if (df["flow_velocity"] < 0).any():
        errors.append("Flow velocity values must be non-negative.")
    if len(df) < 4:
        errors.append("Dataset must contain at least 4 rows.")

    return {"valid": len(errors) == 0, "errors": errors}


def dataframe_to_grids(df: pd.DataFrame) -> Tuple[np.ndarray, ...]:
    """
    Convert a flat (x,y,...) DataFrame into 2D NumPy arrays.
    Assumes df has integer x,y columns defining the grid.
    """
    df = df.copy()
    df.columns = df.columns.str.lower()

    x_vals = sorted(df["x"].unique())
    y_vals = sorted(df["y"].unique())
    cols   = len(x_vals)
    rows   = len(y_vals)

    x_map = {v: i for i, v in enumerate(x_vals)}
    y_map = {v: i for i, v in enumerate(y_vals)}

    elevation     = np.zeros((rows, cols))
    rainfall      = np.zeros((rows, cols))
    water_level   = np.zeros((rows, cols))
    flow_velocity = np.zeros((rows, cols))

    for _, row in df.iterrows():
        ci = x_map[row["x"]]
        ri = y_map[row["y"]]
        elevation    [ri, ci] = row["elevation"]
        rainfall     [ri, ci] = row["rainfall"]
        water_level  [ri, ci] = row["water_level"]
        flow_velocity[ri, ci] = row["flow_velocity"]

    return elevation, rainfall, water_level, flow_velocity
