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

// Member (extended)
export interface UpdateNicknameResponse {
  nickname: string
}

export interface MonthlyActivityAttendedGame {
  gameId: number
  team1Name: string
  team2Name: string
  gameTime: string
  venue: string
}

export interface MonthlyActivityResponse {
  year: number
  month: number
  ticketCount: number
  chatMessageCount: number
  attendedGames: MonthlyActivityAttendedGame[]
}

// Ticket
export type TicketStatus = 'RESERVED' | 'CANCELLED' | 'USED'

export interface TicketResponse {
  ticketId: number
  gameId: number
  seatId: number
  grade: string
  section: string
  rowNumber: string
  seatNumber: string
  price: number
  status: TicketStatus
  createdAt: string
}

export interface ReserveTicketRequest {
  gameId: number
  seatId: number
}

export interface QueuePositionResponse {
  position: number
  estimatedWaitSeconds: number
}

// Payment
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'

export interface PaymentResponse {
  paymentId: number
  ticketId: number
  amount: number
  status: PaymentStatus
  pgOrderId: string
  createdAt: string
}

export interface PaymentRequestBody {
  ticketId: number
  amount: number
}

export interface PaymentVerifyBody {
  pgOrderId: string
  pgPaymentId: string
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

export interface ChatRoomDetailResponse {
  roomId: number
  type: string
  gameId: number | null
  name: string
  imageUrl: string | null
  currentParticipants: number
  createdBy: number
  createdAt: string
  myMembership: ChatRoomMembershipResponse | null
}

export interface ChatRoomMembershipResponse {
  roomId: number
  memberId: number
  status: string
  joinedAt: string
}

export interface MessageResponse {
  messageId: number
  senderId: number
  type: string
  content: string
  createdAt: string
}

export interface MessageListResponse {
  items: MessageResponse[]
  nextCursor: number | null
  hasNext: boolean
  totalCount: number
}

// Notification
export type NotificationEventType =
  | 'TICKET_OPEN'
  | 'GAME_START'
  | 'PAYMENT_COMPLETED'
  | 'CHAT_MENTION'

export type NotificationChannelType = 'EMAIL' | 'MQTT' | 'SLACK'

export interface NotificationResponse {
  id: number
  eventType: NotificationEventType
  payload: string
  read: boolean
  createdAt: string
}

export interface NotificationSettingResponse {
  ticketOpenAlert: boolean
  gameStartAlert: boolean
  paymentAlert: boolean
  chatMentionAlert: boolean
}

export interface UpdateNotificationSettingRequest {
  ticketOpenAlert: boolean
  gameStartAlert: boolean
  paymentAlert: boolean
  chatMentionAlert: boolean
}

export interface NotificationChannelResponse {
  id: number
  channelType: NotificationChannelType
  channelTarget: string
  enabled: boolean
}

export interface RegisterChannelRequest {
  channelType: NotificationChannelType
  channelTarget: string
}
