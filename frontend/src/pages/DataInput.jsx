import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { SectionTitle, SimDisclaimer, ErrorAlert, LoadingSpinner } from '../components/ui'
import { Upload, Play, RefreshCw, Trash2, CheckCircle, AlertCircle, Download } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Helper: generate a uniform-grid manual dataset
function buildManualCells({ rows, cols, rainfall, waterLevel, flowVelocity, minElev, maxElev }) {
  const cells = []
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      // Create simple bowl/basin terrain
      const cx = (cols - 1) / 2, cy = (rows - 1) / 2
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
      const maxDist = Math.sqrt(cx ** 2 + cy ** 2)
      const elevFrac = dist / (maxDist + 1e-9)
      const elev = minElev + (maxElev - minElev) * (1 - elevFrac * 0.8)
      const noise = (Math.random() - 0.5) * 5
      cells.push({
        x, y,
        elevation: parseFloat((elev + noise).toFixed(2)),
        rainfall: parseFloat((rainfall + (Math.random() - 0.5) * 10).toFixed(2)),
        water_level: parseFloat((waterLevel + (Math.random() - 0.5) * 0.3).toFixed(2)),
        flow_velocity: parseFloat((flowVelocity + (Math.random() - 0.5) * 0.2).toFixed(2)),
      })
    }
  }
  return cells
}

const SAMPLE_CSV = `x,y,elevation,rainfall,water_level,flow_velocity
0,0,120,40,1.2,0.8
0,1,118,45,1.5,1.0
0,2,115,50,2.0,1.2
1,0,122,35,1.0,0.6
1,1,119,55,2.2,1.4
1,2,112,60,2.8,1.6
2,0,125,30,0.9,0.5
2,1,116,52,2.1,1.3
2,2,108,70,3.5,2.0`

