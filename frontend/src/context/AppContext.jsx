/**
 * Global application state via React Context.
 * Holds the latest analysis result shared across all pages.
 */
import { createContext, useContext, useState, useCallback } from 'react'
import { generateSampleData, runAnalysis, uploadCSV } from '../services/api'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [result, setResult]       = useState(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [inputCells, setInputCells] = useState(null)

  const clearError = () => setError(null)

  const loadDemo = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await generateSampleData(30, 30)
      setResult(data)
      setInputCells(data.cells)
      return data
    } catch (e) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const analyze = useCallback(async (cells, weights = null) => {
    setLoading(true)
    setError(null)
    try {
      const data = await runAnalysis(cells, weights)
      setResult(data)
      return data
    } catch (e) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const uploadAndAnalyze = useCallback(async (file) => {
    setLoading(true)
    setError(null)
    try {
      const data = await uploadCSV(file)
      setResult(data)
      setInputCells(data.cells)
      return data
    } catch (e) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <AppContext.Provider
      value={{
        result,
        loading,
        error,
        inputCells,
        setInputCells,
        clearError,
        loadDemo,
        analyze,
        uploadAndAnalyze,
        setResult,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
