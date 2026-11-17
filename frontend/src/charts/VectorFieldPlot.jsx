import Plot from 'react-plotly.js'
import { useMemo } from 'react'

/**
 * Vector field (quiver) plot using Plotly cone/annotation arrows.
 * Downsamples the grid so arrows remain legible.
 */
export default function VectorFieldPlot({ result }) {
  const { data, layout } = useMemo(() => {
    if (!result) return { data: [], layout: {} }

    const { Vx, Vy, flow_magnitude, flow_direction, divergence, elevation,
            rows, cols, x_coords, y_coords } = result

    const STEP = Math.max(1, Math.floor(Math.min(rows, cols) / 20))

    const xs = [], ys = [], us = [], vs = [],
          texts = [], mags = []

    for (let i = 0; i < rows; i += STEP) {
      for (let j = 0; j < cols; j += STEP) {
        const mag = flow_magnitude[i][j]
        xs.push(j)
        ys.push(i)
        // Scale arrows by magnitude
        const scale = 0.6 * STEP
        us.push(Vx[i][j] / (mag + 1e-9) * scale)
        vs.push(Vy[i][j] / (mag + 1e-9) * scale)
        mags.push(mag)
        texts.push(
          `Location: (${j}, ${i})<br>` +
          `Elevation: ${elevation[i][j].toFixed(1)} m<br>` +
          `Flow X (Vx): ${Vx[i][j].toFixed(3)}<br>` +
          `Flow Y (Vy): ${Vy[i][j].toFixed(3)}<br>` +
          `Magnitude: ${mag.toFixed(3)} m/s<br>` +
          `Direction: ${flow_direction[i][j].toFixed(1)}°<br>` +
          `Divergence: ${divergence[i][j].toFixed(4)}`
        )
      }
    }

    // Background elevation heatmap
    const heatmapData = {
      type: 'heatmap',
      z: elevation,
      x: x_coords,
      y: y_coords,
      colorscale: 'Earth',
      opacity: 0.6,
      showscale: true,
      colorbar: {
        title: 'Elevation (m)',
        titlefont: { color: '#7fb3d3', size: 11 },
        tickfont: { color: '#7fb3d3', size: 10 },
        x: 1.02,
      },
      hoverinfo: 'skip',
      name: 'Elevation',
    }

    // Quiver arrows as scatter with custom SVG arrows
    const quiverData = {
      type: 'scatter',
      mode: 'markers+text',
      x: xs,
      y: ys,
      marker: {
        symbol: 'arrow',
        size: 12,
        angleref: 'previous',
        color: mags,
        colorscale: [[0, '#00b4ff'], [0.5, '#00e5cc'], [1, '#00ff87']],
        cmin: 0,
        cmax: Math.max(...mags),
        colorbar: {
          title: '|V| m/s',
          titlefont: { color: '#7fb3d3', size: 11 },
          tickfont: { color: '#7fb3d3', size: 10 },
          x: 1.14,
        },
        showscale: true,
      },
      // Use annotations for arrows via separate trace
      hoverinfo: 'text',
      text: texts,
      name: 'Flow vectors',
    }

    // Actual quiver arrows using cone-like approach with line + marker
    const arrowTraces = xs.map((x, idx) => ({
      type: 'scatter',
      mode: 'lines',
      x: [x, x + us[idx]],
      y: [ys[idx], ys[idx] + vs[idx]],
      line: {
        color: `hsl(${195 + mags[idx] * 30}, 100%, ${50 + mags[idx] * 10}%)`,
        width: 1.5,
      },
      hoverinfo: 'skip',
      showlegend: false,
    }))

    const layout = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'rgba(3,12,28,0.8)',
      font: { color: '#7fb3d3', family: 'Inter' },
      xaxis: {
        title: 'Grid X',
        gridcolor: 'rgba(0,180,255,0.08)',
        zerolinecolor: 'rgba(0,180,255,0.15)',
        color: '#7fb3d3',
      },
      yaxis: {
        title: 'Grid Y',
        gridcolor: 'rgba(0,180,255,0.08)',
        zerolinecolor: 'rgba(0,180,255,0.15)',
        color: '#7fb3d3',
        scaleanchor: 'x',
      },
      margin: { t: 10, l: 50, r: 80, b: 50 },
      showlegend: false,
    }

    return {
      data: [heatmapData, ...arrowTraces, quiverData],
      layout,
    }
  }, [result])

  return (
    <Plot
      data={data}
      layout={layout}
      config={{ responsive: true, displayModeBar: true, scrollZoom: true }}
      style={{ width: '100%', height: '500px' }}
    />
  )
}
