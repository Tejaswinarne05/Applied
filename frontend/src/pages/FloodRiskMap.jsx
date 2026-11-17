import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { SectionTitle, NoDataCard, SimDisclaimer, RiskBadge } from '../components/ui'
import FloodRiskHeatmap from '../charts/FloodRiskHeatmap'
import { MapPin, Filter } from 'lucide-react'

const FILTER_LEVELS = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'VERY HIGH']

function HighRiskCard({ area, rank }) {
  const colors = { LOW: '#00ff87', MEDIUM: '#ffb300', HIGH: '#ff7043', 'VERY HIGH': '#ff4757' }
  const color  = colors[area.risk_level] || '#7fb3d3'
  return (
    <div className="glass card-hover" style={{ padding: 16, borderLeft: `3px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: 4, padding: '2px 8px' }}>
            #{rank}
          </span>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#e8f4ff' }}>Grid ({area.x}, {area.y})</p>
        </div>
        <RiskBadge level={area.risk_level} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          ['Elevation', area.elevation + ' m'],
          ['Rainfall', area.rainfall + ' mm/hr'],
          ['Water Level', area.water_level + ' m'],
          ['Flow Vel.', area.flow_velocity + ' m/s'],
          ['Divergence', area.divergence],
          ['Accumulation', (area.accumulation * 100).toFixed(1) + '%'],
        ].map(([k, v]) => (
          <div key={k}>
            <p style={{ fontSize: 10, color: '#4a7fa5', fontWeight: 600 }}>{k}</p>
            <p style={{ fontSize: 12, color: '#7fb3d3', fontWeight: 500 }}>{v}</p>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, padding: '6px 12px', background: `${color}11`, borderRadius: 6, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: '#7fb3d3' }}>Risk Score</span>
        <span style={{ fontSize: 14, fontWeight: 800, color }}>{area.risk_score.toFixed(1)}%</span>
      </div>
    </div>
  )
}

export default function FloodRiskMap() {
  const { result } = useApp()
  const [filter, setFilter] = useState('ALL')

  if (!result) {
    return (
      <div className="page-enter" style={{ padding: 24 }}>
        <SectionTitle>Flood Risk Map</SectionTitle>
        <NoDataCard message="No analysis data available." cta='Load demo data from the Dashboard to see the flood risk heatmap.' />
      </div>
    )
  }

  const { stats, high_risk_areas } = result

  // count cells per level
  const levelCounts = { LOW: 0, MEDIUM: 0, HIGH: 0, 'VERY HIGH': 0 }
  result.cells.forEach((c) => { if (levelCounts[c.risk_level] !== undefined) levelCounts[c.risk_level]++ })

  return (
    <div className="page-enter" style={{ padding: 24 }}>
      <SimDisclaimer />
      <SectionTitle subtitle="Interactive flood risk heatmap generated from vector calculus calculations">
        Flood Risk Map
      </SectionTitle>

      {/* Risk level summary pills */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        {[
          { level: 'LOW',       count: levelCounts.LOW,              color: '#00ff87' },
          { level: 'MEDIUM',    count: levelCounts.MEDIUM,           color: '#ffb300' },
          { level: 'HIGH',      count: levelCounts.HIGH,             color: '#ff7043' },
          { level: 'VERY HIGH', count: levelCounts['VERY HIGH'],     color: '#ff4757' },
        ].map(({ level, count, color }) => (
          <div key={level} style={{ padding: '8px 16px', borderRadius: 8, background: `${color}11`, border: `1px solid ${color}33`, display: 'flex', align: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block', marginTop: 3 }} />
            <span style={{ fontSize: 13, color, fontWeight: 600 }}>{level}</span>
            <span style={{ fontSize: 13, color: '#7fb3d3', marginLeft: 4 }}>{count} cells</span>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <Filter size={14} color="#7fb3d3" />
        <span style={{ fontSize: 12, color: '#7fb3d3', marginRight: 8 }}>Filter:</span>
        {FILTER_LEVELS.map((l) => (
          <button key={l} onClick={() => setFilter(l)} id={`filter-${l.replace(' ', '-')}`}
            style={{
              padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
              background: filter === l ? 'linear-gradient(135deg,#0077cc,#00b4ff)' : 'rgba(0,180,255,0.06)',
              color: filter === l ? '#fff' : '#7fb3d3', transition: 'all 0.2s',
              border: filter === l ? 'none' : '1px solid rgba(0,180,255,0.15)',
            }}>
            {l}
          </button>
        ))}
      </div>

      {/* Heatmap */}
      <div className="glass" style={{ padding: 20, marginBottom: 24 }}>
        <FloodRiskHeatmap result={result} filterLevel={filter} />
      </div>

      {/* High risk areas */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <MapPin size={16} color="#ff4757" />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#e8f4ff' }}>Top 5 Highest-Risk Locations</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {high_risk_areas.map((area, i) => (
            <HighRiskCard key={i} area={area} rank={i + 1} />
          ))}
        </div>
      </div>
    </div>
  )
}
