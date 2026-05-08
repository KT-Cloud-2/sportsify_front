import { useEffect, useRef } from 'react'
import { C } from '../styles/tokens'
import { NotificationResponse, NotificationEventType } from '../types/api'
import { useMarkRead, useMarkAllRead } from '../hooks/useNotifications'

const EVENT_LABEL: Record<NotificationEventType, string> = {
  TICKET_OPEN: '티켓 오픈',
  GAME_START: '경기 시작',
  PAYMENT_COMPLETED: '결제 완료',
  CHAT_MENTION: '채팅 멘션',
}

const EVENT_COLOR: Record<NotificationEventType, string> = {
  TICKET_OPEN: C.teal,
  GAME_START: C.warning,
  PAYMENT_COMPLETED: C.success,
  CHAT_MENTION: C.info,
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return '방금 전'
  if (diffMin < 60) return `${diffMin}분 전`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}시간 전`
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

interface Props {
  open: boolean
  notifications: NotificationResponse[]
  onClose: () => void
}

export function NotificationDrawer({ open, notifications, onClose }: Props) {
  const { mutate: markRead } = useMarkRead()
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllRead()
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <>
      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.4)',
        }} />
      )}
      <div
        ref={drawerRef}
        style={{
          position: 'fixed', top: 58, right: 0, bottom: 0,
          width: 360, background: C.card,
          borderLeft: `1px solid ${C.border}`,
          display: 'flex', flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1)',
          zIndex: 50,
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: `1px solid ${C.border}`, flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: C.fg1 }}>알림</span>
            {unreadCount > 0 && (
              <span style={{
                background: C.error, color: '#fff', borderRadius: 9999,
                fontSize: 11, fontWeight: 700, padding: '1px 7px',
              }}>{unreadCount}</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                disabled={isMarkingAll}
                style={{
                  fontSize: 12, color: C.teal, background: 'none', border: 'none',
                  cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px',
                  borderRadius: 6, opacity: isMarkingAll ? 0.5 : 1,
                }}
              >
                모두 읽음
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', color: C.fg3,
                cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 4,
              }}
            >
              ×
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '100%', gap: 8,
              color: C.fg4, fontSize: 13,
            }}>
              <span style={{ fontSize: 32 }}>🔔</span>
              새로운 알림이 없습니다
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => { if (!n.read) markRead(n.id) }}
                style={{
                  padding: '14px 20px',
                  borderBottom: `1px solid ${C.border}`,
                  background: n.read ? 'transparent' : 'rgba(93,187,160,0.06)',
                  cursor: n.read ? 'default' : 'pointer',
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                }}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', marginTop: 6, flexShrink: 0,
                  background: n.read ? C.border : EVENT_COLOR[n.eventType],
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      color: EVENT_COLOR[n.eventType],
                    }}>
                      {EVENT_LABEL[n.eventType]}
                    </span>
                    <span style={{ fontSize: 11, color: C.fg4 }}>
                      {formatTime(n.createdAt)}
                    </span>
                  </div>
                  <p style={{
                    fontSize: 13, color: n.read ? C.fg3 : C.fg1,
                    margin: 0, wordBreak: 'break-word', lineHeight: 1.5,
                  }}>
                    {n.payload}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
