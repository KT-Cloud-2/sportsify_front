import { NavBar } from '../components/NavBar'
import { Badge } from '../components/Badge'
import { Btn } from '../components/Btn'
import { usePayments, useRefundPayment } from '../hooks/usePayments'
import { PaymentResponse } from '../types/api'
import { C } from '../styles/tokens'

const STATUS_LABEL: Record<string, string> = {
  PENDING: '결제 대기',
  COMPLETED: '결제 완료',
  FAILED: '결제 실패',
  REFUNDED: '환불 완료',
}

const STATUS_VARIANT: Record<string, 'teal' | 'red' | 'gray' | 'yellow'> = {
  PENDING: 'yellow',
  COMPLETED: 'teal',
  FAILED: 'red',
  REFUNDED: 'gray',
}

function PaymentCard({ payment }: { payment: PaymentResponse }) {
  const { mutate: refund, isPending } = useRefundPayment()

  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: 20,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <Badge variant={(STATUS_VARIANT[payment.status] as 'teal' | 'red' | 'gray' | 'yellow') ?? 'teal'}>
          {STATUS_LABEL[payment.status] ?? payment.status}
        </Badge>
        <span style={{ fontSize: 12, color: C.fg4 }}>
          {new Date(payment.createdAt).toLocaleDateString('ko-KR')}
        </span>
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: C.teal, marginBottom: 6 }}>
        {payment.amount.toLocaleString()}원
      </div>
      <div style={{ fontSize: 12, color: C.fg4 }}>
        주문번호: {payment.pgOrderId}
      </div>
      {payment.status === 'COMPLETED' && (
        <div style={{ marginTop: 14 }}>
          <Btn
            variant="ghost" size="sm"
            onClick={() => refund(payment.paymentId)}
            disabled={isPending}
          >
            환불 요청
          </Btn>
        </div>
      )}
    </div>
  )
}

export function PaymentPage() {
  const { data: payments, isLoading, isError } = usePayments()

  return (
    <div style={{ minHeight: '100vh', background: C.dark, color: C.fg1 }}>
      <NavBar />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>결제 내역</h1>

        {isLoading && <p style={{ color: C.fg3 }}>불러오는 중...</p>}
        {isError && <p style={{ color: C.fg4, fontSize: 14 }}>결제 내역을 불러올 수 없습니다. (서비스 준비 중)</p>}
        {!isLoading && !isError && payments?.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: 60, color: C.fg4, fontSize: 14 }}>
            결제 내역이 없습니다.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {payments?.map((p) => <PaymentCard key={p.paymentId} payment={p} />)}
        </div>
      </div>
    </div>
  )
}
