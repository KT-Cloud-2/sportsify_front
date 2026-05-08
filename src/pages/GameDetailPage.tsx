import { useParams, useNavigate } from 'react-router-dom'
import { NavBar } from '../components/NavBar'
import { SeatMap } from '../components/SeatMap'
import { Badge } from '../components/Badge'
import { useGameDetail, useGameSeats } from '../hooks/useGames'
import { GameSeatListResponseDto } from '../types/api'
import { C } from '../styles/tokens'

export function GameDetailPage() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const id = Number(gameId)
  const { data: game, isLoading } = useGameDetail(id)
  const { data: seats } = useGameSeats(id)

  const home = game?.teams.find((t) => t.side === 'HOME')
  const away = game?.teams.find((t) => t.side === 'AWAY')

  const handleConfirm = (seat: GameSeatListResponseDto) => {
    alert(`예매 완료: ${seat.grade} ${seat.section} ${seat.rowNumber}열 ${seat.seatNumber}번 — ${seat.price.toLocaleString()}원`)
  }

  if (isLoading) return <div style={{ color: C.fg3, padding: 48 }}>불러오는 중...</div>
  if (!game) return null

  const dateStr = new Date(game.gameTime).toLocaleString('ko-KR')

  return (
    <div style={{ minHeight: '100vh', background: C.dark, color: C.fg1 }}>
      <NavBar />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: C.fg3, cursor: 'pointer', marginBottom: 24, fontSize: 14 }}>
          ← 뒤로
        </button>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, marginBottom: 28 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <Badge variant="teal">{game.sportType}</Badge>
            {game.isRivalMatch && <Badge variant="red">라이벌전</Badge>}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>
            {home?.name} <span style={{ color: C.fg3 }}>vs</span> {away?.name}
          </div>
          <div style={{ display: 'flex', gap: 20, fontSize: 13, color: C.fg3 }}>
            <span>📅 {dateStr}</span>
            <span>🏟 {game.venue}</span>
            <span>💺 잔여 {game.availableSeats}석</span>
          </div>

          {game.seatGradeSummary.length > 0 && (
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
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
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, margin: '0 0 20px' }}>좌석 선택</h2>
            <SeatMap seats={seats} onConfirm={handleConfirm} />
          </div>
        )}
      </div>
    </div>
  )
}
