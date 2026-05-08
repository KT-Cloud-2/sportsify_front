import { NavBar } from '../components/NavBar'
import { Badge } from '../components/Badge'
import { Btn } from '../components/Btn'
import { useTickets, useCancelTicket } from '../hooks/useTickets'
import { TicketResponse } from '../types/api'
import { C } from '../styles/tokens'

const STATUS_LABEL: Record<string, string> = {
  RESERVED: '예매 완료',
  CANCELLED: '취소됨',
  USED: '사용 완료',
}

const STATUS_VARIANT: Record<string, 'teal' | 'red' | 'gray' | 'yellow'> = {
  RESERVED: 'teal',
  CANCELLED: 'red',
  USED: 'gray',
}

function TicketCard({ ticket }: { ticket: TicketResponse }) {
  const { mutate: cancel, isPending } = useCancelTicket()

  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: 20,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <Badge variant={(STATUS_VARIANT[ticket.status] as 'teal' | 'red' | 'gray') ?? 'teal'}>
          {STATUS_LABEL[ticket.status] ?? ticket.status}
        </Badge>
        <span style={{ fontSize: 12, color: C.fg4 }}>
          {new Date(ticket.createdAt).toLocaleDateString('ko-KR')}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', gap: 16, fontSize: 13, color: C.fg3 }}>
          <span>등급: <span style={{ color: C.fg1, fontWeight: 600 }}>{ticket.grade}</span></span>
          <span>구역: <span style={{ color: C.fg1 }}>{ticket.section}</span></span>
          <span>좌석: <span style={{ color: C.fg1 }}>{ticket.rowNumber}열 {ticket.seatNumber}번</span></span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.teal }}>
          {ticket.price.toLocaleString()}원
        </div>
      </div>
      {ticket.status === 'RESERVED' && (
        <div style={{ marginTop: 14 }}>
          <Btn
            variant="ghost" size="sm"
            onClick={() => cancel(ticket.ticketId)}
            disabled={isPending}
          >
            예매 취소
          </Btn>
        </div>
      )}
    </div>
  )
}

export function TicketPage() {
  const { data: tickets, isLoading, isError } = useTickets()

  return (
    <div style={{ minHeight: '100vh', background: C.dark, color: C.fg1 }}>
      <NavBar />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>내 예매 내역</h1>

        {isLoading && <p style={{ color: C.fg3 }}>불러오는 중...</p>}
        {isError && <p style={{ color: C.fg4, fontSize: 14 }}>예매 내역을 불러올 수 없습니다. (서비스 준비 중)</p>}
        {!isLoading && !isError && tickets?.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: 60, color: C.fg4, fontSize: 14 }}>
            예매 내역이 없습니다.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {tickets?.map((t) => <TicketCard key={t.ticketId} ticket={t} />)}
        </div>
      </div>
    </div>
  )
}
