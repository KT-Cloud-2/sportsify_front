import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchMe, fetchFavoriteTeams, addFavoriteTeam, deleteFavoriteTeam } from '../api/members'

export const useMe = () =>
  useQuery({ queryKey: ['me'], queryFn: fetchMe })

export const useFavoriteTeams = () =>
  useQuery({ queryKey: ['favoriteTeams'], queryFn: fetchFavoriteTeams })

export const useAddFavoriteTeam = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (teamId: number) => addFavoriteTeam(teamId),
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
