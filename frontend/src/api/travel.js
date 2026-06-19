import axios from 'axios'

const http = axios.create({ baseURL: '/api', timeout: 60000 })
http.interceptors.response.use(res => res.data, err => Promise.reject(err))

export async function streamChat({ userId, message, onChunk, onDone, onError }) {
  try {
    const resp = await fetch('/api/agent/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, message }),
    })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)

    const reader = resp.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const data = JSON.parse(line.slice(6))
          if (data.type === 'text') onChunk?.(data.content)
          else if (data.type === 'done') onDone?.()
          else if (data.type === 'error') onError?.(data.message)
        } catch { /* ignore */ }
      }
    }
  } catch (err) {
    onError?.(err.message)
  }
}

export const chat = (userId, message) => http.post('/agent/chat', { userId, message })
export const getHistory = (userId) => http.get(`/agent/history/${userId}`)
export const clearHistory = (userId) => http.delete(`/agent/history/${userId}`)
export const getWeather = (city) => http.post('/tools/weather', { city })
export const calculateBudget = (data) => http.post('/tools/budget', data)
export const checkVisa = (destination) => http.post('/tools/visa', { destination })
export const convertCurrency = (data) => http.post('/tools/currency', data)
export const healthCheck = () => http.get('/agent/health')
