import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchChatRooms,
  fetchChatRoomsByGame,
  fetchChatRoomDetail,
  createChatRoom,
  updateChatRoom,
  deleteChatRoom,
  archiveChatRoom,
  unarchiveChatRoom,
  joinChatRoom,
  leaveChatRoom,
  inviteToRoom,
  banFromRoom,
  changeRoomNotification,
  fetchMessageHistory,
  fetchMessages,
  deleteMessage,
} from '../api/chat'
import { useAuthStore } from '../store/auth'

export const useChatRooms = () => {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['chatRooms'],
    queryFn: () => fetchChatRooms(),
    enabled: !!accessToken,
    throwOnError: false,
  })
}

export const useChatRoomsByGame = (gameId: number) => {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['chatRooms', 'game', gameId],
    queryFn: () => fetchChatRoomsByGame(gameId),
    enabled: !!accessToken && gameId > 0,
    throwOnError: false,
  })
}

export const useChatRoomDetail = (roomId: number) => {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['chatRoom', roomId],
    queryFn: () => fetchChatRoomDetail(roomId),
    enabled: !!accessToken && roomId > 0,
    throwOnError: false,
  })
}

export const useCreateChatRoom = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createChatRoom,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chatRooms'] }),
  })
}

export const useUpdateChatRoom = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ roomId, body }: { roomId: number; body: { name?: string; imageUrl?: string } }) =>
      updateChatRoom(roomId, body),
    onSuccess: (_, { roomId }) => qc.invalidateQueries({ queryKey: ['chatRoom', roomId] }),
  })
}

export const useDeleteChatRoom = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (roomId: number) => deleteChatRoom(roomId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chatRooms'] }),
  })
}

export const useArchiveChatRoom = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (roomId: number) => archiveChatRoom(roomId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chatRooms'] }),
  })
}

export const useUnarchiveChatRoom = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (roomId: number) => unarchiveChatRoom(roomId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chatRooms'] }),
  })
}

export const useJoinChatRoom = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (roomId: number) => joinChatRoom(roomId),
    onSuccess: (_, roomId) => qc.invalidateQueries({ queryKey: ['chatRoom', roomId] }),
  })
}

export const useLeaveChatRoom = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (roomId: number) => leaveChatRoom(roomId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chatRooms'] }),
  })
}

export const useInviteToRoom = () =>
  useMutation({
    mutationFn: ({ roomId, inviteeId }: { roomId: number; inviteeId: number }) =>
      inviteToRoom(roomId, inviteeId),
  })

export const useBanFromRoom = () =>
  useMutation({
    mutationFn: ({ roomId, targetId }: { roomId: number; targetId: number }) =>
      banFromRoom(roomId, targetId),
  })

export const useChangeRoomNotification = () =>
  useMutation({
    mutationFn: ({ roomId, enabled }: { roomId: number; enabled: boolean }) =>
      changeRoomNotification(roomId, enabled),
  })

export const useMessageHistory = (roomId: number) => {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['messages', 'history', roomId],
    queryFn: () => fetchMessageHistory(roomId),
    enabled: !!accessToken && roomId > 0,
    throwOnError: false,
    select: (data) => data.items,
  })
}

export const useMessages = (roomId: number) => {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['messages', roomId],
    queryFn: () => fetchMessages(roomId),
    enabled: !!accessToken && roomId > 0,
    refetchInterval: 3000,
    throwOnError: false,
    select: (data) => data.items,
  })
}

export const useDeleteMessage = (roomId: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (messageId: number) => deleteMessage(messageId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages', roomId] }),
  })
}
