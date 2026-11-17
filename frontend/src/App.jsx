import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Sidebar from './components/Sidebar'
import Header  from './components/Header'

import Dashboard       from './pages/Dashboard'
import DataInput       from './pages/DataInput'
import WaterFlowAnalysis from './pages/WaterFlowAnalysis'
import FloodRiskMap    from './pages/FloodRiskMap'
import Analytics       from './pages/Analytics'
import Results         from './pages/Results'
import About           from './pages/About'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const sidebarWidth = sidebarOpen ? 240 : 72

  return (
    <AppProvider>
      <BrowserRouter>
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }} className="bg-grid">
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

          {/* Main content */}
          <div style={{ flex: 1, marginLeft: sidebarWidth, transition: 'margin-left 0.3s ease', minWidth: 0 }}>
            <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <main style={{ minHeight: 'calc(100vh - 60px)', padding: 0 }}>
              <Routes>
                <Route path="/"          element={<Dashboard />} />
                <Route path="/input"     element={<DataInput />} />
                <Route path="/flow"      element={<WaterFlowAnalysis />} />
                <Route path="/risk"      element={<FloodRiskMap />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/results"   element={<Results />} />
                <Route path="/about"     element={<About />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </AppProvider>
  )
}
