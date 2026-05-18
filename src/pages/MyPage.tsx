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
  useAddFavoriteTeam,
  useTeams,
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

function AddFavoriteTeamPanel() {
  const [sportType, setSportType] = useState('')
  const [search, setSearch] = useState('')
  const { data: teams } = useTeams(sportType || undefined)
  const { mutate: add, isPending } = useAddFavoriteTeam()

  const filtered = (teams ?? []).filter((t) =>
    search === '' || t.name.includes(search) || (t.shortName ?? '').includes(search)
  )

  return (
    <div style={{ marginTop: 16, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.fg3, marginBottom: 10 }}>팀 등록</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <select
          value={sportType}
          onChange={(e) => setSportType(e.target.value)}
          style={{
            background: C.elevated, color: C.fg2, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: '6px 10px', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
          }}
        >
          <option value="">전체 종목</option>
          <option value="BASEBALL">야구</option>
          <option value="BASKETBALL">농구</option>
          <option value="SOCCER">축구</option>
          <option value="VOLLEYBALL">배구</option>
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="팀 검색..."
          style={{
            flex: 1, background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 8,
            padding: '6px 10px', color: C.fg1, fontSize: 13, fontFamily: 'inherit', outline: 'none',
          }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
        {filtered.length === 0 && (
          <p style={{ color: C.fg4, fontSize: 13, margin: 0 }}>검색 결과 없음</p>
        )}
        {filtered.map((team) => (
          <div
            key={team.teamId}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: C.elevated, borderRadius: 8 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, color: C.fg1 }}>{team.name}</span>
              <Badge variant="teal">{team.sportType}</Badge>
            </div>
            <Btn
              size="sm"
              onClick={() => add({ teamId: team.teamId })}
              disabled={isPending}
            >
              추가
            </Btn>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MyPage() {
  const { data: me, isLoading } = useMe()
  const { data: favoriteTeams } = useFavoriteTeams()
  const { mutate: deleteFavoriteTeam } = useDeleteFavoriteTeam()
  const { mutate: updatePriority } = useUpdateFavoriteTeamPriority()
  const [showAddTeam, setShowAddTeam] = useState(false)
  const { handleLogout } = useAuth()

  return (
    <div style={{ minHeight: '100vh', background: C.dark, color: C.fg1 }}>
      <NavBar />
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {isLoading ? <div style={{ color: C.fg3, padding: 48 }}>불러오는 중...</div> : (<>

        {/* 프로필 */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          {me && <NicknameEditor current={me.nickname} />}
          <div style={{ fontSize: 13, color: C.fg3, marginTop: 6 }}>{me?.email}</div>
        </div>

        {/* 선호 팀 */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.fg3 }}>선호 팀</div>
            <Btn size="sm" variant="ghost" onClick={() => setShowAddTeam((v) => !v)}>
              {showAddTeam ? '닫기' : '+ 팀 추가'}
            </Btn>
          </div>
          {favoriteTeams?.length === 0 && !showAddTeam && (
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
          {showAddTeam && <AddFavoriteTeamPanel />}
        </div>

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
        </>)}
      </div>
    </div>
  )
}
