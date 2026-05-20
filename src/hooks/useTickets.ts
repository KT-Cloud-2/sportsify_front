import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reserveSeats, fetchMyTickets } from '../api/tickets'
import { ReservationSeatsRequestDto } from '../types/api'

export const useReserveSeats = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: ReservationSeatsRequestDto) => reserveSeats(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reservations'] }),
  })
}

export const useMyTickets = (page: number = 0, size: number = 10) =>
    useQuery({
      queryKey: ['tickets', page, size],
      queryFn: () => fetchMyTickets(page, size),
    })