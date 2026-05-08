import { client } from './client'
import { NotificationResponse } from '../types/api'

interface PageResponse<T> {
  content: T[]
}

export const fetchNotifications = () =>
  client.get<PageResponse<NotificationResponse>>('/api/notifications').then((r) => r.data.content)

export const markRead = (notificationId: number) =>
  client.patch<void>(`/api/notifications/${notificationId}/read`)

export const markAllRead = () =>
  client.patch<void>('/api/notifications/read-all')
