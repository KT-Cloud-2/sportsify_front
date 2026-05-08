import { client } from './client'
import { MemberResponse, FavoriteTeamResponse } from '../types/api'

export const fetchMe = () =>
  client.get<MemberResponse>('/api/members/me').then((r) => r.data)

export const updateNickname = (nickname: string) =>
  client.patch<{ nickname: string }>('/api/members/me/nickname', { nickname }).then((r) => r.data)

export const fetchFavoriteTeams = () =>
  client.get<FavoriteTeamResponse[]>('/api/members/me/favorite-teams').then((r) => r.data)

export const addFavoriteTeam = (teamId: number) =>
  client.post<FavoriteTeamResponse>('/api/members/me/favorite-teams', { teamId }).then((r) => r.data)

export const deleteFavoriteTeam = (teamId: number) =>
  client.delete<void>(`/api/members/me/favorite-teams/${teamId}`)

export const deleteAccount = () =>
  client.delete<void>('/api/members/me')
