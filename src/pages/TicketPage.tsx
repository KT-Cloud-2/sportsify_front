import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavBar } from '../components/NavBar'
import { Btn } from '../components/Btn'
import { Badge } from '../components/Badge'
import { useMyTickets } from '../hooks/useTickets'
import { TicketItemDto } from '../types/api'
import { C } from '../styles/tokens'

const STATUS_LABEL: Record<string, string> = {
  ISSUED: '발권완료',
  USED: '사용완료',
  CANCELED: '취소됨',
  EXPIRED: '만료',
}

const STATUS_COLOR: Record<string, string> = {
  ISSUED: C.success,
  USED: C.fg4,
  CANCELED: C.error,
  EXPIRED: C.warning,
}

function TicketCard({ ticket }: { ticket: TicketItemDto }) {
  const color = STATUS_COLOR[ticket.status] ?? C.fg3
  const label = STATUS_LABEL[ticket.status] ?? ticket.status

  return (
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
        padding: 20, display: 'flex', flexDirection: 'column', gap: 12,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* 티켓 느낌의 좌측 컬러바 */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
          background: color,
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingLeft: 8 }}>
          <div style={{ flex: 1 }}>
            {/* 경기 정보 */}
            {(ticket.homeTeamName || ticket.awayTeamName) && (
                <div style={{ fontSize: 15, fontWeight: 700, color: C.fg1, marginBottom: 6 }}>
                  {ticket.homeTeamName} <span style={{ color: C.fg4 }}>vs</span> {ticket.awayTeamName}
                </div>
            )}
            {ticket.gameTime && (
                <div style={{ fontSize: 12, color: C.fg3, marginBottom: 4 }}>
                  📅 {new Date(ticket.gameTime).toLocaleString('ko-KR')}
                </div>
            )}
            {ticket.venue && (
                <div style={{ fontSize: 12, color: C.fg3, marginBottom: 8 }}>
                  🏟 {ticket.venue}
                </div>
            )}
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 9999,
            background: `${color}20`, color, border: `1px solid ${color}40`,
            flexShrink: 0,
          }}>
          {label}
        </span>
        </div>

        {/* 좌석 정보 */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingLeft: 8, paddingTop: 8, borderTop: `1px dashed ${C.border}`,
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Badge variant="teal">{ticket.seatGrade}</Badge>
            <span style={{ fontSize: 13, color: C.fg2 }}>
            {ticket.seatSection} · {ticket.seatRowNumber}열 {ticket.seatNumber}번
          </span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: C.teal }}>
          {ticket.price.toLocaleString()}원
        </span>
        </div>

        {/* 발권 시간 */}
        <div style={{ paddingLeft: 8, fontSize: 11, color: C.fg4 }}>
          발권: {new Date(ticket.issuedAt).toLocaleString('ko-KR')}
        </div>
      </div>
  )
}

export function TicketPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const size = 10

  const { data, isLoading, isError } = useMyTickets(page, size)

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

          {isLoading ? (
              <div style={{ textAlign: 'center', paddingTop: 80, color: C.fg3 }}>
                불러오는 중...
              </div>
          ) : isError ? (
              <div style={{ textAlign: 'center', paddingTop: 80, color: C.error }}>
                티켓 목록을 불러오는데 실패했습니다.
              </div>
          ) : !data || data.items.length === 0 ? (
              <div style={{
                textAlign: 'center', paddingTop: 80, display: 'flex',
                flexDirection: 'column', alignItems: 'center', gap: 16,
              }}>
                <div style={{ fontSize: 48, color: C.fg4 }}>🎫</div>
                <div style={{ fontSize: 15, color: C.fg3, fontWeight: 600 }}>티켓이 없습니다</div>
                <div style={{ fontSize: 13, color: C.fg4 }}>경기를 선택하고 좌석을 예매해보세요</div>
                <Btn onClick={() => navigate('/')}>경기 목록 보기</Btn>
              </div>
          ) : (
              <>
                {/* 티켓 수 요약 */}
                <div style={{
                  fontSize: 13, color: C.fg3, marginBottom: 16,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span>총 {data.totalCount}장의 티켓</span>
                  <span>{data.currentPage + 1} / {data.totalPages} 페이지</span>
                </div>

                {/* 티켓 리스트 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {data.items.map((ticket) => (
                      <TicketCard key={ticket.ticketId} ticket={ticket} />
                  ))}
                </div>

                {/* 페이지네이션 */}
                {data.totalPages > 1 && (
                    <div style={{
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      gap: 12, marginTop: 28,
                    }}>
                      <button
                          disabled={page === 0}
                          onClick={() => setPage((p) => Math.max(0, p - 1))}
                          style={{
                            background: 'none', border: `1px solid ${C.border}`, borderRadius: 8,
                            padding: '8px 16px', color: page === 0 ? C.fg4 : C.fg2,
                            cursor: page === 0 ? 'not-allowed' : 'pointer', fontSize: 13,
                          }}
                      >
                        ← 이전
                      </button>
                      <span style={{ fontSize: 13, color: C.fg3 }}>
                  {page + 1} / {data.totalPages}
                </span>
                      <button
                          disabled={!data.hasNext}
                          onClick={() => setPage((p) => p + 1)}
                          style={{
                            background: 'none', border: `1px solid ${C.border}`, borderRadius: 8,
                            padding: '8px 16px', color: !data.hasNext ? C.fg4 : C.fg2,
                            cursor: !data.hasNext ? 'not-allowed' : 'pointer', fontSize: 13,
                          }}
                      >
                        다음 →
                      </button>
                    </div>
                )}
              </>
          )}
        </div>
      </div>
  )
}