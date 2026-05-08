import { client } from './client'
import { NotificationResponse } from '../types/api'

export const fetchNotifications = () =>
  client.get<NotificationResponse[]>('/api/notifications').then((r) => r.data)

export const markRead = (notificationId: number) =>
  client.patch<void>(`/api/notifications/${notificationId}/read`)

export const markAllRead = () =>
  client.patch<void>('/api/notifications/read-all')
