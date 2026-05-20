// src/pages/GameDetailPage.tsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { NavBar } from '../components/NavBar'
import { SeatMap } from '../components/SeatMap'
import { Badge } from '../components/Badge'
import { Btn } from '../components/Btn'
import { useGameDetail, useGameSeats } from '../hooks/useGames'
import { useReserveSeats } from '../hooks/useTickets'
import { GameSeatListResponseDto, ReservationSeatsResponseDto } from '../types/api'
import { C } from '../styles/tokens'

function ReservationModal({
                            reservation,
                            onConfirm,
                            onClose,
                          }: {
  reservation: ReservationSeatsResponseDto
  onConfirm: () => void
  onClose: () => void
}) {
  const totalAmount = reservation.seats.reduce((sum, s) => sum + s.price, 0)

  return (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
      }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32, minWidth: 340, maxWidth: 480 }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>예매 확인</div>
          <div style={{ fontSize: 12, color: C.warning, marginBottom: 20 }}>
            좌석은 15분간 임시 예약됩니다. 결제 완료 전까지 확정되지 않습니다.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {reservation.seats.map((s) => (
                <div key={s.seatId} style={{ background: C.elevated, borderRadius: 10, padding: '10px 14px', fontSize: 13, color: C.fg2 }}>
                  {s.seatGrade} · {s.seatSection} · {s.price.toLocaleString()}원
                </div>
            ))}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.teal, marginBottom: 24 }}>
            합계: {totalAmount.toLocaleString()}원
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn onClick={onConfirm}>결제 진행</Btn>
            <Btn variant="ghost" onClick={onClose}>취소</Btn>
          </div>
        </div>
      </div>
  )
}

export function GameDetailPage() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const id = Number(gameId)
  const { data: game, isLoading } = useGameDetail(id)
  const { data: seats } = useGameSeats(id)
  const { mutate: reserveSeats, isPending: reserving } = useReserveSeats()
  const [selectedSeats, setSelectedSeats] = useState<GameSeatListResponseDto[]>([])
  const [reservation, setReservation] = useState<ReservationSeatsResponseDto | null>(null)
  const [reserveError, setReserveError] = useState<string | null>(null)

  const maxTickets = game?.maxTicketPerUser ?? 4

  const handleSeatToggle = (seat: GameSeatListResponseDto) => {
    setSelectedSeats((prev) => {
      const exists = prev.find((s) => s.seatId === seat.seatId)
      if (exists) {
        return prev.filter((s) => s.seatId !== seat.seatId)
      }
      if (prev.length >= maxTickets) {
        return prev
      }
      return [...prev, seat]
    })
  }

  const handleReserve = () => {
    if (selectedSeats.length === 0) return
    setReserveError(null)
    reserveSeats(
        { gameId: id, seatIds: selectedSeats.map((s) => s.seatId) },
        {
          onSuccess: (res) => {
            setReservation(res)
            setSelectedSeats([])
          },
          onError: (err: unknown) => {
            const msg = err instanceof Error ? err.message : '좌석 예약에 실패했습니다.'
            setReserveError(msg)
          },
        }
    )
  }

  const handleGoToPayment = () => {
    if (reservation) navigate('/payment', { state: reservation })
  }

  const selectedTotal = selectedSeats.reduce((sum, s) => sum + (s.price ?? 0), 0)

  return (
      <div style={{ minHeight: '100vh', background: C.dark, color: C.fg1 }}>
        <NavBar />
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
          {isLoading ? (
              <div style={{ color: C.fg3, padding: 48 }}>불러오는 중...</div>
          ) : game ? (
              <>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: C.fg3, cursor: 'pointer', marginBottom: 24, fontSize: 14 }}>
                  ← 뒤로
                </button>

                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, marginBottom: 28 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    <Badge variant="teal">{game.sportType}</Badge>
                    {game.isRivalMatch && <Badge variant="red">라이벌전</Badge>}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>
                    {game.teams.find((t) => t.side === 'HOME')?.name} <span style={{ color: C.fg3 }}>vs</span> {game.teams.find((t) => t.side === 'AWAY')?.name}
                  </div>
                  <div style={{ display: 'flex', gap: 20, fontSize: 13, color: C.fg3 }}>
                    <span>📅 {new Date(game.gameTime).toLocaleString('ko-KR')}</span>
                    <span>🏟 {game.venue}</span>
                    <span>💺 잔여 {game.availableSeats}석</span>
                  </div>

                  {game.seatGradeSummary.length > 0 && (
                      <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
                        {game.seatGradeSummary.map((g) => (
                            <div key={g.grade} style={{ background: C.elevated, borderRadius: 10, padding: '8px 14px', fontSize: 12 }}>
                              <div style={{ color: C.fg3 }}>{g.grade}</div>
                              <div style={{ color: C.teal, fontWeight: 700 }}>{g.price.toLocaleString()}원</div>
                              <div style={{ color: C.fg2 }}>잔여 {g.available}</div>
                            </div>
                        ))}
                      </div>
                  )}
                </div>

                {seats && seats.length > 0 && (
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28 }}>
                      <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>좌석 선택</h2>
                      <div style={{ fontSize: 12, color: C.fg3, marginBottom: 20 }}>
                        최대 {maxTickets}석까지 선택 가능합니다. (현재 {selectedSeats.length}석 선택됨)
                      </div>
                      {reserving && <div style={{ color: C.fg3, marginBottom: 12 }}>예약 처리 중...</div>}
                      {reserveError && <div style={{ color: C.error, fontSize: 13, marginBottom: 12 }}>{reserveError}</div>}
                      <SeatMap
                          seats={seats}
                          selectedSeatIds={selectedSeats.map((s) => s.seatId)}
                          maxSelectable={maxTickets}
                          onSeatToggle={handleSeatToggle}
                      />

                      {/* 선택된 좌석 요약 및 예매 버튼 */}
                      {selectedSeats.length > 0 && (
                          <div style={{
                            marginTop: 24, padding: 20, background: C.elevated, borderRadius: 14,
                            border: `1px solid ${C.border}`,
                          }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: C.fg3, marginBottom: 12 }}>
                              선택한 좌석 ({selectedSeats.length}/{maxTickets})
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                              {selectedSeats.map((s) => (
                                  <div key={s.seatId} style={{
                                    background: C.card, borderRadius: 8, padding: '6px 12px', fontSize: 12,
                                    color: C.fg2, border: `1px solid ${C.border}`,
                                    display: 'flex', alignItems: 'center', gap: 6,
                                  }}>
                                    <span>{s.grade} · {s.section}</span>
                                    <span style={{ color: C.teal, fontWeight: 700 }}>{(s.price ?? 0).toLocaleString()}원</span>
                                    <button
                                        onClick={() => handleSeatToggle(s)}
                                        style={{
                                          background: 'none', border: 'none', color: C.fg4, cursor: 'pointer',
                                          fontSize: 14, lineHeight: 1, padding: '0 2px',
                                        }}
                                    >
                                      ×
                                    </button>
                                  </div>
                              ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ fontSize: 16, fontWeight: 700, color: C.teal }}>
                                합계: {selectedTotal.toLocaleString()}원
                              </div>
                              <Btn onClick={handleReserve} disabled={reserving}>
                                {reserving ? '처리 중...' : `${selectedSeats.length}석 예매하기`}
                              </Btn>
                            </div>
                          </div>
                      )}
                    </div>
                )}
              </>
          ) : null}
        </div>

        {reservation && (
            <ReservationModal
                reservation={reservation}
                onConfirm={handleGoToPayment}
                onClose={() => setReservation(null)}
            />
        )}
      </div>
  )
}