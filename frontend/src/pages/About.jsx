import { SectionTitle, MathCard, SimDisclaimer } from '../components/ui'
import { Code, Layers, Calculator, AlertTriangle, Zap } from 'lucide-react'

function Section({ icon: Icon, title, children, color = '#00b4ff' }) {
  return (
    <div className="glass" style={{ padding: 24, marginBottom: 20 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${color}44` }}>
          <Icon size={16} color={color} />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#e8f4ff' }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}

function Para({ children }) {
  return <p style={{ fontSize: 14, color: '#7fb3d3', lineHeight: 1.8, marginBottom: 10 }}>{children}</p>
}

function Item({ children }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
      <span style={{ color: '#00b4ff', marginTop: 2, flexShrink: 0 }}>▸</span>
      <span style={{ fontSize: 14, color: '#7fb3d3', lineHeight: 1.6 }}>{children}</span>
    </div>
  )
}

export default function About() {
  return (
    <div className="page-enter" style={{ padding: 24 }}>
      <SimDisclaimer />
      <SectionTitle subtitle="Engineering project documentation">
        About This Project
      </SectionTitle>

      <Section icon={AlertTriangle} title="Problem Statement" color="#ff7043">
        <Para>
          Flooding is one of the most destructive natural phenomena, causing loss of life and massive economic damage worldwide.
          Predicting flood risk requires understanding how water flows across terrain — a problem naturally described
          by vector calculus. This project demonstrates how mathematical tools like gradient, divergence, and vector
          fields can model water movement and estimate flood-prone regions.
        </Para>
        <div style={{ padding: 12, background: 'rgba(255,71,87,0.05)', borderRadius: 8, border: '1px solid rgba(255,71,87,0.15)', marginTop: 8 }}>
          <p style={{ fontSize: 12, color: '#ff7f8a', fontStyle: 'italic' }}>
            ⚠ This is an educational simulation model built for a college engineering project.
            It does NOT provide real-time flood warnings or scientifically validated disaster predictions.
          </p>
        </div>
      </Section>

      <Section icon={Zap} title="Objectives" color="#00b4ff">
        {[
          'Demonstrate gradient computation from elevation data using NumPy.',
          'Construct water-flow vector fields using V = −∇h.',
          'Calculate divergence to identify water convergence zones.',
          'Build a transparent, configurable flood risk scoring model.',
          'Visualize results interactively using Plotly.js and Recharts.',
          'Create a full-stack educational engineering web application.',
        ].map((o, i) => <Item key={i}>{o}</Item>)}
      </Section>

      <Section icon={Calculator} title="Vector Calculus Concepts" color="#00e5cc">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <MathCard
            title="1. Gradient"
            formula="∇h = (∂h/∂x, ∂h/∂y)"
            description="Measures the rate of elevation change in x and y directions. Points in the direction of steepest ascent."
          />
          <MathCard
            title="2. Flow Vector"
            formula="V = −∇h"
            description="Water flows downhill, opposite to the elevation gradient. Gives flow direction at every point."
          />
          <MathCard
            title="3. Flow Magnitude"
            formula="|V| = √(Vx² + Vy²)"
            description="Scalar speed of water flow at a given grid cell. Higher on steep slopes."
          />
          <MathCard
            title="4. Flow Direction"
            formula="θ = atan2(Vy, Vx) [°]"
            description="Angle of water flow in degrees from east (0°), counterclockwise."
          />
          <MathCard
            title="5. Divergence"
            formula="∇·V = ∂Vx/∂x + ∂Vy/∂y"
            description="Negative → convergence (accumulation). Positive → spreading (drainage)."
          />
          <MathCard
            title="6. Flood Risk Score"
            formula="Risk = 0.35R + 0.25W + 0.20E + 0.20A"
            description="R=rainfall, W=water level, E=elevation factor, A=accumulation. Score 0–100."
          />
        </div>

        <div style={{ marginTop: 20, padding: 20, background: 'rgba(0,229,204,0.05)', borderRadius: 10, border: '1px solid rgba(0,229,204,0.15)' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#00e5cc', marginBottom: 10 }}>Risk Classification:</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[['0–30', 'LOW', '#00ff87'], ['31–60', 'MEDIUM', '#ffb300'], ['61–80', 'HIGH', '#ff7043'], ['81–100', 'VERY HIGH', '#ff4757']].map(([range, label, color]) => (
              <div key={label} style={{ padding: '6px 14px', borderRadius: 8, background: `${color}11`, border: `1px solid ${color}33` }}>
                <span style={{ fontSize: 12, color, fontWeight: 700 }}>{range}: {label}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section icon={Layers} title="System Architecture" color="#a855f7">
        <Para>The application follows a clean client-server architecture:</Para>
        <Item><strong style={{ color: '#e8f4ff' }}>Frontend:</strong> React + Vite + Tailwind CSS — SPA with 7 pages and interactive Plotly/Recharts visualizations.</Item>
        <Item><strong style={{ color: '#e8f4ff' }}>Backend:</strong> Python FastAPI REST API — handles all heavy NumPy calculations server-side.</Item>
        <Item><strong style={{ color: '#e8f4ff' }}>Database:</strong> SQLite via SQLAlchemy — stores analysis sessions for history tracking.</Item>
        <Item><strong style={{ color: '#e8f4ff' }}>Communication:</strong> JSON REST API over HTTP. Frontend proxied via Vite dev server.</Item>
      </Section>

      <Section icon={Code} title="Technology Stack" color="#ffb300">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {[
            ['React 18 + Vite', 'Frontend framework'],
            ['Tailwind CSS', 'Styling'],
            ['Plotly.js', 'Interactive visualizations'],
            ['Recharts', 'Statistical charts'],
            ['Lucide React', 'Icons'],
            ['FastAPI', 'Python REST API'],
            ['NumPy', 'Vector calculus engine'],
            ['Pandas', 'Data processing'],
            ['SQLite + SQLAlchemy', 'Database'],
            ['Axios', 'HTTP client'],
          ].map(([tech, desc]) => (
            <div key={tech} style={{ padding: '10px 14px', background: 'rgba(255,179,0,0.05)', borderRadius: 8, border: '1px solid rgba(255,179,0,0.15)' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#ffb300' }}>{tech}</p>
              <p style={{ fontSize: 12, color: '#7fb3d3' }}>{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={AlertTriangle} title="Limitations & Future Scope" color="#4a7fa5">
        <p style={{ fontSize: 13, fontWeight: 600, color: '#7fb3d3', marginBottom: 8 }}>Current Limitations:</p>
        {[
          'Uses synthetic terrain — does not incorporate real GIS/DEM data.',
          'Simplified steady-state model — does not simulate time-varying flood dynamics.',
          'Flat-grid assumption — does not account for soil permeability, vegetation, or channel geometry.',
          'Risk model weights are fixed — not calibrated against real flood event data.',
        ].map((l, i) => <Item key={i}>{l}</Item>)}
        <p style={{ fontSize: 13, fontWeight: 600, color: '#7fb3d3', margin: '16px 0 8px' }}>Future Improvements:</p>
        {[
          'Integrate real DEM (Digital Elevation Model) data from SRTM or ALOS.',
          'Add time-step simulation for dynamic flood propagation.',
          'Use machine learning to calibrate risk weights from historical data.',
          'Add Google Maps / Leaflet.js overlay for geographic visualization.',
          'Implement SCS-CN (curve number) runoff model.',
        ].map((f, i) => <Item key={i}>{f}</Item>)}
      </Section>
    </div>
  )
}
