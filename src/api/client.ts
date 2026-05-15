import axios from 'axios'
import { useAuthStore } from '../store/auth'

// 인증이 필요 없는 공개 엔드포인트용 (토큰 주입 없음)
export const publicClient = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
})

// 인증이 필요한 엔드포인트용 (모든 요청에 Bearer 토큰 주입)
export const client = axios.create({
  baseURL: '',
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
    const status = error.response?.status

    if (status !== 401 || original._retry) {
      return Promise.reject(error)
    }
    original._retry = true

    const { refreshToken, setTokens, clear } = useAuthStore.getState()

    if (!refreshToken) {
      clear()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`
          resolve(client(original))
        })
      })
    }

    isRefreshing = true
    try {
      const { data } = await publicClient.post('/api/auth/token/refresh', { refreshToken })
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
