import { client } from './client'
import { ReservationSeatsRequestDto, ReservationSeatsResponseDto } from '../types/api'

export const reserveSeats = (body: ReservationSeatsRequestDto) =>
  client.post<ReservationSeatsResponseDto>('/api/seats/reservations', body).then((r) => r.data)
