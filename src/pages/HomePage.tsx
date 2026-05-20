import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavBar } from '../components/NavBar'
import { GameCard } from '../components/GameCard'
import { useGames } from '../hooks/useGames'
import { GameListResponseDto } from '../types/api'
import { C } from '../styles/tokens'

const SPORT_FILTERS = [
  { value: undefined as string | undefined, label: '전체' },
  { value: 'BASEBALL',   label: '⚾ 야구' },
  { value: 'SOCCER',     label: '⚽ 축구' },
  { value: 'BASKETBALL', label: '🏀 농구' },
]

type TicketFilter = 'ON_SALE' | 'SOLD_OUT'
const TICKET_FILTERS: { value: TicketFilter; label: string }[] = [
  { value: 'ON_SALE',  label: '예매' },
  { value: 'SOLD_OUT', label: '매진' },
]

const SPORT_BG: Record<string, string> = {
  BASEBALL:   'linear-gradient(135deg, #0e2421 0%, #1a3a2e 40%, #0d1f2d 100%)',
  SOCCER:     'linear-gradient(135deg, #0e1a2c 0%, #1a2e1a 40%, #0d2010 100%)',
  BASKETBALL: 'linear-gradient(135deg, #2c1a0e 0%, #3a2010 40%, #1a0e00 100%)',
}

const SPORT_ACCENT: Record<string, string> = {
  BASEBALL:   C.teal,
  SOCCER:     '#3ECF8E',
  BASKETBALL: C.warning,
}

