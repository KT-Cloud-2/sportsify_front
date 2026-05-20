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

export interface UpdateNicknameResponse {
  memberId: number
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

// Team
export interface TeamResponse {
  teamId: number
  name: string
  shortName: string | null
  sportType: string
  logoUrl: string | null
  active: boolean
}

// Game
export type TeamSide = 'HOME' | 'AWAY' | 'NEUTRAL'

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
  seatGradeSummary: SeatGradeSummary[],
  maxTicketPerUser: number
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

// Seat Reservation
export interface ReservationSeatsRequestDto {
  gameId: number
  seatIds: number[]
}

export type ReservationStatus = 'PENDING' | 'PAYING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED'

export interface ReservationSeatDto {
  seatId: number
  seatGrade: string
  seatSection: string
  price: number
}

export interface ReservationSeatsResponseDto {
  orderId: number
  gameId: number
  memberId: number
  status: ReservationStatus
  reservedAt: string
  seats: ReservationSeatDto[]
  expiresAt: string
}

// Payment
export interface CreatePaymentRequest {
  orderId: number
  matchId: number
  seatId: number
  amount: number
  paymentMethod: string
  idempotencyKey: string
}

export interface ConfirmPaymentRequest {
  paymentKey: string
  orderId: string
  amount: number
}

export interface CancelPaymentRequest {
  cancelReason: string
}

export interface PaymentResponse {
  paymentId: number
  orderId: number
  tossOrderId: string
  paymentKey: string
  amount: number
  paymentMethod: string
  status: string
  requestedAt: string
  approvedAt: string
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

export interface ChatMessageResponse {
  messageId: number
  content: string
  type: string
  createdAt: string
}

// GET /api/chat/rooms (내 채팅방 목록) 응답 아이템
export interface ChatRoomSummaryResponse {
  roomId: number
  type: string
  gameId: number | null
  name: string
  imageUrl: string | null
  currentParticipants: number
  lastMessage: ChatMessageResponse | null
  unRead: number
  notificationEnabled: boolean | null
  createdAt: string
  updatedAt: string
}

// GET /api/chat/rooms/game/{gameId} 응답 아이템
export interface ChatRoomByGameResponse {
  roomId: number
  type: string
  gameId: number | null
  name: string
  imageUrl: string | null
  currentParticipants: number
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
  myMembership: ChatRoomMemberResponse | null
}

export interface ChatRoomMemberResponse {
  roomId: number
  memberId: number
  status: string
  joinedAt: string
}

export interface ChatRoomMemberInviteSummary {
  roomId: number
  status: string
  updatedAt: string
}

export interface ChatRoomMemberInvitesResponse {
  invites: ChatRoomMemberInviteSummary[]
}

export interface ChatRoomUpdateResponse {
  roomId: number
  name: string
  imageUrl: string | null
  updatedAt: string
}

export interface ChatRoomArchiveResponse {
  roomId: number
  status: string
  updatedAt: string
}

export interface ChatRoomSummaryListResponse {
  items: ChatRoomSummaryResponse[]
  nextCursor: number | null
  hasNext: boolean
  totalCount: number
}

export interface ChatRoomByGameListResponse {
  items: ChatRoomByGameResponse[]
  nextCursor: number | null
  hasNext: boolean
  totalCount: number
}

// legacy — 생성/수정 응답 등 단일 방 조회용으로만 사용
export interface ChatRoomListResponse {
  items: ChatRoomResponse[]
  nextCursor: number | null
  hasNext: boolean
  totalCount: number
}

export interface MessageResponse {
  messageId: number
  senderId: number
  type: string
  status: string
  content: string
  createdAt: string
}

export interface MessageMemberInfoSummaryResponse {
  memberId: number
  lastReadMessageId: number
}

export interface MessageDeleteResponse {
  messageId: number
}

export interface MessageListResponse {
  messages: MessageResponse[]
  members: MessageMemberInfoSummaryResponse[] | null
  nextCursor: number | null
  hasNext: boolean
  totalCount: number
}

// STOMP event types
export interface StompEventEnvelope<T = unknown> {
  event: string
  roomId: number
  occurredAt: string
  payload: T
  alertMessageId?: number
}

export interface MessageSentPayload {
  messageId: number
  clientMessageId: string
  senderId: number
  type: string
  content: string
}

export interface MessageDeletedPayload {
  messageId: number
}

export interface StompReadReceiptPayload {
  memberId: number
  lastReadMessageId: number
}

export interface TypingEventPayload {
  event: string
  roomId: number
  userId: number
  typing: boolean
  occurredAt: string
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

export interface PageNotificationResponse {
  content: NotificationResponse[]
  totalElements: number
  totalPages: number
  numberOfElements: number
  first: boolean
  last: boolean
  size: number
  number: number
  empty: boolean
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

export interface TicketItemDto {
  ticketId: number
  gameId: number
  seatGrade: string
  seatSection: string
  seatRowNumber: string
  seatNumber: string
  price: number
  status: string
  issuedAt: string
  homeTeamName?: string
  awayTeamName?: string
  gameTime?: string
  venue?: string
}

export interface TicketListResponseDto {
  items: TicketItemDto[]
  currentPage: number
  totalPages: number
  totalCount: number
  hasNext: boolean
}