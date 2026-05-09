import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
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
} from '../api/notifications'
import { NotificationResponse, UpdateNotificationSettingRequest, RegisterChannelRequest } from '../types/api'
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

export const useNotifications = () => {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    enabled: !!accessToken,
    throwOnError: false,
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

export const useNotificationStream = () => {
  const qc = useQueryClient()
  const accessToken = useAuthStore((s) => s.accessToken)

  useEffect(() => {
    if (!accessToken) return

    const baseUrl = import.meta.env.VITE_API_BASE_URL
    let es: EventSource
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let retryDelay = 1000
    let destroyed = false

    function connect() {
      es = new EventSource(`${baseUrl}/api/notifications/stream?token=${accessToken}`)

      es.addEventListener('notification', (event) => {
        retryDelay = 1000
        try {
          const notification: NotificationResponse = JSON.parse(event.data)
          qc.setQueryData<NotificationResponse[]>(['notifications'], (prev = []) => [
            notification,
            ...prev,
          ])
          sendBrowserNotification(notification)
        } catch {
          // ignore malformed event
        }
      })

      es.onerror = () => {
        es.close()
        if (destroyed) return
        retryTimer = setTimeout(() => {
          retryDelay = Math.min(retryDelay * 2, 30000)
          connect()
        }, retryDelay)
      }
    }

    connect()

    return () => {
      destroyed = true
      if (retryTimer) clearTimeout(retryTimer)
      es.close()
    }
  }, [accessToken, qc])
}
