import { useQuery } from '@tanstack/react-query'
import { fetchGames, fetchGameDetail, fetchGameSeats, GamesParams } from '../api/games'

export const useGames = (params?: GamesParams) =>
  useQuery({
    queryKey: ['games', params],
    queryFn: () => fetchGames(params),
  })

export const useGameDetail = (gameId: number) =>
  useQuery({
    queryKey: ['games', gameId],
    queryFn: () => fetchGameDetail(gameId),
    enabled: gameId > 0,
  })

export const useGameSeats = (gameId: number, grade?: string, status?: string) =>
  useQuery({
    queryKey: ['games', gameId, 'seats', grade, status],
    queryFn: () => fetchGameSeats(gameId, grade, status),
    enabled: gameId > 0,
  })
