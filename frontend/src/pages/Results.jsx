import { useApp } from '../context/AppContext'
import { SectionTitle, NoDataCard, SimDisclaimer, RiskBadge } from '../components/ui'
import { Download, Printer, FileText, CheckCircle } from 'lucide-react'
import { getExportCSVUrl } from '../services/api'

function FindingCard({ index, text }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid rgba(0,180,255,0.08)' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#0077cc,#00b4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 700, color: '#fff' }}>
        {index}
      </div>
      <p style={{ fontSize: 14, color: '#7fb3d3', lineHeight: 1.6, paddingTop: 4 }}>{text}</p>
    </div>
  )
}

function MetricRow({ label, value, unit = '' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(0,180,255,0.08)' }}>
      <span style={{ fontSize: 13, color: '#7fb3d3' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: '#e8f4ff' }}>{value}{unit}</span>
    </div>
  )
}

export default function Results() {
  const { result } = useApp()

  if (!result) {
    return (
      <div className="page-enter" style={{ padding: 24 }}>
        <SectionTitle>Results</SectionTitle>
        <NoDataCard message="No analysis results available." cta="Run an analysis first." />
      </div>
    )
  }

  const { stats, risk_score, risk_level, high_risk_areas, weights = { rainfall: 0.35, water_level: 0.25, elevation: 0.20, accumulation: 0.20 } } = result

  const getRiskColor = (level) => {
    if (level === 'VERY HIGH') return '#ff4757'
    if (level === 'HIGH')      return '#ff7043'
    if (level === 'MEDIUM')    return '#ffb300'
    return '#00ff87'
  }

  const findings = [
    `Low-elevation areas (basin regions) show significantly higher water accumulation scores (up to ${(stats.max_accumulation * 100).toFixed(1)}%).`,
    `Higher rainfall intensity directly correlates with increased flood risk score. Peak rainfall: ${stats.max_rainfall.toFixed(1)} mm/hr.`,
    `Negative divergence (∇·V < 0) identifies zones of water convergence — these map to the highest-risk cells.`,
    `Water flows perpendicular to contour lines, following the steepest descent (V = −∇h). Flow magnitude max: ${stats.max_gradient_mag.toFixed(4)}.`,
    `The flood risk model combines rainfall (35%), water level (25%), elevation (20%), and accumulation (20%) factors.`,
  ]

  const mostVulnerable = high_risk_areas[0]

  function downloadReport() {
    const lines = [
      '=== WATER FLOW & FLOOD RISK ANALYSIS REPORT ===',
      `Generated: ${new Date().toLocaleString()}`,
      'NOTE: This is a simulation/educational model, NOT an official forecast.',
      '',
      '--- SUMMARY ---',
      `Overall Risk Score: ${risk_score.toFixed(2)}%`,
      `Risk Level: ${risk_level}`,
      `Grid Dimensions: ${result.rows} × ${result.cols}`,
      '',
      '--- STATISTICS ---',
      `Mean Rainfall: ${stats.mean_rainfall.toFixed(2)} mm/hr`,
      `Max Rainfall: ${stats.max_rainfall.toFixed(2)} mm/hr`,
      `Mean Water Level: ${stats.mean_water_level.toFixed(2)} m`,
      `Max Water Level: ${stats.max_water_level.toFixed(2)} m`,
      `Mean Flow Velocity: ${stats.mean_flow_velocity.toFixed(2)} m/s`,
      `Max Gradient Magnitude: ${stats.max_gradient_mag.toFixed(4)}`,
      `Mean Divergence: ${stats.mean_divergence.toFixed(4)}`,
      `Max Accumulation: ${(stats.max_accumulation * 100).toFixed(1)}%`,
      `High Risk Cells: ${stats.high_risk_count}`,
      `Very High Risk Cells: ${stats.very_high_risk_count}`,
      '',
      '--- MOST VULNERABLE LOCATION ---',
      mostVulnerable ? `Grid (${mostVulnerable.x}, ${mostVulnerable.y}) — Risk: ${mostVulnerable.risk_score.toFixed(1)}% [${mostVulnerable.risk_level}]` : 'N/A',
      '',
      '--- RISK MODEL WEIGHTS ---',
      `Rainfall: ${(weights.rainfall * 100).toFixed(0)}%`,
      `Water Level: ${(weights.water_level * 100).toFixed(0)}%`,
      `Elevation: ${(weights.elevation * 100).toFixed(0)}%`,
      `Accumulation: ${(weights.accumulation * 100).toFixed(0)}%`,
      '',
      '--- KEY FINDINGS ---',
      ...findings.map((f, i) => `${i + 1}. ${f}`),
    ]

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'flood_risk_report.txt'; a.click()
  }

  return (
    <div className="page-enter" style={{ padding: 24 }}>
      <SimDisclaimer />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <SectionTitle subtitle="Complete flood risk assessment generated from vector calculus analysis">
          Flood Risk Assessment Report
        </SectionTitle>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a href={getExportCSVUrl()} download="flood_analysis_results.csv" id="btn-export-csv">
            <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <Download size={14} /> Export CSV
            </button>
          </a>
          <button className="btn-secondary" onClick={downloadReport} id="btn-download-report" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <FileText size={14} /> Download Report
          </button>
          <button className="btn-secondary" onClick={() => window.print()} id="btn-print" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start', marginBottom: 24 }}>
        {/* Main metrics */}
        <div className="glass" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#e8f4ff', marginBottom: 20 }}>Assessment Summary</h3>
          <div style={{ display: 'flex', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: 12, color: '#7fb3d3', fontWeight: 600, textTransform: 'uppercase' }}>Overall Risk Score</p>
              <p style={{ fontSize: 52, fontWeight: 900, color: getRiskColor(risk_level), lineHeight: 1 }}>
                {risk_score.toFixed(1)}<span style={{ fontSize: 24 }}>%</span>
              </p>
            </div>
            <div style={{ paddingTop: 8 }}>
              <p style={{ fontSize: 12, color: '#7fb3d3', marginBottom: 6 }}>Risk Level</p>
              <RiskBadge level={risk_level} />
            </div>
          </div>

          <MetricRow label="Grid Dimensions"        value={`${result.rows} × ${result.cols}`} />
          <MetricRow label="Maximum Water Accumulation" value={(stats.max_accumulation * 100).toFixed(1)} unit="%" />
          <MetricRow label="Maximum Flow Magnitude" value={stats.max_gradient_mag.toFixed(4)} />
          <MetricRow label="Average Divergence (∇·V)" value={stats.mean_divergence.toFixed(4)} />
          <MetricRow label="High Risk Cells"        value={stats.high_risk_count} />
          <MetricRow label="Very High Risk Cells"   value={stats.very_high_risk_count} />

          {mostVulnerable && (
            <div style={{ marginTop: 16, padding: 16, background: 'rgba(255,71,87,0.06)', borderRadius: 10, border: '1px solid rgba(255,71,87,0.2)' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#ff4757', marginBottom: 8 }}>📍 Most Vulnerable Location</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#e8f4ff' }}>Grid ({mostVulnerable.x}, {mostVulnerable.y})</p>
              <p style={{ fontSize: 13, color: '#7fb3d3' }}>Risk: {mostVulnerable.risk_score.toFixed(1)}% — Elev: {mostVulnerable.elevation} m — Rainfall: {mostVulnerable.rainfall} mm/hr</p>
            </div>
          )}
        </div>

        {/* Risk model weights */}
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e8f4ff', marginBottom: 16 }}>Risk Model Weights</h3>
          <p style={{ fontSize: 12, color: '#4a7fa5', marginBottom: 16 }}>
            Risk = 0.35R + 0.25W + 0.20E + 0.20A
          </p>
          {[
            { label: 'Rainfall (R)',    val: weights.rainfall,    color: '#00b4ff' },
            { label: 'Water Level (W)', val: weights.water_level, color: '#00e5cc' },
            { label: 'Elevation (E)',   val: weights.elevation,   color: '#ffb300' },
            { label: 'Accumulation (A)',val: weights.accumulation,color: '#ff7043' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: '#7fb3d3' }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color }}>{(val * 100).toFixed(0)}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(0,180,255,0.1)', overflow: 'hidden' }}>
                <div style={{ width: `${val * 100}%`, height: '100%', background: color, borderRadius: 3 }} />
              </div>
            </div>
          ))}
          <p style={{ fontSize: 11, color: '#4a7fa5', marginTop: 12, fontStyle: 'italic' }}>
            Weights are configurable in backend/calculations/flood_risk.py
          </p>
        </div>
      </div>

      {/* Key findings */}
      <div className="glass" style={{ padding: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#e8f4ff', marginBottom: 4 }}>Key Findings</h3>
        <p style={{ fontSize: 12, color: '#4a7fa5', marginBottom: 16 }}>Observations from the vector calculus simulation:</p>
        {findings.map((f, i) => <FindingCard key={i} index={i + 1} text={f} />)}
      </div>
    </div>
  )
}
