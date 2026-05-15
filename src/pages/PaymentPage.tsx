import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { loadTossPayments } from '@tosspayments/payment-sdk'
import { NavBar } from '../components/NavBar'
import { Btn } from '../components/Btn'
import { useCreatePayment } from '../hooks/usePayments'
import { ReservationSeatsResponseDto } from '../types/api'
import { useAuthStore } from '../store/auth'
import { C } from '../styles/tokens'

const TOSS_CLIENT_KEY = 'test_ck_0RnYX2w5322llqkbJgRK3NeyqApQ'

function SeatSummaryCard({ reservation }: { reservation: ReservationSeatsResponseDto }) {
  const total = reservation.seats.reduce((s, seat) => s + seat.price, 0)
  const expiresAt = new Date(reservation.expiresAt)

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.fg3, marginBottom: 14 }}>선택한 좌석</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {reservation.seats.map((seat) => (
          <div key={seat.seatId} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: C.elevated, borderRadius: 10, padding: '10px 14px',
          }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.fg1 }}>{seat.seatGrade}</span>
              <span style={{ fontSize: 12, color: C.fg3, marginLeft: 8 }}>{seat.seatSection}</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.teal }}>{seat.price.toLocaleString()}원</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
        <span style={{ fontSize: 13, color: C.fg3 }}>합계</span>
        <span style={{ fontSize: 20, fontWeight: 800, color: C.teal }}>{total.toLocaleString()}원</span>
      </div>
      <div style={{ fontSize: 11, color: C.warning, marginTop: 10 }}>
        좌석 임시 예약 만료: {expiresAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  )
}

export function PaymentPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const reservation = location.state as ReservationSeatsResponseDto | undefined
  const accessToken = useAuthStore((s) => s.accessToken)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { mutate: createPayment } = useCreatePayment()

  useEffect(() => {
    if (!reservation) navigate('/', { replace: true })
  }, [reservation, navigate])

  if (!reservation) return null

  const total = reservation.seats.reduce((s, seat) => s + seat.price, 0)
  const seatInfo = reservation.seats.map((s) => `${s.seatGrade} ${s.seatSection}`).join(', ')

  const handlePay = () => {
    if (!accessToken) { setError('로그인이 필요합니다.'); return }
    setIsLoading(true)
    setError(null)

    const idempotencyKey = `idem-${reservation.orderId}-${Date.now()}`

    createPayment(
      {
        matchId: reservation.gameId,
        seatId: reservation.seats[0].seatId,
        amount: total,
        paymentMethod: 'CARD',
        idempotencyKey,
      },
      {
        onSuccess: async (paymentOrder) => {
          try {
            const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY)
            await tossPayments.requestPayment('카드', {
              amount: total,
              orderId: paymentOrder.orderId,
              orderName: `스포츠 경기 예매 — ${seatInfo}`,
              customerName: '스포티파이 회원',
              successUrl: `${window.location.origin}/checkout/success`,
              failUrl: `${window.location.origin}/checkout/fail`,
            })
          } catch (err: unknown) {
            // 사용자가 결제창 닫으면 여기 옴
            const msg = err instanceof Error ? err.message : '결제가 취소되었습니다.'
            setError(msg)
            setIsLoading(false)
          }
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : '결제 주문 생성에 실패했습니다.'
          setError(msg)
          setIsLoading(false)
        },
      }
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.dark, color: C.fg1 }}>
      <NavBar />
      <div style={{ maxWidth: 540, margin: '0 auto', padding: '32px 24px' }}>
        <button
          onClick={() => navigate(-1 as never)}
          style={{ background: 'none', border: 'none', color: C.fg3, cursor: 'pointer', fontSize: 14, marginBottom: 24 }}
        >
          ← 뒤로
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 28 }}>결제</h1>

        <SeatSummaryCard reservation={reservation} />

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.fg3, marginBottom: 12 }}>결제 수단</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="https://static.tosspayments.com/icons/svg/toss.svg" alt="toss" style={{ width: 24, height: 24, borderRadius: 6 }} />
            <span style={{ fontSize: 14, color: C.fg1, fontWeight: 600 }}>토스페이먼츠</span>
            <span style={{ fontSize: 11, color: C.fg4, background: C.elevated, borderRadius: 4, padding: '2px 6px' }}>테스트 모드</span>
          </div>
        </div>

        {error && (
          <div style={{
            background: `${C.error}18`, border: `1px solid ${C.error}`, borderRadius: 12,
            padding: '12px 16px', marginBottom: 20, fontSize: 13, color: C.error,
          }}>
            {error}
          </div>
        )}

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: C.fg4, lineHeight: 1.7 }}>
            결제 버튼을 누르면 토스페이먼츠 결제창이 열립니다.
            예매 완료 후 취소는 마이페이지에서 가능합니다.
          </div>
        </div>

        <Btn size="lg" style={{ width: '100%' }} onClick={handlePay} disabled={isLoading}>
          {isLoading ? '결제창 여는 중...' : `${total.toLocaleString()}원 결제하기`}
        </Btn>
      </div>
    </div>
  )
}
