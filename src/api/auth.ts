import { client, publicClient } from './client'
import { AuthTokens } from '../types/api'

// PUBLIC: /api/auth/** — SecurityConfig permitAll
export const refreshToken = (refreshToken: string) =>
  publicClient.post<AuthTokens>('/api/auth/token/refresh', { refreshToken }).then((r) => r.data)

// AUTH: 로그아웃은 인증된 사용자만 (interceptor가 Bearer 주입)
export const logout = (refreshToken: string) =>
  client.post<void>('/api/auth/logout', { refreshToken })
