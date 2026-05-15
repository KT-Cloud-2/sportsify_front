import { useNavigate } from 'react-router-dom'
import { C } from '../styles/tokens'
import { Btn } from '../components/Btn'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', background: C.dark, color: C.fg1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 64, fontWeight: 900, color: C.teal }}>404</div>
      <div style={{ fontSize: 16, color: C.fg3 }}>페이지를 찾을 수 없습니다.</div>
      <Btn onClick={() => navigate('/')}>홈으로</Btn>
    </div>
  )
}
