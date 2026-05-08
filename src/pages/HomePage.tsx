import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavBar } from '../components/NavBar'
import { GameCard } from '../components/GameCard'
import { useGames } from '../hooks/useGames'
import { useNotifications } from '../hooks/useNotifications'
import { C } from '../styles/tokens'

const SPORT_FILTERS = [
  { value: undefined as string | undefined, label: '전체' },
  { value: 'BASEBALL',   label: '⚾ 야구' },
  { value: 'SOCCER',     label: '⚽ 축구' },
  { value: 'BASKETBALL', label: '🏀 농구' },
]

export function HomePage() {
  const navigate = useNavigate()
  const [sportType, setSportType] = useState<string | undefined>()
  const { data: games, isLoading, isError } = useGames({ sportType })
  const { data: notifications } = useNotifications()
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0

  return (
    <div style={{ minHeight: '100vh', background: C.dark, color: C.fg1 }}>
      <NavBar unreadCount={unreadCount} />

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, margin: '0 0 24px' }}>경기 일정</h1>

        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {SPORT_FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => setSportType(f.value)}
              style={{
                padding: '7px 16px', borderRadius: 9999, fontSize: 13, fontWeight: 600,
                background: sportType === f.value ? C.teal : C.elevated,
                color: sportType === f.value ? C.deep : C.fg2,
                border: `1px solid ${sportType === f.value ? C.teal : C.border}`,
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading && <p style={{ color: C.fg3 }}>불러오는 중...</p>}
        {isError && <p style={{ color: C.error }}>경기 목록을 불러올 수 없습니다.</p>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {games?.map((game) => (
            <GameCard key={game.gameId} game={game} onSelect={(id) => navigate(`/games/${id}`)} />
          ))}
        </div>
      </div>
    </div>
  )
}
