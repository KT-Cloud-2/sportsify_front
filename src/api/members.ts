import { client } from './client'
import { MemberResponse, FavoriteTeamResponse, UpdateNicknameResponse } from '../types/api'

export const fetchMe = () =>
  client.get<MemberResponse>('/api/members').then((r) => r.data)

export const updateNickname = (nickname: string) =>
  client.patch<UpdateNicknameResponse>('/api/members/nickname', { nickname }).then((r) => r.data)

export const deleteAccount = () =>
  client.delete<void>('/api/members')

export const fetchFavoriteTeams = () =>
  client.get<FavoriteTeamResponse[]>('/api/members/favorite-teams').then((r) => r.data)

export const addFavoriteTeam = (teamId: number, priority?: number) =>
  client.post<FavoriteTeamResponse>('/api/members/favorite-teams', { teamId, priority }).then((r) => r.data)

export const updateFavoriteTeamPriority = (teamId: number, priority: number) =>
  client.patch<FavoriteTeamResponse>(`/api/members/favorite-teams/${teamId}/priority`, { priority }).then((r) => r.data)

export const deleteFavoriteTeam = (teamId: number) =>
  client.delete<void>(`/api/members/favorite-teams/${teamId}`)

// TODO: 백엔드 미구현 — 3주 후 활성화
// export const fetchMonthlyActivity = (year?: number, month?: number) =>
//   client.get<MonthlyActivityResponse>('/api/members/activity/monthly', { params: { year, month } }).then((r) => r.data)
