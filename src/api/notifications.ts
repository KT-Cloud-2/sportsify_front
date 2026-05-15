import { client } from './client'
import {
  NotificationResponse,
  PageNotificationResponse,
  NotificationSettingResponse,
  UpdateNotificationSettingRequest,
  NotificationChannelResponse,
  RegisterChannelRequest,
} from '../types/api'

export const fetchNotifications = (page = 0, size = 20) =>
  client
    .get<PageNotificationResponse>('/api/notifications', { params: { page, size } })
    .then((r) => r.data)

export const markRead = (notificationId: number) =>
  client.patch<void>(`/api/notifications/${notificationId}/read`)

export const markAllRead = () =>
  client.patch<void>('/api/notifications/read-all')

export const fetchNotificationSetting = () =>
  client.get<NotificationSettingResponse>('/api/notifications/settings').then((r) => r.data)

export const updateNotificationSetting = (body: UpdateNotificationSettingRequest) =>
  client.put<NotificationSettingResponse>('/api/notifications/settings', body).then((r) => r.data)

export const fetchNotificationChannels = () =>
  client.get<NotificationChannelResponse[]>('/api/notifications/channels').then((r) => r.data)

export const registerNotificationChannel = (body: RegisterChannelRequest) =>
  client.post<NotificationChannelResponse>('/api/notifications/channels', body).then((r) => r.data)

export const deleteNotificationChannel = (channelId: number) =>
  client.delete<void>(`/api/notifications/channels/${channelId}`)

export const toggleNotificationChannel = (channelId: number) =>
  client.patch<NotificationChannelResponse>(`/api/notifications/channels/${channelId}/toggle`).then((r) => r.data)

// 백엔드 JwtAuthenticationFilter가 SSE 요청 시 ?token= 쿼리 파라미터를 지원
export const getNotificationStreamUrl = (accessToken: string) =>
  `/api/notifications/stream?token=${encodeURIComponent(accessToken)}`
