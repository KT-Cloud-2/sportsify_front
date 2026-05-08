import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchTickets,
  fetchTicket,
  reserveTicket,
  cancelTicket,
  enterQueue,
  fetchQueuePosition,
  leaveQueue,
} from '../api/tickets'
import { ReserveTicketRequest } from '../types/api'
import { useAuthStore } from '../store/auth'

export const useTickets = () => {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['tickets'],
    queryFn: fetchTickets,
    enabled: !!accessToken,
    throwOnError: false,
  })
}

export const useTicket = (ticketId: number) =>
  useQuery({
    queryKey: ['tickets', ticketId],
    queryFn: () => fetchTicket(ticketId),
    enabled: ticketId > 0,
    throwOnError: false,
  })

export const useReserveTicket = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: ReserveTicketRequest) => reserveTicket(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }),
  })
}

export const useCancelTicket = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ticketId: number) => cancelTicket(ticketId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }),
  })
}

export const useEnterQueue = () =>
  useMutation({
    mutationFn: ({ gameId, seatId }: { gameId: number; seatId: number }) =>
      enterQueue(gameId, seatId),
  })

export const useQueuePosition = (enabled: boolean) =>
  useQuery({
    queryKey: ['queuePosition'],
    queryFn: fetchQueuePosition,
    enabled,
    refetchInterval: enabled ? 3000 : false,
    throwOnError: false,
  })

export const useLeaveQueue = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: leaveQueue,
    onSuccess: () => qc.removeQueries({ queryKey: ['queuePosition'] }),
  })
}
