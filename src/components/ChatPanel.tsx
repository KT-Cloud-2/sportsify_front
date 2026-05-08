import { useState, useRef, useEffect } from 'react'
import { MessageResponse } from '../types/api'
import { C } from '../styles/tokens'
import { Btn } from './Btn'

interface ChatPanelProps {
  messages: MessageResponse[]
  currentUserId: number
  onSend: (content: string) => void
  onDelete?: (messageId: number) => void
  isSending: boolean
}

export function ChatPanel({ messages, currentUserId, onSend, onDelete, isSending }: ChatPanelProps) {
  const [input, setInput] = useState('')
  const [hoveredId, setHoveredId] = useState<number | null>(null)
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: C.fg4, fontSize: 13, paddingTop: 40 }}>
            아직 메시지가 없습니다. 첫 메시지를 보내보세요.
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUserId
          const isHovered = hoveredId === msg.messageId
          return (
            <div
              key={msg.messageId}
              onMouseEnter={() => setHoveredId(msg.messageId)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 6 }}
            >
              {isMine && onDelete && isHovered && (
                <button
                  onClick={() => onDelete(msg.messageId)}
                  style={{
                    background: 'none', border: 'none', color: C.fg4,
                    cursor: 'pointer', fontSize: 12, padding: '2px 4px',
                  }}
                >
                  삭제
                </button>
              )}
              <div style={{
                maxWidth: '70%', padding: '8px 14px',
                borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: isMine ? C.teal : C.elevated,
                color: isMine ? C.deep : C.fg1, fontSize: 14,
                position: 'relative',
              }}>
                {!isMine && (
                  <div style={{ fontSize: 10, color: C.fg4, marginBottom: 4 }}>
                    #{msg.senderId}
                  </div>
                )}
                {msg.content}
                <div style={{ fontSize: 10, color: isMine ? 'rgba(14,36,33,0.6)' : C.fg4, marginTop: 4, textAlign: 'right' }}>
                  {new Date(msg.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: 16, borderTop: `1px solid ${C.border}`, display: 'flex', gap: 10, flexShrink: 0 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="메시지 입력..."
          style={{
            flex: 1, background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10,
            padding: '10px 14px', color: C.fg1, fontSize: 14, outline: 'none', fontFamily: 'inherit',
          }}
        />
        <Btn onClick={handleSend} disabled={isSending || !input.trim()}>전송</Btn>
      </div>
    </div>
  )
}
