import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchChatRooms,
  fetchChatRoomDetail,
  joinChatRoom,
  leaveChatRoom,
  fetchMessageHistory,
  sendMessage,
  deleteMessage,
} from '../api/chat'

export const useChatRooms = () =>
  useQuery({
    queryKey: ['chatRooms'],
    queryFn: fetchChatRooms,
    throwOnError: false,
  })

export const useChatRoomDetail = (roomId: number) =>
  useQuery({
    queryKey: ['chatRoom', roomId],
    queryFn: () => fetchChatRoomDetail(roomId),
    enabled: roomId > 0,
    throwOnError: false,
  })

export const useJoinChatRoom = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (roomId: number) => joinChatRoom(roomId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chatRooms'] }),
  })
}

export const useLeaveChatRoom = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (roomId: number) => leaveChatRoom(roomId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chatRooms'] }),
  })
}

export const useMessages = (roomId: number) =>
  useQuery({
    queryKey: ['messages', roomId],
    queryFn: () => fetchMessageHistory(roomId),
    enabled: roomId > 0,
    refetchInterval: 3000,
    throwOnError: false,
    select: (data) => data.items,
  })

export const useSendMessage = (roomId: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => sendMessage(roomId, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages', roomId] }),
  })
}

export const useDeleteMessage = (roomId: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (messageId: number) => deleteMessage(messageId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages', roomId] }),
  })
}
