# Sportify 프론트엔드 개발 가이드

백엔드: `/Users/kang/gitdir/kt_cloud/Sortsify` (Spring Boot)

---

## 실행 방법

### 1. 환경 변수 설정

`.env.local` 파일이 없으면 생성 (`.gitignore`에 포함되어 있어 커밋 안 됨):

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
# dist/ 생성 (337kB, gzip 109kB)
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
├── api/            # axios 함수만 — 상태 없음, 순수 HTTP 호출
│   ├── client.ts   # axios 인스턴스, JWT interceptor, 401 refresh
│   ├── auth.ts
│   ├── games.ts
│   ├── teams.ts
│   ├── members.ts
│   ├── chat.ts
│   └── notifications.ts
│
├── hooks/          # react-query 훅 — 캐싱/로딩/에러 처리
│   ├── useAuth.ts
│   ├── useGames.ts
│   ├── useMembers.ts
│   ├── useChat.ts
│   └── useNotifications.ts  # SSE stream 포함
│
├── components/     # 순수 UI — props만 받고 API 직접 호출 안 함
│   ├── Badge.tsx
│   ├── Btn.tsx
│   ├── NavBar.tsx
│   ├── GameCard.tsx
│   ├── SeatMap.tsx
│   └── ChatPanel.tsx
│
├── pages/          # 라우트 — hooks + components 조합, 레이아웃
│   ├── LoginPage.tsx
│   ├── HomePage.tsx
│   ├── GameDetailPage.tsx
│   ├── ChatPage.tsx
│   └── MyPage.tsx
│
├── store/
│   └── auth.ts     # zustand: accessToken, refreshToken, user
│
├── styles/
│   └── tokens.ts   # 색상 토큰 (C.teal, C.dark 등)
│
└── types/
    └── api.ts      # 백엔드 DTO 타입 전체
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
   → POST /api/auth/token/refresh
   → 성공: 새 토큰 저장, 원본 요청 재시도
   → 실패: 토큰 삭제, /login 리다이렉트
```

---

## 페이지별 기능

| 경로 | 페이지 | 인증 | 주요 기능 |
|------|--------|------|-----------|
| `/login` | LoginPage | ❌ | Google/Kakao OAuth 버튼, 콜백 토큰 처리 |
| `/oauth2/callback` | LoginPage | ❌ | 토큰 파싱 후 홈 리다이렉트 |
| `/` | HomePage | ✅ | 경기 목록, 스포츠 필터 (전체/야구/축구/농구) |
| `/games/:id` | GameDetailPage | ✅ | 경기 상세, 좌석등급 요약, 좌석 선택 |
| `/chat` | ChatPage | ✅ | 채팅방 목록, 메시지 (3초 polling) |
| `/mypage` | MyPage | ✅ | 프로필, 선호팀 관리, 로그아웃, SSE 알림 |

---

## API 엔드포인트

모든 URL은 `VITE_API_BASE_URL` 기준으로 절대 경로 사용.

### 인증 (`src/api/auth.ts`)
```
POST /api/auth/token/refresh    토큰 갱신
POST /api/auth/logout           로그아웃
```

### 경기 (`src/api/games.ts`)
```
GET /api/games                  경기 목록 (?sportType, teamId, status, from, to)
GET /api/games/:id              경기 상세 + 좌석등급 요약
GET /api/games/:id/seats        좌석 목록 (?grade, status)
```

### 팀 (`src/api/teams.ts`)
```
GET /api/teams                  팀 목록 (?sportType, isActive)
GET /api/teams/:id              팀 상세
```

### 멤버 (`src/api/members.ts`)
```
GET    /api/members/me                          내 정보
PATCH  /api/members/me/nickname                 닉네임 변경
DELETE /api/members/me                          회원 탈퇴
GET    /api/members/me/favorite-teams           선호팀 목록
POST   /api/members/me/favorite-teams           선호팀 추가
DELETE /api/members/me/favorite-teams/:teamId   선호팀 삭제
```

### 채팅 (`src/api/chat.ts`)
```
GET  /api/chat/rooms                    채팅방 목록
GET  /api/chat/rooms/game/:gameId       경기별 채팅방
POST /api/chat/rooms                    채팅방 생성
POST /api/chat/rooms/:id/join           채팅방 입장
GET  /api/chat/messages/history/:roomId 메시지 히스토리
POST /api/chat/messages                 메시지 전송
```

### 알림 (`src/api/notifications.ts`)
```
GET   /api/notifications              알림 목록
PATCH /api/notifications/:id/read     단건 읽음
PATCH /api/notifications/read-all     전체 읽음
GET   /api/notifications/stream       SSE 스트림 (EventSource)
```

---

## 실시간 기능

### 알림 SSE (`useNotificationStream`)

`MyPage` 마운트 시 자동 연결. 새 알림 수신 시 react-query 캐시 업데이트.

```ts
// src/hooks/useNotifications.ts
const es = new EventSource(`${baseUrl}/api/notifications/stream?token=${accessToken}`)
```

> 토큰을 URL 쿼리스트링에 포함하는 이유: `EventSource`는 커스텀 헤더 미지원.
> 서버 액세스 로그에 토큰이 남을 수 있음 — 프로덕션에서는 단명 토큰 교환 방식 검토.

### 채팅 Polling → STOMP 마이그레이션 예정

현재: REST polling `refetchInterval: 3000ms`

STOMP 완성 후 `src/hooks/useChat.ts`의 `useMessages`만 교체하면 됨.
`ChatPanel`, `ChatPage`는 인터페이스가 동일하므로 변경 불필요.

```ts
// 교체 대상 (useChat.ts)
export const useMessages = (roomId: number) =>
  useQuery({
    queryKey: ['messages', roomId],
    queryFn: () => fetchMessageHistory(roomId),
    enabled: roomId > 0,
    refetchInterval: 3000,  // ← STOMP로 교체
  })
```

---

## CORS 설정

Vite 프록시 **미사용** — 프론트엔드가 백엔드를 직접 호출.
브라우저 CORS는 백엔드 `SecurityConfig`에서 처리.

백엔드 설정 파일: `/Users/kang/gitdir/kt_cloud/Sortsify/src/main/resources/application-local.yml`

```yaml
app:
  cors:
    allowed-origins:
      - http://localhost:3000
      - http://localhost:5173
```

`allowCredentials` 미적용 — JWT Bearer 헤더 방식이므로 쿠키 불필요.

---

## 디자인 시스템 연동

원본 디자인 목업: `ui_kits/sports_ticketing/sportify-screens.jsx`

색상 토큰: `src/styles/tokens.ts`

```ts
import { C } from '../styles/tokens'
// C.teal, C.dark, C.card, C.border, C.fg1~fg4, C.error, C.success ...
```

컴포넌트 포팅 원칙: 시각적 출력 동일하게 유지, 데이터만 실제 API로 교체.

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
