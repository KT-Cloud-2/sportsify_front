import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { C } from '../styles/tokens'
import { useNotifications, useNotificationStream, requestBrowserNotificationPermission } from '../hooks/useNotifications'
import { NotificationDrawer } from './NotificationDrawer'
import { useAuthStore } from '../store/auth'
import { useMe } from '../hooks/useMembers'
import { useAuth } from '../hooks/useAuth'

const navItems = [
  { id: 'home',    label: '홈',     path: '/' },
  { id: 'chat',    label: '팀 채팅', path: '/chat' },
]

export function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const accessToken = useAuthStore((s) => s.accessToken)
  const { data: notifications = [] } = useNotifications()
  const { data: me } = useMe()
  const { handleLogout } = useAuth()
  useNotificationStream()

  useEffect(() => {
    if (!accessToken) return
    requestBrowserNotificationPermission()
  }, [accessToken])

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    document.title = unreadCount > 0 ? `(${unreadCount}) Sportify` : 'Sportify'
  }, [unreadCount])

  useEffect(() => {
    if (!profileOpen) return
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [profileOpen])

  const initial = me?.nickname?.[0]?.toUpperCase() ?? '?'

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
          {/* 알림 벨 */}
          <button
            onClick={() => setDrawerOpen((v) => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: 4, lineHeight: 1 }}
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

          {/* 프로필 아바타 + 드롭다운 */}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setProfileOpen((v) => !v)}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: profileOpen ? C.teal : C.elevated,
                border: `2px solid ${profileOpen ? C.teal : C.border}`,
                color: profileOpen ? C.deep : C.fg1,
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
            >
              {initial}
            </button>

            {profileOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 12, minWidth: 160, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                overflow: 'hidden', zIndex: 100,
              }}>
                {me && (
                  <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.fg1 }}>{me.nickname}</div>
                    <div style={{ fontSize: 11, color: C.fg4, marginTop: 2 }}>{me.email}</div>
                  </div>
                )}
                {[
                  { label: '마이페이지', action: () => { navigate('/mypage'); setProfileOpen(false) } },
                  { label: '예매 내역',  action: () => { navigate('/tickets'); setProfileOpen(false) } },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    style={{
                      width: '100%', background: 'none', border: 'none', padding: '11px 16px',
                      textAlign: 'left', fontSize: 13, color: C.fg2, cursor: 'pointer',
                      display: 'block',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = C.elevated)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    {item.label}
                  </button>
                ))}
                <div style={{ borderTop: `1px solid ${C.border}` }}>
                  <button
                    onClick={() => { handleLogout(); setProfileOpen(false) }}
                    style={{
                      width: '100%', background: 'none', border: 'none', padding: '11px 16px',
                      textAlign: 'left', fontSize: 13, color: C.error, cursor: 'pointer',
                      display: 'block',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = C.elevated)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            )}
          </div>
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
