import { useApp } from '../context/AppContext'
import { KpiCard, RiskBadge, SimDisclaimer, NoDataCard, LoadingSpinner, ErrorAlert } from '../components/ui'
import { CloudRain, Waves, Wind, AlertTriangle, TrendingUp, MapPin, Droplets, Activity } from 'lucide-react'
import Plot from 'react-plotly.js'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

function MiniRiskMap({ result }) {
  const data = useMemo(() => {
    if (!result) return []
    return [{
      type: 'heatmap',
      z: result.risk_map,
      colorscale: [
        [0, '#00ff87'], [0.3, '#00ff87'],
        [0.31, '#ffb300'], [0.6, '#ffb300'],
        [0.61, '#ff7043'], [0.8, '#ff7043'],
        [0.81, '#ff4757'], [1, '#ff4757'],
      ],
      zmin: 0, zmax: 100,
      showscale: false,
      hoverinfo: 'skip',
    }]
  }, [result])

  if (!result) return null
  return (
    <Plot
      data={data}
      layout={{
        paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
        margin: { t: 0, l: 0, r: 0, b: 0 },
        xaxis: { visible: false }, yaxis: { visible: false },
      }}
      config={{ displayModeBar: false, staticPlot: true }}
      style={{ width: '100%', height: '200px', borderRadius: 8 }}
    />
  )
}

export default function Dashboard() {
  const { result, loading, error, clearError, loadDemo } = useApp()
  const navigate = useNavigate()

  const stats = result?.stats

  function getRiskColor(level) {
    if (level === 'VERY HIGH') return '#ff4757'
    if (level === 'HIGH')      return '#ff7043'
    if (level === 'MEDIUM')    return '#ffb300'
    return '#00ff87'
  }

  return (
    <div className="page-enter" style={{ padding: 24 }}>
      <SimDisclaimer />
      <ErrorAlert message={error} onDismiss={clearError} />

      {/* Hero Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg,#00b4ff,#00e5cc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Water Flow & Flood Risk Analysis
          </h1>
          <p style={{ color: '#7fb3d3', fontSize: 14, marginTop: 6 }}>
            Vector Calculus Based Flood Simulation — Educational / Engineering Project
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-primary" onClick={loadDemo} disabled={loading} id="btn-load-demo">
            {loading ? '⏳ Loading…' : '🌊 Load Demo Dataset'}
          </button>
          {result && (
            <button className="btn-secondary" onClick={() => navigate('/flow')} id="btn-view-flow">
              View Analysis →
            </button>
          )}
        </div>
      </div>

      {loading && <LoadingSpinner message="Generating terrain and running vector calculus analysis…" />}

      {!result && !loading && (
        <NoDataCard
          message="No analysis data loaded yet."
          cta='Click "Load Demo Dataset" above to populate the dashboard with a 30×30 realistic terrain simulation.'
        />
      )}

      {result && !loading && (
        <>
          {/* KPI cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <KpiCard icon={CloudRain} label="Rainfall Intensity" value={stats.mean_rainfall.toFixed(1)} unit="mm/hr" color="#00b4ff" subtitle={`Max: ${stats.max_rainfall.toFixed(1)} mm/hr`} />
            <KpiCard icon={Waves}     label="Avg Water Level"   value={stats.mean_water_level.toFixed(2)} unit="m" color="#00e5cc" subtitle={`Max: ${stats.max_water_level.toFixed(2)} m`} />
            <KpiCard icon={Wind}      label="Avg Flow Velocity" value={stats.mean_flow_velocity.toFixed(2)} unit="m/s" color="#a855f7" subtitle={`Max: ${stats.max_flow_velocity.toFixed(2)} m/s`} />
            <KpiCard icon={AlertTriangle} label="Flood Risk Score" value={result.risk_score.toFixed(1)} unit="%" color={getRiskColor(result.risk_level)} subtitle={`Level: ${result.risk_level}`} />
          </div>

          {/* Second row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
            <KpiCard icon={AlertTriangle} label="High Risk Cells" value={stats.high_risk_count} color="#ff7043" subtitle={`Very High: ${stats.very_high_risk_count}`} />
            <KpiCard icon={Droplets}   label="Max Accumulation" value={(stats.max_accumulation * 100).toFixed(1)} unit="%" color="#00e5cc" />
            <KpiCard icon={Activity}   label="Max Flow Magnitude" value={stats.max_gradient_mag.toFixed(3)} color="#00b4ff" subtitle="∇h max" />
            <KpiCard icon={TrendingUp} label="Avg Divergence" value={stats.mean_divergence.toFixed(4)} color="#ffb300" subtitle="∇·V mean" />
          </div>

          {/* Main content grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
            {/* Mini risk map */}
            <div className="glass" style={{ padding: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#7fb3d3', marginBottom: 12 }}>
                📍 Flood Risk Overview
              </p>
              <MiniRiskMap result={result} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="btn-secondary" onClick={() => navigate('/risk')} style={{ fontSize: 12, padding: '6px 14px' }}>
                  Open Full Map →
                </button>
              </div>
            </div>

            {/* Risk summary card */}
            <div>
              <div
                className="glass"
                style={{
                  padding: 24,
                  borderLeft: `3px solid ${getRiskColor(result.risk_level)}`,
                  marginBottom: 16,
                }}
              >
                <p style={{ fontSize: 11, color: '#7fb3d3', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                  Flood Risk Status
                </p>
                <div style={{ marginBottom: 12 }}>
                  <RiskBadge level={result.risk_level} />
                </div>
                <p style={{ fontSize: 32, fontWeight: 800, color: getRiskColor(result.risk_level), marginBottom: 4 }}>
                  {result.risk_score.toFixed(1)}%
                </p>
                <p style={{ fontSize: 13, color: '#7fb3d3', lineHeight: 1.6 }}>
                  {result.risk_level === 'VERY HIGH'
                    ? 'Critical water accumulation in low-elevation basin regions.'
                    : result.risk_level === 'HIGH'
                    ? 'Significant water accumulation in low-elevation areas.'
                    : result.risk_level === 'MEDIUM'
                    ? 'Moderate accumulation in some zones. Monitor low areas.'
                    : 'Water levels are within normal simulation parameters.'}
                </p>
                <p style={{ fontSize: 11, color: '#4a7fa5', marginTop: 10, fontStyle: 'italic' }}>
                  ⚠ Simulation result – for educational/project purposes only.
                </p>
              </div>

              {/* High-risk top spots */}
              <div className="glass" style={{ padding: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#7fb3d3', marginBottom: 12 }}>
                  📍 Top Risk Locations
                </p>
                {result.high_risk_areas.slice(0, 3).map((area, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 2 ? '1px solid rgba(0,180,255,0.08)' : 'none' }}>
                    <div>
                      <p style={{ fontSize: 13, color: '#e8f4ff', fontWeight: 500 }}>
                        Grid ({area.x}, {area.y})
                      </p>
                      <p style={{ fontSize: 11, color: '#4a7fa5' }}>Elev: {area.elevation} m</p>
                    </div>
                    <RiskBadge level={area.risk_level} />
                  </div>
                ))}
                <button className="btn-secondary" onClick={() => navigate('/risk')} style={{ width: '100%', marginTop: 12, fontSize: 12, padding: '8px' }}>
                  View All High-Risk Areas
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
