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
                maxWidth: '70%', padding: '8px 14px',
                borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
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
