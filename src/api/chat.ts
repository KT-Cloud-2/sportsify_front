import { client } from './client'
import { ChatRoomResponse, MessageResponse } from '../types/api'

interface ChatRoomListResponse {
  items: ChatRoomResponse[]
  nextCursor: number | null
  hasNext: boolean
  totalCount: number
}

// GET /api/chat/rooms 은 @RequestBody로 type 필드를 요구함
export const fetchChatRooms = () =>
  client.get<ChatRoomListResponse>('/api/chat/rooms', {
    data: { type: 'GAME', limit: 50 },
  }).then((r) => r.data.items ?? [])

export const fetchChatRoomByGame = (gameId: number) =>
  client.get<ChatRoomResponse>(`/api/chat/rooms/game/${gameId}`).then((r) => r.data)

export const createChatRoom = (name: string, gameId?: number) =>
  client.post<ChatRoomResponse>('/api/chat/rooms', { name, gameId }).then((r) => r.data)

export const fetchMessageHistory = (roomId: number, page = 0, size = 50) =>
  client.get<MessageResponse[]>(`/api/chat/messages/history/${roomId}`, {
    params: { page, size },
  }).then((r) => r.data)

export const sendMessage = (roomId: number, content: string) =>
  client.post<MessageResponse>('/api/chat/messages', { roomId, content }).then((r) => r.data)

export const joinChatRoom = (roomId: number) =>
  client.post<void>(`/api/chat/rooms/${roomId}/join`)
