import { NotificationEventType } from '../types/api'

export const EVENT_LABEL: Record<NotificationEventType, string> = {
  TICKET_OPEN: '티켓 오픈',
  GAME_START: '경기 시작',
  PAYMENT_COMPLETED: '결제 완료',
  CHAT_MENTION: '채팅 멘션',
}

export const EVENT_ICON: Record<NotificationEventType, string> = {
  TICKET_OPEN: '🎫',
  GAME_START: '⚾',
  PAYMENT_COMPLETED: '✅',
  CHAT_MENTION: '💬',
}

export const EVENT_COLOR: Record<NotificationEventType, string> = {
  TICKET_OPEN: '#5DBBA0',
  GAME_START: '#F59E0B',
  PAYMENT_COMPLETED: '#3ECF8E',
  CHAT_MENTION: '#3B82F6',
}

function parse(payload: string): Record<string, unknown> | null {
  try { return JSON.parse(payload) } catch { return null }
}

function formatStartSuffix(gameStartAt: string | undefined): string {
  if (!gameStartAt) return '곧 시작합니다'
  const diff = Math.floor((new Date(gameStartAt).getTime() - Date.now()) / 60000)
  if (diff <= 0) return '지금 시작했습니다'
  if (diff < 60) return `${diff}분 뒤 시작합니다`
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return m > 0 ? `${h}시간 ${m}분 뒤 시작합니다` : `${h}시간 뒤 시작합니다`
}

export function formatPayloadMessage(eventType: NotificationEventType, payload: string): string {
  const p = parse(payload)
  if (!p) return payload

  switch (eventType) {
    case 'GAME_START': {
      const home = p.homeTeam as string | undefined
      const away = p.awayTeam as string | undefined
      const gameStartAt = p.gameStartAt as string | undefined
      if (home && away) {
        const suffix = formatStartSuffix(gameStartAt)
        return `${home} vs ${away} 경기가 ${suffix}`
      }
      break
    }
    case 'TICKET_OPEN': {
      const name = p.eventName as string | undefined
      if (name) return `${name} 티켓 예매가 오픈되었습니다`
      break
    }
    case 'PAYMENT_COMPLETED': {
      const item = p.itemName as string | undefined
      const amount = p.amount as number | undefined
      if (item && amount != null) return `${item} 결제가 완료되었습니다 · ${amount.toLocaleString()}원`
      if (item) return `${item} 결제가 완료되었습니다`
      break
    }
    case 'CHAT_MENTION': {
      const by = p.mentionedBy as string | undefined
      const preview = p.preview as string | undefined
      if (by && preview) return `${by}: ${preview}`
      if (by) return `${by}님이 나를 멘션했습니다`
      break
    }
  }
  return payload
}

export function formatPayloadSub(eventType: NotificationEventType, payload: string): string | null {
  const p = parse(payload)
  if (!p) return null

  switch (eventType) {
    case 'GAME_START': {
      const gameId = p.gameId as number | undefined
      return gameId != null ? `경기 #${gameId}` : null
    }
    case 'TICKET_OPEN': {
      const ticketId = p.ticketId as number | undefined
      return ticketId != null ? `티켓 #${ticketId}` : null
    }
    case 'PAYMENT_COMPLETED': {
      const orderId = p.orderId as number | undefined
      return orderId != null ? `주문번호 #${orderId}` : null
    }
    case 'CHAT_MENTION': {
      const roomId = p.roomId as number | undefined
      return roomId != null ? `채팅방 #${roomId}` : null
    }
    default:
      return null
  }
}
