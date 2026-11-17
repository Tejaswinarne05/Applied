import { Menu, Bell, Activity } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Header({ sidebarOpen, setSidebarOpen }) {
  const { loading } = useApp()

  return (
    <header
      style={{
        height: 60,
        background: 'rgba(3, 12, 28, 0.95)',
        borderBottom: '1px solid rgba(0,180,255,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: '#7fb3d3',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
          }}
        >
          <Menu size={20} />
        </button>
        <div>
          <h1
            style={{
              fontSize: 15,
              fontWeight: 700,
              background: 'linear-gradient(135deg,#00b4ff,#00e5cc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Water Flow & Flood Risk Analysis
          </h1>
          <p style={{ fontSize: 11, color: '#4a7fa5', marginTop: 1 }}>
            Vector Calculus Based Flood Simulation
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#00b4ff',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
            <span style={{ fontSize: 12, color: '#00b4ff' }}>Computing…</span>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 6,
            background: 'rgba(0,180,255,0.08)',
            border: '1px solid rgba(0,180,255,0.2)',
          }}
        >
          <Activity size={12} color="#00e5cc" />
          <span style={{ fontSize: 11, color: '#00e5cc', fontWeight: 600 }}>
            Simulation Mode
          </span>
        </div>
      </div>
    </header>
  )
}
