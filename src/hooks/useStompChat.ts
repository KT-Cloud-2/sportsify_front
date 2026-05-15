import { useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/auth'
import { MessageResponse } from '../types/api'

// vite proxy forwards /ws → ws://localhost:8080/ws; /websocket suffix bypasses SockJS
const WS_ORIGIN = window.location.origin.replace(/^http/, 'ws')
const WS_URL = `${WS_ORIGIN}/ws/chat/websocket`

interface StompEnvelope {
  kind: string
  roomId: number
  occurredAt: string
  payload: MessageResponse
}

export function useStompChat(roomId: number) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const qc = useQueryClient()
  const clientRef = useRef<Client | null>(null)

  useEffect(() => {
    if (!accessToken || roomId <= 0) return

    const client = new Client({
      brokerURL: WS_URL,
      connectHeaders: { Authorization: `Bearer ${accessToken}` },
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        client.subscribe(`/topic/rooms/${roomId}`, (frame) => {
          try {
            const envelope: StompEnvelope = JSON.parse(frame.body)
            if (envelope.kind !== 'MESSAGE') return
            const message = envelope.payload
            qc.setQueryData<{ items: MessageResponse[]; nextCursor: number | null; hasNext: boolean; totalCount: number }>(
              ['messages', roomId],
              (prev) => {
                if (!prev) return { items: [message], nextCursor: null, hasNext: false, totalCount: 1 }
                const alreadyExists = prev.items.some((m) => m.messageId === message.messageId)
                if (alreadyExists) return prev
                return { ...prev, items: [...prev.items, message] }
              }
            )
          } catch {
            // ignore malformed frame
          }
        })
      },
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
      clientRef.current = null
    }
  }, [accessToken, roomId, qc])

  const sendMessage = useCallback(
    (content: string) => {
      if (!clientRef.current?.connected) return
      clientRef.current.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({ roomId, content, type: 'TEXT' }),
      })
    },
    [roomId]
  )

  return { sendMessage }
}
