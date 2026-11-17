import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts'

const TOOLTIP_STYLE = {
  background: 'rgba(3,12,28,0.97)',
  border: '1px solid rgba(0,180,255,0.3)',
  borderRadius: 8,
  color: '#e8f4ff',
  fontSize: 12,
}

const AXIS_STYLE = { fill: '#7fb3d3', fontSize: 11 }

function ChartCard({ title, children }) {
  return (
    <div className="glass" style={{ padding: 20 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#7fb3d3', marginBottom: 16 }}>{title}</p>
      {children}
    </div>
  )
}

function ScatterVsRisk({ title, data, xKey, xLabel, fill }) {
  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height={240}>
        <ScatterChart margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,180,255,0.08)" />
          <XAxis
            dataKey={xKey}
            name={xLabel}
            tick={AXIS_STYLE}
            type="number"
            domain={['auto', 'auto']}
            label={{ value: xLabel, fill: '#7fb3d3', fontSize: 11, position: 'insideBottom', offset: -8 }}
          />
          <YAxis
            dataKey="risk"
            name="Risk Score"
            unit="%"
            tick={AXIS_STYLE}
            type="number"
            domain={[0, 100]}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter data={data} fill={fill} opacity={0.55} />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function RainfallVsRisk({ cells }) {
  if (!cells?.length) return null
  const data = cells.map((c) => ({ rainfall: +c.rainfall.toFixed(1), risk: +c.risk_score.toFixed(1) }))
  return <ScatterVsRisk title="Rainfall vs Risk Score" data={data} xKey="rainfall" xLabel="Rainfall (mm/hr)" fill="#00b4ff" />
}

export function WaterLevelVsRisk({ cells }) {
  if (!cells?.length) return null
  const data = cells.map((c) => ({ water_level: +c.water_level.toFixed(2), risk: +c.risk_score.toFixed(1) }))
  return <ScatterVsRisk title="Water Level vs Risk Score" data={data} xKey="water_level" xLabel="Water Level (m)" fill="#00e5cc" />
}

export function ElevationVsRisk({ cells }) {
  if (!cells?.length) return null
  const data = cells.map((c) => ({ elevation: +c.elevation.toFixed(1), risk: +c.risk_score.toFixed(1) }))
  return <ScatterVsRisk title="Elevation vs Risk Score" data={data} xKey="elevation" xLabel="Elevation (m)" fill="#ffb300" />
}

export function FlowVelocityVsRisk({ cells }) {
  if (!cells?.length) return null
  const data = cells.map((c) => ({ velocity: +c.flow_velocity.toFixed(2), risk: +c.risk_score.toFixed(1) }))
  return <ScatterVsRisk title="Flow Velocity vs Risk Score" data={data} xKey="velocity" xLabel="Flow Velocity (m/s)" fill="#ff7043" />
}

export function DivergenceVsAccumulation({ cells }) {
  if (!cells?.length) return null
  const data = cells.map((c) => ({ divergence: +c.divergence.toFixed(4), accumulation: +c.accumulation.toFixed(4) }))
  return (
    <ChartCard title="Divergence vs Accumulation">
      <ResponsiveContainer width="100%" height={240}>
        <ScatterChart margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,180,255,0.08)" />
          <XAxis dataKey="divergence" name="Divergence" tick={AXIS_STYLE} type="number" domain={['auto', 'auto']} label={{ value: '∇·V (Divergence)', fill: '#7fb3d3', fontSize: 11, position: 'insideBottom', offset: -8 }} />
          <YAxis dataKey="accumulation" name="Accumulation" tick={AXIS_STYLE} type="number" domain={[0, 1]} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Scatter data={data} fill="#a855f7" opacity={0.55} />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function RiskDistributionBar({ cells }) {
  if (!cells?.length) return null
  const counts = { LOW: 0, MEDIUM: 0, HIGH: 0, 'VERY HIGH': 0 }
  cells.forEach((c) => { if (counts[c.risk_level] !== undefined) counts[c.risk_level]++ })
  const data = [
    { level: 'LOW', count: counts.LOW, color: '#00ff87' },
    { level: 'MEDIUM', count: counts.MEDIUM, color: '#ffb300' },
    { level: 'HIGH', count: counts.HIGH, color: '#ff7043' },
    { level: 'VERY HIGH', count: counts['VERY HIGH'], color: '#ff4757' },
  ]
  return (
    <ChartCard title="Risk Level Distribution">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,180,255,0.08)" />
          <XAxis dataKey="level" tick={AXIS_STYLE} />
          <YAxis tick={AXIS_STYLE} label={{ value: 'Grid Cells', fill: '#7fb3d3', fontSize: 11, angle: -90, position: 'insideLeft' }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Bar dataKey="count" name="Grid Cells" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
