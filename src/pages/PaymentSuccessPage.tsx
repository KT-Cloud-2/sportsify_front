import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { NavBar } from '../components/NavBar'
import { Btn } from '../components/Btn'
import { confirmPaymentMock } from '../api/payments'
import { PaymentResponse } from '../types/api'
import { savePaymentHistory } from '../utils/paymentHistory'
import { C } from '../styles/tokens'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0', borderBottom: `1px solid ${C.elevated}`,
    }}>
      <span style={{ fontSize: 13, color: C.fg3 }}>{label}</span>
      <span style={{ fontSize: 13, color: C.fg1, fontWeight: 600 }}>{value}</span>
    </div>
  )
}

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const paymentKey = searchParams.get('paymentKey') ?? ''
  const orderId = searchParams.get('orderId') ?? ''
  const amount = Number(searchParams.get('amount') ?? 0)

  const [status, setStatus] = useState<'confirming' | 'success' | 'failed'>('confirming')
  const [result, setResult] = useState<PaymentResponse | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      navigate('/', { replace: true })
      return
    }

    confirmPaymentMock({ paymentKey, orderId, amount })
      .then((res) => {
        savePaymentHistory(res)
        setResult(res)
        setStatus('success')
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : '결제 승인 중 오류가 발생했습니다.'
        setErrorMsg(msg)
        setStatus('failed')
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ minHeight: '100vh', background: C.dark, color: C.fg1 }}>
      <NavBar />
      <div style={{ maxWidth: 540, margin: '0 auto', padding: '48px 24px' }}>

        {status === 'confirming' && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              border: `4px solid ${C.elevated}`, borderTopColor: C.teal,
              margin: '0 auto 24px',
              animation: 'spin 1s linear infinite',
            }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: C.fg1 }}>결제 승인 중...</div>
            <div style={{ fontSize: 13, color: C.fg3, marginTop: 8 }}>잠시만 기다려주세요</div>
          </div>
        )}

        {status === 'success' && result && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: `${C.success}20`, border: `2px solid ${C.success}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', fontSize: 32, color: C.success,
              }}>
                ✓
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.fg1, marginBottom: 6 }}>예매 완료!</div>
              <div style={{ fontSize: 14, color: C.fg3 }}>결제가 성공적으로 완료되었습니다</div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.fg3, marginBottom: 12 }}>주문 상세</div>
              <Row label="주문번호" value={result.orderId} />
              <Row label="결제 금액" value={`${result.amount.toLocaleString()}원`} />
              <Row label="결제 수단" value={result.paymentMethod ?? '카드'} />
              <Row label="결제 상태" value="완료" />
              <Row
                label="승인 시각"
                value={result.approvedAt
                  ? new Date(result.approvedAt).toLocaleString('ko-KR')
                  : new Date().toLocaleString('ko-KR')}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Btn size="lg" onClick={() => navigate('/chat')}>
                경기 채팅방 입장
              </Btn>
              <Btn size="lg" variant="secondary" onClick={() => navigate('/')}>
                홈으로
              </Btn>
            </div>
          </>
        )}

        {status === 'failed' && (
          <FailedContent message={errorMsg} navigate={navigate} />
        )}
      </div>
    </div>
  )
}

function FailedContent({ message, navigate }: { message: string; navigate: ReturnType<typeof useNavigate> }) {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (countdown <= 0) { navigate('/'); return }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, navigate])

  return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: `${C.error}20`, border: `2px solid ${C.error}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px', fontSize: 32, color: C.error,
      }}>
        ✗
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.fg1, marginBottom: 6 }}>결제 승인 실패</div>
      <div style={{ fontSize: 14, color: C.fg3, marginBottom: 8 }}>{message}</div>
      <div style={{ fontSize: 13, color: C.fg4, marginBottom: 32 }}>
        {countdown}초 후 홈으로 이동합니다
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <Btn onClick={() => navigate(-1 as never)}>다시 시도</Btn>
        <Btn variant="ghost" onClick={() => navigate('/')}>홈으로</Btn>
      </div>
    </div>
  )
}
