import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { C } from '../styles/tokens'
import { Btn } from '../components/Btn'

export function LoginPage() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const navigate = useNavigate()

  useEffect(() => {
    if (accessToken) navigate('/', { replace: true })
  }, [accessToken, navigate])

  return (
    <div style={{ width: '100vw', height: '100vh', background: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 48, width: 360, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg,${C.teal},${C.deep})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 18 }}>S</div>
          <span style={{ fontWeight: 800, fontSize: 22, color: C.teal }}>Sportify</span>
        </div>

        <p style={{ textAlign: 'center', color: C.fg3, fontSize: 14, margin: 0 }}>소셜 계정으로 로그인하세요</p>

        <a href="/oauth2/authorization/google" style={{ textDecoration: 'none' }}>
          <Btn variant="ghost" style={{ width: '100%' }}>Google로 로그인</Btn>
        </a>
        <a href="/oauth2/authorization/kakao" style={{ textDecoration: 'none' }}>
          <Btn variant="ghost" style={{ width: '100%', background: '#FEE500', color: '#191919', border: 'none' }}>
            카카오로 로그인
          </Btn>
        </a>
      </div>
    </div>
  )
}
