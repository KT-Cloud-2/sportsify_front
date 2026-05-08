import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { fetchNotifications, markRead, markAllRead } from '../api/notifications'
import { NotificationResponse } from '../types/api'
import { useAuthStore } from '../store/auth'

export const useNotifications = () =>
  useQuery({ queryKey: ['notifications'], queryFn: fetchNotifications })

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

export const useNotificationStream = () => {
  const qc = useQueryClient()
  const accessToken = useAuthStore((s) => s.accessToken)

  useEffect(() => {
    if (!accessToken) return

    const baseUrl = import.meta.env.VITE_API_BASE_URL
    const es = new EventSource(`${baseUrl}/api/notifications/stream?token=${accessToken}`)

    es.onmessage = (event) => {
      const notification: NotificationResponse = JSON.parse(event.data)
      qc.setQueryData<NotificationResponse[]>(['notifications'], (prev = []) => [
        notification,
        ...prev,
      ])
    }

    es.onerror = () => es.close()

    return () => es.close()
  }, [accessToken, qc])
}
