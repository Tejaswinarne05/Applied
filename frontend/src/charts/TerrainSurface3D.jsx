import Plot from 'react-plotly.js'
import { useMemo } from 'react'

export default function TerrainSurface3D({ result }) {
  const { data, layout } = useMemo(() => {
    if (!result) return { data: [], layout: {} }
    const { elevation, x_coords, y_coords } = result

    return {
      data: [
        {
          type: 'surface',
          z: elevation,
          x: x_coords,
          y: y_coords,
          colorscale: 'Earth',
          contours: {
            z: { show: true, usecolormap: true, project: { z: true }, color: 'rgba(255,255,255,0.2)', width: 1 },
          },
          colorbar: {
            title: 'Elevation (m)',
            titlefont: { color: '#7fb3d3', size: 11 },
            tickfont: { color: '#7fb3d3', size: 10 },
          },
          hovertemplate: 'X: %{x}<br>Y: %{y}<br>Elevation: %{z:.1f} m<extra></extra>',
        },
      ],
      layout: {
        paper_bgcolor: 'transparent',
        scene: {
          bgcolor: 'rgba(3,12,28,0.9)',
          xaxis: { title: 'Grid X', gridcolor: 'rgba(0,180,255,0.15)', color: '#7fb3d3' },
          yaxis: { title: 'Grid Y', gridcolor: 'rgba(0,180,255,0.15)', color: '#7fb3d3' },
          zaxis: { title: 'Elevation (m)', gridcolor: 'rgba(0,180,255,0.15)', color: '#7fb3d3' },
          camera: { eye: { x: 1.5, y: -1.5, z: 1.2 } },
        },
        font: { color: '#7fb3d3', family: 'Inter' },
        margin: { t: 10, l: 0, r: 0, b: 0 },
      },
    }
  }, [result])

  return (
    <Plot
      data={data}
      layout={layout}
      config={{ responsive: true, displayModeBar: true }}
      style={{ width: '100%', height: '460px' }}
    />
  )
}
