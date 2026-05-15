import { publicClient as client } from './client'
import { TeamResponse } from '../types/api'

export const fetchTeams = (sportType?: string, isActive?: boolean) =>
  client.get<TeamResponse[]>('/api/teams', { params: { sportType, isActive } }).then((r) => r.data)

export const fetchTeam = (teamId: number) =>
  client.get<TeamResponse>(`/api/teams/${teamId}`).then((r) => r.data)
