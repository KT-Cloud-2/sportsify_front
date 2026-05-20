import { client } from './client'
import {ReservationSeatsRequestDto, ReservationSeatsResponseDto, TicketListResponseDto} from '../types/api'

export const reserveSeats = (body: ReservationSeatsRequestDto) =>
  client.post<ReservationSeatsResponseDto>('/api/seats/reservations', body).then((r) => r.data)

export const fetchMyTickets = (page: number = 0, size: number = 10) =>
    client.get<TicketListResponseDto>('/api/tickets', { params: { page, size } }).then((r) => r.data)