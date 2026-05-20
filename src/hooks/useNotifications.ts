import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { publicClient } from '../api/client'
import {
  fetchNotifications,
  markRead,
  markAllRead,
  fetchNotificationSetting,
  updateNotificationSetting,
  fetchNotificationChannels,
  registerNotificationChannel,
  deleteNotificationChannel,
  toggleNotificationChannel,
  getNotificationStreamUrl,
} from '../api/notifications'
import { NotificationResponse, PageNotificationResponse, UpdateNotificationSettingRequest, RegisterChannelRequest } from '../types/api'
import { useAuthStore } from '../store/auth'
import { EVENT_LABEL, EVENT_ICON, formatPayloadMessage } from '../utils/notificationPayload'

function sendBrowserNotification(n: NotificationResponse) {
  if (typeof Notification === 'undefined') return
  if (Notification.permission !== 'granted') return

  const title = `${EVENT_ICON[n.eventType]} ${EVENT_LABEL[n.eventType]}`
  const body = formatPayloadMessage(n.eventType, n.payload)

  new Notification(title, {
    body,
    icon: '/logo.svg',
    tag: String(n.id),    // 같은 tag면 중복 알림 대체
  })
}

export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (typeof Notification === 'undefined') return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return Notification.requestPermission()
}

export const useNotifications = (page = 0, size = 20) => {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['notifications', page, size],
    queryFn: () => fetchNotifications(page, size),
    enabled: !!accessToken,
    throwOnError: false,
    select: (data: PageNotificationResponse) => data.content,
  })
}

export const useMarkRead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export const useMarkAllRead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export const useNotificationsPage = (page = 0, size = 20) => {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['notifications', 'page', page, size],
    queryFn: () => fetchNotifications(page, size),
    enabled: !!accessToken,
    throwOnError: false,
  })
}

export const useNotificationSetting = () => {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['notification-setting'],
    queryFn: fetchNotificationSetting,
    enabled: !!accessToken,
    throwOnError: false,
  })
}

export const useUpdateNotificationSetting = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateNotificationSettingRequest) => updateNotificationSetting(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notification-setting'] }),
  })
}

export const useNotificationChannels = () => {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['notification-channels'],
    queryFn: fetchNotificationChannels,
    enabled: !!accessToken,
    throwOnError: false,
  })
}

export const useRegisterNotificationChannel = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: RegisterChannelRequest) => registerNotificationChannel(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notification-channels'] }),
  })
}

export const useDeleteNotificationChannel = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (channelId: number) => deleteNotificationChannel(channelId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notification-channels'] }),
  })
}

export const useToggleNotificationChannel = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (channelId: number) => toggleNotificationChannel(channelId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notification-channels'] }),
  })
}

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, setTokens, clear } = useAuthStore.getState()
  if (!refreshToken) return null
  try {
    const { data } = await publicClient.post('/api/auth/token/refresh', { refreshToken })
    setTokens(data.accessToken, data.refreshToken)
    return data.accessToken as string
  } catch {
    clear()
    return null
  }
}

// 백엔드가 SSE ?token= 쿼리 파라미터를 지원하므로 EventSource 사용
export const useNotificationStream = () => {
  const qc = useQueryClient()
  const accessToken = useAuthStore((s) => s.accessToken)

  useEffect(() => {
    if (!accessToken) return

    let es: EventSource
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let retryDelay = 2000
    let destroyed = false

    async function connect() {
      let token = useAuthStore.getState().accessToken
      if (!token) return

      es = new EventSource(getNotificationStreamUrl(token))

      es.addEventListener('notification', (e) => {
        retryDelay = 2000
        try {
          const notification: NotificationResponse = JSON.parse(e.data)
          qc.invalidateQueries({ queryKey: ['notifications'] })
          sendBrowserNotification(notification)
        } catch {
          // malformed event 무시
        }
      })

      es.onerror = () => {
        es.close()
        if (destroyed) return
        retryTimer = setTimeout(async () => {
          retryDelay = Math.min(retryDelay * 2, 30000)
          // 토큰 만료로 끊겼을 수 있으므로 재연결 전 갱신 시도
          const fresh = await refreshAccessToken()
          if (!fresh) return  // refreshToken도 만료 → clear() 호출됨
          connect()
        }, retryDelay)
      }
    }

    connect()

    return () => {
      destroyed = true
      if (retryTimer) clearTimeout(retryTimer)
      es?.close()
    }
  }, [accessToken, qc])
}
