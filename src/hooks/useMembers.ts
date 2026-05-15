import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchMe,
  updateNickname,
  deleteAccount,
  fetchFavoriteTeams,
  addFavoriteTeam,
  updateFavoriteTeamPriority,
  deleteFavoriteTeam,
  fetchMonthlyActivity,
} from '../api/members'
import { fetchTeams } from '../api/teams'

export const useMe = () =>
  useQuery({ queryKey: ['me'], queryFn: fetchMe })

export const useUpdateNickname = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (nickname: string) => updateNickname(nickname),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  })
}

export const useDeleteAccount = () =>
  useMutation({ mutationFn: deleteAccount })

export const useFavoriteTeams = () =>
  useQuery({ queryKey: ['favoriteTeams'], queryFn: fetchFavoriteTeams })

export const useAddFavoriteTeam = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ teamId, priority }: { teamId: number; priority?: number }) =>
      addFavoriteTeam(teamId, priority),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favoriteTeams'] }),
  })
}

export const useUpdateFavoriteTeamPriority = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ teamId, priority }: { teamId: number; priority: number }) =>
      updateFavoriteTeamPriority(teamId, priority),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favoriteTeams'] }),
  })
}

export const useDeleteFavoriteTeam = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (teamId: number) => deleteFavoriteTeam(teamId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favoriteTeams'] }),
  })
}

export const useTeams = (sportType?: string) =>
  useQuery({
    queryKey: ['teams', sportType],
    queryFn: () => fetchTeams(sportType, true),
  })

export const useMonthlyActivity = (_year?: number, _month?: number) =>
  useQuery({
    queryKey: ['monthlyActivity'],
    queryFn: (): never => { throw new Error('not implemented') },
    enabled: false,
    throwOnError: false,
  })
