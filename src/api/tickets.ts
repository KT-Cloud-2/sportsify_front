import { client } from './client'
import { TicketResponse, ReserveTicketRequest, QueuePositionResponse } from '../types/api'

export const fetchTickets = () =>
  client.get<TicketResponse[]>('/api/tickets').then((r) => r.data)

export const fetchTicket = (ticketId: number) =>
  client.get<TicketResponse>(`/api/tickets/${ticketId}`).then((r) => r.data)

export const reserveTicket = (body: ReserveTicketRequest) =>
  client.post<TicketResponse>('/api/tickets/reserve', body).then((r) => r.data)

export const cancelTicket = (ticketId: number) =>
  client.post<void>(`/api/tickets/${ticketId}/cancel`)

export const enterQueue = (gameId: number, seatId: number) =>
  client.post<void>('/api/tickets/queue/enter', { gameId, seatId })

export const fetchQueuePosition = () =>
  client.get<QueuePositionResponse>('/api/tickets/queue/position').then((r) => r.data)

export const leaveQueue = () =>
  client.delete<void>('/api/tickets/queue/leave')
