import { publicClient as client } from './client'
import {
  GameListResponseDto,
  GameDetailResponseDto,
  GameSeatListResponseDto,
} from '../types/api'

export interface GamesParams {
  sportType?: string
  teamId?: number
  status?: string
  from?: string
  to?: string
}

export const fetchGames = (params?: GamesParams) =>
  client.get<GameListResponseDto[]>('/api/games', { params }).then((r) => r.data)

export const fetchGameDetail = (gameId: number) =>
  client.get<GameDetailResponseDto>(`/api/games/${gameId}`).then((r) => r.data)

export const fetchGameSeats = (gameId: number, grade?: string, status?: string) =>
  client.get<GameSeatListResponseDto[]>(`/api/games/${gameId}/seats`, {
    params: { grade, status },
  }).then((r) => r.data)
