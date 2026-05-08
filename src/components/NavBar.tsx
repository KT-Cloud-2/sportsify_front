import { useNavigate, useLocation } from 'react-router-dom'
import { C } from '../styles/tokens'

const navItems = [
  { id: 'home',   label: '홈',     path: '/' },
  { id: 'chat',   label: '팀 채팅', path: '/chat' },
  { id: 'mypage', label: '마이',   path: '/mypage' },
]

interface NavBarProps {
  unreadCount?: number
}

export function NavBar({ unreadCount = 0 }: NavBarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav style={{
      background: 'rgba(23,26,44,0.96)', borderBottom: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', padding: '0 28px', height: 58, gap: 28, flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 12 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: `linear-gradient(135deg,${C.teal},${C.deep})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, color: '#fff', fontSize: 13,
        }}>S</div>
        <span style={{ fontWeight: 800, fontSize: 16, color: C.teal, letterSpacing: '-0.02em' }}>
          Sportify
        </span>
      </div>

      {navItems.map((item) => {
        const active = location.pathname === item.path
        return (
          <span
            key={item.id}
            onClick={() => navigate(item.path)}
            style={{
              fontSize: 13, fontWeight: active ? 700 : 500,
              color: active ? C.teal : C.fg3, padding: '0 2px', height: '100%',
              borderBottom: active ? `2px solid ${C.teal}` : '2px solid transparent',
              display: 'flex', alignItems: 'center', cursor: 'pointer',
            }}
          >
            {item.label}
          </span>
        )
      })}

      <div style={{ marginLeft: 'auto', display: 'flex', gap: 14, alignItems: 'center' }}>
        {unreadCount > 0 && (
          <div style={{ position: 'relative' }}>
            <span style={{ fontSize: 18, color: C.fg2 }}>🔔</span>
            <div style={{
              position: 'absolute', top: -3, right: -3, minWidth: 14, height: 14,
              padding: '0 4px', borderRadius: 9999, background: C.error,
              color: '#fff', fontSize: 9, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{unreadCount}</div>
          </div>
        )}
      </div>
    </nav>
  )
}
