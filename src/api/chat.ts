import { client } from './client'
import { ChatRoomResponse, ChatRoomDetailResponse, ChatRoomMembershipResponse, MessageResponse, MessageListResponse } from '../types/api'

interface ChatRoomListResponse {
  items: ChatRoomResponse[]
  nextCursor: number | null
  hasNext: boolean
  totalCount: number
}

interface CreateChatRoomRequest {
  type: string
  name: string
  imageUrl?: string
  gameId?: number
  inviteeIds?: number[]
}

// GET /api/chat/rooms requires @RequestBody with type field
export const fetchChatRooms = () =>
  client.get<ChatRoomListResponse>('/api/chat/rooms', {
    data: { type: 'GAME', limit: 50 },
  }).then((r) => r.data.items ?? [])

export const fetchChatRoomByGame = (gameId: number) =>
  client.get<ChatRoomListResponse>(`/api/chat/rooms/game/${gameId}`).then((r) => r.data.items ?? [])

export const fetchChatRoomDetail = (roomId: number) =>
  client.get<ChatRoomDetailResponse>(`/api/chat/rooms/${roomId}`).then((r) => r.data)

export const createChatRoom = (body: CreateChatRoomRequest) =>
  client.post<ChatRoomResponse>('/api/chat/rooms', body).then((r) => r.data)

export const joinChatRoom = (roomId: number) =>
  client.post<ChatRoomMembershipResponse>(`/api/chat/rooms/${roomId}/join`).then((r) => r.data)

export const leaveChatRoom = (roomId: number) =>
  client.delete<void>(`/api/chat/rooms/${roomId}/invite`)

export const fetchMessageHistory = (roomId: number, cursor?: number, limit = 50) =>
  client.get<MessageListResponse>(`/api/chat/messages/history/${roomId}`, {
    data: { cursor, limit },
  }).then((r) => r.data)

export const sendMessage = (roomId: number, content: string) =>
  client.post<MessageResponse>('/api/chat/messages', { roomId, content }).then((r) => r.data)

export const deleteMessage = (messageId: number) =>
  client.delete<void>(`/api/chat/messages/${messageId}`)
