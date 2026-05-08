# Sportify 프론트엔드 개발 가이드

백엔드: `/Users/kang/gitdir/kt_cloud/Sortsify` (Spring Boot)

---

## 실행 방법

### 1. 환경 변수 설정

`.env.local` 파일이 없으면 생성 (`.gitignore`에 포함, 커밋 안 됨):

```bash
echo "VITE_API_BASE_URL=http://localhost:8080" > .env.local
```

| 파일 | 값 | 커밋 |
|------|-----|------|
| `.env.local` | `VITE_API_BASE_URL=http://localhost:8080` | ❌ |
| `.env.production` | `VITE_API_BASE_URL=https://api.sportsify.com` | ✅ |

### 2. 백엔드 실행

```bash
cd /Users/kang/gitdir/kt_cloud/Sortsify
./gradlew bootRun
# Spring Boot → http://localhost:8080
```

### 3. 프론트엔드 실행

```bash
cd /Users/kang/gitdir/kt_cloud/sportify_front
npm install
npm run dev
# Vite → http://localhost:3000
```

### 4. 프로덕션 빌드

```bash
npm run build
# dist/ 생성
```

---

## 아키텍처

### 레이어 구조

```
API 요청 흐름:
  pages/ → hooks/ → api/ → 백엔드

렌더링 흐름:
  pages/ → components/ (props 전달)
```

```
src/
├── api/                      # axios 함수만 — 상태 없음, 순수 HTTP 호출
│   ├── client.ts             # axios 인스턴스, JWT interceptor, 401 refresh
│   ├── auth.ts
│   ├── games.ts
│   ├── teams.ts
│   ├── members.ts
│   ├── chat.ts
│   ├── notifications.ts
│   ├── tickets.ts            # 예매 — 백엔드 미구현 (UI 준비)
│   └── payments.ts           # 결제 — 백엔드 미구현 (UI 준비)
│
├── hooks/                    # react-query 훅 — 캐싱/로딩/에러 처리
│   ├── useAuth.ts
│   ├── useGames.ts
│   ├── useMembers.ts
│   ├── useChat.ts
│   ├── useNotifications.ts   # SSE stream + 설정 + 채널
│   ├── useTickets.ts
│   └── usePayments.ts
│
├── components/               # 순수 UI — props만 받고 API 직접 호출 안 함
│   ├── Badge.tsx
│   ├── Btn.tsx
│   ├── NavBar.tsx            # 알림 드로어, SSE 연결 내장
│   ├── GameCard.tsx
│   ├── SeatMap.tsx
│   ├── ChatPanel.tsx
│   ├── NotificationDrawer.tsx
│   └── NotificationSettingsPanel.tsx
│
├── pages/                    # 라우트 — hooks + components 조합, 레이아웃
│   ├── LoginPage.tsx
│   ├── HomePage.tsx
│   ├── GameDetailPage.tsx
│   ├── ChatPage.tsx
│   ├── MyPage.tsx
│   ├── TicketPage.tsx
│   └── PaymentPage.tsx
│
├── store/
│   └── auth.ts               # zustand: accessToken, refreshToken, user
│
├── styles/
│   └── tokens.ts             # 색상 토큰 (C.teal, C.dark 등)
│
└── types/
    └── api.ts                # 백엔드 DTO 타입 전체
```

### 핵심 규칙

- `components/` → API 직접 호출 **금지** (hooks를 통해서만)
- `api/` → react-query **금지** (plain async 함수만)
- 서버 상태 → react-query만 (`useState`로 API 데이터 금지)
- 전역 상태 → zustand (`src/store/auth.ts`만)
- `localStorage` 직접 접근 → `store/auth.ts` 밖에서 **금지**

---

## 인증 흐름

```
1. /login 진입
   └─ Google/Kakao 버튼 클릭
      → GET {VITE_API_BASE_URL}/oauth2/authorization/{google|kakao}

2. 백엔드 OAuth2 처리 완료
   → 리다이렉트: /oauth2/callback?accessToken=...&refreshToken=...

3. LoginPage (useEffect)
   → 쿼리스트링에서 토큰 추출
   → useAuthStore.setTokens() → localStorage + zustand 저장
   → navigate('/')

4. 이후 모든 API 요청
   → axios request interceptor: Authorization: Bearer {accessToken} 자동 첨부

5. 401 응답 시 (client.ts interceptor)
   → error.response.data.code === 'UNAUTHORIZED' 일 때만 refresh 시도
   → POST /api/auth/token/refresh
   → 성공: 새 토큰 저장, 원본 요청 재시도
   → 실패 (INVALID_REFRESH_TOKEN 등): 토큰 삭제, /login 리다이렉트
```

