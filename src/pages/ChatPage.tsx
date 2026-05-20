import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { NavBar } from '../components/NavBar'
import { ChatPanel } from '../components/ChatPanel'
import { Btn } from '../components/Btn'
import {
  useChatRooms,
  useChatRoomsByGame,
  useChatRoomDetail,
  useJoinChatRoom,
  useLeaveChatRoom,
  useMessages,
  useDeleteMessage,
  useCreateChatRoom,
  useMyInvites,
  useRejectChatRoom,
  useInviteToRoom,
  useDeleteChatRoom,
} from '../hooks/useChat'
import { useStompManager } from '../hooks/useStompManager'
import type { StompManager } from '../hooks/useStompManager'
import { useMe } from '../hooks/useMembers'
import { C } from '../styles/tokens'
import type { ChatRoomSummaryResponse, ChatRoomMemberInviteSummary } from '../types/api'

const StompCtx = createContext<StompManager | null>(null)

function useStomp(): StompManager {
  const ctx = useContext(StompCtx)
  if (!ctx) throw new Error('StompCtx missing')
  return ctx
}

function RoomHeader({ roomId, currentUserId }: { roomId: number; currentUserId: number }) {
  const navigate = useNavigate()
  const { subscribe, unsubscribe } = useStomp()
  const { data: detail } = useChatRoomDetail(roomId)
  const { mutate: leave, isPending: leaving } = useLeaveChatRoom()
  const { mutate: join, isPending: joining } = useJoinChatRoom()
  const { mutate: deleteRoom, isPending: deleting } = useDeleteChatRoom()
  const { mutate: invite, isPending: inviting } = useInviteToRoom()
  const [showInvite, setShowInvite] = useState(false)
  const [inviteeId, setInviteeId] = useState('')

  if (!detail) return null

  const isJoined = detail.myMembership?.status === 'JOINED'
  const isGame = detail.type === 'GAME'
  const isCreator = detail.createdBy === currentUserId

  const handleJoin = () => {
    join(roomId, {
      onSuccess: () => subscribe(roomId, detail.type),
    })
  }

  const handleLeave = () => {
    leave(roomId, {
      onSuccess: () => {
        if (detail.type === 'DIRECT') unsubscribe(roomId)
        navigate('/chat')
      },
    })
  }

  const handleDelete = () => {
    deleteRoom(roomId, {
      onSuccess: () => {
        unsubscribe(roomId)
        navigate('/chat')
      },
    })
  }

  const handleInvite = () => {
    const id = Number(inviteeId)
    if (!id) return
    invite({ roomId, inviteeId: id }, {
      onSuccess: () => { setInviteeId(''); setShowInvite(false) },
    })
  }

  return (
    <div style={{ borderBottom: `1px solid ${C.border}`, background: C.card }}>
      <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.fg1 }}>{detail.name}</div>
          <div style={{ fontSize: 12, color: C.fg4, marginTop: 2 }}>
            참여자 {detail.currentParticipants}명 · {detail.type}
            {detail.gameId && ` · 경기 #${detail.gameId}`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {/* DM은 초대 불가 — GAME 방에서 참여 중일 때만 표시 */}
          {isGame && isJoined && (
            <Btn size="sm" variant="ghost" onClick={() => setShowInvite((v) => !v)}>
              초대
            </Btn>
          )}
          {isCreator ? (
            <>
              <Btn variant="ghost" size="sm" onClick={handleLeave} disabled={leaving}>
                나가기
              </Btn>
              <Btn variant="ghost" size="sm" onClick={handleDelete} disabled={deleting}
                style={{ color: '#e05c5c' }}>
                삭제
              </Btn>
            </>
          ) : (
            isJoined ? (
              <Btn variant="ghost" size="sm" onClick={handleLeave} disabled={leaving}>
                나가기
              </Btn>
            ) : (
              <Btn size="sm" onClick={handleJoin} disabled={joining}>
                참여
              </Btn>
            )
          )}
        </div>
      </div>
      {showInvite && (
        <div style={{ padding: '8px 20px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="number"
            value={inviteeId}
            onChange={(e) => setInviteeId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
            placeholder="초대할 멤버 ID"
            style={{
              flex: 1, background: C.elevated, border: `1px solid ${C.border}`,
              borderRadius: 8, padding: '6px 10px', color: C.fg1, fontSize: 13,
              outline: 'none', fontFamily: 'inherit',
            }}
          />
          <Btn size="sm" onClick={handleInvite} disabled={inviting || !inviteeId}>
            초대
          </Btn>
          <Btn size="sm" variant="ghost" onClick={() => { setShowInvite(false); setInviteeId('') }}>
            취소
          </Btn>
        </div>
      )}
    </div>
  )
}

function ChatArea({ roomId, currentUserId }: { roomId: number; currentUserId: number }) {
  const navigate = useNavigate()
  const { sendMessage, sendTyping, typingState } = useStomp()
  const { data: messagesData } = useMessages(roomId)
  const messages = messagesData?.messages ?? []
  const members = messagesData?.members ?? []
  const { mutate: deleteMsg } = useDeleteMessage(roomId)
  const { mutate: createRoom } = useCreateChatRoom()

  const isTyping = typingState[roomId] ?? false

  const handleDmInvite = (senderId: number) => {
    createRoom(
      { type: 'DIRECT', inviteeIds: [senderId] },
      {
        onSuccess: (room) => navigate(`/chat?roomId=${room.roomId}`),
        onError: () => navigate('/chat'),
      }
    )
  }

  return (
    <>
      <RoomHeader roomId={roomId} currentUserId={currentUserId} />
      <ChatPanel
        messages={messages}
        members={members}
        currentUserId={currentUserId}
        onSend={(content) => sendMessage(roomId, content)}
        onDelete={deleteMsg}
        onDmInvite={handleDmInvite}
        onTyping={(isTyping) => sendTyping(roomId, isTyping)}
        isSending={false}
        isTyping={isTyping}
      />
    </>
  )
}

interface RoomItemProps {
  room: ChatRoomSummaryResponse
  isSelected: boolean
  showUnread: boolean
  onClick: () => void
}

function RoomItem({ room, isSelected, showUnread, onClick }: RoomItemProps) {
  const lastMsgPreview = room.lastMessage?.content
    ? room.lastMessage.content.length > 28
      ? room.lastMessage.content.slice(0, 28) + '…'
      : room.lastMessage.content
    : null
  const lastMsgTime = room.lastMessage?.createdAt
    ? new Date(room.lastMessage.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    : null
  const unreadCount = room.unRead ?? 0

  return (
    <button
      onClick={onClick}
      style={{
        background: isSelected ? C.elevated : 'transparent',
        borderWidth: 0,
        borderLeftWidth: 3,
        borderStyle: 'solid',
        borderColor: 'transparent',
        borderLeftColor: isSelected ? C.teal : 'transparent',
        padding: '10px 14px',
        textAlign: 'left',
        color: C.fg1,
        cursor: 'pointer',
        width: '100%',
        transition: 'background 0.15s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
        <div style={{
          fontWeight: 600, fontSize: 13,
          color: isSelected ? C.fg1 : C.fg2,
          flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {room.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {showUnread && unreadCount > 0 && (
            <span style={{
              background: C.teal, color: C.deep, borderRadius: 10,
              fontSize: 10, fontWeight: 700, padding: '1px 6px',
              minWidth: 18, textAlign: 'center',
            }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          {lastMsgTime && (
            <span style={{ fontSize: 10, color: C.fg4 }}>{lastMsgTime}</span>
          )}
        </div>
      </div>
      {lastMsgPreview && (
        <div style={{
          fontSize: 11, color: C.fg4, marginTop: 3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {lastMsgPreview}
        </div>
      )}
      <div style={{ fontSize: 10, color: C.fg4, marginTop: 2 }}>
        {room.currentParticipants}명 참여 중
      </div>
    </button>
  )
}

function InviteItem({ invite }: { invite: ChatRoomMemberInviteSummary }) {
  const { subscribe } = useStomp()
  const { data: detail } = useChatRoomDetail(invite.roomId)
  const { mutate: join, isPending: joining } = useJoinChatRoom()
  const { mutate: reject, isPending: rejecting } = useRejectChatRoom()

  return (
    <div style={{
      padding: '10px 14px',
      display: 'flex', flexDirection: 'column', gap: 6,
      borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.fg1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {detail?.name ?? `방 #${invite.roomId}`}
      </div>
      <div style={{ fontSize: 11, color: C.fg4 }}>
        {detail?.type === 'DIRECT' ? 'DM 초대' : '게임 채팅 초대'}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <Btn
          size="sm"
          disabled={joining}
          onClick={() => join(invite.roomId, {
            onSuccess: () => subscribe(invite.roomId, detail?.type ?? 'DIRECT'),
          })}
        >
          수락
        </Btn>
        <Btn
          size="sm"
          variant="ghost"
          disabled={rejecting}
          onClick={() => reject(invite.roomId)}
        >
          거절
        </Btn>
      </div>
    </div>
  )
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{
      padding: '12px 14px 6px',
      fontSize: 11, fontWeight: 700, color: C.fg4,
      letterSpacing: '0.06em', textTransform: 'uppercase',
    }}>
      {label}
    </div>
  )
}

function EmptySection({ text }: { text: string }) {
  return (
    <div style={{ fontSize: 12, color: C.fg4, padding: '4px 14px 10px' }}>{text}</div>
  )
}

export function ChatPage() {
  const [searchParams] = useSearchParams()
  const gameIdParam = searchParams.get('gameId')
  const roomIdParam = searchParams.get('roomId')
  const gameId = gameIdParam ? Number(gameIdParam) : 0

  const { data: directRooms = [], isLoading: directLoading } = useChatRooms('DIRECT')
  const { data: gameRooms = [], isLoading: gameRoomsLoading } = useChatRooms('GAME')
  const { data: gameRoomsByGame } = useChatRoomsByGame(gameId)
  const { data: invites = [] } = useMyInvites()
  const { data: me } = useMe()
  const [selectedRoomId, setSelectedRoomId] = useState<number>(
    roomIdParam ? Number(roomIdParam) : 0
  )

  const manager = useStompManager(selectedRoomId)
  const { subscribe } = manager

  const currentUserId = me?.memberId ?? 0
  const isLoading = directLoading || gameRoomsLoading

  // Auto-subscribe all DIRECT rooms
  useEffect(() => {
    for (const room of directRooms) subscribe(room.roomId, room.type)
  }, [directRooms, subscribe])

  // Auto-subscribe all GAME rooms
  useEffect(() => {
    for (const room of gameRooms) subscribe(room.roomId, room.type)
  }, [gameRooms, subscribe])

  // URL ?roomId 변경 시 동기화 (DM 생성 후 navigate 등)
  useEffect(() => {
    if (roomIdParam) setSelectedRoomId(Number(roomIdParam))
  }, [roomIdParam])

  useEffect(() => {
    if (gameId && gameRoomsByGame && gameRoomsByGame.length > 0 && selectedRoomId === 0) {
      setSelectedRoomId(gameRoomsByGame[0].roomId)
    }
  }, [gameId, gameRoomsByGame, selectedRoomId])

  return (
    <StompCtx.Provider value={manager}>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: C.dark, color: C.fg1 }}>
        <NavBar />
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* 사이드바 */}
          <div style={{ width: 280, borderRight: `1px solid ${C.border}`, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

            {isLoading && (
              <div style={{ fontSize: 12, color: C.fg4, padding: '12px 14px' }}>불러오는 중...</div>
            )}

            {/* 초대 섹션 */}
            {invites.length > 0 && (
              <>
                <SectionHeader label={`초대 (${invites.length})`} />
                {invites.map((invite) => (
                  <InviteItem key={invite.roomId} invite={invite} />
                ))}
                <div style={{ height: 1, background: C.border, margin: '6px 0' }} />
              </>
            )}

            {/* DM 섹션 */}
            <SectionHeader label="DM" />
            {!directLoading && directRooms.length === 0 && <EmptySection text="DM이 없습니다." />}
            {directRooms.map((room) => (
              <RoomItem
                key={room.roomId}
                room={room}
                isSelected={selectedRoomId === room.roomId}
                showUnread={true}
                onClick={() => setSelectedRoomId(room.roomId)}
              />
            ))}

            {/* 구분선 */}
            <div style={{ height: 1, background: C.border, margin: '6px 0' }} />

            {/* 게임 채팅 섹션 */}
            <SectionHeader label="게임 채팅" />
            {!gameRoomsLoading && gameRooms.length === 0 && <EmptySection text="참여한 게임 채팅이 없습니다." />}
            {gameRooms.map((room) => (
              <RoomItem
                key={room.roomId}
                room={room}
                isSelected={selectedRoomId === room.roomId}
                showUnread={false}
                onClick={() => setSelectedRoomId(room.roomId)}
              />
            ))}
          </div>

          {/* 채팅 영역 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {selectedRoomId > 0 ? (
              <ChatArea roomId={selectedRoomId} currentUserId={currentUserId} />
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.fg4, flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 24 }}>💬</div>
                <div style={{ fontSize: 13 }}>채팅방을 선택하세요</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </StompCtx.Provider>
  )
}
