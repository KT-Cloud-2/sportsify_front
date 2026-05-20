import { useEffect, useRef, useCallback, useState } from "react";
import { Client } from "@stomp/stompjs";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth";
import type {
  MessageResponse,
  MessageListResponse,
  StompEventEnvelope,
  MessageSentPayload,
  MessageDeletedPayload,
  StompReadReceiptPayload,
  TypingEventPayload,
} from "../types/api";

const WS_ORIGIN = window.location.origin.replace(/^http/, "ws");
const WS_URL = `${WS_ORIGIN}/ws/chat/websocket`;
const READ_INTERVAL_MS = 5_000;
const TYPING_STOP_DELAY_MS = 3_000;

export function useStompChat(roomId: number, roomType?: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();
  const clientRef = useRef<Client | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [typingUserIds, setTypingUserIds] = useState<number[]>([]);

  useEffect(() => {
    if (!accessToken || roomId <= 0) return;

    let readTimer: ReturnType<typeof setInterval> | null = null;

    const client = new Client({
      brokerURL: WS_URL,
      connectHeaders: { Authorization: `Bearer ${accessToken}` },
      reconnectDelay: 3_000,
      heartbeatIncoming: 10_000,
      heartbeatOutgoing: 10_000,
      onConnect: () => {
        // Main room events
        client.subscribe(`/topic/rooms/${roomId}`, (frame) => {
          try {
            const env = JSON.parse(frame.body) as StompEventEnvelope;
            switch (env.event) {
              case "MESSAGE_SENT": {
                const p = env.payload as MessageSentPayload;
                const msg: MessageResponse = {
                  messageId: p.messageId,
                  senderId: p.senderId,
                  type: p.type,
                  status: "SENT",
                  content: p.content,
                  createdAt: env.occurredAt,
                };
                qc.setQueryData<MessageListResponse>(
                  ["messages", roomId],
                  (prev) => {
                    if (!prev)
                      return {
                        messages: [msg],
                        members: null,
                        nextCursor: null,
                        hasNext: false,
                        totalCount: 1,
                      };
                    if (prev.messages.some((m) => m.messageId === p.messageId))
                      return prev;
                    const sorted = [...prev.messages, msg].sort(
                      (a, b) => a.messageId - b.messageId,
                    );
                    return { ...prev, messages: sorted };
                  },
                );
                break;
              }
              case "MESSAGE_DELETED": {
                const p = env.payload as MessageDeletedPayload;
                qc.setQueryData<MessageListResponse>(
                  ["messages", roomId],
                  (prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      messages: prev.messages.map((m) =>
                        m.messageId === p.messageId
                          ? {
                              ...m,
                              status: "DELETED",
                              content: "삭제된 메시지입니다.",
                            }
                          : m,
                      ),
                    };
                  },
                );
                break;
              }
              case "READ_RECEIPT": {
                const p = env.payload as StompReadReceiptPayload;
                qc.setQueryData<MessageListResponse>(
                  ["messages", roomId],
                  (prev) => {
                    if (!prev) return prev;
                    const existing = prev.members ?? [];
                    const updated = existing.some(
                      (m) => m.memberId === p.memberId,
                    )
                      ? existing.map((m) =>
                          m.memberId === p.memberId
                            ? { ...m, lastReadMessageId: p.lastReadMessageId }
                            : m,
                        )
                      : [
                          ...existing,
                          {
                            memberId: p.memberId,
                            lastReadMessageId: p.lastReadMessageId,
                          },
                        ];
                    return { ...prev, members: updated };
                  },
                );
                break;
              }
              case "MEMBER_JOINED":
              case "MEMBER_LEFT":
              case "MEMBER_BANNED":
                qc.invalidateQueries({ queryKey: ["chatRoom", roomId] });
                qc.invalidateQueries({ queryKey: ["chatRooms"] });
                break;
              case "ROOM_DELETED":
              case "ROOM_ARCHIVED":
                qc.invalidateQueries({ queryKey: ["chatRooms"] });
                break;
            }
          } catch {
            // ignore malformed frame
          }
        });

        // Typing topic
        client.subscribe(`/topic/rooms/${roomId}/typing`, (frame) => {
          try {
            const ev = JSON.parse(frame.body) as TypingEventPayload;
            setTypingUserIds((prev) =>
              ev.typing
                ? prev.includes(ev.userId)
                  ? prev
                  : [...prev, ev.userId]
                : prev.filter((id) => id !== ev.userId),
            );
          } catch {
            // ignore malformed frame
          }
        });

        // DIRECT 방에서만 read receipt 전송 (GAME 방은 unread 미관리)
        if (roomType === "DIRECT") {
          readTimer = setInterval(() => {
            const cached = qc.getQueryData<MessageListResponse>([
              "messages",
              roomId,
            ]);
            const msgs = cached?.messages;
            if (!msgs?.length || !client.connected) return;
            const lastId = msgs[msgs.length - 1].messageId;
            client.publish({
              destination: "/app/chat.read",
              body: JSON.stringify({ roomId, lastReadMessageId: lastId }),
            });
          }, READ_INTERVAL_MS);
        }
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (readTimer) clearInterval(readTimer);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      setTypingUserIds([]);
      client.deactivate();
      clientRef.current = null;
    };
  }, [accessToken, roomId, qc]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!clientRef.current?.connected) return;
      clientRef.current.publish({
        destination: "/app/chat.send",
        body: JSON.stringify({
          clientMessageId: crypto.randomUUID(),
          roomId,
          content,
          type: "TEXT",
        }),
      });
    },
    [roomId],
  );

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!clientRef.current?.connected) return;
      if (isTyping) {
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        clientRef.current.publish({
          destination: "/app/chat.typing",
          body: JSON.stringify({ roomId, typing: true }),
        });
        // Auto-stop typing after inactivity
        typingTimerRef.current = setTimeout(() => {
          clientRef.current?.publish({
            destination: "/app/chat.typing",
            body: JSON.stringify({ roomId, typing: false }),
          });
        }, TYPING_STOP_DELAY_MS);
      } else {
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        clientRef.current.publish({
          destination: "/app/chat.typing",
          body: JSON.stringify({ roomId, typing: false }),
        });
      }
    },
    [roomId],
  );

  return { sendMessage, sendTyping, typingUserIds };
}