> 401 코드가 `UNAUTHORIZED` 가 아닌 경우(예: `INVALID_REFRESH_TOKEN`, `FORBIDDEN` 등)는 refresh 시도 없이 즉시 reject. `src/api/client.ts` 참고.

---

## 페이지별 기능

| 경로 | 페이지 | 인증 | 주요 기능 |
|------|--------|------|-----------|
| `/login` | LoginPage | ❌ | Google/Kakao OAuth 버튼, 콜백 토큰 처리 |
| `/oauth2/callback` | LoginPage | ❌ | 토큰 파싱 후 홈 리다이렉트 |
| `/` | HomePage | ✅ | 경기 목록, 스포츠 필터 (전체/야구/축구/농구) |
| `/games/:id` | GameDetailPage | ✅ | 경기 상세, 좌석등급 요약, 좌석 선택 |
| `/chat` | ChatPage | ✅ | 채팅방 목록, 방 상세(참여자), join/leave, 메시지 (3초 polling) |
| `/tickets` | TicketPage | ✅ | 예매 내역 조회, 예매 취소 |
| `/payments` | PaymentPage | ✅ | 결제 내역 조회, 환불 요청 |
| `/mypage` | MyPage | ✅ | 닉네임 수정, 선호팀 우선순위/삭제, 월별 활동통계, 알림 설정, 회원 탈퇴 |

---

## API 엔드포인트

모든 URL은 `VITE_API_BASE_URL` 기준 절대 경로.

### 인증 (`src/api/auth.ts`)
```
POST /api/auth/token/refresh    토큰 갱신
POST /api/auth/logout           로그아웃
```

### 경기 (`src/api/games.ts`)
```
GET /api/games                  경기 목록 (?sportType, teamId, status, from, to) — 인증 불필요
GET /api/games/:id              경기 상세 + 좌석등급 요약 — 인증 불필요
GET /api/games/:id/seats        좌석 목록 (?grade, status) — 인증 불필요
```

### 팀 (`src/api/teams.ts`)
```
GET /api/teams                  팀 목록 (?sportType, isActive) — 인증 불필요
GET /api/teams/:id              팀 상세 — 인증 불필요
```

### 멤버 (`src/api/members.ts`)
```
GET    /api/members/me                                  내 정보
PATCH  /api/members/me/nickname                         닉네임 변경
DELETE /api/members/me                                  회원 탈퇴
GET    /api/members/me/favorite-teams                   선호팀 목록
POST   /api/members/me/favorite-teams                   선호팀 추가 (teamId, priority?)
PATCH  /api/members/me/favorite-teams/:teamId/priority  선호팀 우선순위 수정
DELETE /api/members/me/favorite-teams/:teamId           선호팀 삭제
GET    /api/members/me/activity/monthly                 월별 응원 활동 통계 (?year, month)
```

### 채팅 (`src/api/chat.ts`)
```
GET    /api/chat/rooms                      채팅방 목록 — @RequestBody { type, limit } 필수
GET    /api/chat/rooms/game/:gameId         경기별 채팅방 목록
GET    /api/chat/rooms/:roomId              채팅방 상세 (참여자 수, 내 membership)
POST   /api/chat/rooms                      채팅방 생성
POST   /api/chat/rooms/:id/join             채팅방 입장
DELETE /api/chat/rooms/:id/invite           채팅방 나가기
GET    /api/chat/messages/history/:roomId   메시지 히스토리 — @RequestBody { cursor?, limit }
POST   /api/chat/messages                   메시지 전송
DELETE /api/chat/messages/:messageId        메시지 삭제
```

> `GET /api/chat/rooms` 는 Spring `@RequestBody` 로 요청 바디를 요구함. axios `data` 옵션으로 전달.

### 알림 (`src/api/notifications.ts`)
```
GET   /api/notifications                          알림 목록 (Spring Page → content 배열)
PATCH /api/notifications/:id/read                 단건 읽음
PATCH /api/notifications/read-all                 전체 읽음
GET   /api/notifications/stream                   SSE 스트림 (?token=accessToken)
GET   /api/notifications/settings                 알림 설정 조회
PUT   /api/notifications/settings                 알림 설정 변경
GET   /api/notifications/channels                 채널 목록
POST  /api/notifications/channels                 채널 등록 (channelType, channelTarget)
DELETE /api/notifications/channels/:id            채널 삭제
PATCH  /api/notifications/channels/:id/toggle     채널 활성화 토글
```

