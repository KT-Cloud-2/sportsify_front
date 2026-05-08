import { client } from './client'
import { MemberResponse, FavoriteTeamResponse, UpdateNicknameResponse, MonthlyActivityResponse } from '../types/api'

export const fetchMe = () =>
  client.get<MemberResponse>('/api/members/me').then((r) => r.data)

export const updateNickname = (nickname: string) =>
  client.patch<UpdateNicknameResponse>('/api/members/me/nickname', { nickname }).then((r) => r.data)

export const deleteAccount = () =>
  client.delete<void>('/api/members/me')

export const fetchFavoriteTeams = () =>
  client.get<FavoriteTeamResponse[]>('/api/members/me/favorite-teams').then((r) => r.data)

export const addFavoriteTeam = (teamId: number, priority?: number) =>
  client.post<FavoriteTeamResponse>('/api/members/me/favorite-teams', { teamId, priority }).then((r) => r.data)

export const updateFavoriteTeamPriority = (teamId: number, priority: number) =>
  client.patch<FavoriteTeamResponse>(`/api/members/me/favorite-teams/${teamId}/priority`, { priority }).then((r) => r.data)

export const deleteFavoriteTeam = (teamId: number) =>
  client.delete<void>(`/api/members/me/favorite-teams/${teamId}`)

export const fetchMonthlyActivity = (year?: number, month?: number) =>
  client.get<MonthlyActivityResponse>('/api/members/me/activity/monthly', { params: { year, month } }).then((r) => r.data)
