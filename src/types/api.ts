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