### 티켓 (`src/api/tickets.ts`) — 백엔드 미구현
```
GET    /api/tickets                     예매 내역
GET    /api/tickets/:id                 예매 상세
POST   /api/tickets/reserve             좌석 선점 예매
POST   /api/tickets/:id/cancel          예매 취소
POST   /api/tickets/queue/enter         대기열 입장
GET    /api/tickets/queue/position      대기열 순번 (폴링)
DELETE /api/tickets/queue/leave         대기열 이탈
```

### 결제 (`src/api/payments.ts`) — 백엔드 미구현
```
GET  /api/payments                  결제 내역
GET  /api/payments/:id              결제 상세
POST /api/payments/request          결제 요청
POST /api/payments/verify           결제 검증
POST /api/payments/:id/refund       환불 요청
```

---

## 알림 시스템

### NavBar 통합

`NavBar` 컴포넌트가 알림의 단일 진입점. 모든 페이지에서 NavBar를 사용하므로 별도로 SSE 연결을 추가할 필요 없음.

```ts
// NavBar.tsx 내부
const { data: notifications = [] } = useNotifications()
useNotificationStream()  // SSE 연결
// 벨 클릭 → NotificationDrawer 오픈
```

### SSE 스트림 (`useNotificationStream`)

`EventSource`는 커스텀 헤더 미지원 → 토큰을 쿼리스트링으로 전달.

```ts
const es = new EventSource(`${baseUrl}/api/notifications/stream?token=${accessToken}`)
es.addEventListener('notification', (event) => { ... })
```

> 서버 액세스 로그에 토큰이 남을 수 있음. 프로덕션 운영 시 단명 토큰 교환 방식 검토 필요.

### 알림 설정/채널 (`NotificationSettingsPanel`)

MyPage 하단에 배치. 알림 종류 토글 + 채널(EMAIL/Slack/MQTT) 추가·삭제·활성화.

---

## 실시간 채팅

### 현재: REST polling

```ts
// src/hooks/useChat.ts
refetchInterval: 3000  // 3초마다 메시지 재조회
```

### 마이그레이션 예정: STOMP WebSocket

백엔드 STOMP 구현 완료 후 `useMessages` 훅만 교체하면 됨. `ChatPanel`, `ChatPage` 인터페이스 변경 불필요.

---

## CORS 설정

Vite 프록시 **미사용** — 프론트엔드가 백엔드를 직접 호출.

백엔드 설정: `Sortsify/src/main/resources/application-local.yml`

```yaml
app:
  cors:
    allowed-origins: http://localhost:3000,http://localhost:5173
```

`allowCredentials` 미적용 — JWT Bearer 헤더 방식이므로 쿠키 불필요.

---

## 백엔드 구현 현황

| 도메인 | 엔드포인트 | 백엔드 구현 |
|--------|-----------|-----------|
| Auth | `/api/auth/**` | ✅ |
| Member | `/api/members/**` | ✅ |
| Team | `/api/teams/**` | ✅ |
| Game | `/api/games/**` | ✅ |
| Chat | `/api/chat/**` | ✅ |
| Notification | `/api/notifications/**` | ✅ |
| Ticket | `/api/tickets/**` | ❌ 미구현 |
| Payment | `/api/payments/**` | ❌ 미구현 |

티켓/결제 페이지는 백엔드 응답 실패 시 "서비스 준비 중" 메시지를 표시하며 앱 동작에 영향 없음.

---

## 디자인 시스템

원본 목업: `ui_kits/sports_ticketing/sportify-screens.jsx`

색상 토큰: `src/styles/tokens.ts`

```ts
import { C } from '../styles/tokens'
// C.teal, C.dark, C.card, C.elevated
// C.border, C.fg1~fg4
// C.error, C.success, C.warning, C.info
```

로고: `public/logo.svg` (NavBar + 파비콘 공용)

---

## 기술 스택

| 역할 | 라이브러리 | 버전 |
|------|-----------|------|
| 빌드 | Vite | 6.x |
| UI | React | 18.x |
| 언어 | TypeScript | 5.x (strict) |
| 서버 상태 | TanStack Query | 5.x |
| HTTP | axios | 1.x |
| 전역 상태 | zustand | 5.x |
| 라우팅 | react-router-dom | 7.x |
| 실시간 알림 | EventSource (native) | — |
| 채팅 | REST polling → STOMP 예정 | — |
