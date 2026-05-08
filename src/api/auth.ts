import { client } from './client'
import { AuthTokens } from '../types/api'

export const refreshToken = (refreshToken: string) =>
  client.post<AuthTokens>('/api/auth/token/refresh', { refreshToken }).then((r) => r.data)

export const logout = (accessToken: string, refreshToken: string) =>
  client.post<void>('/api/auth/logout', { refreshToken }, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
