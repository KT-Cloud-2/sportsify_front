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

async function doRefresh(): Promise<string> {
    const { refreshToken, setTokens, clear } = useAuthStore.getState()
    if (!refreshToken) {
        clear()
        window.location.href = '/login'
        throw new Error('no refresh token')
    }
    try {
        const { data } = await publicClient.post('/api/auth/token/refresh', { refreshToken })
        setTokens(data.accessToken, data.refreshToken)
        return data.accessToken as string
    } catch {
        clear()
        window.location.href = '/login'
        throw new Error('refresh failed')
    }
}

client.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config
        const status = error.response?.status

        if (status !== 401 || original._retry) {
            if (error.response?.data?.message) {
                return Promise.reject(new Error(error.response.data.message))
            }
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
        try {
            const newToken = await doRefresh()
            refreshQueue.forEach((cb) => cb(newToken))
            refreshQueue = []
            original.headers.Authorization = `Bearer ${newToken}`
            return client(original)
        } finally {
            isRefreshing = false
        }
    }
)

// accessToken 5분마다 선제 갱신 — 만료 전에 교체해 401 없이 연속 사용
// refresh 실패 시 doRefresh() 내부에서 clear() + /login 이동
const ACCESS_TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000

export function startTokenRefreshTimer(): () => void {
    const id = setInterval(async () => {
        const { accessToken } = useAuthStore.getState()
        if (!accessToken) return
        if (isRefreshing) return
        isRefreshing = true
        try {
            const newToken = await doRefresh()
            refreshQueue.forEach((cb) => cb(newToken))
            refreshQueue = []
        } finally {
            isRefreshing = false
        }
    }, ACCESS_TOKEN_REFRESH_INTERVAL)

    return () => clearInterval(id)
}