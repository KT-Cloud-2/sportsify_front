import axios from 'axios'
import { useAuthStore } from '../store/auth'

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }
    original._retry = true

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`
          resolve(client(original))
        })
      })
    }

    isRefreshing = true
    const { refreshToken, setTokens, clear } = useAuthStore.getState()

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/token/refresh`,
        { refreshToken }
      )
      setTokens(data.accessToken, data.refreshToken)
      refreshQueue.forEach((cb) => cb(data.accessToken))
      refreshQueue = []
      original.headers.Authorization = `Bearer ${data.accessToken}`
      return client(original)
    } catch {
      clear()
      window.location.href = '/login'
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  }
)
