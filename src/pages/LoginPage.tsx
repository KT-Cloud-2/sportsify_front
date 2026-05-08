import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { C } from '../styles/tokens'
import { Btn } from '../components/Btn'

export function LoginPage() {
  const [params] = useSearchParams()
  const { setTokens, accessToken } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const at = params.get('accessToken')
    const rt = params.get('refreshToken')
    if (at && rt) {
      setTokens(at, rt)
      navigate('/', { replace: true })
    }
  }, [params, setTokens, navigate])

  useEffect(() => {
    if (accessToken && !params.get('accessToken')) {
      navigate('/', { replace: true })
    }
  }, [accessToken, navigate, params])

  const baseUrl = import.meta.env.VITE_API_BASE_URL

  return (
    <div style={{ width: '100vw', height: '100vh', background: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 48, width: 360, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg,${C.teal},${C.deep})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 18 }}>S</div>
          <span style={{ fontWeight: 800, fontSize: 22, color: C.teal }}>Sportify</span>
        </div>

        <p style={{ textAlign: 'center', color: C.fg3, fontSize: 14, margin: 0 }}>소셜 계정으로 로그인하세요</p>

        <a href={`${baseUrl}/oauth2/authorization/google`} style={{ textDecoration: 'none' }}>
          <Btn variant="ghost" style={{ width: '100%' }}>Google로 로그인</Btn>
        </a>
        <a href={`${baseUrl}/oauth2/authorization/kakao`} style={{ textDecoration: 'none' }}>
          <Btn variant="ghost" style={{ width: '100%', background: '#FEE500', color: '#191919', border: 'none' }}>
            카카오로 로그인
          </Btn>
        </a>
      </div>
    </div>
  )
}
