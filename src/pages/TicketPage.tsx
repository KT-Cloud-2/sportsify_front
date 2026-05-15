import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavBar } from '../components/NavBar'
import { Btn } from '../components/Btn'
import { Badge } from '../components/Badge'
import { loadPaymentHistory, PaymentHistoryItem } from '../utils/paymentHistory'
import { C } from '../styles/tokens'

const STATUS_LABEL: Record<string, string> = {
  COMPLETED: '결제완료',
  PENDING: '결제대기',
  CANCELED: '취소됨',
  REFUNDED: '환불됨',
  FAILED: '실패',
}

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: C.success,
  PENDING: C.warning,
  CANCELED: C.fg4,
  REFUNDED: C.info,
  FAILED: C.error,
}

function PaymentCard({ item, onCancel }: { item: PaymentHistoryItem; onCancel?: (item: PaymentHistoryItem) => void }) {
  const color = STATUS_COLOR[item.status] ?? C.fg3
  const label = STATUS_LABEL[item.status] ?? item.status

  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
      padding: 20, display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 13, color: C.fg3, marginBottom: 4 }}>
            {new Date(item.requestedAt).toLocaleString('ko-KR')}
          </div>
          <div style={{ fontSize: 12, color: C.fg4, fontFamily: 'monospace' }}>{item.orderId}</div>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 9999,
          background: `${color}20`, color, border: `1px solid ${color}40`,
        }}>
          {label}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Badge variant="teal">{item.paymentMethod ?? 'CARD'}</Badge>
        </div>
        <span style={{ fontSize: 20, fontWeight: 800, color: C.teal }}>
          {item.amount.toLocaleString()}원
        </span>
      </div>

      {item.approvedAt && (
        <div style={{ fontSize: 12, color: C.fg4 }}>
          승인: {new Date(item.approvedAt).toLocaleString('ko-KR')}
        </div>
      )}

      {item.status === 'COMPLETED' && onCancel && (
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
          <Btn variant="ghost" size="sm" onClick={() => onCancel(item)}>
            예매 취소
          </Btn>
        </div>
      )}
    </div>
  )
}

export function TicketPage() {
  const navigate = useNavigate()
  const [history, setHistory] = useState<PaymentHistoryItem[]>(() => loadPaymentHistory())

  const handleCancel = (item: PaymentHistoryItem) => {
    if (!confirm(`주문 ${item.orderId}을 취소하시겠습니까?`)) return
    // 로컬 상태만 CANCELED로 업데이트 (백엔드 cancel API는 paymentId 필요)
    const updated = history.map((h) =>
      h.orderId === item.orderId ? { ...h, status: 'CANCELED' } : h
    )
    setHistory(updated)
    localStorage.setItem('paymentHistory', JSON.stringify(updated))
  }

  return (
    <div style={{ minHeight: '100vh', background: C.dark, color: C.fg1 }}>
      <NavBar />
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>예매 내역</h1>
          <Btn variant="secondary" size="sm" onClick={() => navigate('/')}>
            경기 보러가기
          </Btn>
        </div>

        {history.length === 0 ? (
          <div style={{
            textAlign: 'center', paddingTop: 80, display: 'flex',
            flexDirection: 'column', alignItems: 'center', gap: 16,
          }}>
            <div style={{ fontSize: 48, color: C.fg4 }}>🎫</div>
            <div style={{ fontSize: 15, color: C.fg3, fontWeight: 600 }}>예매 내역이 없습니다</div>
            <div style={{ fontSize: 13, color: C.fg4 }}>경기를 선택하고 좌석을 예매해보세요</div>
            <Btn onClick={() => navigate('/')}>경기 목록 보기</Btn>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {history.map((item) => (
              <PaymentCard key={item.orderId} item={item} onCancel={handleCancel} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
