import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { C } from '../styles/tokens'

export function OAuthCallbackPage() {
  const { setTokens } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const at = params.get('accessToken')
    const rt = params.get('refreshToken')
    if (at && rt) {
      setTokens(at, rt)
      navigate('/', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }, [setTokens, navigate])

  return (
    <div style={{ minHeight: '100vh', background: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.fg3 }}>
      로그인 처리 중...
    </div>
  )
}
