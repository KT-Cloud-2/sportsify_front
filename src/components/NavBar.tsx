import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { C } from '../styles/tokens'
import { useNotifications, useNotificationStream } from '../hooks/useNotifications'
import { NotificationDrawer } from './NotificationDrawer'

const navItems = [
  { id: 'home',     label: '홈',     path: '/' },
  { id: 'chat',     label: '팀 채팅', path: '/chat' },
  { id: 'tickets',  label: '예매 내역', path: '/tickets' },
  { id: 'payments', label: '결제 내역', path: '/payments' },
  { id: 'mypage',   label: '마이',   path: '/mypage' },
]

export function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { data: notifications = [] } = useNotifications()
  useNotificationStream()

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <>
      <nav style={{
        background: 'rgba(23,26,44,0.96)', borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', padding: '0 28px', height: 58, gap: 28, flexShrink: 0,
        position: 'sticky', top: 0, zIndex: 30,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 12 }}>
          <img src="/logo.svg" alt="Sportify" style={{ width: 28, height: 28, borderRadius: 6 }} />
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
          <button
            onClick={() => setDrawerOpen((v) => !v)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              position: 'relative', padding: 4, lineHeight: 1,
            }}
          >
            <span style={{ fontSize: 20, color: drawerOpen ? C.teal : C.fg2 }}>🔔</span>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 0, right: 0, minWidth: 14, height: 14,
                padding: '0 4px', borderRadius: 9999, background: C.error,
                color: '#fff', fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{unreadCount}</span>
            )}
          </button>
        </div>
      </nav>

      <NotificationDrawer
        open={drawerOpen}
        notifications={notifications}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  )
}
