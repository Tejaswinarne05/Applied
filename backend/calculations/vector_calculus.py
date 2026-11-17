"""
Vector Calculus Engine
======================
All mathematical calculations for water flow analysis.

Mathematical concepts implemented:
  - Gradient:     ∇h = (∂h/∂x, ∂h/∂y)
  - Flow Vector:  V  = -∇h   (water flows toward lower elevation)
  - Magnitude:    |V| = √(Vx² + Vy²)
  - Direction:    θ   = atan2(Vy, Vx)  [degrees]
  - Divergence:   ∇·V = ∂Vx/∂x + ∂Vy/∂y
"""

import numpy as np
from typing import Tuple, Dict, Any


def normalize(arr: np.ndarray) -> np.ndarray:
    """Min-max normalize an array to [0, 1]."""
    mn, mx = arr.min(), arr.max()
    if mx - mn == 0:
        return np.zeros_like(arr, dtype=float)
    return (arr - mn) / (mx - mn)


def compute_gradient(elevation: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    """
    Compute the elevation gradient using NumPy.

    ∇h = (∂h/∂x, ∂h/∂y)

    Water flows in the direction of steepest descent, so:
    V = -∇h  =>  Vx = -∂h/∂x,  Vy = -∂h/∂y

    Returns:
        Vx: flow vector x-component
        Vy: flow vector y-component
    """
    grad_y, grad_x = np.gradient(elevation)  # np.gradient returns (row-grad, col-grad)
    Vx = -grad_x   # negative gradient → downhill direction
    Vy = -grad_y
    return Vx, Vy


def compute_flow_magnitude(Vx: np.ndarray, Vy: np.ndarray) -> np.ndarray:
    """
    |V| = √(Vx² + Vy²)
    """
    return np.sqrt(Vx ** 2 + Vy ** 2)


def compute_flow_direction(Vx: np.ndarray, Vy: np.ndarray) -> np.ndarray:
    """
    θ = atan2(Vy, Vx)  converted to degrees [0, 360).
    """
    theta_rad = np.arctan2(Vy, Vx)
    theta_deg = np.degrees(theta_rad) % 360
    return theta_deg


def compute_divergence(Vx: np.ndarray, Vy: np.ndarray) -> np.ndarray:
    """
    ∇·V = ∂Vx/∂x + ∂Vy/∂y

    Interpretation:
      Negative divergence → water converging / accumulating
      Positive divergence → water spreading / dispersing
    """
    _, dvx_dx = np.gradient(Vx)     # col-gradient of Vx  = ∂Vx/∂x
    dvy_dy, _ = np.gradient(Vy)     # row-gradient of Vy  = ∂Vy/∂y
    return dvx_dx + dvy_dy


def compute_accumulation(
    rainfall: np.ndarray,
    water_level: np.ndarray,
    elevation: np.ndarray,
    divergence: np.ndarray,
    flow_magnitude: np.ndarray,
) -> np.ndarray:
    """
    Composite water-accumulation score (0-1).

    Higher score = more water likely to collect here.

    Factors:
      - High rainfall       → more input water
      - High water level    → already wet
      - Low elevation       → basin / sink
      - Negative divergence → convergence point
      - Low flow magnitude  → water stagnates (optional subtle factor)
    """
    r_norm  = normalize(rainfall)
    w_norm  = normalize(water_level)
    e_norm  = 1 - normalize(elevation)     # invert: low elevation = high score
    # Negative divergence = convergence → multiply by -1 so more negative = higher score
    d_norm  = normalize(-divergence)
    fm_norm = 1 - normalize(flow_magnitude)  # low velocity = stagnation

    accumulation = (
        0.30 * r_norm +
        0.25 * w_norm +
        0.25 * e_norm +
        0.15 * d_norm +
        0.05 * fm_norm
    )
    return np.clip(accumulation, 0, 1)


def run_full_analysis(
    elevation: np.ndarray,
    rainfall: np.ndarray,
    water_level: np.ndarray,
    flow_velocity: np.ndarray,
) -> Dict[str, Any]:
    """
    Run all vector calculus calculations and return a structured result dict.
    """
    rows, cols = elevation.shape

    Vx, Vy          = compute_gradient(elevation)
    flow_magnitude  = compute_flow_magnitude(Vx, Vy)
    flow_direction  = compute_flow_direction(Vx, Vy)
    divergence      = compute_divergence(Vx, Vy)
    accumulation    = compute_accumulation(
                          rainfall, water_level, elevation,
                          divergence, flow_magnitude
                      )

    return {
        "Vx":             Vx,
        "Vy":             Vy,
        "flow_magnitude": flow_magnitude,
        "flow_direction": flow_direction,
        "divergence":     divergence,
        "accumulation":   accumulation,
        "elevation":      elevation,
        "rainfall":       rainfall,
        "water_level":    water_level,
        "flow_velocity":  flow_velocity,
        "shape":          (rows, cols),
    }
