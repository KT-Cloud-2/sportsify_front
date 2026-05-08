import { client } from './client'
import { ChatRoomResponse, MessageResponse } from '../types/api'

export const fetchChatRooms = () =>
  client.get<ChatRoomResponse[]>('/api/chat/rooms').then((r) => r.data)

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
