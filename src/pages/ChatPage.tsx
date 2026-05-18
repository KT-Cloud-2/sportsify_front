import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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
} from '../hooks/useChat'
import { useStompChat } from '../hooks/useStompChat'
import { useMe } from '../hooks/useMembers'
import { C } from '../styles/tokens'

function RoomHeader({ roomId, currentUserId }: { roomId: number; currentUserId: number }) {
  const { data: detail } = useChatRoomDetail(roomId)
  const { mutate: leave, isPending: leaving } = useLeaveChatRoom()
  const { mutate: join, isPending: joining } = useJoinChatRoom()

  if (!detail) return null

  const myStatus = detail.myMembership?.status
  const isJoined = myStatus === 'JOINED'

  return (
    <div style={{
      padding: '12px 20px', borderBottom: `1px solid ${C.border}`,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: C.card,
    }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.fg1 }}>{detail.name}</div>
        <div style={{ fontSize: 12, color: C.fg4, marginTop: 2 }}>
          참여자 {detail.currentParticipants}명 · {detail.type}
          {detail.gameId && ` · 경기 #${detail.gameId}`}
        </div>
      </div>
      <div>
        {detail.createdBy !== currentUserId && (
          isJoined ? (
            <Btn variant="ghost" size="sm" onClick={() => leave(roomId)} disabled={leaving}>
              나가기
            </Btn>
          ) : (
            <Btn size="sm" onClick={() => join(roomId)} disabled={joining}>
              참여
            </Btn>
          )
        )}
      </div>
    </div>
  )
}

function ChatArea({ roomId, currentUserId }: { roomId: number; currentUserId: number }) {
  const { data: messages = [] } = useMessages(roomId)
  const { mutate: deleteMsg } = useDeleteMessage(roomId)
  const { sendMessage } = useStompChat(roomId)

  return (
    <>
      <RoomHeader roomId={roomId} currentUserId={currentUserId} />
      <ChatPanel
        messages={messages}
        currentUserId={currentUserId}
        onSend={sendMessage}
        onDelete={deleteMsg}
        isSending={false}
      />
    </>
  )
}

export function ChatPage() {
  const [searchParams] = useSearchParams()
  const gameIdParam = searchParams.get('gameId')
  const roomIdParam = searchParams.get('roomId')
  const gameId = gameIdParam ? Number(gameIdParam) : 0

  const { data: rooms, isLoading: roomsLoading } = useChatRooms()
  const { data: gameRooms } = useChatRoomsByGame(gameId)
  const { data: me } = useMe()
  const [selectedRoomId, setSelectedRoomId] = useState<number>(
    roomIdParam ? Number(roomIdParam) : 0
  )

  const currentUserId = me?.memberId ?? 0

  useEffect(() => {
    if (gameId && gameRooms && gameRooms.length > 0 && selectedRoomId === 0) {
      setSelectedRoomId(gameRooms[0].roomId)
    }
  }, [gameId, gameRooms, selectedRoomId])

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: C.dark, color: C.fg1 }}>
      <NavBar />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 사이드바 */}
        <div style={{ width: 260, borderRight: `1px solid ${C.border}`, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.fg3, marginBottom: 8 }}>채팅방</div>
          {roomsLoading && <div style={{ fontSize: 12, color: C.fg4 }}>불러오는 중...</div>}
          {!roomsLoading && rooms?.length === 0 && (
            <div style={{ fontSize: 12, color: C.fg4 }}>참여한 채팅방이 없습니다.</div>
          )}
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
              <div style={{ fontWeight: 600 }}>{room.name}</div>
              <div style={{ fontSize: 11, color: C.fg4, marginTop: 3 }}>{room.type}</div>
            </button>
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
  )
}