function HeroBanner({ game, onSelect }: { game: GameListResponseDto; onSelect: (id: number) => void }) {
  const home = game.teams.find((t) => t.side === 'HOME')
  const away = game.teams.find((t) => t.side === 'AWAY')
  const date = new Date(game.gameTime)
  const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  const accent = SPORT_ACCENT[game.sportType] ?? C.teal
  const bg = SPORT_BG[game.sportType] ?? SPORT_BG.BASEBALL
  const isSoldOut = game.availableSeats === 0

  return (
    <div style={{
      background: bg,
      borderRadius: 20,
      padding: '48px 48px 40px',
      marginBottom: 40,
      position: 'relative',
      overflow: 'hidden',
      border: `1px solid ${C.border}`,
    }}>
      {/* 배경 장식 */}
      <div style={{
        position: 'absolute', top: -60, right: -60,
        width: 280, height: 280, borderRadius: '50%',
        background: `${accent}0d`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -80, right: 80,
        width: 200, height: 200, borderRadius: '50%',
        background: `${accent}08`,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
            color: accent, textTransform: 'uppercase',
          }}>
            오늘의 경기
          </span>
          {game.isRivalMatch && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 8px',
              borderRadius: 9999, background: `${C.error}22`, color: C.error,
              border: `1px solid ${C.error}44`,
            }}>
              라이벌전
            </span>
          )}
        </div>

        {/* vs 섹션 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 28 }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 13, color: C.fg4, marginBottom: 6 }}>HOME</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.fg1, letterSpacing: '-0.02em' }}>
              {home?.shortName ?? home?.name}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: C.fg4, marginBottom: 4 }}>{timeStr}</div>
            <div style={{
              fontSize: 20, fontWeight: 900, color: accent,
              padding: '6px 16px', borderRadius: 10,
              border: `1px solid ${accent}33`, background: `${accent}11`,
            }}>
              VS
            </div>
          </div>

          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 13, color: C.fg4, marginBottom: 6 }}>AWAY</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.fg1, letterSpacing: '-0.02em' }}>
              {away?.shortName ?? away?.name}
            </div>
          </div>
        </div>

        {/* 메타 정보 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 20, fontSize: 13, color: C.fg3 }}>
            <span>🏟 {game.stadium}</span>
            <span>💺 잔여 {game.availableSeats.toLocaleString()}석</span>
          </div>

          <button
            onClick={() => onSelect(game.gameId)}
            disabled={isSoldOut}
            style={{
              padding: '10px 28px', borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: isSoldOut ? C.elevated : accent,
              color: isSoldOut ? C.fg4 : C.deep,
              border: 'none', cursor: isSoldOut ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => { if (!isSoldOut) e.currentTarget.style.opacity = '0.85' }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
          >
            {isSoldOut ? '매진' : '지금 예매하기'}
          </button>
        </div>
      </div>
    </div>
  )
}

function HeroBannerSkeleton() {
  return (
    <div style={{
      background: C.card, borderRadius: 20, padding: '48px 48px 40px',
      marginBottom: 40, border: `1px solid ${C.border}`,
      display: 'flex', flexDirection: 'column', gap: 20,
    }}>
      {[140, 80].map((w) => (
        <div key={w} style={{
          height: w === 140 ? 36 : 18, width: `${w}px`,
          borderRadius: 8, background: C.elevated,
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      ))}
    </div>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const [sportType, setSportType] = useState<string | undefined>()
  const [ticketFilters, setTicketFilters] = useState<Set<TicketFilter>>(new Set(['ON_SALE', 'SOLD_OUT']))
  const [visibleCount, setVisibleCount] = useState(5)
  const { data: games, isLoading, isError } = useGames({ sportType })

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  // 오늘 경기 중 ON_SALE + 잔여석 있는 것 우선, 없으면 마지막 경기
  const featuredGame = games?.find(
    (g) => g.gameTime.startsWith(todayStr) && g.status === 'ON_SALE' && g.availableSeats > 0
  ) ?? games?.[games.length - 1]

  function toggleTicketFilter(v: TicketFilter) {
    setTicketFilters((prev) => {
      const next = new Set(prev)
      if (next.has(v)) {
        if (next.size === 1) return prev
        next.delete(v)
      } else {
        next.add(v)
      }
      return next
    })
    setVisibleCount(5)
  }

  const allFiltered = games?.filter((g) => {
    const isSoldOut = g.availableSeats === 0 || g.status !== 'ON_SALE'
    if (isSoldOut) return ticketFilters.has('SOLD_OUT')
    return ticketFilters.has('ON_SALE')
  }) ?? []
  const filteredGames = allFiltered.slice(0, visibleCount)
  const hasMore = allFiltered.length > visibleCount

  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisibleCount((n) => n + 5) },
      { threshold: 0.1 },
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, filteredGames.length])

  return (
    <div style={{ minHeight: '100vh', background: C.dark, color: C.fg1 }}>
      <NavBar />

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        {/* 히어로 배너 */}
        {isLoading && <HeroBannerSkeleton />}
        {!isLoading && featuredGame && (
          <HeroBanner game={featuredGame} onSelect={(id) => navigate(`/games/${id}`)} />
        )}

        {/* 경기 목록 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>경기 일정</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* 종목 필터 */}
            {SPORT_FILTERS.map((f) => (
              <button
                key={f.label}
                onClick={() => setSportType(f.value)}
                style={{
                  padding: '6px 14px', borderRadius: 9999, fontSize: 12, fontWeight: 600,
                  background: sportType === f.value ? C.teal : C.elevated,
                  color: sportType === f.value ? C.deep : C.fg2,
                  border: `1px solid ${sportType === f.value ? C.teal : C.border}`,
                  cursor: 'pointer',
                }}
              >
                {f.label}
              </button>
            ))}

            <div style={{ width: 1, height: 16, background: C.border, margin: '0 4px' }} />

            {/* 예매/매진 필터 */}
            {TICKET_FILTERS.map((f) => {
              const active = ticketFilters.has(f.value)
              const color = f.value === 'ON_SALE' ? C.teal : C.fg3
              return (
                <button
                  key={f.value}
                  onClick={() => toggleTicketFilter(f.value)}
                  style={{
                    padding: '6px 14px', borderRadius: 9999, fontSize: 12, fontWeight: 600,
                    background: active ? `${color}22` : C.elevated,
                    color: active ? color : C.fg4,
                    border: `1px solid ${active ? color : C.border}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>

        {isLoading && <p style={{ color: C.fg3 }}>불러오는 중...</p>}
        {isError && <p style={{ color: C.error }}>경기 목록을 불러올 수 없습니다.</p>}
        {!isLoading && filteredGames?.length === 0 && (
          <p style={{ color: C.fg4, fontSize: 13 }}>해당하는 경기가 없습니다.</p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filteredGames.map((game) => (
            <GameCard key={game.gameId} game={game} onSelect={(id) => navigate(`/games/${id}`)} />
          ))}
        </div>

        {hasMore && <div ref={sentinelRef} style={{ height: 40 }} />}
      </div>
    </div>
  )
}
