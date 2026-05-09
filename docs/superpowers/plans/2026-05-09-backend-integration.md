# Sportify Frontend — Backend Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vite + React SPA를 생성하고 Sortsify 백엔드(localhost:8080)와 인증·경기·채팅·알림 4개 도메인을 연동한다.

**Architecture:** `api/` (axios 함수) → `hooks/` (react-query) → `components/` (UI) → `pages/` (라우트) 3레이어 엄수. 기존 `ui_kits/sports_ticketing/sportify-screens.jsx` 디자인을 그대로 포팅하여 하드코딩 데이터만 실제 API로 교체한다.

**Tech Stack:** Vite 5, React 18, TypeScript 5 (strict), TanStack Query v5, axios, zustand, react-router-dom v6, EventSource (native SSE)

---

## File Map

### 신규 생성

| 파일 | 책임 |
|------|------|
| `vite.config.ts` | /api/* → localhost:8080 프록시 |
| `src/main.tsx` | 앱 진입점 |
| `src/App.tsx` | 라우터 설정 |
| `src/styles/tokens.ts` | UI 키트 색상/스타일 토큰 |
| `src/types/api.ts` | 백엔드 DTO 타입 전체 |
| `src/api/client.ts` | axios 인스턴스, interceptor, refresh |
| `src/api/auth.ts` | /api/auth 함수 |
| `src/api/games.ts` | /api/games 함수 |
| `src/api/teams.ts` | /api/teams 함수 |
| `src/api/members.ts` | /api/members 함수 |
| `src/api/chat.ts` | /api/chat/rooms, /api/chat/messages 함수 |
| `src/api/notifications.ts` | /api/notifications 함수 |
| `src/store/auth.ts` | zustand: accessToken, refreshToken, user |
| `src/hooks/useGames.ts` | 경기 목록/상세/좌석 react-query |
| `src/hooks/useAuth.ts` | 인증 상태, logout |
| `src/hooks/useMembers.ts` | 내 정보, 선호팀 |
| `src/hooks/useChat.ts` | 채팅방 목록, 메시지 |
| `src/hooks/useNotifications.ts` | 알림 목록, SSE 스트림 |
| `src/components/Badge.tsx` | UI 키트 Badge 포팅 |
| `src/components/Btn.tsx` | UI 키트 Btn 포팅 |
| `src/components/NavBar.tsx` | UI 키트 NavBar 포팅 |
| `src/components/GameCard.tsx` | UI 키트 MatchCard → 실제 GameListResponseDto |
| `src/components/SeatMap.tsx` | UI 키트 SeatMap → 실제 GameSeatListResponseDto |
| `src/components/ChatPanel.tsx` | UI 키트 ChatPanel → 실제 메시지 |
| `src/pages/LoginPage.tsx` | OAuth 버튼, 콜백 처리 |
| `src/pages/HomePage.tsx` | 경기 목록 |
| `src/pages/GameDetailPage.tsx` | 경기 상세 + 좌석 선택 |
| `src/pages/ChatPage.tsx` | 팀 채팅 |
| `src/pages/MyPage.tsx` | 내 정보, 선호팀 |

---

## Task 1: Vite + React 프로젝트 초기화

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/main.tsx`

- [ ] **Step 1: 프로젝트 스캐폴드**

```bash
cd /Users/kang/gitdir/kt_cloud/sportify_front
npm create vite@latest . -- --template react-ts
```

선택: `React` → `TypeScript`

- [ ] **Step 2: 의존성 설치**

```bash
npm install @tanstack/react-query axios zustand react-router-dom
npm install -D @types/react @types/react-dom
```

- [ ] **Step 3: vite.config.ts — 프록시 설정**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/oauth2': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/login': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
```

- [ ] **Step 4: tsconfig.json — strict 설정 확인**

`tsconfig.json`에 아래 옵션이 있는지 확인, 없으면 추가:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

- [ ] **Step 5: 빌드 확인**

```bash
npm run build
```

Expected: `dist/` 생성, 오류 없음

- [ ] **Step 6: 커밋**

```bash
git add package.json vite.config.ts tsconfig.json index.html src/
git commit -m "feat: init vite react-ts project with backend proxy"
```

---

## Task 2: 스타일 토큰 + 타입 정의

**Files:**
- Create: `src/styles/tokens.ts`
- Create: `src/types/api.ts`

- [ ] **Step 1: 색상 토큰 추출**

`src/styles/tokens.ts`:

```ts
export const C = {
  dark: '#171A2C',
  card: '#1C2030',
  elevated: '#2A2F45',
  teal: '#5DBBA0',
  tealLight: '#DBF9E8',
  deep: '#0E2421',
  red: '#E8003D',
  green: '#1B6B3A',
  orange: '#F97316',
  purple: '#7B2FBE',
  border: '#3D4464',
  fg1: '#FFFFFF',
  fg2: '#C8CCDA',
  fg3: '#8B93B0',
  fg4: '#5A6280',
  success: '#3ECF8E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
} as const
```

- [ ] **Step 2: API 타입 정의**

`src/types/api.ts`:

```ts
// Auth
export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

// Member
export interface MemberResponse {
  memberId: number
  email: string
  nickname: string
  createdAt: string
}

export interface FavoriteTeamResponse {
  favoriteTeamId: number
  teamId: number
  teamName: string
  shortName: string | null
  sportType: string
  priority: number
}

// Team
export interface TeamResponse {
  teamId: number
  name: string
  shortName: string | null
  sportType: string
  isActive: boolean
}

// Game
export type TeamSide = 'HOME' | 'AWAY'

export interface TeamInfo {
  teamId: number
  name: string
  shortName: string | null
  side: TeamSide
}

export interface SeatGradeSummary {
  grade: string
  price: number
  available: number
}

export interface GameListResponseDto {
  gameId: number
  sportType: string
  teams: TeamInfo[]
  gameTime: string
  stadium: string
  status: string
  totalSeats: number
  availableSeats: number
  isRivalMatch: boolean
}

export interface GameDetailResponseDto {
  gameId: number
  sportType: string
  teams: TeamInfo[]
  gameTime: string
  venue: string
  status: string
  totalSeats: number
  availableSeats: number
  isRivalMatch: boolean
  seatGradeSummary: SeatGradeSummary[]
}

export interface GameSeatListResponseDto {
  seatId: number
  grade: string
  section: string
  rowNumber: string
  seatNumber: string
  price: number
  status: string
}

// Chat
export interface ChatRoomResponse {
  roomId: number
  type: string
  gameId: number | null
  name: string
  imageUrl: string | null
  createdBy: number
  createdAt: string
}

export interface MessageResponse {
  messageId: number
  senderId: number
  type: string
  content: string
  createdAt: string
}

// Notification
export type NotificationEventType =
  | 'TICKET_OPEN'
  | 'GAME_START'
  | 'PAYMENT_COMPLETED'
  | 'CHAT_MENTION'

export interface NotificationResponse {
  id: number
  eventType: NotificationEventType
  payload: string
  read: boolean
  createdAt: string
}
```

- [ ] **Step 3: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 4: 커밋**

```bash
git add src/styles/tokens.ts src/types/api.ts
git commit -m "feat: add style tokens and api type definitions"
```

---

## Task 3: axios 클라이언트 + auth store

**Files:**
- Create: `src/store/auth.ts`
- Create: `src/api/client.ts`

- [ ] **Step 1: zustand auth store**

`src/store/auth.ts`:

```ts
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
```

- [ ] **Step 2: axios 클라이언트 + interceptor**

`src/api/client.ts`:

```ts
import axios from 'axios'
import { useAuthStore } from '../store/auth'

export const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }
    original._retry = true

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`
          resolve(client(original))
        })
      })
    }

    isRefreshing = true
    const { refreshToken, setTokens, clear } = useAuthStore.getState()

    try {
      const { data } = await axios.post('/api/auth/token/refresh', { refreshToken })
      setTokens(data.accessToken, data.refreshToken)
      refreshQueue.forEach((cb) => cb(data.accessToken))
      refreshQueue = []
      original.headers.Authorization = `Bearer ${data.accessToken}`
      return client(original)
    } catch {
      clear()
      window.location.href = '/login'
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  }
)
```

- [ ] **Step 3: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 4: 커밋**

```bash
git add src/store/auth.ts src/api/client.ts
git commit -m "feat: add axios client with jwt interceptor and auth store"
```

---

## Task 4: API 함수 레이어

**Files:**
- Create: `src/api/auth.ts`
- Create: `src/api/games.ts`
- Create: `src/api/teams.ts`
- Create: `src/api/members.ts`
- Create: `src/api/chat.ts`
- Create: `src/api/notifications.ts`

- [ ] **Step 1: auth API**

`src/api/auth.ts`:

```ts
import { client } from './client'
import { AuthTokens } from '../types/api'

export const refreshToken = (refreshToken: string) =>
  client.post<AuthTokens>('/auth/token/refresh', { refreshToken }).then((r) => r.data)

export const logout = (accessToken: string, refreshToken: string) =>
  client.post<void>('/auth/logout', { refreshToken }, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
```

- [ ] **Step 2: games API**

`src/api/games.ts`:

```ts
import { client } from './client'
import {
  GameListResponseDto,
  GameDetailResponseDto,
  GameSeatListResponseDto,
} from '../types/api'

export interface GamesParams {
  sportType?: string
  teamId?: number
  status?: string
  from?: string
  to?: string
}

export const fetchGames = (params?: GamesParams) =>
  client.get<GameListResponseDto[]>('/games', { params }).then((r) => r.data)

export const fetchGameDetail = (gameId: number) =>
  client.get<GameDetailResponseDto>(`/games/${gameId}`).then((r) => r.data)

export const fetchGameSeats = (gameId: number, grade?: string, status?: string) =>
  client.get<GameSeatListResponseDto[]>(`/games/${gameId}/seats`, {
    params: { grade, status },
  }).then((r) => r.data)
```

- [ ] **Step 3: teams API**

`src/api/teams.ts`:

```ts
import { client } from './client'
import { TeamResponse } from '../types/api'

export const fetchTeams = (sportType?: string, isActive?: boolean) =>
  client.get<TeamResponse[]>('/teams', { params: { sportType, isActive } }).then((r) => r.data)

export const fetchTeam = (teamId: number) =>
  client.get<TeamResponse>(`/teams/${teamId}`).then((r) => r.data)
```

- [ ] **Step 4: members API**

`src/api/members.ts`:

```ts
import { client } from './client'
import { MemberResponse, FavoriteTeamResponse } from '../types/api'

export const fetchMe = () =>
  client.get<MemberResponse>('/members/me').then((r) => r.data)

export const updateNickname = (nickname: string) =>
  client.patch<{ nickname: string }>('/members/me/nickname', { nickname }).then((r) => r.data)

export const fetchFavoriteTeams = () =>
  client.get<FavoriteTeamResponse[]>('/members/me/favorite-teams').then((r) => r.data)

export const addFavoriteTeam = (teamId: number) =>
  client.post<FavoriteTeamResponse>('/members/me/favorite-teams', { teamId }).then((r) => r.data)

export const deleteFavoriteTeam = (teamId: number) =>
  client.delete<void>(`/members/me/favorite-teams/${teamId}`)

export const deleteAccount = () =>
  client.delete<void>('/members/me')
```

- [ ] **Step 5: chat API**

`src/api/chat.ts`:

```ts
import { client } from './client'
import { ChatRoomResponse, MessageResponse } from '../types/api'

export const fetchChatRooms = () =>
  client.get<ChatRoomResponse[]>('/chat/rooms').then((r) => r.data)

export const fetchChatRoomByGame = (gameId: number) =>
  client.get<ChatRoomResponse>(`/chat/rooms/game/${gameId}`).then((r) => r.data)

export const createChatRoom = (name: string, gameId?: number) =>
  client.post<ChatRoomResponse>('/chat/rooms', { name, gameId }).then((r) => r.data)

export const fetchMessageHistory = (roomId: number, page = 0, size = 50) =>
  client.get<MessageResponse[]>(`/chat/messages/history/${roomId}`, {
    params: { page, size },
  }).then((r) => r.data)

export const sendMessage = (roomId: number, content: string) =>
  client.post<MessageResponse>('/chat/messages', { roomId, content }).then((r) => r.data)

export const joinChatRoom = (roomId: number) =>
  client.post<void>(`/chat/rooms/${roomId}/join`)
```

- [ ] **Step 6: notifications API**

`src/api/notifications.ts`:

```ts
import { client } from './client'
import { NotificationResponse } from '../types/api'

export const fetchNotifications = () =>
  client.get<NotificationResponse[]>('/notifications').then((r) => r.data)

export const markRead = (notificationId: number) =>
  client.patch<void>(`/notifications/${notificationId}/read`)

export const markAllRead = () =>
  client.patch<void>('/notifications/read-all')
```

- [ ] **Step 7: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 8: 커밋**

```bash
git add src/api/
git commit -m "feat: add api layer for all domains"
```

---

## Task 5: react-query 훅

**Files:**
- Create: `src/hooks/useGames.ts`
- Create: `src/hooks/useAuth.ts`
- Create: `src/hooks/useMembers.ts`
- Create: `src/hooks/useChat.ts`
- Create: `src/hooks/useNotifications.ts`

- [ ] **Step 1: useGames**

`src/hooks/useGames.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import { fetchGames, fetchGameDetail, fetchGameSeats, GamesParams } from '../api/games'

export const useGames = (params?: GamesParams) =>
  useQuery({
    queryKey: ['games', params],
    queryFn: () => fetchGames(params),
  })

export const useGameDetail = (gameId: number) =>
  useQuery({
    queryKey: ['games', gameId],
    queryFn: () => fetchGameDetail(gameId),
    enabled: gameId > 0,
  })

export const useGameSeats = (gameId: number, grade?: string, status?: string) =>
  useQuery({
    queryKey: ['games', gameId, 'seats', grade, status],
    queryFn: () => fetchGameSeats(gameId, grade, status),
    enabled: gameId > 0,
  })
```

- [ ] **Step 2: useAuth**

`src/hooks/useAuth.ts`:

```ts
import { useAuthStore } from '../store/auth'
import { logout as logoutApi } from '../api/auth'
import { useNavigate } from 'react-router-dom'

export const useAuth = () => {
  const { accessToken, refreshToken, user, clear } = useAuthStore()
  const navigate = useNavigate()

  const isAuthenticated = accessToken !== null

  const handleLogout = async () => {
    if (accessToken && refreshToken) {
      await logoutApi(accessToken, refreshToken).catch(() => {})
    }
    clear()
    navigate('/login')
  }

  return { isAuthenticated, user, handleLogout }
}
```

- [ ] **Step 3: useMembers**

`src/hooks/useMembers.ts`:

```ts
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
```

- [ ] **Step 4: useChat**

`src/hooks/useChat.ts`:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchChatRooms, fetchMessageHistory, sendMessage } from '../api/chat'

export const useChatRooms = () =>
  useQuery({ queryKey: ['chatRooms'], queryFn: fetchChatRooms })

export const useMessages = (roomId: number) =>
  useQuery({
    queryKey: ['messages', roomId],
    queryFn: () => fetchMessageHistory(roomId),
    enabled: roomId > 0,
    refetchInterval: 3000,
  })

export const useSendMessage = (roomId: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => sendMessage(roomId, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages', roomId] }),
  })
}
```

- [ ] **Step 5: useNotifications (SSE 포함)**

`src/hooks/useNotifications.ts`:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { fetchNotifications, markRead, markAllRead } from '../api/notifications'
import { NotificationResponse } from '../types/api'
import { useAuthStore } from '../store/auth'

export const useNotifications = () =>
  useQuery({ queryKey: ['notifications'], queryFn: fetchNotifications })

export const useMarkRead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export const useMarkAllRead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export const useNotificationStream = () => {
  const qc = useQueryClient()
  const accessToken = useAuthStore((s) => s.accessToken)

  useEffect(() => {
    if (!accessToken) return

    const es = new EventSource(`/api/notifications/stream?token=${accessToken}`)

    es.onmessage = (event) => {
      const notification: NotificationResponse = JSON.parse(event.data)
      qc.setQueryData<NotificationResponse[]>(['notifications'], (prev = []) => [
        notification,
        ...prev,
      ])
    }

    es.onerror = () => es.close()

    return () => es.close()
  }, [accessToken, qc])
}
```

- [ ] **Step 6: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 7: 커밋**

```bash
git add src/hooks/
git commit -m "feat: add react-query hooks for all domains"
```

---

## Task 6: 공통 컴포넌트 포팅 (UI 키트 → TypeScript)

**Files:**
- Create: `src/components/Badge.tsx`
- Create: `src/components/Btn.tsx`
- Create: `src/components/NavBar.tsx`

- [ ] **Step 1: Badge 컴포넌트**

`src/components/Badge.tsx`:

```tsx
import { C } from '../styles/tokens'

type BadgeVariant =
  | 'teal' | 'green' | 'red' | 'yellow' | 'gray'
  | 'baseball' | 'soccer' | 'basketball'

const variantStyles: Record<BadgeVariant, { bg: string; color: string; bd: string }> = {
  teal:       { bg: 'rgba(93,187,160,0.15)',  color: C.teal,    bd: 'rgba(93,187,160,0.3)' },
  green:      { bg: 'rgba(62,207,142,0.12)',  color: C.success, bd: 'rgba(62,207,142,0.25)' },
  red:        { bg: 'rgba(239,68,68,0.12)',   color: C.error,   bd: 'rgba(239,68,68,0.25)' },
  yellow:     { bg: 'rgba(245,158,11,0.12)',  color: C.warning, bd: 'rgba(245,158,11,0.25)' },
  gray:       { bg: C.elevated,               color: C.fg3,     bd: C.border },
  baseball:   { bg: 'rgba(232,0,61,0.15)',    color: '#ff8fa3', bd: 'rgba(232,0,61,0.3)' },
  soccer:     { bg: 'rgba(27,107,58,0.2)',    color: '#4ade80', bd: 'rgba(27,107,58,0.4)' },
  basketball: { bg: 'rgba(249,115,22,0.15)',  color: '#fdba74', bd: 'rgba(249,115,22,0.3)' },
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  style?: React.CSSProperties
}

export function Badge({ children, variant = 'teal', style = {} }: BadgeProps) {
  const v = variantStyles[variant]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      borderRadius: 9999, padding: '3px 10px', fontSize: 11, fontWeight: 600,
      background: v.bg, color: v.color, border: `1px solid ${v.bd}`, ...style,
    }}>
      {children}
    </span>
  )
}
```

- [ ] **Step 2: Btn 컴포넌트**

`src/components/Btn.tsx`:

```tsx
import { C } from '../styles/tokens'

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type BtnSize = 'sm' | 'md' | 'lg'

const sizes = {
  sm: { padding: '6px 14px',  fontSize: 12 },
  md: { padding: '10px 20px', fontSize: 14 },
  lg: { padding: '13px 28px', fontSize: 16 },
}

const variants: Record<BtnVariant, { bg: string; color: string; bd: string }> = {
  primary:   { bg: C.teal,  color: C.deep,  bd: 'none' },
  secondary: { bg: 'transparent', color: C.teal, bd: `1.5px solid ${C.teal}` },
  ghost:     { bg: C.card,  color: C.fg2,   bd: `1px solid ${C.border}` },
  danger:    { bg: C.error, color: '#fff',  bd: 'none' },
}

interface BtnProps {
  children: React.ReactNode
  variant?: BtnVariant
  size?: BtnSize
  style?: React.CSSProperties
  onClick?: () => void
  disabled?: boolean
}

export function Btn({ children, variant = 'primary', size = 'md', style = {}, onClick, disabled }: BtnProps) {
  const sz = sizes[size]
  const v = variants[variant]
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: 'inherit', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
        borderRadius: 9999, ...sz, background: v.bg, color: v.color, border: v.bd,
        opacity: disabled ? 0.5 : 1, ...style,
      }}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 3: NavBar 컴포넌트**

`src/components/NavBar.tsx`:

```tsx
import { useNavigate, useLocation } from 'react-router-dom'
import { C } from '../styles/tokens'

const navItems = [
  { id: 'home',      label: '홈',     path: '/' },
  { id: 'chat',      label: '팀 채팅', path: '/chat' },
  { id: 'mypage',    label: '마이',   path: '/mypage' },
]

interface NavBarProps {
  unreadCount?: number
}

export function NavBar({ unreadCount = 0 }: NavBarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav style={{
      background: 'rgba(23,26,44,0.96)', borderBottom: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', padding: '0 28px', height: 58, gap: 28, flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 12 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: `linear-gradient(135deg,${C.teal},${C.deep})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, color: '#fff', fontSize: 13,
        }}>S</div>
        <span style={{ fontWeight: 800, fontSize: 16, color: C.teal, letterSpacing: '-0.02em' }}>
          Sportify
        </span>
      </div>

      {navItems.map((item) => {
        const active = location.pathname === item.path
        return (
          <span
            key={item.id}
            onClick={() => navigate(item.path)}
            style={{
              fontSize: 13, fontWeight: active ? 700 : 500,
              color: active ? C.teal : C.fg3, padding: '0 2px', height: '100%',
              borderBottom: active ? `2px solid ${C.teal}` : '2px solid transparent',
              display: 'flex', alignItems: 'center', cursor: 'pointer',
            }}
          >
            {item.label}
          </span>
        )
      })}

      <div style={{ marginLeft: 'auto', display: 'flex', gap: 14, alignItems: 'center' }}>
        {unreadCount > 0 && (
          <div style={{ position: 'relative' }}>
            <span style={{ fontSize: 18, color: C.fg2 }}>🔔</span>
            <div style={{
              position: 'absolute', top: -3, right: -3, minWidth: 14, height: 14,
              padding: '0 4px', borderRadius: 9999, background: C.error,
              color: '#fff', fontSize: 9, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{unreadCount}</div>
          </div>
        )}
      </div>
    </nav>
  )
}
```

- [ ] **Step 4: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 5: 커밋**

```bash
git add src/components/Badge.tsx src/components/Btn.tsx src/components/NavBar.tsx
git commit -m "feat: port Badge, Btn, NavBar components from ui kit"
```

---

## Task 7: GameCard + SeatMap 컴포넌트

**Files:**
- Create: `src/components/GameCard.tsx`
- Create: `src/components/SeatMap.tsx`

- [ ] **Step 1: GameCard**

`src/components/GameCard.tsx`:

```tsx
import { GameListResponseDto } from '../types/api'
import { Badge } from './Badge'
import { Btn } from './Btn'
import { C } from '../styles/tokens'

const sportMeta: Record<string, { label: string; icon: string; variant: 'baseball' | 'soccer' | 'basketball' }> = {
  BASEBALL:   { label: '야구', icon: '⚾', variant: 'baseball' },
  SOCCER:     { label: '축구', icon: '⚽', variant: 'soccer' },
  BASKETBALL: { label: '농구', icon: '🏀', variant: 'basketball' },
}

interface GameCardProps {
  game: GameListResponseDto
  onSelect: (gameId: number) => void
}

export function GameCard({ game, onSelect }: GameCardProps) {
  const meta = sportMeta[game.sportType] ?? { label: game.sportType, icon: '🏟', variant: 'teal' as const }
  const home = game.teams.find((t) => t.side === 'HOME')
  const away = game.teams.find((t) => t.side === 'AWAY')
  const date = new Date(game.gameTime)
  const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
  const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  const isSoldOut = game.availableSeats === 0

  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
      padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Badge variant={meta.variant}>{meta.icon} {meta.label}</Badge>
        {game.isRivalMatch && <Badge variant="red">라이벌전</Badge>}
        {isSoldOut && <Badge variant="gray">매진</Badge>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: C.fg1 }}>{home?.name}</span>
        <span style={{ fontSize: 13, color: C.fg3 }}>VS</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: C.fg1 }}>{away?.name}</span>
      </div>

      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: C.fg3 }}>
        <span>📅 {dateStr} {timeStr}</span>
        <span>🏟 {game.stadium}</span>
        <span>💺 잔여 {game.availableSeats}석</span>
      </div>

      <Btn
        variant={isSoldOut ? 'ghost' : 'primary'}
        disabled={isSoldOut}
        onClick={() => onSelect(game.gameId)}
      >
        {isSoldOut ? '매진' : '좌석 선택'}
      </Btn>
    </div>
  )
}
```

- [ ] **Step 2: SeatMap**

`src/components/SeatMap.tsx`:

```tsx
import { useState } from 'react'
import { GameSeatListResponseDto } from '../types/api'
import { Btn } from './Btn'
import { C } from '../styles/tokens'

interface SeatMapProps {
  seats: GameSeatListResponseDto[]
  onConfirm: (seat: GameSeatListResponseDto) => void
}

export function SeatMap({ seats, onConfirm }: SeatMapProps) {
  const [selected, setSelected] = useState<GameSeatListResponseDto | null>(null)

  const grades = [...new Set(seats.map((s) => s.grade))]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {grades.map((grade) => (
        <div key={grade}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.fg3, marginBottom: 8 }}>{grade}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {seats.filter((s) => s.grade === grade).map((seat) => {
              const available = seat.status === 'AVAILABLE'
              const isSelected = selected?.seatId === seat.seatId
              return (
                <button
                  key={seat.seatId}
                  disabled={!available}
                  onClick={() => setSelected(seat)}
                  style={{
                    width: 36, height: 36, borderRadius: 6, fontSize: 10, fontWeight: 600,
                    background: isSelected ? C.teal : available ? C.elevated : C.border,
                    color: isSelected ? C.deep : available ? C.fg2 : C.fg4,
                    border: `1px solid ${isSelected ? C.teal : C.border}`,
                    cursor: available ? 'pointer' : 'not-allowed',
                  }}
                >
                  {seat.seatNumber}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {selected && (
        <div style={{ background: C.card, border: `1px solid ${C.teal}`, borderRadius: 12, padding: 16 }}>
          <div style={{ color: C.fg1, marginBottom: 12 }}>
            {selected.grade} · {selected.section} · {selected.rowNumber}열 {selected.seatNumber}번
            <span style={{ float: 'right', color: C.teal, fontWeight: 700 }}>
              {selected.price.toLocaleString()}원
            </span>
          </div>
          <Btn onClick={() => onConfirm(selected)}>예매 확정</Btn>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 4: 커밋**

```bash
git add src/components/GameCard.tsx src/components/SeatMap.tsx
git commit -m "feat: add GameCard and SeatMap components"
```

---

## Task 8: 페이지 — LoginPage + 라우터

**Files:**
- Create: `src/pages/LoginPage.tsx`
- Modify: `src/App.tsx`
- Create: `src/main.tsx` (수정)

- [ ] **Step 1: App.tsx — 라우터 설정**

`src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { GameDetailPage } from './pages/GameDetailPage'
import { ChatPage } from './pages/ChatPage'
import { MyPage } from './pages/MyPage'
import { useAuthStore } from './store/auth'

const queryClient = new QueryClient()

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken)
  return accessToken ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/oauth2/callback" element={<LoginPage />} />
          <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/games/:gameId" element={<PrivateRoute><GameDetailPage /></PrivateRoute>} />
          <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
          <Route path="/mypage" element={<PrivateRoute><MyPage /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
```

- [ ] **Step 2: LoginPage — OAuth 버튼 + 콜백 처리**

`src/pages/LoginPage.tsx`:

```tsx
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { C } from '../styles/tokens'
import { Btn } from '../components/Btn'

export function LoginPage() {
  const [params] = useSearchParams()
  const { setTokens, accessToken } = useAuthStore()
  const navigate = useNavigate()

  // OAuth2 콜백 처리: /oauth2/callback?accessToken=...&refreshToken=...
  useEffect(() => {
    const at = params.get('accessToken')
    const rt = params.get('refreshToken')
    if (at && rt) {
      setTokens(at, rt)
      navigate('/', { replace: true })
    }
  }, [params, setTokens, navigate])

  // 이미 로그인 상태면 홈으로
  useEffect(() => {
    if (accessToken && !params.get('accessToken')) {
      navigate('/', { replace: true })
    }
  }, [accessToken, navigate, params])

  return (
    <div style={{ width: '100vw', height: '100vh', background: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 48, width: 360, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg,${C.teal},${C.deep})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 18 }}>S</div>
          <span style={{ fontWeight: 800, fontSize: 22, color: C.teal }}>Sportify</span>
        </div>

        <p style={{ textAlign: 'center', color: C.fg3, fontSize: 14 }}>소셜 계정으로 로그인하세요</p>

        <a href="/oauth2/authorization/google" style={{ textDecoration: 'none' }}>
          <Btn variant="ghost" style={{ width: '100%' }}>Google로 로그인</Btn>
        </a>
        <a href="/oauth2/authorization/kakao" style={{ textDecoration: 'none' }}>
          <Btn variant="ghost" style={{ width: '100%', background: '#FEE500', color: '#191919', border: 'none' }}>
            카카오로 로그인
          </Btn>
        </a>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 4: 커밋**

```bash
git add src/App.tsx src/pages/LoginPage.tsx
git commit -m "feat: add router setup and login page with oauth2 callback"
```

---

## Task 9: HomePage — 경기 목록

**Files:**
- Create: `src/pages/HomePage.tsx`

- [ ] **Step 1: HomePage 구현**

`src/pages/HomePage.tsx`:

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavBar } from '../components/NavBar'
import { GameCard } from '../components/GameCard'
import { useGames } from '../hooks/useGames'
import { useNotifications } from '../hooks/useNotifications'
import { C } from '../styles/tokens'

const SPORT_FILTERS = [
  { value: undefined, label: '전체' },
  { value: 'BASEBALL', label: '⚾ 야구' },
  { value: 'SOCCER', label: '⚽ 축구' },
  { value: 'BASKETBALL', label: '🏀 농구' },
]

export function HomePage() {
  const navigate = useNavigate()
  const [sportType, setSportType] = useState<string | undefined>()
  const { data: games, isLoading, isError } = useGames({ sportType })
  const { data: notifications } = useNotifications()
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0

  return (
    <div style={{ minHeight: '100vh', background: C.dark, color: C.fg1 }}>
      <NavBar unreadCount={unreadCount} />

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>경기 일정</h1>

        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {SPORT_FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => setSportType(f.value)}
              style={{
                padding: '7px 16px', borderRadius: 9999, fontSize: 13, fontWeight: 600,
                background: sportType === f.value ? C.teal : C.elevated,
                color: sportType === f.value ? C.deep : C.fg2,
                border: `1px solid ${sportType === f.value ? C.teal : C.border}`,
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading && <p style={{ color: C.fg3 }}>불러오는 중...</p>}
        {isError && <p style={{ color: C.error }}>경기 목록을 불러올 수 없습니다.</p>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {games?.map((game) => (
            <GameCard key={game.gameId} game={game} onSelect={(id) => navigate(`/games/${id}`)} />
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add src/pages/HomePage.tsx
git commit -m "feat: add home page with game list and sport filter"
```

---

## Task 10: GameDetailPage — 경기 상세 + 좌석 선택

**Files:**
- Create: `src/pages/GameDetailPage.tsx`

- [ ] **Step 1: GameDetailPage 구현**

`src/pages/GameDetailPage.tsx`:

```tsx
import { useParams, useNavigate } from 'react-router-dom'
import { NavBar } from '../components/NavBar'
import { SeatMap } from '../components/SeatMap'
import { Badge } from '../components/Badge'
import { useGameDetail, useGameSeats } from '../hooks/useGames'
import { GameSeatListResponseDto } from '../types/api'
import { C } from '../styles/tokens'

export function GameDetailPage() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const id = Number(gameId)
  const { data: game, isLoading } = useGameDetail(id)
  const { data: seats } = useGameSeats(id)

  const home = game?.teams.find((t) => t.side === 'HOME')
  const away = game?.teams.find((t) => t.side === 'AWAY')

  const handleConfirm = (seat: GameSeatListResponseDto) => {
    alert(`예매 완료: ${seat.grade} ${seat.section} ${seat.rowNumber}열 ${seat.seatNumber}번 — ${seat.price.toLocaleString()}원`)
  }

  if (isLoading) return <div style={{ color: C.fg3, padding: 48 }}>불러오는 중...</div>
  if (!game) return null

  const dateStr = new Date(game.gameTime).toLocaleString('ko-KR')

  return (
    <div style={{ minHeight: '100vh', background: C.dark, color: C.fg1 }}>
      <NavBar />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: C.fg3, cursor: 'pointer', marginBottom: 24, fontSize: 14 }}>
          ← 뒤로
        </button>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, marginBottom: 28 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <Badge variant="teal">{game.sportType}</Badge>
            {game.isRivalMatch && <Badge variant="red">라이벌전</Badge>}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>
            {home?.name} <span style={{ color: C.fg3 }}>vs</span> {away?.name}
          </div>
          <div style={{ display: 'flex', gap: 20, fontSize: 13, color: C.fg3 }}>
            <span>📅 {dateStr}</span>
            <span>🏟 {game.venue}</span>
            <span>💺 잔여 {game.availableSeats}석</span>
          </div>

          {game.seatGradeSummary.length > 0 && (
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              {game.seatGradeSummary.map((g) => (
                <div key={g.grade} style={{ background: C.elevated, borderRadius: 10, padding: '8px 14px', fontSize: 12 }}>
                  <div style={{ color: C.fg3 }}>{g.grade}</div>
                  <div style={{ color: C.teal, fontWeight: 700 }}>{g.price.toLocaleString()}원</div>
                  <div style={{ color: C.fg2 }}>잔여 {g.available}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {seats && seats.length > 0 && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>좌석 선택</h2>
            <SeatMap seats={seats} onConfirm={handleConfirm} />
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 타입 체크 + 커밋**

```bash
npx tsc --noEmit
git add src/pages/GameDetailPage.tsx
git commit -m "feat: add game detail page with seat map"
```

---

## Task 11: ChatPage + ChatPanel 컴포넌트

**Files:**
- Create: `src/components/ChatPanel.tsx`
- Create: `src/pages/ChatPage.tsx`

- [ ] **Step 1: ChatPanel 컴포넌트**

`src/components/ChatPanel.tsx`:

```tsx
import { useState, useRef, useEffect } from 'react'
import { MessageResponse } from '../types/api'
import { C } from '../styles/tokens'
import { Btn } from './Btn'

interface ChatPanelProps {
  messages: MessageResponse[]
  currentUserId: number
  onSend: (content: string) => void
  isSending: boolean
}

export function ChatPanel({ messages, currentUserId, onSend, isSending }: ChatPanelProps) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    onSend(trimmed)
    setInput('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUserId
          return (
            <div key={msg.messageId} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '70%', padding: '8px 14px', borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: isMine ? C.teal : C.elevated,
                color: isMine ? C.deep : C.fg1, fontSize: 14,
              }}>
                {msg.content}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: 16, borderTop: `1px solid ${C.border}`, display: 'flex', gap: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="메시지 입력..."
          style={{
            flex: 1, background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10,
            padding: '10px 14px', color: C.fg1, fontSize: 14, outline: 'none',
          }}
        />
        <Btn onClick={handleSend} disabled={isSending || !input.trim()}>전송</Btn>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: ChatPage 구현**

`src/pages/ChatPage.tsx`:

```tsx
import { useState } from 'react'
import { NavBar } from '../components/NavBar'
import { ChatPanel } from '../components/ChatPanel'
import { useChatRooms, useMessages, useSendMessage } from '../hooks/useChat'
import { useMe } from '../hooks/useMembers'
import { C } from '../styles/tokens'

export function ChatPage() {
  const { data: rooms } = useChatRooms()
  const { data: me } = useMe()
  const [selectedRoomId, setSelectedRoomId] = useState<number>(0)

  const { data: messages = [] } = useMessages(selectedRoomId)
  const { mutate: send, isPending } = useSendMessage(selectedRoomId)

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: C.dark, color: C.fg1 }}>
      <NavBar />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 채팅방 목록 */}
        <div style={{ width: 260, borderRight: `1px solid ${C.border}`, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.fg3, marginBottom: 8 }}>채팅방</div>
          {rooms?.map((room) => (
            <button
              key={room.roomId}
              onClick={() => setSelectedRoomId(room.roomId)}
              style={{
                background: selectedRoomId === room.roomId ? C.elevated : 'transparent',
                border: `1px solid ${selectedRoomId === room.roomId ? C.teal : C.border}`,
                borderRadius: 10, padding: '10px 14px', textAlign: 'left',
                color: C.fg1, fontSize: 13, cursor: 'pointer', width: '100%',
              }}
            >
              {room.name}
            </button>
          ))}
        </div>

        {/* 메시지 패널 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedRoomId > 0 ? (
            <ChatPanel
              messages={messages}
              currentUserId={me?.memberId ?? 0}
              onSend={send}
              isSending={isPending}
            />
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.fg4 }}>
              채팅방을 선택하세요
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 타입 체크 + 커밋**

```bash
npx tsc --noEmit
git add src/components/ChatPanel.tsx src/pages/ChatPage.tsx
git commit -m "feat: add chat page with room list and message panel"
```

---

## Task 12: MyPage

**Files:**
- Create: `src/pages/MyPage.tsx`

- [ ] **Step 1: MyPage 구현**

`src/pages/MyPage.tsx`:

```tsx
import { NavBar } from '../components/NavBar'
import { Btn } from '../components/Btn'
import { Badge } from '../components/Badge'
import { useMe, useFavoriteTeams, useDeleteFavoriteTeam } from '../hooks/useMembers'
import { useAuth } from '../hooks/useAuth'
import { useNotificationStream } from '../hooks/useNotifications'
import { C } from '../styles/tokens'

export function MyPage() {
  const { data: me, isLoading } = useMe()
  const { data: favoriteTeams } = useFavoriteTeams()
  const { mutate: deleteFavoriteTeam } = useDeleteFavoriteTeam()
  const { handleLogout } = useAuth()
  useNotificationStream()

  if (isLoading) return <div style={{ color: C.fg3, padding: 48 }}>불러오는 중...</div>

  return (
    <div style={{ minHeight: '100vh', background: C.dark, color: C.fg1 }}>
      <NavBar />
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* 프로필 */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{me?.nickname}</div>
          <div style={{ fontSize: 13, color: C.fg3 }}>{me?.email}</div>
        </div>

        {/* 선호 팀 */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.fg3, marginBottom: 16 }}>선호 팀</div>
          {favoriteTeams?.length === 0 && (
            <p style={{ color: C.fg4, fontSize: 13 }}>등록된 선호 팀이 없습니다.</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {favoriteTeams?.map((team) => (
              <div key={team.favoriteTeamId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Badge variant="teal">#{team.priority}</Badge>
                  <span style={{ fontSize: 14, color: C.fg1 }}>{team.teamName}</span>
                  <span style={{ fontSize: 12, color: C.fg3 }}>{team.sportType}</span>
                </div>
                <Btn variant="ghost" size="sm" onClick={() => deleteFavoriteTeam(team.teamId)}>삭제</Btn>
              </div>
            ))}
          </div>
        </div>

        {/* 로그아웃 */}
        <Btn variant="danger" onClick={handleLogout}>로그아웃</Btn>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 3: 최종 빌드 확인**

```bash
npm run build
```

Expected: `dist/` 생성, 오류 없음

- [ ] **Step 4: 개발 서버 확인 (백엔드 실행 필요)**

```bash
# 백엔드 먼저 실행: /Users/kang/gitdir/kt_cloud/Sortsify 에서
# ./gradlew bootRun 또는 IDE 실행

npm run dev
# http://localhost:3000 접속 확인
```

Expected: 로그인 페이지 렌더링, OAuth 버튼 클릭 시 localhost:8080으로 프록시

- [ ] **Step 5: 커밋**

```bash
git add src/pages/MyPage.tsx
git commit -m "feat: add my page with profile, favorite teams, and logout"
```

---

## 백엔드 CORS 설정 (필요 시)

백엔드가 Vite proxy 없이 직접 호출되는 경우 SecurityConfig에 CORS 추가 필요:

```java
// SecurityConfig.java — http.csrf(...) 다음에 추가
.cors(cors -> cors.configurationSource(request -> {
    var config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:3000"));
    config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    return config;
}))
```

> Vite proxy를 통하면 브라우저 기준 same-origin이므로 CORS 불필요.
