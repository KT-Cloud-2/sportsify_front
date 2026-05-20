import { useState, useRef, useEffect } from "react";
import {
  MessageResponse,
  MessageMemberInfoSummaryResponse,
} from "../types/api";
import { C } from "../styles/tokens";
import { Btn } from "./Btn";

interface ChatPanelProps {
  messages: MessageResponse[];
  members: MessageMemberInfoSummaryResponse[];
  currentUserId: number;
  onSend: (content: string) => void;
  onDelete?: (messageId: number) => void;
  onDmInvite?: (senderId: number) => void;
  onTyping?: (isTyping: boolean) => void;
  isSending: boolean;
  isTyping: boolean;
}

const actionBtn = (visible: boolean): React.CSSProperties => ({
  visibility: visible ? "visible" : "hidden",
  background: "none",
  border: "none",
  color: C.fg4,
  cursor: "pointer",
  fontSize: 11,
  padding: "2px 6px",
  borderRadius: 4,
  whiteSpace: "nowrap",
  flexShrink: 0,
});

export function ChatPanel({
  messages,
  members,
  currentUserId,
  onSend,
  onDelete,
  onDmInvite,
  onTyping,
  isSending,
  isTyping,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  // ref로 추적 — state 대신 ref를 써야 빠른 연속 입력 시 stale closure 없음
  const typingActiveRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput("");
    if (typingActiveRef.current) {
      typingActiveRef.current = false;
      onTyping?.(false);
    }
  };

  const handleInputChange = (value: string) => {
    const hasValue = value.trim().length > 0;
    setInput(value);
    if (hasValue && !typingActiveRef.current) {
      typingActiveRef.current = true;
      onTyping?.(true);
    } else if (!hasValue && typingActiveRef.current) {
      typingActiveRef.current = false;
      onTyping?.(false);
    }
  };

  const getReadCount = (messageId: number) =>
    members.filter(
      (m) => m.memberId !== currentUserId && m.lastReadMessageId >= messageId,
    ).length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: C.fg4,
              fontSize: 13,
              paddingTop: 40,
            }}
          >
            아직 메시지가 없습니다. 첫 메시지를 보내보세요.
          </div>
        )}

        {messages.map((msg) => {
          if (msg.type === "SYSTEM") {
            return (
              <div
                key={msg.messageId}
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  color: C.fg4,
                  padding: "2px 0",
                  userSelect: "none",
                }}
              >
                — {msg.content} —
              </div>
            );
          }

          const isMine = msg.senderId === currentUserId;
          const isDeleted = msg.status === "DELETED";
          const isHovered = hoveredId === msg.messageId;
          const readCount = isMine ? getReadCount(msg.messageId) : 0;

          return (
            <div
              key={msg.messageId}
              onMouseEnter={() => setHoveredId(msg.messageId)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isMine ? "flex-end" : "flex-start",
                gap: 2,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
                {isMine && (
                  <button
                    onClick={() => !isDeleted && onDelete?.(msg.messageId)}
                    style={actionBtn(isHovered && !!onDelete && !isDeleted)}
                  >
                    삭제
                  </button>
                )}

                <div
                  style={{
                    maxWidth: "70%",
                    padding: "8px 14px",
                    borderRadius: isMine
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                    background: isDeleted
                      ? C.elevated
                      : isMine
                        ? C.teal
                        : C.elevated,
                    color: isDeleted ? C.fg4 : isMine ? C.deep : C.fg1,
                    fontSize: 14,
                    fontStyle: isDeleted ? "italic" : "normal",
                  }}
                >
                  {!isMine && (
                    <div
                      style={{ fontSize: 10, color: C.fg4, marginBottom: 4 }}
                    >
                      #{msg.senderId}
                    </div>
                  )}
                  {msg.content}
                  <div
                    style={{
                      fontSize: 10,
                      color:
                        isMine && !isDeleted ? "rgba(14,36,33,0.6)" : C.fg4,
                      marginTop: 4,
                      textAlign: "right",
                    }}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                {!isMine && (
                  <button
                    onClick={() => onDmInvite?.(msg.senderId)}
                    style={actionBtn(isHovered && !!onDmInvite && !isDeleted)}
                  >
                    DM
                  </button>
                )}
              </div>

              {isMine && readCount > 0 && (
                <div style={{ fontSize: 10, color: C.teal, paddingRight: 4 }}>
                  읽음 {readCount}
                </div>
              )}
            </div>
          );
        })}

        {/* 타이핑 인디케이터 */}
        {isTyping && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                display: "flex",
                gap: 3,
                padding: "10px 14px",
                background: C.elevated,
                borderRadius: "16px 16px 16px 4px",
              }}
            >
              {[0, 200, 400].map((delay) => (
                <span
                  key={delay}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: C.fg3,
                    display: "inline-block",
                    animation: "typingBounce 1.2s infinite",
                    animationDelay: `${delay}ms`,
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: 11, color: C.fg4 }}>상대방이 입력 중</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div
        style={{
          padding: 16,
          borderTop: `1px solid ${C.border}`,
          display: "flex",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <input
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="메시지 입력..."
          style={{
            flex: 1,
            background: C.elevated,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: "10px 14px",
            color: C.fg1,
            fontSize: 14,
            outline: "none",
            fontFamily: "inherit",
          }}
        />
        <Btn onClick={handleSend} disabled={isSending || !input.trim()}>
          전송
        </Btn>
      </div>
    </div>
  );
}
