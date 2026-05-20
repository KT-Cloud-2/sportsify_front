import { useEffect, useRef, useCallback, useState } from "react";
import { Client } from "@stomp/stompjs";
import type { StompHeaders } from "@stomp/stompjs";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth";
import type {
  MemberResponse,
  MessageResponse,
  MessageListResponse,
  ChatRoomSummaryResponse,
  StompEventEnvelope,
  MessageSentPayload,
  MessageDeletedPayload,
  StompReadReceiptPayload,
  TypingEventPayload,
} from "../types/api";

const WS_ORIGIN = window.location.origin.replace(/^http/, "ws");
const WS_URL = `${WS_ORIGIN}/ws/chat/websocket`;
const READ_INTERVAL_MS = 5_000;

interface SubscriptionMeta {
  mainSubId: string;
  typingSubId: string;
  roomType: string;
}

export interface StompManager {
  subscribe: (roomId: number, roomType: string) => void;
  unsubscribe: (roomId: number) => void;
  sendMessage: (roomId: number, content: string) => void;
  sendTyping: (roomId: number, isTyping: boolean) => void;
  typingState: Record<number, boolean>;
}

export function useStompManager(selectedRoomId: number): StompManager {
  const accessToken = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();

  const clientRef = useRef<Client | null>(null);
  const subsRef = useRef(new Map<number, SubscriptionMeta>());
  const readTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxSentReadIdRef = useRef<Record<number, number>>({});
  const [typingState, setTypingState] = useState<Record<number, boolean>>({});

  // Refs to always-fresh values — avoid stale closures in STOMP handlers
  const qcRef = useRef(qc);
  qcRef.current = qc;

  const selectedRoomIdRef = useRef(selectedRoomId);
  selectedRoomIdRef.current = selectedRoomId;

  const currentUserIdRef = useRef(0);
  currentUserIdRef.current =
    qc.getQueryData<MemberResponse>(["me"])?.memberId ?? 0;

  const sendReadReceiptRef = useRef<(roomId: number) => void>(null!);
  sendReadReceiptRef.current = (roomId: number) => {
    const client = clientRef.current;
    if (!client?.connected) return;
    const meta = subsRef.current.get(roomId);
    if (meta?.roomType !== "DIRECT") return;
    const msgs = qcRef.current.getQueryData<MessageListResponse>([
      "messages",
      roomId,
    ])?.messages;
    if (!msgs?.length) return;
    const lastId = msgs.reduce((max, m) => Math.max(max, m.messageId), 0);
    if (lastId < (maxSentReadIdRef.current[roomId] ?? 0)) return;
    maxSentReadIdRef.current[roomId] = lastId;
    client.publish({
      destination: "/app/chat.read",
      body: JSON.stringify({ roomId, lastReadMessageId: lastId }),
    });
  };

  useEffect(() => {
    if (selectedRoomId > 0) sendReadReceiptRef.current(selectedRoomId);
  }, [selectedRoomId]);

  const onRoomEventRef = useRef<
    (roomId: number, env: StompEventEnvelope) => void
  >(null!);
  onRoomEventRef.current = (roomId, env) => {
    const q = qcRef.current;
    switch (env.event) {
      case "MESSAGE_SENT":
      case "REPLAY_MESSAGE": {
        const p = env.payload as MessageSentPayload;
        if (!p?.messageId) return;
        const msg: MessageResponse = {
          messageId: p.messageId,
          senderId: p.senderId,
          type: p.type,
          status: "SENT",
          content: p.content,
          createdAt: env.occurredAt,
        };
        q.setQueryData<MessageListResponse>(["messages", roomId], (prev) => {
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
          return {
            ...prev,
            messages: [...prev.messages, msg].sort(
              (a, b) => a.messageId - b.messageId,
            ),
          };
        });

        const meta = subsRef.current.get(roomId);
        if (
          env.event === "MESSAGE_SENT" &&
          p.type !== "SYSTEM" &&
          meta?.roomType === "DIRECT" &&
          roomId !== selectedRoomIdRef.current &&
          p.senderId !== currentUserIdRef.current
        ) {
          q.setQueryData<ChatRoomSummaryResponse[]>(
            ["chatRooms", "DIRECT"],
            (prev) => {
              if (!prev) return prev;
              return prev.map((r) =>
                r.roomId === roomId
                  ? {
                      ...r,
                      unRead: (r.unRead ?? 0) + 1,
                      lastMessage: {
                        messageId: p.messageId,
                        content: p.content,
                        type: p.type,
                        createdAt: env.occurredAt,
                      },
                    }
                  : r,
              );
            },
          );
        }
        break;
      }
      case "REPLAY_OVERFLOW":
        qcRef.current.invalidateQueries({ queryKey: ["messages", roomId] });
        break;
      case "MESSAGE_DELETED": {
        const p = env.payload as MessageDeletedPayload;
        q.setQueryData<MessageListResponse>(["messages", roomId], (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.map((m) =>
              m.messageId === p.messageId
                ? { ...m, status: "DELETED", content: "삭제된 메시지입니다." }
                : m,
            ),
          };
        });
        break;
      }
      case "READ_RECEIPT": {
        const p = env.payload as StompReadReceiptPayload;
        q.setQueryData<MessageListResponse>(["messages", roomId], (prev) => {
          if (!prev) return prev;
          const existing = prev.members ?? [];
          const updated = existing.some((m) => m.memberId === p.memberId)
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
        });
        if (p.memberId === currentUserIdRef.current) {
          q.setQueryData<ChatRoomSummaryResponse[]>(
            ["chatRooms", "DIRECT"],
            (prev) =>
              prev?.map((r) => (r.roomId === roomId ? { ...r, unRead: 0 } : r)),
          );
        }
        break;
      }
      case "MEMBER_JOINED":
      case "MEMBER_LEFT":
      case "MEMBER_INVITED":
      case "MEMBER_BANNED": {
        q.invalidateQueries({ queryKey: ["chatRoom", roomId] });
        q.invalidateQueries({ queryKey: ["messages", roomId] });
        const memberMeta = subsRef.current.get(roomId);
        if (memberMeta?.roomType === "DIRECT") {
          if (roomId !== selectedRoomIdRef.current) {
            q.setQueryData<ChatRoomSummaryResponse[]>(
              ["chatRooms", "DIRECT"],
              (prev) =>
                prev?.map((r) =>
                  r.roomId === roomId
                    ? { ...r, unRead: (r.unRead ?? 0) + 1 }
                    : r,
                ),
            );
          } else if (env.alertMessageId) {
            const client = clientRef.current;
            if (
              client?.connected &&
              env.alertMessageId > (maxSentReadIdRef.current[roomId] ?? 0)
            ) {
              maxSentReadIdRef.current[roomId] = env.alertMessageId;
              client.publish({
                destination: "/app/chat.read",
                body: JSON.stringify({
                  roomId,
                  lastReadMessageId: env.alertMessageId,
                }),
              });
            }
          }
        }
        break;
      }
      case "ROOM_UPDATED":
        q.invalidateQueries({ queryKey: ["chatRoom", roomId] });
        q.invalidateQueries({ queryKey: ["messages", roomId] });
        break;
      case "ROOM_DELETED":
      case "ROOM_ARCHIVED":
        q.setQueryData<ChatRoomSummaryResponse[]>(
          ["chatRooms", "DIRECT"],
          (prev) => prev?.filter((r) => r.roomId !== roomId),
        );
        q.setQueryData<ChatRoomSummaryResponse[]>(
          ["chatRooms", "GAME"],
          (prev) => prev?.filter((r) => r.roomId !== roomId),
        );
        q.invalidateQueries({ queryKey: ["messages", roomId] });
        break;
      case "ROOM_UNARCHIVED":
        q.invalidateQueries({ queryKey: ["chatRooms", "DIRECT"] });
        q.invalidateQueries({ queryKey: ["chatRooms", "GAME"] });
        q.invalidateQueries({ queryKey: ["messages", roomId] });
        break;
    }
  };

  const onTypingEventRef = useRef<
    (roomId: number, ev: TypingEventPayload) => void
  >(null!);
  onTypingEventRef.current = (roomId, ev) => {
    if (ev.userId === currentUserIdRef.current) {
      return;
    }
    setTypingState((prev) => {
      if (prev[roomId] === ev.typing) return prev;
      return { ...prev, [roomId]: ev.typing };
    });
  };

  const doSubscribeRef = useRef<
    (client: Client, roomId: number, roomType: string) => void
  >(null!);
  doSubscribeRef.current = (client, roomId, roomType) => {
    const msgs = qcRef.current.getQueryData<MessageListResponse>([
      "messages",
      roomId,
    ])?.messages;
    const lastId = msgs?.length ? msgs[msgs.length - 1].messageId : undefined;
    const headers: StompHeaders =
      lastId != null ? { lastMessageId: String(lastId) } : {};

    const mainSub = client.subscribe(
      `/topic/rooms/${roomId}`,
      (frame) => {
        try {
          onRoomEventRef.current(roomId, JSON.parse(frame.body));
        } catch {}
      },
      headers,
    );
    const typingSub = client.subscribe(
      `/topic/rooms/${roomId}/typing`,
      (frame) => {
        try {
          onTypingEventRef.current(roomId, JSON.parse(frame.body));
        } catch {}
      },
    );
    subsRef.current.set(roomId, {
      mainSubId: mainSub.id,
      typingSubId: typingSub.id,
      roomType,
    });
  };

  useEffect(() => {
    if (!accessToken) return;

    const client = new Client({
      brokerURL: WS_URL,
      connectHeaders: { Authorization: `Bearer ${accessToken}` },
      reconnectDelay: 3_000,
      heartbeatIncoming: 10_000,
      heartbeatOutgoing: 10_000,
      onConnect: () => {
        const snapshot = Array.from(subsRef.current.entries());
        subsRef.current.clear();
        for (const [roomId, meta] of snapshot) {
          doSubscribeRef.current(client, roomId, meta.roomType);
        }

        // 현재 선택된 DIRECT 방에만 주기적 read receipt
        readTimerRef.current = setInterval(() => {
          if (!client.connected) return;
          sendReadReceiptRef.current(selectedRoomIdRef.current);
        }, READ_INTERVAL_MS);
      },
      onDisconnect: () => {
        if (readTimerRef.current) {
          clearInterval(readTimerRef.current);
          readTimerRef.current = null;
        }
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (readTimerRef.current) clearInterval(readTimerRef.current);
      client.deactivate();
      clientRef.current = null;
    };
  }, [accessToken]);

  const subscribe = useCallback((roomId: number, roomType: string) => {
    const existing = subsRef.current.get(roomId);
    if (existing?.mainSubId) return;
    subsRef.current.set(roomId, { mainSubId: "", typingSubId: "", roomType });
    const client = clientRef.current;
    if (client?.connected) {
      doSubscribeRef.current(client, roomId, roomType);
    }
  }, []);

  const unsubscribe = useCallback((roomId: number) => {
    const meta = subsRef.current.get(roomId);
    if (!meta) return;
    const client = clientRef.current;
    if (client?.connected && meta.mainSubId) {
      client.unsubscribe(meta.mainSubId);
      client.unsubscribe(meta.typingSubId);
    }
    subsRef.current.delete(roomId);
  }, []);

  const sendMessage = useCallback((roomId: number, content: string) => {
    const client = clientRef.current;
    if (!client?.connected) return;
    client.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({
        clientMessageId: crypto.randomUUID(),
        roomId,
        content,
        type: "TEXT",
      }),
    });
  }, []);

  const sendTyping = useCallback((roomId: number, isTyping: boolean) => {
    const client = clientRef.current;
    if (!client?.connected) return;
    client.publish({
      destination: "/app/chat.typing",
      body: JSON.stringify({ roomId, typing: isTyping }),
    });
  }, []);

  return { subscribe, unsubscribe, sendMessage, sendTyping, typingState };
}
