import Plot from 'react-plotly.js'
import { useMemo } from 'react'

export default function ElevationContour({ result }) {
  const { data, layout } = useMemo(() => {
    if (!result) return { data: [], layout: {} }
    const { elevation, x_coords, y_coords } = result

    return {
      data: [
        {
          type: 'contour',
          z: elevation,
          x: x_coords,
          y: y_coords,
          colorscale: 'Viridis',
          contours: {
            coloring: 'heatmap',
            showlabels: true,
            labelfont: { size: 10, color: '#fff' },
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
        plot_bgcolor: 'rgba(3,12,28,0.8)',
        font: { color: '#7fb3d3', family: 'Inter' },
        xaxis: { title: 'Grid X', gridcolor: 'rgba(0,180,255,0.08)', color: '#7fb3d3' },
        yaxis: { title: 'Grid Y', gridcolor: 'rgba(0,180,255,0.08)', color: '#7fb3d3', scaleanchor: 'x' },
        margin: { t: 10, l: 50, r: 80, b: 50 },
      },
    }
  }, [result])

  return (
    <Plot
      data={data}
      layout={layout}
      config={{ responsive: true, displayModeBar: true }}
      style={{ width: '100%', height: '420px' }}
    />
  )
}
