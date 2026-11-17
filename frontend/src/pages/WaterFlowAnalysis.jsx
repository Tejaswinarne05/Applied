import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { SectionTitle, NoDataCard, SimDisclaimer, MathCard } from '../components/ui'
import VectorFieldPlot from '../charts/VectorFieldPlot'
import ElevationContour from '../charts/ElevationContour'
import TerrainSurface3D from '../charts/TerrainSurface3D'
import { Activity, TrendingUp, Wind, Compass } from 'lucide-react'

function StatCard({ label, value, unit, color = '#00b4ff', desc }) {
  return (
    <div className="glass" style={{ padding: 16 }}>
      <p style={{ fontSize: 11, color: '#7fb3d3', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 800, color, marginTop: 4 }}>
        {value} <span style={{ fontSize: 13, fontWeight: 400, color: '#7fb3d3' }}>{unit}</span>
      </p>
      {desc && <p style={{ fontSize: 11, color: '#4a7fa5', marginTop: 4 }}>{desc}</p>}
    </div>
  )
}

const TABS = ['Vector Field', 'Elevation Contour', '3D Terrain']

export default function WaterFlowAnalysis() {
  const { result } = useApp()
  const [activeTab, setActiveTab] = useState(0)

  if (!result) {
    return (
      <div className="page-enter" style={{ padding: 24 }}>
        <SectionTitle>Water Flow Analysis</SectionTitle>
        <NoDataCard message="No analysis data available." cta='Go to "Data Input" and click "Load Demo Dataset" or run an analysis first.' />
      </div>
    )
  }

  const { stats } = result

  return (
    <div className="page-enter" style={{ padding: 24 }}>
      <SimDisclaimer />
      <SectionTitle subtitle="Vector field visualizations derived from terrain elevation gradient">
        Water Flow Analysis
      </SectionTitle>

      {/* Math formula cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <MathCard title="Gradient"   formula="∇h = (∂h/∂x, ∂h/∂y)" description="Rate of elevation change in each direction" />
        <MathCard title="Flow Vector" formula="V = −∇h"             description="Water flows toward decreasing elevation" />
        <MathCard title="Magnitude"  formula="|V| = √(Vx² + Vy²)"  description="Speed of water flow at each grid cell" />
        <MathCard title="Divergence" formula="∇·V = ∂Vx/∂x + ∂Vy/∂y" description="Negative = convergence / accumulation" />
      </div>

      {/* Numerical stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Avg Gradient Mag"  value={stats.mean_gradient_mag.toFixed(4)}  color="#00b4ff" desc="Mean |∇h|" />
        <StatCard label="Max Gradient Mag"  value={stats.max_gradient_mag.toFixed(4)}   color="#00e5cc" desc="Max |∇h|" />
        <StatCard label="Avg Flow Magnitude" value={stats.mean_flow_velocity.toFixed(3)} unit="m/s" color="#a855f7" />
        <StatCard label="Max Flow Magnitude" value={stats.max_flow_velocity.toFixed(3)}  unit="m/s" color="#ff7043" />
        <StatCard label="Avg Divergence"    value={stats.mean_divergence.toFixed(4)}     color="#ffb300" desc="∇·V mean" />
        <StatCard label="Max Accumulation"  value={(stats.max_accumulation * 100).toFixed(1)} unit="%" color="#ff4757" />
      </div>

      {/* Divergence interpretation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div className="glass" style={{ padding: 16, borderLeft: '3px solid #00e5cc' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#00e5cc', marginBottom: 4 }}>Negative Divergence (∇·V &lt; 0)</p>
          <p style={{ fontSize: 12, color: '#7fb3d3' }}>Water converging / accumulating. Indicates potential flood zone.</p>
        </div>
        <div className="glass" style={{ padding: 16, borderLeft: '3px solid #ffb300' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#ffb300', marginBottom: 4 }}>Positive Divergence (∇·V &gt; 0)</p>
          <p style={{ fontSize: 12, color: '#7fb3d3' }}>Water spreading / dispersing. Safer drainage behavior.</p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="glass" style={{ padding: 20 }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setActiveTab(i)} id={`viz-tab-${i}`}
              style={{
                padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 12,
                background: activeTab === i ? 'linear-gradient(135deg,#0077cc,#00b4ff)' : 'rgba(0,180,255,0.06)',
                color: activeTab === i ? '#fff' : '#7fb3d3', transition: 'all 0.2s',
                border: activeTab === i ? 'none' : '1px solid rgba(0,180,255,0.15)',
              }}>
              {t}
            </button>
          ))}
        </div>

        {activeTab === 0 && (
          <>
            <p style={{ fontSize: 12, color: '#4a7fa5', marginBottom: 12 }}>
              Arrows show water flow direction (V = −∇h). Arrow color and length indicate flow magnitude.
              Hover over grid points for detailed values.
            </p>
            <VectorFieldPlot result={result} />
          </>
        )}
        {activeTab === 1 && (
          <>
            <p style={{ fontSize: 12, color: '#4a7fa5', marginBottom: 12 }}>
              Contour lines connect equal-elevation points. Water flows perpendicular to contour lines (downhill).
            </p>
            <ElevationContour result={result} />
          </>
        )}
        {activeTab === 2 && (
          <>
            <p style={{ fontSize: 12, color: '#4a7fa5', marginBottom: 12 }}>
              3D terrain surface. Drag to rotate, scroll to zoom. Higher = lighter. Basin visible in lower-right quadrant.
            </p>
            <TerrainSurface3D result={result} />
          </>
        )}
      </div>
    </div>
  )
}
