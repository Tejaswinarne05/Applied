import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Database, Waves, Map, BarChart3,
  FileText, Info, ChevronRight, Droplets,
} from 'lucide-react'

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/input',     icon: Database,        label: 'Data Input' },
  { to: '/flow',      icon: Waves,           label: 'Water Flow Analysis' },
  { to: '/risk',      icon: Map,             label: 'Flood Risk Map' },
  { to: '/analytics', icon: BarChart3,       label: 'Analytics' },
  { to: '/results',   icon: FileText,        label: 'Results' },
  { to: '/about',     icon: Info,            label: 'About Project' },
]

export default function Sidebar({ open, setOpen }) {
  return (
    <>
      {/* overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        style={{
          width: open ? 240 : 72,
          minHeight: '100vh',
          background: 'rgba(3, 12, 28, 0.97)',
          borderRight: '1px solid rgba(0,180,255,0.12)',
          transition: 'width 0.3s ease',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* logo */}
        <div
          style={{
            padding: '20px 16px',
            borderBottom: '1px solid rgba(0,180,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer',
          }}
          onClick={() => setOpen(!open)}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg,#0077cc,#00b4ff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 0 16px rgba(0,180,255,0.4)',
            }}
          >
            <Droplets size={20} color="#fff" />
          </div>
          {open && (
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e8f4ff', lineHeight: 1.2 }}>
                FloodAnalysis
              </div>
              <div style={{ fontSize: 11, color: '#4a7fa5', marginTop: 2 }}>
                Vector Calculus Engine
              </div>
            </div>
          )}
        </div>

        {/* nav items */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 12px',
                borderRadius: 8,
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(0,119,204,0.3), rgba(0,180,255,0.15))'
                  : 'transparent',
                borderLeft: isActive ? '2px solid #00b4ff' : '2px solid transparent',
                color: isActive ? '#00b4ff' : '#7fb3d3',
                fontWeight: isActive ? 600 : 400,
                fontSize: 13,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              })}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {open && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* collapse toggle */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid rgba(0,180,255,0.1)',
            display: 'flex',
            justifyContent: open ? 'flex-end' : 'center',
            cursor: 'pointer',
          }}
          onClick={() => setOpen(!open)}
        >
          <ChevronRight
            size={16}
            color="#4a7fa5"
            style={{
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease',
            }}
          />
        </div>
      </aside>
    </>
  )
}
