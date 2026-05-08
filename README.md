# Sportify — KT Cloud Sports Design System

**제품명**: Sportify  
**팀**: kt cloud 백엔드 3팀  
**언어**: Korean + English (bilingual)  
**스택**: React, PostgreSQL, Redis, WebSocket, MQTT, AWS ALB+EC2

---

## 팀 구성

| 이름 | 담당 도메인 |
|---|---|
| 오예진 | 회원 · 인증 · 팀 |
| 강정훈 | 팀 · 알림 · 인프라 |
| 주병규 | 채팅 |
| 손하영 | 예매 · 경기 |
| 유창민 | 결제 |

---

## Sources

| Resource | Notes |
|---|---|
| Logo SVG | `assets/logo.svg` — 팀 제공 |
| DB Schema | 붙여넣기 제공 (PostgreSQL DDL) |
| 요구사항 정의서 | 붙여넣기 제공 |
| PRD | Sportify PRD v1 |
| Figma | 미제공 |

---

## Products / Surfaces

| Product | Description |
|---|---|
| **스포츠 티켓팅** | 야구·축구·농구 티켓 예매 플랫폼 (대기열 + 좌석선점 + 결제) |
| **팀 채팅** | WebSocket 기반 실시간 채팅 (채팅방 생성·입장·초대·메시지) |
| **알림 시스템** | Redis Streams → Fan-out → EMAIL·MQTT·Slack |
| **Admin Dashboard** | 경기·팀·좌석·결제 운영 대시보드 |

---

## DOMAIN STRUCTURE

### 회원 (Member)
- OAuth 로그인 (Google, Kakao) — `provider` + `provider_id` UNIQUE
- JWT + Refresh Token (HttpOnly Cookie, Stateless)
- 상태: `ACTIVE` / `INACTIVE` / `WITHDRAWN` / `DORMANT` (1년 미접속)
- Role: `USER` / `ADMIN`
- Activity log: `LOGIN_SUCCESS`, `LOGIN_FAIL`, `TICKET_RESERVED`, `PAYMENT_SUCCESS`, `PAYMENT_FAIL`

### 팀 / 경기 (Team / Game)
- `sport_type`: `BASEBALL`, `SOCCER`, `BASKETBALL`
- 경기 상태 전이: `SCHEDULED → OPEN → IN_PROGRESS → FINISHED` (CANCELLED 가능)
- Soft Delete (`deleted_at`)
- 선호 팀 등록 (priority 기반 정렬)

### 예매 (Booking)
**대기열 (Queue)**
- Redis Sorted Set (Score = 요청 시각)
- SSE 기반 실시간 순번 전달
- 진입 UUID (TTL 15분), SSE 끊김 30초 내 재연결 시 순번 유지

**좌석 선점 (Seat Hold)**
- Redis `SETNX` + TTL 15분
- DB Pessimistic Lock (`SELECT FOR UPDATE`) 2차 검증
- `seat_status`: `AVAILABLE → RESERVED → CONFIRMED`
- `order_seats.status`: `PENDING → PAYING → EXPIRED / CANCELLED`

**1인 제한**: `games.max_ticket_per_user`

### 결제 (Payment)
- Idempotency Key 기반 중복 결제 방지
- PG Webhook (IP 화이트리스트 + 시크릿 키 서명 검증)
- 상태: `PENDING → COMPLETED → REFUNDED`
- `payment_transactions_history` (요청/응답 payload 전체 저장)

### 채팅 (Chat)
- WebSocket + Redis Pub/Sub
- 채팅방 타입: `PUBLIC` / `PRIVATE`
- 메시지 타입: `TEXT` / `IMAGE` / `FILE`
- 멤버 상태: `INVITED → JOINED → LEFT / BANNED`
- `last_read_message_id` 기반 안읽음 수 계산

### 알림 (Notification)
```
Event 발생 → notification_events DB 저장 → Redis Streams publish
→ Consumer Group 소비 → Fan-out → 채널별 발송 (EMAIL / MQTT / Slack)
```
- 이벤트: `ticket.opened`, `payment.completed`, `game.starting`, `chat.mentioned`
- 우선순위 큐: HIGH / MEDIUM / LOW
- DLQ: 3회 재시도 후 저장, 관리자 재처리
- Idempotency: `notification_history` UNIQUE(`event_id`, `user_id`)
- MQTT: Mosquitto Broker (EC2-2), TLS :8883, 토픽 `notification/{memberId}`

### 인프라
```
ALB → Target Group → EC2-1 (8081/8082 롤링 배포)
                   → EC2-2 (PostgreSQL + Redis + Mosquitto)
```
- Slack Commands: CI/CD, 로그 조회, 서버 상태, Redis 조회, 비용 절약 모드

---

## CONTENT FUNDAMENTALS