export default function DataInput() {
  const { analyze, uploadAndAnalyze, loading, error, clearError, loadDemo } = useApp()
  const navigate = useNavigate()

  const [tab, setTab]       = useState('manual')
  const [form, setForm]     = useState({
    rows: 20, cols: 20,
    rainfall: 60, waterLevel: 2.5, flowVelocity: 1.2,
    minElev: 30, maxElev: 180,
  })
  const [valErrors, setValErrors] = useState([])
  const [success, setSuccess]     = useState(false)
  const [dragOver, setDragOver]   = useState(false)
  const fileRef = useRef()

  function validateForm() {
    const errs = []
    if (form.rows < 2 || form.rows > 100) errs.push('Grid rows must be 2–100.')
    if (form.cols < 2 || form.cols > 100) errs.push('Grid columns must be 2–100.')
    if (form.rainfall < 0)   errs.push('Rainfall must be ≥ 0.')
    if (form.waterLevel < 0) errs.push('Water level must be ≥ 0.')
    if (form.flowVelocity < 0) errs.push('Flow velocity must be ≥ 0.')
    if (form.minElev >= form.maxElev) errs.push('Max elevation must be > min elevation.')
    return errs
  }

  async function handleRunManual() {
    setValErrors([])
    setSuccess(false)
    const errs = validateForm()
    if (errs.length) { setValErrors(errs); return }

    const cells = buildManualCells({
      rows: +form.rows, cols: +form.cols,
      rainfall: +form.rainfall, waterLevel: +form.waterLevel,
      flowVelocity: +form.flowVelocity, minElev: +form.minElev, maxElev: +form.maxElev,
    })
    try {
      await analyze(cells)
      setSuccess(true)
      setTimeout(() => navigate('/flow'), 1000)
    } catch (_) {}
  }

  async function handleFile(file) {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setValErrors(['Only CSV files are accepted.']); return
    }
    setValErrors([])
    setSuccess(false)
    try {
      await uploadAndAnalyze(file)
      setSuccess(true)
      setTimeout(() => navigate('/flow'), 1000)
    } catch (_) {}
  }

  function downloadSampleCSV() {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'sample_flood_data.csv'; a.click()
  }

  return (
    <div className="page-enter" style={{ padding: 24 }}>
      <SimDisclaimer />
      <SectionTitle subtitle="Provide terrain and hydrological data for vector calculus analysis">
        Data Input
      </SectionTitle>
      <ErrorAlert message={error} onDismiss={clearError} />

      {/* Validation errors */}
      {valErrors.length > 0 && (
        <div style={{ background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.3)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          {valErrors.map((e, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#ff7f8a', fontSize: 13, marginBottom: i < valErrors.length - 1 ? 6 : 0 }}>
              <AlertCircle size={14} /> {e}
            </div>
          ))}
        </div>
      )}

      {success && (
        <div style={{ background: 'rgba(0,255,135,0.08)', border: '1px solid rgba(0,255,135,0.3)', borderRadius: 10, padding: 16, marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
          <CheckCircle size={16} color="#00ff87" />
          <span style={{ color: '#00ff87', fontSize: 13 }}>Analysis complete! Redirecting…</span>
        </div>
      )}

      {/* Quick action */}
      <div className="glass" style={{ padding: 16, marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ fontSize: 13, color: '#7fb3d3', flex: 1 }}>
          🚀 <strong style={{ color: '#e8f4ff' }}>Quick Start:</strong> Load the built-in 30×30 demo dataset instantly.
        </div>
        <button className="btn-primary" onClick={async () => { await loadDemo(); navigate('/flow') }} disabled={loading} id="btn-demo-input">
          🌊 Load Demo Dataset
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(0,180,255,0.05)', padding: 4, borderRadius: 10, width: 'fit-content', border: '1px solid rgba(0,180,255,0.15)' }}>
        {['manual', 'upload'].map((t) => (
          <button key={t} onClick={() => setTab(t)} id={`tab-${t}`}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
              background: tab === t ? 'linear-gradient(135deg,#0077cc,#00b4ff)' : 'transparent',
              color: tab === t ? '#fff' : '#7fb3d3', transition: 'all 0.2s',
            }}>
            {t === 'manual' ? '⚙️ Manual Input' : '📂 Upload CSV'}
          </button>
        ))}
      </div>

      {tab === 'manual' && (
        <div className="glass" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e8f4ff', marginBottom: 20 }}>Manual Grid Parameters</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {[
              { key: 'rainfall',     label: 'Rainfall Intensity (mm/hr)', min: 0, max: 500, step: 1 },
              { key: 'waterLevel',   label: 'Water Level (m)',            min: 0, max: 50,  step: 0.1 },
              { key: 'flowVelocity', label: 'Flow Velocity (m/s)',        min: 0, max: 20,  step: 0.1 },
              { key: 'rows',         label: 'Grid Rows',                  min: 2, max: 100, step: 1 },
              { key: 'cols',         label: 'Grid Columns',               min: 2, max: 100, step: 1 },
              { key: 'minElev',      label: 'Min Elevation (m)',          min: 0, max: 500, step: 1 },
              { key: 'maxElev',      label: 'Max Elevation (m)',          min: 1, max: 1000,step: 1 },
            ].map(({ key, label, min, max, step }) => (
              <div key={key}>
                <label>{label}</label>
                <input
                  className="input-field"
                  type="number" min={min} max={max} step={step}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  id={`input-${key}`}
                />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={handleRunManual} disabled={loading} id="btn-run-manual">
              <Play size={14} style={{ marginRight: 6 }} />
              {loading ? 'Running…' : 'Run Analysis'}
            </button>
            <button className="btn-secondary" onClick={() => setForm({ rows: 20, cols: 20, rainfall: 60, waterLevel: 2.5, flowVelocity: 1.2, minElev: 30, maxElev: 180 })} id="btn-clear-form">
              <RefreshCw size={14} style={{ marginRight: 6 }} /> Reset
            </button>
          </div>
        </div>
      )}

      {tab === 'upload' && (
        <div className="glass" style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e8f4ff' }}>Upload CSV Dataset</h3>
            <button className="btn-secondary" onClick={downloadSampleCSV} id="btn-download-sample" style={{ fontSize: 12, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Download size={13} /> Download Sample CSV
            </button>
          </div>

          <div
            style={{
              border: `2px dashed ${dragOver ? '#00b4ff' : 'rgba(0,180,255,0.2)'}`,
              borderRadius: 12, padding: 48,
              textAlign: 'center', cursor: 'pointer',
              background: dragOver ? 'rgba(0,180,255,0.05)' : 'transparent',
              transition: 'all 0.2s',
            }}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
            id="csv-drop-zone"
          >
            <Upload size={36} color="#00b4ff" style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 15, color: '#e8f4ff', fontWeight: 600 }}>Drag & drop CSV file here</p>
            <p style={{ fontSize: 13, color: '#4a7fa5', marginTop: 6 }}>or click to browse (max 5 MB)</p>
            <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
          </div>

          <div className="glass" style={{ padding: 20, marginTop: 20, background: 'rgba(0,180,255,0.04)' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#00b4ff', marginBottom: 8 }}>Required CSV columns:</p>
            <code style={{ fontSize: 12, color: '#00e5cc' }}>x, y, elevation, rainfall, water_level, flow_velocity</code>
            <p style={{ fontSize: 12, color: '#4a7fa5', marginTop: 8 }}>All values must be numeric. Rainfall, water_level and flow_velocity must be ≥ 0.</p>
          </div>
        </div>
      )}

      {loading && <div style={{ marginTop: 20 }}><LoadingSpinner /></div>}
    </div>
  )
}
