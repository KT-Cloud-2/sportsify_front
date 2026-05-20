import { z } from 'zod'
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

// 새 이벤트 추가: NotificationEventType → PayloadSchemas → PAYLOAD_FORMATTERS 순서로 추가
// 모든 스키마 필드는 .optional() — DB payload 구조가 버전마다 달라도 safeParse로 폴백
// message()는 항상 사람이 읽을 수 있는 문자열 반환 (raw JSON 노출 금지)

const PayloadSchemas = {
  PAYMENT_COMPLETED: z.object({
    itemName:  z.string().optional(),
    amount:    z.number().optional(),
    orderId:   z.number().optional(),
    paymentId: z.number().optional(),
    memberId:  z.number().optional(),
  }),

  GAME_START: z.object({
    gameId:      z.number().optional(),
    homeTeam:    z.string().optional(),
    awayTeam:    z.string().optional(),
    gameStartAt: z.string().optional(),
  }),

  TICKET_OPEN: z.object({
    ticketId:  z.number().optional(),
    eventName: z.string().optional(),
  }),

  CHAT_MENTION: z.object({
    roomId:     z.number().optional(),
    roomName:   z.string().optional(),
    senderName: z.string().optional(),
    message:    z.string().optional(),
  }),
} satisfies Record<NotificationEventType, z.ZodObject<z.ZodRawShape>>

type ParsedPayload<T extends NotificationEventType> = z.infer<typeof PayloadSchemas[T]>

interface PayloadFormatter<T extends NotificationEventType> {
  message: (p: ParsedPayload<T>) => string
  sub:     (p: ParsedPayload<T>) => string | null
  navPath: (p: ParsedPayload<T>) => string | null
}

const PAYLOAD_FORMATTERS: { [T in NotificationEventType]: PayloadFormatter<T> } = {
  PAYMENT_COMPLETED: {
    message({ itemName, amount }) {
      if (itemName && amount != null) return `${itemName} 결제가 완료되었습니다 · ${amount.toLocaleString()}원`
      if (itemName) return `${itemName} 결제가 완료되었습니다`
      if (amount != null) return `${amount.toLocaleString()}원 결제가 완료되었습니다`
      return '결제가 완료되었습니다'
    },
    sub({ orderId, paymentId }) {
      if (orderId != null) return `주문번호 #${orderId}`
      if (paymentId != null) return `결제번호 #${paymentId}`
      return null
    },
    navPath: () => '/tickets',
  },

  GAME_START: {
    message({ homeTeam, awayTeam, gameStartAt }) {
      const teams = homeTeam && awayTeam ? `${homeTeam} vs ${awayTeam} 경기가 ` : '경기가 '
      return teams + formatStartSuffix(gameStartAt)
    },
    sub({ gameId }) {
      return gameId != null ? `경기 #${gameId}` : null
    },
    navPath({ gameId }) {
      return gameId != null ? `/games/${gameId}` : '/'
    },
  },

  TICKET_OPEN: {
    message({ eventName }) {
      return eventName ? `${eventName} 티켓 예매가 오픈되었습니다` : '티켓 예매가 오픈되었습니다'
    },
    sub({ ticketId }) {
      return ticketId != null ? `티켓 #${ticketId}` : null
    },
    navPath: () => '/tickets',
  },

  CHAT_MENTION: {
    message({ senderName, message }) {
      if (senderName && message) return `${senderName}: ${message}`
      if (senderName) return `${senderName}님이 멘션했습니다`
      return '멘션 알림이 있습니다'
    },
    sub({ roomName, roomId }) {
      if (roomName) return roomName
      return roomId != null ? `채팅방 #${roomId}` : null
    },
    navPath({ roomId }) {
      return roomId != null ? `/chat?roomId=${roomId}` : '/chat'
    },
  },
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

function parsePayload<T extends NotificationEventType>(
  eventType: T,
  payload: string,
): ParsedPayload<T> {
  let raw: unknown
  try { raw = JSON.parse(payload) } catch { raw = {} }
  // safeParse: 스키마 불일치 시 빈 객체로 폴백 — 절대 throw하지 않음
  const result = PayloadSchemas[eventType].safeParse(raw)
  return (result.success ? result.data : {}) as ParsedPayload<T>
}

export function formatPayloadMessage(eventType: NotificationEventType, payload: string): string {
  return PAYLOAD_FORMATTERS[eventType].message(parsePayload(eventType, payload) as never)
}

export function formatPayloadSub(eventType: NotificationEventType, payload: string): string | null {
  return PAYLOAD_FORMATTERS[eventType].sub(parsePayload(eventType, payload) as never)
}

export function resolveNavPath(eventType: NotificationEventType, payload: string): string | null {
  return PAYLOAD_FORMATTERS[eventType].navPath(parsePayload(eventType, payload) as never)
}
