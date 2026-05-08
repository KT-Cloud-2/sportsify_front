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
