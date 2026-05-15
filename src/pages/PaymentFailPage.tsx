import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { NavBar } from '../components/NavBar'
import { Btn } from '../components/Btn'
import { C } from '../styles/tokens'

export function PaymentFailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(5)

  const code = searchParams.get('code') ?? ''
  const message = searchParams.get('message') ?? '결제가 취소되었거나 실패했습니다.'
  const orderId = searchParams.get('orderId') ?? ''

  useEffect(() => {
    if (countdown <= 0) { navigate('/'); return }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, navigate])

  return (
    <div style={{ minHeight: '100vh', background: C.dark, color: C.fg1 }}>
      <NavBar />
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: `${C.error}20`, border: `2px solid ${C.error}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontSize: 32, color: C.error,
        }}>
          ✗
        </div>

        <div style={{ fontSize: 24, fontWeight: 800, color: C.fg1, marginBottom: 8 }}>결제 실패</div>
        <div style={{ fontSize: 14, color: C.fg3, marginBottom: 4 }}>{message}</div>
        {code && (
          <div style={{ fontSize: 12, color: C.fg4, marginBottom: 4 }}>코드: {code}</div>
        )}
        {orderId && (
          <div style={{ fontSize: 12, color: C.fg4, marginBottom: 24 }}>주문번호: {orderId}</div>
        )}

        <div style={{ fontSize: 13, color: C.fg4, marginBottom: 32 }}>
          {countdown}초 후 홈으로 이동합니다
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Btn onClick={() => navigate(-1 as never)}>다시 시도</Btn>
          <Btn variant="ghost" onClick={() => navigate('/')}>홈으로</Btn>
        </div>
      </div>
    </div>
  )
}
