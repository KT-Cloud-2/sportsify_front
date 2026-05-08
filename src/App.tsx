import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Component, ReactNode } from 'react'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { GameDetailPage } from './pages/GameDetailPage'
import { ChatPage } from './pages/ChatPage'
import { MyPage } from './pages/MyPage'
import { TicketPage } from './pages/TicketPage'
import { PaymentPage } from './pages/PaymentPage'
import { useAuthStore } from './store/auth'
import { C } from './styles/tokens'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { throwOnError: false, retry: 1 },
  },
})

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
        <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/oauth2/callback" element={<LoginPage />} />
            <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
            <Route path="/games/:gameId" element={<PrivateRoute><GameDetailPage /></PrivateRoute>} />
            <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
            <Route path="/mypage" element={<PrivateRoute><MyPage /></PrivateRoute>} />
            <Route path="/tickets" element={<PrivateRoute><TicketPage /></PrivateRoute>} />
            <Route path="/payments" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
