import { useApp } from '../context/AppContext'
import { SectionTitle, NoDataCard, SimDisclaimer } from '../components/ui'
import {
  RainfallVsRisk, WaterLevelVsRisk, ElevationVsRisk,
  FlowVelocityVsRisk, DivergenceVsAccumulation,
} from '../charts/AnalyticsCharts'
import { BarChart2 } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

const TOOLTIP_STYLE = {
  background: 'rgba(3,12,28,0.97)', border: '1px solid rgba(0,180,255,0.3)',
  borderRadius: 8, color: '#e8f4ff', fontSize: 12,
}
const AXIS_STYLE = { fill: '#7fb3d3', fontSize: 11 }

function StatCard({ label, value, unit, color = '#00b4ff' }) {
  return (
    <div className="glass" style={{ padding: 16 }}>
      <p style={{ fontSize: 11, color: '#7fb3d3', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 800, color, marginTop: 4 }}>
        {value} <span style={{ fontSize: 12, fontWeight: 400, color: '#7fb3d3' }}>{unit}</span>
      </p>
    </div>
  )
}

function RiskDistribution({ cells }) {
  if (!cells?.length) return null
  const counts = { 'LOW': 0, 'MEDIUM': 0, 'HIGH': 0, 'VERY HIGH': 0 }
  cells.forEach((c) => { if (counts[c.risk_level] !== undefined) counts[c.risk_level]++ })
  const COLORS = { LOW: '#00ff87', MEDIUM: '#ffb300', HIGH: '#ff7043', 'VERY HIGH': '#ff4757' }
  const data = Object.entries(counts).map(([k, v]) => ({ name: k, cells: v, color: COLORS[k] }))

  return (
    <div className="glass" style={{ padding: 20 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#7fb3d3', marginBottom: 16 }}>Risk Level Distribution</p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,180,255,0.08)" />
          <XAxis dataKey="name" tick={AXIS_STYLE} />
          <YAxis tick={AXIS_STYLE} label={{ value: 'Grid Cells', fill: '#7fb3d3', fontSize: 11, angle: -90, position: 'insideLeft' }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Bar dataKey="cells" name="Cells">
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function Analytics() {
  const { result } = useApp()

  if (!result) {
    return (
      <div className="page-enter" style={{ padding: 24 }}>
        <SectionTitle>Analytics</SectionTitle>
        <NoDataCard message="No analysis data available." cta="Load demo data from Dashboard first." />
      </div>
    )
  }

  const { stats, cells } = result

  return (
    <div className="page-enter" style={{ padding: 24 }}>
      <SimDisclaimer />
      <SectionTitle subtitle="Statistical relationships between hydrological parameters and flood risk">
        Analytics
      </SectionTitle>

      {/* Stat summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Avg Rainfall"      value={stats.mean_rainfall.toFixed(1)}       unit="mm/hr" color="#00b4ff" />
        <StatCard label="Max Rainfall"      value={stats.max_rainfall.toFixed(1)}        unit="mm/hr" color="#00b4ff" />
        <StatCard label="Avg Water Level"   value={stats.mean_water_level.toFixed(2)}    unit="m"     color="#00e5cc" />
        <StatCard label="Max Water Level"   value={stats.max_water_level.toFixed(2)}     unit="m"     color="#00e5cc" />
        <StatCard label="Avg Flow Velocity" value={stats.mean_flow_velocity.toFixed(2)}  unit="m/s"   color="#a855f7" />
        <StatCard label="Max Flow Velocity" value={stats.max_flow_velocity.toFixed(2)}   unit="m/s"   color="#a855f7" />
        <StatCard label="Overall Risk"      value={result.risk_score.toFixed(1)}         unit="%"     color="#ff7043" />
        <StatCard label="High Risk Cells"   value={stats.high_risk_count}                             color="#ff4757" />
      </div>

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
        <RainfallVsRisk         cells={cells} />
        <WaterLevelVsRisk       cells={cells} />
        <ElevationVsRisk        cells={cells} />
        <FlowVelocityVsRisk     cells={cells} />
        <DivergenceVsAccumulation cells={cells} />
        <RiskDistribution       cells={cells} />
      </div>
    </div>
  )
}
