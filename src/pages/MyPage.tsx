import { NavBar } from '../components/NavBar'
import { Btn } from '../components/Btn'
import { Badge } from '../components/Badge'
import { useMe, useFavoriteTeams, useDeleteFavoriteTeam } from '../hooks/useMembers'
import { useAuth } from '../hooks/useAuth'
import { useNotificationStream } from '../hooks/useNotifications'
import { C } from '../styles/tokens'

export function MyPage() {
  const { data: me, isLoading } = useMe()
  const { data: favoriteTeams } = useFavoriteTeams()
  const { mutate: deleteFavoriteTeam } = useDeleteFavoriteTeam()
  const { handleLogout } = useAuth()
  useNotificationStream()

  if (isLoading) return <div style={{ color: C.fg3, padding: 48 }}>불러오는 중...</div>

  return (
    <div style={{ minHeight: '100vh', background: C.dark, color: C.fg1 }}>
      <NavBar />
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{me?.nickname}</div>
          <div style={{ fontSize: 13, color: C.fg3 }}>{me?.email}</div>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.fg3, marginBottom: 16 }}>선호 팀</div>
          {favoriteTeams?.length === 0 && (
            <p style={{ color: C.fg4, fontSize: 13, margin: 0 }}>등록된 선호 팀이 없습니다.</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {favoriteTeams?.map((team) => (
              <div key={team.favoriteTeamId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Badge variant="teal">#{team.priority}</Badge>
                  <span style={{ fontSize: 14, color: C.fg1 }}>{team.teamName}</span>
                  <span style={{ fontSize: 12, color: C.fg3 }}>{team.sportType}</span>
                </div>
                <Btn variant="ghost" size="sm" onClick={() => deleteFavoriteTeam(team.teamId)}>삭제</Btn>
              </div>
            ))}
          </div>
        </div>

        <Btn variant="danger" onClick={handleLogout}>로그아웃</Btn>
      </div>
    </div>
  )
}
