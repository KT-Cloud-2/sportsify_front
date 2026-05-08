import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchChatRooms, fetchMessageHistory, sendMessage } from '../api/chat'

export const useChatRooms = () =>
  useQuery({ queryKey: ['chatRooms'], queryFn: fetchChatRooms })

export const useMessages = (roomId: number) =>
  useQuery({
    queryKey: ['messages', roomId],
    queryFn: () => fetchMessageHistory(roomId),
    enabled: roomId > 0,
    refetchInterval: 3000,
  })

export const useSendMessage = (roomId: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => sendMessage(roomId, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages', roomId] }),
  })
}
