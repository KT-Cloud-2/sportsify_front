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
    const es = new EventSource(`${baseUrl}/api/notifications/stream?token=${accessToken}`)

    es.addEventListener('notification', (event) => {
      try {
        const notification: NotificationResponse = JSON.parse(event.data)
        qc.setQueryData<NotificationResponse[]>(['notifications'], (prev = []) => [
          notification,
          ...prev,
        ])
      } catch {
        // ignore malformed event
      }
    })

    es.onerror = () => es.close()

    return () => es.close()
  }, [accessToken, qc])
}
