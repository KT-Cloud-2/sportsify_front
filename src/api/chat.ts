import { client, publicClient } from './client'
import {
  ChatRoomResponse,
  ChatRoomSummaryResponse,
  ChatRoomByGameResponse,
  ChatRoomDetailResponse,
  ChatRoomMemberResponse,
  ChatRoomMemberInvitesResponse,
  ChatRoomUpdateResponse,
  ChatRoomArchiveResponse,
  ChatRoomSummaryListResponse,
  ChatRoomByGameListResponse,
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

interface ChatRoomPageParams {
  cursor?: number
  limit?: number
}

interface MessagePageNationRequest {
  cursor?: number
  limit?: number
}

// AUTH: GET /api/chat/rooms — type은 @NotBlank 필수
export const fetchChatRooms = (type: 'GAME' | 'DIRECT', params: ChatRoomPageParams = { limit: 20 }): Promise<ChatRoomSummaryResponse[]> =>
  client.get<ChatRoomSummaryListResponse>('/api/chat/rooms', { params: { type, ...params } }).then((r) => r.data.items ?? [])

// PUBLIC: GET /api/chat/rooms/game/{gameId}
export const fetchChatRoomsByGame = (gameId: number, params: ChatRoomPageParams = { limit: 20 }): Promise<ChatRoomByGameResponse[]> =>
  publicClient.get<ChatRoomByGameListResponse>(`/api/chat/rooms/game/${gameId}`, { params }).then((r) => r.data.items ?? [])

// 공개 엔드포인트지만 myMembership 필드는 인증 토큰이 있어야 채워짐
export const fetchChatRoomDetail = (roomId: number) =>
  client.get<ChatRoomDetailResponse>(`/api/chat/rooms/${roomId}`).then((r) => r.data)

// AUTH: Bearer 토큰 필요
export const fetchMessages = (roomId: number, params: MessagePageNationRequest = { limit: 50 }) =>
  client.get<MessageListResponse>(`/api/chat/messages/getMessages/${roomId}`, { params }).then((r) => r.data)

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
  client.delete<ChatRoomMemberResponse>(`/api/chat/rooms/${roomId}/leave`).then((r) => r.data)

export const inviteToRoom = (roomId: number, inviteeId: number) =>
  client.post<ChatRoomMemberResponse>(`/api/chat/rooms/${roomId}/invite`, null, { params: { inviteeId } }).then((r) => r.data)

export const fetchMyInvites = () =>
  client.get<ChatRoomMemberInvitesResponse>('/api/chat/rooms/getMyInvites').then((r) => r.data)

export const rejectChatRoom = (roomId: number) =>
  client.post<void>(`/api/chat/rooms/${roomId}/reject`)

export const banFromRoom = (roomId: number, targetId: number) =>
  client.post<ChatRoomMemberResponse>(`/api/chat/rooms/${roomId}/ban`, null, { params: { targetId } }).then((r) => r.data)

export const changeRoomNotification = (roomId: number, enabled: boolean) =>
  client.patch<ChatRoomMemberResponse>(`/api/chat/rooms/${roomId}/notification`, null, { params: { enabled } }).then((r) => r.data)

// AUTH: /api/chat/messages/history/** — 인증 필요
export const fetchMessageHistory = (roomId: number, params: MessagePageNationRequest = { limit: 50 }) =>
  client.get<MessageListResponse>(`/api/chat/messages/history/${roomId}`, { params }).then((r) => r.data)

export const deleteMessage = (messageId: number) =>
  client.delete<MessageDeleteResponse>(`/api/chat/messages/${messageId}`).then((r) => r.data)
