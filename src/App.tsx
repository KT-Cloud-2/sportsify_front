import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Component, ReactNode, useEffect, useState } from 'react'
import axios from 'axios'
import { LoginPage } from './pages/LoginPage'
import { OAuthCallbackPage } from './pages/OAuthCallbackPage'
import { HomePage } from './pages/HomePage'
import { GameDetailPage } from './pages/GameDetailPage'
import { ChatPage } from './pages/ChatPage'
import { MyPage } from './pages/MyPage'
import { TicketPage } from './pages/TicketPage'
import { PaymentPage } from './pages/PaymentPage'
import { PaymentSuccessPage } from './pages/PaymentSuccessPage'
import { PaymentFailPage } from './pages/PaymentFailPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { useAuthStore } from './store/auth'
import { C } from './styles/tokens'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { throwOnError: false, retry: 1 },
  },
})

// 앱 시작 시 refreshToken → accessToken 재발급 후 렌더
// accessToken 만료는 axios interceptor가 자동 갱신 (5분 주기 무관)
function TokenRestorer({ children }: { children: ReactNode }) {
  const { refreshToken, setTokens, clear } = useAuthStore()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!refreshToken) {
      setReady(true)
      return
    }
    axios.post('/api/auth/token/refresh', { refreshToken })
      .then(({ data }) => setTokens(data.accessToken, data.refreshToken))
      .catch(() => {
        // refreshToken도 만료 → 둘 다 삭제
        clear()
      })
      .finally(() => setReady(true))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) return (
    <div style={{ minHeight: '100vh', background: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: C.fg4, fontSize: 14 }}>로딩 중...</div>
    </div>
  )
  return <>{children}</>
}

function PrivateRoute({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken)
  return accessToken ? <>{children}</> : <Navigate to="/login" replace />
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', background: C.dark, color: C.fg1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 16, color: C.fg2 }}>페이지를 불러올 수 없습니다.</div>
          <button onClick={() => { this.setState({ hasError: false }); window.location.href = '/' }} style={{ background: C.teal, color: C.deep, border: 'none', borderRadius: 9999, padding: '8px 20px', fontWeight: 700, cursor: 'pointer' }}>
            홈으로 돌아가기
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TokenRestorer>
        <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/oauth2/callback" element={<OAuthCallbackPage />} />
            <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
            <Route path="/games/:gameId" element={<PrivateRoute><GameDetailPage /></PrivateRoute>} />
            <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
            <Route path="/mypage" element={<PrivateRoute><MyPage /></PrivateRoute>} />
            <Route path="/tickets" element={<PrivateRoute><TicketPage /></PrivateRoute>} />
            <Route path="/payments" element={<Navigate to="/tickets" replace />} />
            <Route path="/payment" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />
            <Route path="/checkout/success" element={<PrivateRoute><PaymentSuccessPage /></PrivateRoute>} />
            <Route path="/checkout/fail" element={<PrivateRoute><PaymentFailPage /></PrivateRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ErrorBoundary>
        </TokenRestorer>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
