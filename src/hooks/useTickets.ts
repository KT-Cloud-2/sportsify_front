import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reserveSeats } from '../api/tickets'
import { ReservationSeatsRequestDto } from '../types/api'

export const useReserveSeats = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: ReservationSeatsRequestDto) => reserveSeats(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reservations'] }),
  })
}
