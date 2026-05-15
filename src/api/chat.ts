import { client, publicClient } from './client'
import {
  ChatRoomResponse,
  ChatRoomDetailResponse,
  ChatRoomMemberResponse,
  ChatRoomUpdateResponse,
  ChatRoomArchiveResponse,
  ChatRoomListResponse,
  MessageListResponse,
  MessageDeleteResponse,
} from '../types/api'

interface CreateChatRoomRequest {
  type: string
  name?: string
  imageUrl?: string
  gameId?: number
  inviteeIds?: number[]
}

interface ChatRoomGetRequest {
  type?: string
  cursor?: number
  limit?: number
}

interface MessagePageNationRequest {
  cursor?: number
  limit?: number
}

// PUBLIC: /api/chat/rooms/** — SecurityConfig permitAll
export const fetchChatRooms = (params: ChatRoomGetRequest = { limit: 50 }) =>
  publicClient.get<ChatRoomListResponse>('/api/chat/rooms', { params }).then((r) => r.data.items ?? [])

export const fetchChatRoomsByGame = (gameId: number, params: ChatRoomGetRequest = { limit: 50 }) =>
  publicClient.get<ChatRoomListResponse>(`/api/chat/rooms/game/${gameId}`, { params }).then((r) => r.data.items ?? [])

export const fetchChatRoomDetail = (roomId: number) =>
  publicClient.get<ChatRoomDetailResponse>(`/api/chat/rooms/${roomId}`).then((r) => r.data)

// PUBLIC: /api/chat/messages/getMessages/** — SecurityConfig permitAll
export const fetchMessages = (roomId: number, params: MessagePageNationRequest = { limit: 50 }) =>
  publicClient.get<MessageListResponse>(`/api/chat/messages/getMessages/${roomId}`, { params }).then((r) => r.data)

// AUTH: 나머지 채팅 조작은 인증 필요
export const createChatRoom = (body: CreateChatRoomRequest) =>
  client.post<ChatRoomResponse>('/api/chat/rooms', body).then((r) => r.data)

export const updateChatRoom = (roomId: number, body: { name?: string; imageUrl?: string }) =>
  client.patch<ChatRoomUpdateResponse>(`/api/chat/rooms/${roomId}`, body).then((r) => r.data)

export const deleteChatRoom = (roomId: number) =>
  client.delete<void>(`/api/chat/rooms/${roomId}`)

export const archiveChatRoom = (roomId: number) =>
  client.patch<ChatRoomArchiveResponse>(`/api/chat/rooms/${roomId}/archive`).then((r) => r.data)

export const unarchiveChatRoom = (roomId: number) =>
  client.patch<ChatRoomArchiveResponse>(`/api/chat/rooms/${roomId}/unarchive`).then((r) => r.data)

export const joinChatRoom = (roomId: number) =>
  client.post<ChatRoomMemberResponse>(`/api/chat/rooms/${roomId}/join`).then((r) => r.data)

export const leaveChatRoom = (roomId: number) =>
  client.delete<ChatRoomMemberResponse>(`/api/chat/rooms/${roomId}/invite`).then((r) => r.data)

export const inviteToRoom = (roomId: number, inviteeId: number) =>
  client.post<ChatRoomMemberResponse>(`/api/chat/rooms/${roomId}/invite`, null, { params: { inviteeId } }).then((r) => r.data)

export const banFromRoom = (roomId: number, targetId: number) =>
  client.post<ChatRoomMemberResponse>(`/api/chat/rooms/${roomId}/ban`, null, { params: { targetId } }).then((r) => r.data)

export const changeRoomNotification = (roomId: number, enabled: boolean) =>
  client.patch<ChatRoomMemberResponse>(`/api/chat/rooms/${roomId}/notification`, null, { params: { enabled } }).then((r) => r.data)

// AUTH: /api/chat/messages/history/** — 인증 필요
export const fetchMessageHistory = (roomId: number, params: MessagePageNationRequest = { limit: 50 }) =>
  client.get<MessageListResponse>(`/api/chat/messages/history/${roomId}`, { params }).then((r) => r.data)

export const deleteMessage = (messageId: number) =>
  client.delete<MessageDeleteResponse>(`/api/chat/messages/${messageId}`).then((r) => r.data)
