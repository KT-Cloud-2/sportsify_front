import { create } from 'zustand'
import { MemberResponse } from '../types/api'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: MemberResponse | null
  setTokens: (accessToken: string, refreshToken: string) => void
  setUser: (user: MemberResponse) => void
  clear: () => void
}

// accessToken: 메모리에만 보관 (탭 종료 시 소멸, XSS 방어)
// refreshToken: localStorage 유지 (새로고침 후 accessToken 재발급용)
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: localStorage.getItem('refreshToken'),
  user: null,
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('refreshToken', refreshToken)
    set({ accessToken, refreshToken })
  },
  setUser: (user) => set({ user }),
  clear: () => {
    localStorage.removeItem('refreshToken')
    set({ accessToken: null, refreshToken: null, user: null })
  },
}))
