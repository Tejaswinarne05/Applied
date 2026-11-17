import Plot from 'react-plotly.js'
import { useMemo } from 'react'

const RISK_COLORSCALE = [
  [0,    '#00ff87'],   // LOW
  [0.30, '#00ff87'],
  [0.31, '#ffb300'],   // MEDIUM
  [0.60, '#ffb300'],
  [0.61, '#ff7043'],   // HIGH
  [0.80, '#ff7043'],
  [0.81, '#ff4757'],   // VERY HIGH
  [1,    '#ff4757'],
]

export default function FloodRiskHeatmap({ result, filterLevel = 'ALL' }) {
  const { data, layout } = useMemo(() => {
    if (!result) return { data: [], layout: {} }
    const { risk_map, cells, rows, cols, x_coords, y_coords,
            elevation, rainfall, water_level, divergence, accumulation } = result

    // Apply filter – mask non-matching cells to null
    let z = risk_map.map((row, i) =>
      row.map((val, j) => {
        if (filterLevel === 'ALL') return val
        const level = cells[i * cols + j]?.risk_level
        if (filterLevel === 'LOW'       && level === 'LOW')       return val
        if (filterLevel === 'MEDIUM'    && level === 'MEDIUM')    return val
        if (filterLevel === 'HIGH'      && level === 'HIGH')      return val
        if (filterLevel === 'VERY HIGH' && level === 'VERY HIGH') return val
        return null
      })
    )

    const customText = risk_map.map((row, i) =>
      row.map((val, j) => {
        const c = cells[i * cols + j]
        if (!c) return ''
        return (
          `Location: (${c.x}, ${c.y})<br>` +
          `Elevation: ${c.elevation} m<br>` +
          `Rainfall: ${c.rainfall} mm/hr<br>` +
          `Water Level: ${c.water_level} m<br>` +
          `Flow Velocity: ${c.flow_velocity} m/s<br>` +
          `Divergence: ${c.divergence}<br>` +
          `Accumulation: ${c.accumulation}<br>` +
          `Risk Score: ${c.risk_score.toFixed(1)}%<br>` +
          `Risk Level: ${c.risk_level}`
        )
      })
    )

    return {
      data: [
        {
          type: 'heatmap',
          z,
          x: x_coords,
          y: y_coords,
          colorscale: RISK_COLORSCALE,
          zmin: 0,
          zmax: 100,
          colorbar: {
            title: 'Risk Score (%)',
            titlefont: { color: '#7fb3d3', size: 11 },
            tickfont: { color: '#7fb3d3', size: 10 },
            tickvals: [15, 45, 70, 90],
            ticktext: ['LOW', 'MEDIUM', 'HIGH', 'VERY HIGH'],
          },
          text: customText,
          hovertemplate: '%{text}<extra></extra>',
          hoverlabel: {
            bgcolor: 'rgba(3,12,28,0.95)',
            bordercolor: '#00b4ff',
            font: { color: '#e8f4ff', size: 12 },
          },
        },
      ],
      layout: {
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'rgba(3,12,28,0.8)',
        font: { color: '#7fb3d3', family: 'Inter' },
        xaxis: {
          title: 'Grid X',
          gridcolor: 'rgba(0,180,255,0.06)',
          color: '#7fb3d3',
          scaleanchor: 'y',
        },
        yaxis: {
          title: 'Grid Y',
          gridcolor: 'rgba(0,180,255,0.06)',
          color: '#7fb3d3',
        },
        margin: { t: 10, l: 50, r: 100, b: 50 },
      },
    }
  }, [result, filterLevel])

  return (
    <Plot
      data={data}
      layout={layout}
      config={{ responsive: true, displayModeBar: true, scrollZoom: true }}
      style={{ width: '100%', height: '520px' }}
    />
  )
}
