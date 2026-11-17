/**
 * API service layer — all communication with the FastAPI backend.
 */
import axios from 'axios'

const BASE_URL = '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

// ── response interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      (Array.isArray(err.response?.data?.detail)
        ? err.response.data.detail.map((d) => d.msg).join('; ')
        : null) ||
      err.message ||
      'An unexpected error occurred. Please try again.'
    return Promise.reject(new Error(message))
  }
)

// ── API methods ───────────────────────────────────────────────────────────────

export const checkHealth = () => api.get('/health').then((r) => r.data)

export const generateSampleData = (rows = 30, cols = 30) =>
  api.post('/generate-sample-data', { rows, cols, run_analysis: true }).then((r) => r.data)

export const runAnalysis = (cells, weights = null) =>
  api.post('/analyze', { cells, weights }).then((r) => r.data)

export const uploadCSV = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api
    .post('/upload-csv', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data)
}

export const getResults = () => api.get('/results').then((r) => r.data)

export const getStatistics = () => api.get('/statistics').then((r) => r.data)

export const getHighRiskAreas = () => api.get('/high-risk-areas').then((r) => r.data)

export const resetData = () => api.post('/reset').then((r) => r.data)

export const getExportCSVUrl = () => `${BASE_URL}/export-csv`
