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

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  user: null,
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    set({ accessToken, refreshToken })
  },
  setUser: (user) => set({ user }),
  clear: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    set({ accessToken: null, refreshToken: null, user: null })
  },
}))
