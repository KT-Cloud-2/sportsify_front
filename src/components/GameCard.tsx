import { useNavigate } from 'react-router-dom'
import { GameListResponseDto } from '../types/api'
import { Badge } from './Badge'
import { Btn } from './Btn'
import { C } from '../styles/tokens'
import { useChatRoomsByGame } from '../hooks/useChat'

const sportMeta: Record<string, { label: string; icon: string; variant: 'baseball' | 'soccer' | 'basketball' }> = {
  BASEBALL:   { label: '야구', icon: '⚾', variant: 'baseball' },
  SOCCER:     { label: '축구', icon: '⚽', variant: 'soccer' },
  BASKETBALL: { label: '농구', icon: '🏀', variant: 'basketball' },
}

interface GameCardProps {
  game: GameListResponseDto
  onSelect: (gameId: number) => void
}

export function GameCard({ game, onSelect }: GameCardProps) {
  const navigate = useNavigate()
  const { data: chatRooms } = useChatRoomsByGame(game.gameId)
  const hasChatRoom = (chatRooms?.length ?? 0) > 0

  const meta = sportMeta[game.sportType] ?? { label: game.sportType, icon: '🏟', variant: 'teal' as const }
  const home = game.teams.find((t) => t.side === 'HOME')
  const away = game.teams.find((t) => t.side === 'AWAY')
  const date = new Date(game.gameTime)
  const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
  const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  const isSoldOut = game.availableSeats === 0

  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
      padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Badge variant={meta.variant}>{meta.icon} {meta.label}</Badge>
        <div style={{ display: 'flex', gap: 6 }}>
          {game.isRivalMatch && <Badge variant="red">라이벌전</Badge>}
          {isSoldOut && <Badge variant="gray">매진</Badge>}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: C.fg1 }}>{home?.name}</span>
        <span style={{ fontSize: 13, color: C.fg3 }}>VS</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: C.fg1 }}>{away?.name}</span>
      </div>

      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: C.fg3 }}>
        <span>📅 {dateStr} {timeStr}</span>
        <span>🏟 {game.stadium}</span>
        <span>💺 잔여 {game.availableSeats}석</span>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <Btn
          variant={isSoldOut ? 'ghost' : 'primary'}
          disabled={isSoldOut}
          onClick={() => onSelect(game.gameId)}
          style={{ flex: 1 }}
        >
          {isSoldOut ? '매진' : '좌석 선택'}
        </Btn>
        {hasChatRoom && (
          <Btn
            variant="secondary"
            onClick={() => navigate(`/chat?gameId=${game.gameId}`)}
          >
            💬 채팅
          </Btn>
        )}
      </div>
    </div>
  )
}
