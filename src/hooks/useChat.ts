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
  fetchMyInvites,
  rejectChatRoom,
} from '../api/chat'
import { useAuthStore } from '../store/auth'

export const useChatRooms = (type: 'GAME' | 'DIRECT') => {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['chatRooms', type],
    queryFn: () => fetchChatRooms(type),
    enabled: !!accessToken,
    throwOnError: false,
  })
}

export const useAllChatRooms = () => {
  const gameQuery = useChatRooms('GAME')
  const directQuery = useChatRooms('DIRECT')
  return {
    data: [...(gameQuery.data ?? []), ...(directQuery.data ?? [])],
    isLoading: gameQuery.isLoading || directQuery.isLoading,
  }
}

export const useChatRoomsByGame = (gameId: number) => {
  return useQuery({
    queryKey: ['chatRooms', 'game', gameId],
    queryFn: () => fetchChatRoomsByGame(gameId),
    enabled: gameId > 0,
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
    onSuccess: (_, roomId) => {
      qc.invalidateQueries({ queryKey: ['chatRoom', roomId] })
      qc.invalidateQueries({ queryKey: ['chatRooms'] })
      qc.invalidateQueries({ queryKey: ['chatInvites'] })
    },
  })
}

export const useLeaveChatRoom = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (roomId: number) => leaveChatRoom(roomId),
    onSuccess: (_, roomId) => {
      qc.invalidateQueries({ queryKey: ['chatRoom', roomId] })
      qc.invalidateQueries({ queryKey: ['chatRooms'] })
    },
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
    select: (data) => data.messages,
  })
}

export const useMessages = (roomId: number) => {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['messages', roomId],
    queryFn: () => fetchMessages(roomId),
    enabled: !!accessToken && roomId > 0,
    throwOnError: false,
    select: (data) => ({
      ...data,
      messages: [...(data.messages ?? [])].sort((a, b) => a.messageId - b.messageId),
    }),
  })
}

export const useMyInvites = () => {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['chatInvites'],
    queryFn: fetchMyInvites,
    enabled: !!accessToken,
    select: (data) => data.invites,
    refetchInterval: 30_000,
  })
}

export const useRejectChatRoom = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (roomId: number) => rejectChatRoom(roomId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chatInvites'] }),
  })
}

export const useDeleteMessage = (roomId: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (messageId: number) => deleteMessage(messageId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages', roomId] }),
  })
}