- **Korean-first**, 기술 용어는 영어
- **경어(존댓말)**: "~하세요", "~합니다"
- 에러 메시지 예시: `"이미 선점된 좌석입니다"`, `"인당 구매 수량을 초과하였습니다"`
- CTA: `"티켓 예매"`, `"지금 구매"`, `"대기열 입장"`, `"결제하기"`
- API 문서: 영어 + 한글 주석
- 숫자/상태 강조: 대기 순번, 잔여 좌석, 가격은 크고 굵게
- Emoji: 마케팅 copy에만 (⚾ ⚽ 🏀), UI chrome에는 사용 안 함

---

## VISUAL FOUNDATIONS

### Color System
**Brand Core** (로고에서 추출)
- `#171A2C` — Brand Dark (베이스 배경)
- `#5DBBA0` — Brand Teal (Primary Accent)
- `#4EA8A9` — Teal Blue (Secondary)
- `#DBF9E8` — Teal Light (On-dark highlight)
- `#0E2421` — Deep Forest (Dark surface)

**Sport Accents**
- `#E8003D` — Baseball Red (KT Wiz)
- `#1B6B3A` — Soccer Green (필드 그린)
- `#F97316` — Basketball Orange (농구)
- `#7B2FBE` — E-Sports Purple (게이밍)

**Neutrals**: #F8F9FA → #0D1020 (10단계)

**Semantic**: Success #3ECF8E · Warning #F59E0B · Error #EF4444 · Info #3B82F6

### Typography
**Font**: Noto Sans KR Variable (`fonts/NotoSansKR-VariableFont_wght.ttf`)  
Weight range: 100–900 (Variable)

### Visual Motifs
- 어두운 스타디움 야간 분위기 (Dark navy dominant)
- 카드: 다크 서피스 (#1C2030) + 1px border + 8–12px radius
- 선점/활성 상태: Teal glow `box-shadow: 0 0 20px rgba(93,187,160,0.25)`
- 호버: brightness(1.1), border-color → teal
- 애니메이션: 150–250ms, `cubic-bezier(0.4,0,0.2,1)`
- 대기열 화면: 순번 카운트다운 강조, 진행 바

---

## ICONOGRAPHY

**Icon System**: Lucide Icons (CDN `unpkg.com/lucide`)  
Style: 24px, 1.5px stroke, rounded

핵심 아이콘:
- 예매: `ticket`, `calendar`, `map-pin`, `clock`, `users`
- 결제: `credit-card`, `check-circle`, `alert-circle`
- 채팅: `message-circle`, `send`, `paperclip`, `image`
- 알림: `bell`, `bell-off`, `mail`, `smartphone`
- 관리자: `settings`, `bar-chart`, `shield`, `zap`

---

## API Endpoints (주요)

```
GET  /api/games                    경기 목록 (sportType, teamId, status 필터)
GET  /api/games/{gameId}           경기 상세 + 좌석 요약
GET  /api/games/{gameId}/seats     좌석 목록 (teamSide, grade 필터)
GET  /api/teams                    팀 목록
POST /api/bookings/queue           대기열 등록
GET  /api/bookings/queue/status    SSE 순번 조회
POST /api/bookings/seats/hold      좌석 임시 선점
POST /api/payments                 결제 요청
GET  /api/notifications/settings   알림 설정 조회
PUT  /api/notifications/settings   알림 설정 변경
```

---

## File Index

```
/
├── README.md               ← You are here
├── CLAUDE.md               ← AI 코딩 규칙 (15년차 프론트 기준)
├── colors_and_type.css     ← CSS design tokens
├── SKILL.md                ← Agent skill manifest
├── assets/
│   └── logo.svg
├── fonts/
│   └── NotoSansKR-VariableFont_wght.ttf
├── src/                    ← Vite + React + TypeScript 앱 (백엔드 연동)
│   ├── api/                ← axios 함수 레이어
│   ├── hooks/              ← react-query 훅
│   ├── components/         ← UI 컴포넌트
│   ├── pages/              ← 라우트 페이지
│   ├── store/              ← zustand (인증)
│   ├── styles/             ← 색상 토큰
│   └── types/              ← 백엔드 DTO 타입
├── preview/                ← Design System cards (Design System 탭)
│   ├── brand-logo.html
│   ├── colors-brand.html
│   ├── colors-sport.html       ← 야구·축구·농구·e스포츠
│   ├── colors-neutral.html
│   ├── colors-semantic.html
│   ├── type-scale.html
│   ├── type-specimens.html
│   ├── spacing-tokens.html
│   ├── shadows-radii.html
│   ├── components-buttons.html
│   ├── components-badges.html
│   ├── components-inputs.html
│   └── components-cards.html
└── ui_kits/
    └── sports_ticketing/
        ├── README.md
        └── index.html      ← 홈·경기상세·대기열·좌석선점·결제·채팅·알림설정·내 티켓·Admin
```

---

## 프론트엔드 앱 실행

> 자세한 내용: [docs/frontend.md](docs/frontend.md)

```bash
# 백엔드 먼저 실행 (Sortsify 프로젝트)
cd /Users/kang/gitdir/kt_cloud/Sortsify && ./gradlew bootRun

# 프론트엔드 실행
npm install && npm run dev
# → http://localhost:3000
```
