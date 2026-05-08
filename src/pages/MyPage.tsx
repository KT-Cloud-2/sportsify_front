import { useState } from 'react'
import { NavBar } from '../components/NavBar'
import { Btn } from '../components/Btn'
import { Badge } from '../components/Badge'
import { NotificationSettingsPanel } from '../components/NotificationSettingsPanel'
import {
  useMe,
  useUpdateNickname,
  useDeleteAccount,
  useFavoriteTeams,
  useDeleteFavoriteTeam,
  useUpdateFavoriteTeamPriority,
  useMonthlyActivity,
} from '../hooks/useMembers'
import { useAuth } from '../hooks/useAuth'
import { C } from '../styles/tokens'

function NicknameEditor({ current }: { current: string }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(current)
  const { mutate: update, isPending } = useUpdateNickname()

  if (!editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18, fontWeight: 700 }}>{current}</span>
        <button
          onClick={() => { setValue(current); setEditing(true) }}
          style={{ background: 'none', border: 'none', color: C.fg4, cursor: 'pointer', fontSize: 13 }}
        >
          수정
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') update(value, { onSuccess: () => setEditing(false) })
          if (e.key === 'Escape') setEditing(false)
        }}
        autoFocus
        maxLength={20}
        style={{
          background: C.elevated, border: `1px solid ${C.teal}`, borderRadius: 8,
          padding: '6px 10px', color: C.fg1, fontSize: 15, fontFamily: 'inherit',
          outline: 'none', width: 160,
        }}
      />
      <Btn size="sm" onClick={() => update(value, { onSuccess: () => setEditing(false) })} disabled={isPending || value.length < 2}>저장</Btn>
      <Btn size="sm" variant="ghost" onClick={() => setEditing(false)}>취소</Btn>
    </div>
  )
}

function MonthlyActivitySection() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const { data, isLoading, isError } = useMonthlyActivity(year, month)

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.fg3 }}>월별 응원 활동</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button onClick={() => { const d = new Date(year, month - 2); setYear(d.getFullYear()); setMonth(d.getMonth() + 1) }}
            style={{ background: 'none', border: 'none', color: C.fg3, cursor: 'pointer', fontSize: 16 }}>‹</button>
          <span style={{ fontSize: 13, color: C.fg2, minWidth: 60, textAlign: 'center' }}>{year}.{String(month).padStart(2, '0')}</span>
          <button onClick={() => { const d = new Date(year, month); setYear(d.getFullYear()); setMonth(d.getMonth() + 1) }}
            style={{ background: 'none', border: 'none', color: C.fg3, cursor: 'pointer', fontSize: 16 }}>›</button>
        </div>
      </div>

      {isLoading && <div style={{ color: C.fg4, fontSize: 13 }}>불러오는 중...</div>}
      {isError && <div style={{ color: C.fg4, fontSize: 13 }}>아직 데이터를 불러올 수 없습니다.</div>}
      {data && (
        <>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div style={{ background: C.elevated, borderRadius: 10, padding: '12px 16px', flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.teal }}>{data.ticketCount}</div>
              <div style={{ fontSize: 11, color: C.fg4, marginTop: 2 }}>예매 티켓</div>
            </div>
            <div style={{ background: C.elevated, borderRadius: 10, padding: '12px 16px', flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.info }}>{data.chatMessageCount}</div>
              <div style={{ fontSize: 11, color: C.fg4, marginTop: 2 }}>채팅 메시지</div>
            </div>
          </div>
          {data.attendedGames.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 12, color: C.fg4, marginBottom: 4 }}>참여 경기</div>
              {data.attendedGames.map((g) => (
                <div key={g.gameId} style={{ background: C.elevated, borderRadius: 8, padding: '8px 12px', fontSize: 12, color: C.fg2 }}>
                  {g.team1Name} vs {g.team2Name} — {new Date(g.gameTime).toLocaleDateString('ko-KR')}
                </div>
              ))}
            </div>
          )}
          {data.attendedGames.length === 0 && (
            <div style={{ fontSize: 13, color: C.fg4 }}>이 달 참여한 경기가 없습니다.</div>
          )}
        </>
      )}
    </div>
  )
}

function DeleteAccountSection({ onLogout }: { onLogout: () => void }) {
  const [confirm, setConfirm] = useState(false)
  const { mutate: deleteAccount, isPending } = useDeleteAccount()

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        style={{ background: 'none', border: 'none', color: C.fg4, cursor: 'pointer', fontSize: 13, textDecoration: 'underline', padding: 0 }}
      >
        회원 탈퇴
      </button>
    )
  }

  return (
    <div style={{ background: C.card, border: `1px solid ${C.error}`, borderRadius: 12, padding: 16 }}>
      <p style={{ fontSize: 13, color: C.fg2, marginBottom: 12 }}>
        탈퇴하면 모든 데이터가 삭제되며 복구할 수 없습니다. 정말 탈퇴하시겠습니까?
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <Btn variant="danger" size="sm" onClick={() => deleteAccount(undefined, { onSuccess: onLogout })} disabled={isPending}>
          탈퇴 확인
        </Btn>
        <Btn variant="ghost" size="sm" onClick={() => setConfirm(false)}>취소</Btn>
      </div>
    </div>
  )
}

export function MyPage() {
  const { data: me, isLoading } = useMe()
  const { data: favoriteTeams } = useFavoriteTeams()
  const { mutate: deleteFavoriteTeam } = useDeleteFavoriteTeam()
  const { mutate: updatePriority } = useUpdateFavoriteTeamPriority()
  const { handleLogout } = useAuth()

  if (isLoading) return <div style={{ color: C.fg3, padding: 48 }}>불러오는 중...</div>

  return (
    <div style={{ minHeight: '100vh', background: C.dark, color: C.fg1 }}>
      <NavBar />
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* 프로필 */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          {me && <NicknameEditor current={me.nickname} />}
          <div style={{ fontSize: 13, color: C.fg3, marginTop: 6 }}>{me?.email}</div>
        </div>

        {/* 선호 팀 */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.fg3, marginBottom: 16 }}>선호 팀</div>
          {favoriteTeams?.length === 0 && (
            <p style={{ color: C.fg4, fontSize: 13, margin: 0 }}>등록된 선호 팀이 없습니다.</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {favoriteTeams?.map((team) => (
              <div key={team.favoriteTeamId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <select
                    value={team.priority}
                    onChange={(e) => updatePriority({ teamId: team.teamId, priority: Number(e.target.value) })}
                    style={{
                      background: C.elevated, color: C.fg2, border: `1px solid ${C.border}`,
                      borderRadius: 6, padding: '2px 6px', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>#{n}</option>
                    ))}
                  </select>
                  <span style={{ fontSize: 14, color: C.fg1 }}>{team.teamName}</span>
                  <Badge variant="teal">{team.sportType}</Badge>
                </div>
                <Btn variant="ghost" size="sm" onClick={() => deleteFavoriteTeam(team.teamId)}>삭제</Btn>
              </div>
            ))}
          </div>
        </div>

        {/* 월별 활동 */}
        <MonthlyActivitySection />

        {/* 알림 설정 */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.fg3, marginBottom: 12, padding: '0 4px' }}>알림 설정</div>
          <NotificationSettingsPanel />
        </div>

        {/* 계정 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn variant="danger" onClick={handleLogout}>로그아웃</Btn>
          <div style={{ textAlign: 'center' }}>
            <DeleteAccountSection onLogout={handleLogout} />
          </div>
        </div>
      </div>
    </div>
  )
}
