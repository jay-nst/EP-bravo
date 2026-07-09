# EarthPaper Sprint A - Technical Design Document

> 위성 영상 셀프서비스 포털 MVP 기술 설계
> 작성일: 2026-06-24 | 상세화: 2026-06-25 (v4.2 Discovery Feed 반영)

---

## 1. 제품 개요

EarthPaper는 Observer(1.5m)와 SpaceEye-T(25cm) 위성 영상을 AOI(Area of Interest) 기반으로
검색, 클리핑, 즉시 다운로드할 수 있는 셀프서비스 포털이다.

**핵심 가치**: 기존 B2B 영업 기반의 위성 영상 구매 프로세스를 셀프서비스로 전환하여,
사용자가 지도에서 직접 영역을 그리고, 결제하고, 클리핑된 영상을 즉시 다운로드한다.

**대상 사용자**: GIS 엔지니어, 건설/토목 기획자, 농업/환경 모니터링 담당자

---

## 2. Sprint A 마일스톤 구조

```
Sprint A
  |
  +-- A1: 지도 + 인증 + 결제      (핵심 구매 플로우)
  +-- A2: 채팅 + LLM 보안          (AI 상담)
  +-- A3: 알림 + PWA + 촬영요청    (사용자 경험 완성)
```

### 2.1 A1: 지도 + 인증 + 결제 (핵심 구매 플로우)

| # | 태스크 | 파일 | 상태 | 비고 |
|---|--------|------|------|------|
| A1-01 | Supabase Auth 연동 (이메일/비밀번호) | `middleware.ts`, `(auth)/login`, `(auth)/signup` | 완료 | OAuth callback 포함 |
| A1-02 | Profile 자동 생성 trigger | `00001_initial_schema.sql` | 완료 | `handle_new_user()` |
| A1-03 | Middleware 인증 가드 | `middleware.ts` | 완료 | PROTECTED_PATHS 5개 |
| A1-04 | Mapbox GL JS 지도 렌더링 | `EarthMap.tsx` | 완료 | satellite-streets-v12 |
| A1-05 | Mapbox Draw AOI 폴리곤 그리기 | `EarthMap.tsx` | 완료 | polygon + trash 컨트롤 |
| A1-06 | 카탈로그 검색 API | `api/catalog/search/route.ts` | 완료 | **PostGIS RPC 미적용** |
| A1-07 | 카탈로그 Footprint 지도 표시 | `EarthMap.tsx` | 완료 | GeoJSON layer + click 선택 |
| A1-08 | AOI 면적/가격 계산 | `geo.ts` | 완료 | Shoelace + WGS84, 42개 테스트 |
| A1-09 | AOI 유효성 검증 게이트 | `geo.ts` | 완료 | 최소/최대 면적 체크 |
| A1-10 | 주문 생성 API | `api/payment/create/route.ts` | 완료 | Zod 검증 + Admin Client |
| A1-11 | Toss Payments 위젯 연동 | `toss/widget.ts` | 완료 | **테스트 키 미설정** |
| A1-12 | 결제 확인 + 클리핑 API | `api/payment/confirm/route.ts` | 완료 | 2-step 패턴, 자동 환불 포함 |
| A1-13 | AWS Lambda 클리핑 호출 | `aws/lambda.ts` | 완료 | **AWS 키 미설정** |
| A1-14 | S3 Presigned URL 다운로드 | `aws/s3.ts` | 완료 | 7일 만료 |
| A1-15 | 주문 목록/상태 조회 API | `api/orders/route.ts`, `api/orders/[id]/status` | 완료 | RLS 적용 |
| A1-16 | 다운로드 API | `api/download/[orderId]/route.ts` | 완료 | 만료 체크 포함 |
| A1-17 | 결제 성공/실패 페이지 | `payment/success`, `payment/fail` | 완료 | Toss redirect 처리 |
| A1-18 | AoiPanel 사이드바 컴포넌트 | `AoiPanel.tsx` | 완료 | 위성 선택 + 가격 표시 |
| A1-19 | PostGIS ST_Intersects RPC | (미구현) | **TODO** | 섹션 5.5 참조 |
| A1-20 | Toss 테스트 키 설정 | `.env.local` | **TODO** | 섹션 12 참조 |
| A1-21 | AWS Lambda + S3 설정 | `.env.local` | **TODO** | 섹션 12 참조 |

### 2.2 A2: 채팅 + LLM 보안 (AI 상담)

| # | 태스크 | 파일 | 상태 | 비고 |
|---|--------|------|------|------|
| A2-01 | 채팅 세션 CRUD API | `api/chat/sessions/route.ts` | 완료 | 생성 + 목록 |
| A2-02 | 채팅 메시지 스트리밍 API | `api/chat/route.ts` | 완료 | SSE 스트리밍 |
| A2-03 | 응답 저장 API | `api/chat/save/route.ts` | 완료 | 토큰 카운트 증가 |
| A2-04 | LLM 보안 3중 방어 | `llm/security.ts` | 완료 | 입력제한 + 인젝션 + 시스템프롬프트 |
| A2-05 | Gemini Provider | `llm/gemini.ts` | 완료 | 무료 1,500 RPD |
| A2-06 | Bedrock Provider | `llm/bedrock.ts` | 완료 | 유료 대기 |
| A2-07 | Provider 추상화 | `llm/provider.ts` | 완료 | 환경변수 전환 |
| A2-08 | 토큰 한도 RPC | `00002_chat_tokens_rpc.sql` | 완료 | `increment_chat_tokens()` |
| A2-09 | 채팅 UI 페이지 | `(main)/chat/page.tsx` | 완료 | 세션 사이드바 + 스트리밍 |

### 2.3 A3: 알림 + PWA + 촬영요청 (사용자 경험 완성)

| # | 태스크 | 파일 | 상태 | 비고 |
|---|--------|------|------|------|
| A3-01 | 알림 테이블 + 자동 trigger | `00003_notifications.sql` | 완료 | 주문/촬영 상태 변경 시 자동 |
| A3-02 | 알림 목록 API | `api/notifications/route.ts` | 완료 | 미읽음 우선 정렬 |
| A3-03 | 알림 읽음 처리 API | `api/notifications/[id]/read/route.ts` | 완료 | PATCH |
| A3-04 | NotificationBell 컴포넌트 | `NotificationBell.tsx` | 완료 | 미읽음 카운트 + 드롭다운 |
| A3-05 | 촬영 요청 API | `api/tasking/route.ts` | 완료 | 생성 + 목록 |
| A3-06 | 촬영 요청 UI 페이지 | `(main)/tasking/page.tsx` | 완료 | 폼 + 요청 목록 |
| A3-07 | PWA manifest.ts | `manifest.ts` | 완료 | **아이콘 PNG 참조 수정 필요** |
| A3-08 | 알림 Realtime 전환 | (미구현) | **TODO** | 현재 polling, 섹션 5.6 참조 |
| A3-09 | Supabase 이메일 템플릿 한글화 | (미구현) | **TODO** | 확인/비밀번호 재설정 |
| A3-10 | 대시보드 v4.2 → Bloomberg 에디토리얼 매거진 (Breaking Strip + Live Feed + Shorts + 플랫폼 리포트) | DashboardClient.tsx | **완료** | 3컬럼 Floating Panels → 단일 스크롤 매거진으로 변경 |

---

## 3. 시스템 아키텍처

```
+----------------------------------------------+
|                  Client (PWA)                 |
|   Next.js 16 App Router + React 19           |
|   Mapbox GL JS + Tailwind CSS 4              |
+------+---+---+---+---+---+---+---+-----------+
       |   |   |   |   |   |   |
       v   v   v   v   v   v   v
+----------------------------------------------+
|              API Routes (Server)              |
|  /api/catalog/search   GET  영상 검색         |
|  /api/payment/create   POST 주문 생성         |
|  /api/payment/confirm  POST 결제 확인+클리핑  |
|  /api/orders           GET  주문 목록         |
|  /api/orders/[id]/status GET 주문 상태        |
|  /api/download/[orderId] GET 다운로드 URL     |
|  /api/chat             POST 채팅 스트리밍     |
|  /api/chat/save        POST 응답 저장         |
|  /api/chat/sessions    GET/POST 세션 관리     |
|  /api/notifications    GET  알림 목록         |
|  /api/notifications/[id]/read PATCH 읽음처리  |
|  /api/tasking          GET/POST 촬영 요청     |
|  /api/dashboard/feed   GET  디스커버리 피드   |
|  /api/dashboard/summary GET 대시보드 요약     |
|  /api/dashboard/watchlist GET/POST/DEL 관심지역|
+------+---+---+---+---+---+---+---+-----------+
       |   |   |   |       |   |
       v   v   v   v       v   v
+----------+ +--------+ +---+-------+
| Supabase | |  Toss  | | AWS       |
| Cloud    | |Payments| | Lambda+S3 |
| - Auth   | |  API   | | (Clip)    |
| - DB     | +--------+ +-----------+
| - RLS    |
| - PostGIS|     +------------------+
+----------+     | LLM Provider     |
                 | Gemini (free)    |
                 | Bedrock (paid)   |
                 +------------------+
```

---

## 4. 데이터 모델

### 4.1 ERD

```
auth.users (Supabase 관리)
    |
    | 1:1 (trigger: on_auth_user_created)
    v
+------------------+        +---------------------+
|    profiles      |        |  imagery_catalog    |
+------------------+        +---------------------+
| id (PK, FK)      |        | id (PK)             |
| email            |        | satellite           |
| name?            |        | resolution          |
| company?         |        | supersolution?      |
| phone?           |        | acquired_at         |
| plan             |        | bbox (PostGIS)      |
| chat_tokens_used |        | cloud_cover?        |
| chat_tokens_limit|        | cog_url             |
| created_at       |        | thumbnail_url?      |
| updated_at       |        | price_per_km2       |
+--------+---------+        | min_area_km2        |
         |                   | metadata (JSONB)    |
         |                   | created_at          |
         |                   +----------+----------+
         |                              |
         |    +-----------+             |
         +--->|  orders   |<------------+
         |    +-----------+
         |    | id (PK)           |
         |    | user_id (FK)      |
         |    | catalog_item_id   |
         |    | aoi (PostGIS)     |
         |    | aoi_area_km2      |
         |    | status (enum)     |
         |    | total_price       |
         |    | clip_job_id?      |
         |    | clip_result_url?  |
         |    | error_message?    |
         |    | created_at        |
         |    | updated_at        |
         |    +--------+----------+
         |             |
         |    +--------v----------+    +------------------+
         |    |    payments       |    |    downloads     |
         |    +-------------------+    +------------------+
         +--->| id (PK)           |    | id (PK)          |
         |    | order_id (FK)     +--->| order_id (FK)    |
         |    | user_id (FK)      |    | user_id (FK)     |
         |    | pg_provider       |    | file_url         |
         |    | pg_payment_key?   |    | file_size?       |
         |    | amount            |    | expires_at       |
         |    | currency          |    | downloaded       |
         |    | status (enum)     |    | created_at       |
         |    | held_at?          |    +------------------+
         |    | confirmed_at?     |
         |    | refunded_at?      |
         |    | pg_response (JSONB)|
         |    | created_at        |
         |    +-------------------+
         |
         |    +-------------------+    +------------------+
         +--->| chat_sessions     |    | chat_messages    |
         |    +-------------------+    +------------------+
         |    | id (PK)           +--->| id (PK)          |
         |    | user_id (FK)      |    | session_id (FK)  |
         |    | title?            |    | role             |
         |    | tokens_used       |    | content          |
         |    | created_at        |    | tokens           |
         |    | updated_at        |    | metadata (JSONB) |
         |    +-------------------+    | created_at       |
         |                             +------------------+
         |
         |    +-------------------+    +------------------+
         +--->| tasking_requests  |    | notifications    |
         |    +-------------------+    +------------------+
         |    | id (PK)           |    | id (PK)          |
         |    | user_id (FK)      +--->| user_id (FK)     |
         |    | aoi (PostGIS)     |    | type             |
         |    | preferred_date_*  |    | title            |
         |    | contact_email     |    | message          |
         |    | contact_phone?    |    | read             |
         |    | notes?            |    | link?            |
         |    | status            |    | metadata (JSONB) |
         |    | created_at        |    | created_at       |
         |    +-------------------+    +------------------+
         |
         |    +-------------------+    +------------------+
         +--->| watchlist_areas   |    | feed_items       |
              +-------------------+    +------------------+
              | id (PK)           |    | id (PK)          |
              | user_id (FK)      |    | type (enum)      |
              | name              |    | title            |
              | geometry(PostGIS) |    | description?     |
              | new_images_count  |    | thumbnail_url?   |
              | created_at        |    | link_url?        |
              | updated_at        |    | link_action      |
              +-------------------+    | metadata (JSONB) |
                                       | priority         |
                                       | published_at     |
                                       | is_active        |
                                       | created_at       |
                                       +------------------+
```

### 4.2 주요 Enum 타입

| Enum | 값 | 용도 |
|------|-----|------|
| `order_status` | pending, payment_held, processing, completed, failed, refunded | 주문 상태 머신 |
| `payment_status` | held, confirmed, refund_queued, refunded, failed | 결제 상태 |
| `satellite` | observer, spaceeye-t | 위성 종류 |
| `plan` | free, pro, annual | 사용자 요금제 |
| `tasking_status` | received, reviewing, quoted, accepted, rejected | 촬영 요청 상태 |
| `chat_role` | user, assistant, system | 채팅 메시지 역할 |
| `notification_type` | order_completed, order_failed, tasking_update, system | 알림 종류 |
| `feed_type` | analysis, shorts, trending, news, community, report, citadel, predict, warden, northpaper | Discovery Feed + 플랫폼별 콘텐츠 타입 |

### 4.3 공간 인덱스

```sql
-- PostGIS GiST 인덱스: 카탈로그 영상의 bbox 공간 검색
CREATE INDEX idx_catalog_bbox ON imagery_catalog USING gist(bbox);
CREATE INDEX idx_catalog_acquired ON imagery_catalog(acquired_at DESC);
CREATE INDEX idx_catalog_satellite ON imagery_catalog(satellite);

-- 복합 인덱스: 주문 조회 최적화
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- 알림 미읽음 부분 인덱스 (빈번한 쿼리 최적화)
CREATE INDEX idx_notifications_unread ON notifications(user_id, read) WHERE read = false;
```

### 4.4 RLS (Row Level Security) 정책

모든 테이블에 RLS 활성화. 원칙: **사용자는 자신의 데이터만 접근**.

| 테이블 | SELECT | INSERT | UPDATE |
|--------|--------|--------|--------|
| profiles | `auth.uid() = id` | (trigger) | `auth.uid() = id` |
| imagery_catalog | authenticated | (admin only) | (admin only) |
| orders | `auth.uid() = user_id` | `auth.uid() = user_id` | (server only) |
| payments | `auth.uid() = user_id` | (server only) | (server only) |
| downloads | `auth.uid() = user_id` | (server only) | (server only) |
| chat_sessions | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| chat_messages | session ownership | session ownership | - |
| tasking_requests | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| notifications | `auth.uid() = user_id` | (server only) | - |
| feed_items | authenticated (is_active) | (admin only) | (admin only) |
| watchlist_areas | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |

서버 측 쓰기 작업(결제, 주문 상태 변경, 알림 생성)은 `service_role` 키를 사용하는 Admin Client로 수행하여 RLS를 우회한다.

---

## 5. 핵심 플로우 상세

### 5.1 주문-결제-클리핑 플로우 (F1: 2-Step Payment)

```
User                    Server              Toss         Lambda       S3
 |                        |                  |             |           |
 |  1. AOI 그리기          |                  |             |           |
 |  2. POST /payment/create|                 |             |           |
 |----------------------->|                  |             |           |
 |  {orderId, amount}     |                  |             |           |
 |<-----------------------|                  |             |           |
 |                        |                  |             |           |
 |  3. Toss Widget 결제   |                  |             |           |
 |--------------------------------------->  |             |           |
 |  {paymentKey}          |                  |             |           |
 |<---------------------------------------|  |             |           |
 |                        |                  |             |           |
 |  4. POST /payment/confirm               |             |           |
 |----------------------->|                  |             |           |
 |                        |  5. confirm      |             |           |
 |                        |----------------->|             |           |
 |                        |  payment_held    |             |           |
 |                        |<-----------------|             |           |
 |                        |                  |             |           |
 |                        |  6. invokeLambdaClip           |           |
 |                        |-------------------------------->|          |
 |                        |                  |  clip COG   |           |
 |                        |                  |             |---------->|
 |                        |                  |  result     |           |
 |                        |<--------------------------------|          |
 |                        |                  |             |           |
 |                        | [성공시]                                    |
 |                        |  7a. order=completed                       |
 |                        |      payment=confirmed                     |
 |                        |      download 레코드 생성 (7일 만료)        |
 |                        |      DB trigger -> 알림 자동 생성           |
 |  {status: completed}   |                                            |
 |<-----------------------|                                            |
 |                        |                                            |
 |                        | [실패시]                                    |
 |                        |  7b. order=failed                          |
 |                        |      cancel payment (자동 환불)             |
 |                        |      payment=refunded                      |
 |                        |      order=refunded                        |
 |                        |      DB trigger -> 실패 알림 생성           |
 |  {status: refunded}    |                                            |
 |<-----------------------|                                            |
```

**상태 머신**:

```
                  +--------+
                  | pending|
                  +---+----+
                      |
                      v (Toss confirm 성공)
               +-----------+
               |payment_held|
               +-----+-----+
                     |
                     v (Lambda 호출)
               +-----------+
               | processing|
               +-----+-----+
                    / \
          성공 /     \ 실패
              v       v
       +---------+ +------+
       |completed| |failed|
       +---------+ +--+---+
                       |
                       v (자동 환불)
                   +--------+
                   |refunded|
                   +--------+
```

### 5.2 API 계약 상세 (Request/Response)

#### POST /api/payment/create

```
Request:
{
  catalogItemId: string (UUID),          // 카탈로그 영상 ID
  aoi: {
    type: "Polygon",
    coordinates: [[[lng, lat], ...]]     // GeoJSON Polygon
  }
}

Response 200:
{
  orderId: string (UUID),                // 생성된 주문 ID (Toss orderId로 사용)
  amount: number,                        // 계산된 총 가격 (USD)
  orderName: string                      // "observer 위성영상 (42.5km²)"
}

Error 400: { error: "최소 주문 면적은 25km²입니다. 현재: 12km²" }
Error 401: { error: "로그인이 필요합니다" }
Error 404: { error: "영상을 찾을 수 없습니다" }
Error 500: { error: "주문 생성 실패", details: "..." }
```

#### POST /api/payment/confirm

```
Request:
{
  paymentKey: string,                    // Toss에서 발급한 결제키
  orderId: string (UUID),               // payment/create에서 받은 orderId
  amount: number                         // 결제 금액 (서버 재검증용)
}

Response 200 (성공):
{
  status: "completed",
  orderId: string,
  message: "결제 및 클리핑 완료"
}

Response 200 (클리핑 실패 -> 자동환불):
{
  status: "refunded",
  orderId: string,
  message: "클리핑 실패로 자동 환불되었습니다"
}

Error 400: { error: "결제 실패: CARD_DECLINED", code: "..." }
Error 400: { error: "결제 금액이 일치하지 않습니다" }
Error 404: { error: "주문을 찾을 수 없거나 이미 처리된 주문입니다" }
Error 500: { status: "refund_failed", message: "환불 처리 중 오류..." }
```

#### GET /api/catalog/search

```
Query Parameters:
  west:          number (-180~180, 필수)
  south:         number (-90~90, 필수)
  east:          number (-180~180, 필수)
  north:         number (-90~90, 필수)
  satellite:     "observer" | "spaceeye-t" (선택)
  maxCloudCover: number (0~100, 선택)
  limit:         number (1~100, 기본 20)

Response 200:
{
  items: CatalogItem[],                  // 촬영일 DESC 정렬
  count: number
}

CatalogItem:
{
  id: string,
  satellite: "observer" | "spaceeye-t",
  resolution: "1.5m" | "25cm",
  supersolution: "1m" | "8.3cm" | null,
  acquired_at: string (ISO 8601),
  bbox: GeoJSON.Polygon,
  cloud_cover: number | null,
  cog_url: string,
  thumbnail_url: string | null,
  price_per_km2: number,
  min_area_km2: number,
  metadata: {},
  created_at: string
}
```

#### POST /api/chat

```
Request:
{
  sessionId: string (UUID),
  message: string (최대 2,000자)
}

Response 200: SSE Stream (text/event-stream)
  data: {"text": "안녕하세요..."}
  data: {"text": " 위성 영상에"}
  data: [DONE]

Error 400: { error: "메시지가 너무 깁니다 (최대 2000자, 현재 2150자)" }
Error 400: { error: "허용되지 않는 메시지 패턴이 감지되었습니다" }
Error 429: { error: "채팅 토큰 한도에 도달했습니다 (1000 토큰)" }
Error 404: { error: "채팅 세션을 찾을 수 없습니다" }
```

#### POST /api/chat/save

```
Request:
{
  sessionId: string (UUID),
  content: string                        // AI 응답 전체 텍스트
}

Response 200: { success: true }
```

#### GET /api/notifications

```
Response 200:
{
  notifications: Notification[]          // created_at DESC, 미읽음 우선
}

Notification:
{
  id: string,
  type: "order_completed" | "order_failed" | "tasking_update" | "system",
  title: string,
  message: string,
  read: boolean,
  link: string | null,                   // 관련 페이지 경로 (예: "/portal")
  created_at: string
}
```

#### PATCH /api/notifications/[id]/read

```
Response 200: { success: true }
Error 404: { error: "알림을 찾을 수 없습니다" }
```

#### GET /api/orders

```
Response 200:
{
  orders: Order[]                        // created_at DESC
}
```

#### GET /api/orders/[id]/status

```
Response 200:
{
  status: OrderStatus,
  updated_at: string
}
```

#### GET /api/download/[orderId]

```
Response 200:
{
  url: string,                           // S3 Presigned URL (1시간 유효)
  fileName: string,
  fileSize: number | null,
  expiresAt: string                      // 다운로드 기한 (7일)
}

Error 404: { error: "다운로드를 찾을 수 없습니다" }
Error 410: { error: "다운로드 기간이 만료되었습니다" }
```

#### POST /api/tasking

```
Request:
{
  aoi: GeoJSON.Polygon,
  preferredDateFrom: string | null,      // YYYY-MM-DD
  preferredDateTo: string | null,
  contactEmail: string,
  contactPhone: string | null,
  notes: string | null
}

Response 201: { id: string, status: "received" }
```

#### GET /api/tasking

```
Response 200:
{
  requests: TaskingRequest[]             // created_at DESC
}
```

### 5.3 에러 핸들링 매트릭스

| 시나리오 | 서버 처리 | 사용자에게 보이는 것 | 복구 방법 |
|---------|----------|-------------------|----------|
| AOI 면적 부족 | 400 + 에러 메시지 | AoiPanel에 빨간 에러 텍스트, 구매 버튼 비활성화 | AOI 다시 그리기 |
| AOI 면적 초과 (>10,000km²) | 400 + 에러 메시지 | AoiPanel에 빨간 에러 텍스트 | AOI 축소 |
| 카탈로그 항목 미존재 | 404 | alert("영상을 찾을 수 없습니다") | 다른 영상 선택 |
| Toss 결제 취소 (사용자) | 클라이언트에서 catch | 무시 (에러 아님) | 재시도 가능 |
| Toss 결제 실패 (카드 거절 등) | 400 + TossError | alert("결제 실패: {message}") | 다른 결제 수단 |
| 결제 금액 불일치 (위변조 시도) | 400 | alert("결제 금액이 일치하지 않습니다") | 재주문 |
| Lambda 클리핑 실패 | 자동 환불 진행 | "클리핑 실패로 자동 환불되었습니다" + 알림 | 재주문 |
| 자동 환불 실패 | 500, refund_failed | "고객센터로 문의해주세요" | 수동 환불 |
| 채팅 토큰 한도 초과 | 429 | "채팅 토큰 한도에 도달했습니다" | 요금제 업그레이드 |
| 프롬프트 인젝션 감지 | 400 | "허용되지 않는 메시지 패턴" | 정상 메시지 입력 |
| LLM Provider 오류 | 500 | "응답 생성 중 오류" | 재시도 |
| Supabase 인증 만료 | 401 (middleware redirect) | /login으로 리다이렉트 | 재로그인 |
| 다운로드 기간 만료 (7일) | 410 | "다운로드 기간이 만료되었습니다" | 재주문 |

### 5.4 채팅 스트리밍 플로우 (F8: LLM Security)

```
User                    Server               LLM Provider
 |                        |                       |
 |  POST /api/chat        |                       |
 |  {sessionId, message}  |                       |
 |----------------------->|                       |
 |                        |                       |
 |                        |  1. Auth 검증 (getUser)        |
 |                        |  2. Zod 스키마 검증             |
 |                        |  3. F8 Defense 1: 길이 (2000자) |
 |                        |  4. F8 Defense 2: 인젝션 패턴   |
 |                        |     10개 정규식 매칭             |
 |                        |  5. 토큰 한도 확인               |
 |                        |     free: 1,000 / pro: 20,000   |
 |                        |  6. 세션 소유권 확인 (RLS)       |
 |                        |  7. 사용자 메시지 DB 저장        |
 |                        |  8. 최근 20건 이력 로드          |
 |                        |  9. F8 Defense 3: 시스템 프롬프트 |
 |                        |     하드코딩 주입 (사용자 수정 불가)|
 |                        |                       |
 |                        |  streamChat()          |
 |                        |---------------------->|
 |  SSE stream            |  SSE stream           |
 |<-----------------------|<----------------------|
 |                        |                       |
 |  POST /api/chat/save   |                       |
 |  {sessionId, content}  |                       |
 |----------------------->|                       |
 |                        |  assistant 메시지 저장  |
 |                        |  increment_chat_tokens |
 |                        |   (RPC, 토큰 수 증가)  |
 |  {success: true}       |                       |
 |<-----------------------|                       |
```

**LLM 보안 3중 방어 상세 (F8)**:

```
+--------------------------------------------------+
|              Security Layer                       |
+--------------------------------------------------+
| Defense 1: Input Validation                       |
|   - MAX_INPUT_LENGTH = 2,000자                    |
|   - 빈 메시지 (trim 후 0자) 차단                   |
|                                                   |
| Defense 2: Prompt Injection Detection             |
|   10개 차단 패턴 (정규식):                          |
|   1. /ignore\s+(previous|all|above)\s+instructions/i
|   2. /system\s*prompt/i                           |
|   3. /you\s+are\s+now/i                          |
|   4. /forget\s+(everything|all|your)/i           |
|   5. /new\s+instructions/i                       |
|   6. /override\s+(system|instructions)/i         |
|   7. /act\s+as\s+(?!a\s+satellite)/i             |
|   8. /pretend\s+you/i                            |
|   9. /jailbreak/i                                |
|  10. /DAN\s+mode/i                               |
|                                                   |
| Defense 3: System Prompt Isolation                |
|   - getSystemPrompt() 하드코딩                     |
|   - 역할: 위성 영상 상담만                          |
|   - 카탈로그 외 영상 추천 금지                       |
|   - 한국어 응답                                    |
+--------------------------------------------------+
```

**토큰 한도 체계**:

| 요금제 | 월 토큰 한도 | 초과 시 |
|--------|------------|---------|
| free | 1,000 | 429 에러 + "채팅 토큰 한도에 도달" |
| pro | 20,000 | 동일 |
| annual | 20,000 | 동일 |

### 5.5 PostGIS 공간 검색 RPC (TODO - A1-19)

현재 카탈로그 검색은 satellite/cloud_cover 필터만 적용하고, bbox 공간 교차 필터는 미적용.
다음 RPC 함수를 추가해야 한다:

```sql
-- 마이그레이션: 00004_catalog_spatial_rpc.sql

CREATE OR REPLACE FUNCTION public.search_catalog_by_bbox(
  search_west double precision,
  search_south double precision,
  search_east double precision,
  search_north double precision,
  filter_satellite text DEFAULT NULL,
  filter_max_cloud real DEFAULT NULL,
  result_limit int DEFAULT 20
)
RETURNS SETOF imagery_catalog
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM imagery_catalog
  WHERE ST_Intersects(
    bbox,
    ST_MakeEnvelope(search_west, search_south, search_east, search_north, 4326)
  )
  AND (filter_satellite IS NULL OR satellite = filter_satellite)
  AND (filter_max_cloud IS NULL OR cloud_cover <= filter_max_cloud)
  ORDER BY acquired_at DESC
  LIMIT result_limit;
$$;
```

**API Route 변경** (`api/catalog/search/route.ts`):

```typescript
// 변경 전: supabase.from('imagery_catalog').select('*')...
// 변경 후:
const { data, error } = await supabase.rpc('search_catalog_by_bbox', {
  search_west: west,
  search_south: south,
  search_east: east,
  search_north: north,
  filter_satellite: satellite || null,
  filter_max_cloud: maxCloudCover ?? null,
  result_limit: limit,
});
```

### 5.6 알림 시스템 (DB Trigger + Realtime 계획)

**현재 (polling)**:

```
NotificationBell
  |
  +-- useEffect: 30초 간격 polling
  |   GET /api/notifications?unread=true
  |
  +-- 미읽음 카운트 표시
  +-- 드롭다운에 최근 5건 표시
  +-- 클릭 시 PATCH /api/notifications/[id]/read
```

**계획 (Supabase Realtime)**:

```
NotificationBell
  |
  +-- useEffect: Supabase Realtime 구독
  |   supabase.channel('notifications')
  |     .on('postgres_changes', {
  |       event: 'INSERT',
  |       schema: 'public',
  |       table: 'notifications',
  |       filter: `user_id=eq.${userId}`
  |     }, (payload) => {
  |       addNotification(payload.new)
  |     })
  |     .subscribe()
  |
  +-- 새 알림 도착 시 즉시 벨 카운트 업데이트
  +-- 브라우저 Notification API 호출 (PWA)
```

**Realtime 전환 시 필요 작업**:
1. Supabase 대시보드에서 notifications 테이블 Realtime 활성화
2. `NotificationBell.tsx`에 Realtime 구독 코드 추가
3. polling 로직 제거
4. 연결 끊김 시 fallback polling 유지

### 5.7 알림 자동 생성 (DB Trigger)

```
orders 테이블 UPDATE
      |
      v
on_order_status_change() trigger
      |
      +-- completed -> notify_user('order_completed',
      |                  '영상 준비 완료',
      |                  '주문하신 위성 영상이 준비되었습니다.',
      |                  '/portal')
      |
      +-- failed    -> notify_user('order_failed',
                         '주문 처리 실패',
                         coalesce('오류: ' || error_message, '...'),
                         '/portal')

tasking_requests 테이블 UPDATE
      |
      v
on_tasking_status_change() trigger
      |
      +-- 상태 변경 시 -> notify_user('tasking_update',
                           '촬영 요청 상태 변경',
                           '"' || new.status || '"(으)로 변경',
                           '/tasking')
```

---

## 6. LLM Provider 추상화

```
+------------------+
|   provider.ts    |
|  streamChat()    |
|  invokeChat()    |
+--------+---------+
         |
         | LLM_PROVIDER env
         |
    +----+----+
    |         |
    v         v
+-------+ +--------+
|gemini | |bedrock |
|  .ts  | |  .ts   |
+-------+ +--------+
| Free   | | Paid   |
| 1500   | | Claude |
| RPD    | | 3.5    |
+-------+ +--------+
```

**인터페이스 정의**:

```typescript
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface StreamChatParams {
  system: string;         // 시스템 프롬프트 (하드코딩)
  messages: ChatMessage[]; // 최근 20건 대화 이력
  maxTokens?: number;      // 기본 1024
}

interface InvokeChatResult {
  content: string;
  inputTokens: number;
  outputTokens: number;
}

// streamChat() -> ReadableStream<Uint8Array> (SSE)
// invokeChat() -> InvokeChatResult (동기 호출)
```

| 항목 | Gemini (기본) | Bedrock |
|------|--------------|---------|
| 모델 | gemini-2.0-flash | Claude 3.5 Sonnet |
| 비용 | 무료 (1,500 RPD) | 종량제 |
| SDK | @google/generative-ai | @aws-sdk/client-bedrock-runtime |
| 전환 | `.env`의 `LLM_PROVIDER=gemini` | `LLM_PROVIDER=bedrock` |

---

## 7. 인증 아키텍처

```
+----------------+     +------------------+     +----------------+
|  Login/Signup  |     |   Middleware      |     |  Supabase      |
|  Pages         |---->|   (middleware.ts) |---->|  Auth          |
+----------------+     +------------------+     +----------------+
                              |
                  PROTECTED_PATHS 검사:
                  /dashboard, /map, /portal, /chat, /tasking
                              |
                  미인증 -> /login?next=원래경로
                  인증됨+auth페이지 -> /dashboard 리다이렉트
                  인증됨+랜딩(/) -> /dashboard 리다이렉트
```

**인증 흐름 상세**:

```
1. 회원가입 (POST /signup)
   |
   +-- Supabase signUp(email, password)
   +-- 이메일 확인 메일 발송 (Supabase 관리)
   +-- 확인 클릭 -> /auth/callback -> code exchange
   +-- auth.users INSERT -> handle_new_user() trigger
   +-- profiles 자동 생성 (id=auth.uid, email=auth.email)

2. 로그인 (POST /login)
   |
   +-- Supabase signInWithPassword(email, password)
   +-- JWT 세션 쿠키 설정 (HttpOnly)
   +-- /dashboard로 리다이렉트

3. 보호 경로 접근
   |
   +-- middleware.ts: getUser() 호출
   +-- 세션 유효 -> 통과
   +-- 세션 무효 -> /login?next=/원래경로 리다이렉트
```

**Supabase 클라이언트 3종**:

| 클라이언트 | 파일 | 용도 | 키 | RLS |
|-----------|------|------|-----|-----|
| Browser | `client.ts` | 클라이언트 컴포넌트 | anon key | 적용 |
| Server | `server.ts` | API Route, Server Component | anon key + cookie | 적용 |
| Admin | `admin.ts` | 결제/주문 상태 변경, 알림 생성 | service_role key | **우회** |

---

## 8. 프론트엔드 상세

### 8.1 페이지 구조

```
src/app/
  |
  +-- layout.tsx              루트 레이아웃 (Geist 폰트, 다크 테마)
  +-- page.tsx                랜딩 페이지 (비로그인 전용)
  +-- manifest.ts             PWA 매니페스트
  |
  +-- (auth)/                 인증 그룹
  |   +-- layout.tsx          센터 정렬 레이아웃
  |   +-- login/page.tsx      로그인
  |   +-- signup/page.tsx     회원가입
  |
  +-- (main)/                 메인 앱 그룹
  |   +-- layout.tsx          Header 포함 레이아웃
  |   +-- dashboard/page.tsx  포털 대시보드 (로그인 후 메인 홈)
  |   +-- map/page.tsx        지도 (Mapbox GL + AOI 그리기)
  |   +-- portal/page.tsx     내 주문 목록
  |   +-- chat/page.tsx       AI 채팅 (세션 사이드바 + 스트리밍)
  |   +-- tasking/page.tsx    촬영 요청 (폼 + 요청 목록)
  |   +-- payment/
  |       +-- success/page.tsx 결제 성공
  |       +-- fail/page.tsx    결제 실패
  |
  +-- auth/callback/route.ts  OAuth 콜백
  +-- api/                    15개 API Route
```

### 8.2 컴포넌트 구조 및 Props

```
src/components/
  |
  +-- layout/
  |   +-- Header.tsx          상단 네비게이션 바
  |   +-- NotificationBell.tsx 알림 벨 (미읽음 카운트 + 드롭다운)
  |
  +-- map/
      +-- EarthMap.tsx        Mapbox GL JS 지도 + 레이어 표시
      +-- AoiPanel.tsx        AOI 정보 패널 (면적, 가격, 주문 버튼)
```

**EarthMap Props**:

```typescript
interface EarthMapProps {
  onAoiChange?: (aoi: AoiSelection | null) => void;  // AOI 변경 콜백
  satellite?: SatelliteType;                           // 위성 필터 (기본: observer)
  onCatalogSelect?: (itemId: string) => void;          // 카탈로그 선택 콜백
}

interface AoiSelection {
  polygon: GeoJSON.Polygon;       // AOI 폴리곤 GeoJSON
  areaKm2: number;                // 계산된 면적
  price: number;                  // 계산된 가격
  satellite: SatelliteType;       // 적용 위성
  validationError: string | null; // 유효성 에러 (없으면 null)
}
```

**AoiPanel Props**:

```typescript
interface AoiPanelProps {
  aoi: AoiSelection | null;              // 현재 AOI (없으면 안내 메시지)
  satellite: SatelliteType;              // 현재 위성
  onSatelliteChange: (s: SatelliteType) => void;  // 위성 전환
  onPurchase: () => void;               // 구매 버튼 클릭
  purchasing: boolean;                   // 결제 진행 중 (버튼 비활성화)
  hasCatalogItem: boolean;              // 카탈로그 선택 여부
}
```

### 8.3 프론트엔드 상태 관리

지도 페이지 (`map/page.tsx`) 상태 흐름:

```
MapPage (state owner)
  |
  +-- satellite: SatelliteType              // 현재 선택된 위성
  +-- aoi: AoiSelection | null              // 현재 AOI
  +-- purchasing: boolean                    // 결제 진행 중
  +-- catalogItemId: string | null           // 선택된 카탈로그 ID
  |
  +-- EarthMap
  |     +-- map (ref): mapboxgl.Map          // Mapbox 인스턴스
  |     +-- draw (ref): MapboxDraw           // Draw 인스턴스
  |     +-- isLoaded: boolean                // 지도 로드 완료
  |     +-- catalogItems: CatalogItem[]      // 검색된 카탈로그
  |     +-- selectedItemId: string | null    // 선택된 footprint
  |     |
  |     +-- [draw.create/update] -> handleDrawUpdate -> onAoiChange(aoi)
  |     +-- [moveend] -> 500ms debounce -> searchCatalog() -> setCatalogItems
  |     +-- [click footprint] -> onCatalogSelect(itemId)
  |
  +-- AoiPanel
        +-- satellite 표시/전환
        +-- aoi 면적/가격 표시
        +-- validationError 표시 (빨간 텍스트)
        +-- "구매하기" 버튼 -> handlePurchase()
```

**구매 플로우 (클라이언트 측)**:

```
handlePurchase()
  |
  1. POST /api/payment/create
  |   body: { catalogItemId, aoi: polygon }
  |   <- { orderId, amount, orderName }
  |
  2. supabase.auth.getUser() -> user.email
  |
  3. requestTossPayment({
  |     orderId,
  |     amount,
  |     orderName,
  |     customerEmail: user.email
  |   })
  |   -> Toss SDK loadTossPayments(clientKey)
  |   -> payment.requestPayment({
  |        method: 'CARD',
  |        amount: { currency: 'KRW', value: amount },
  |        orderId,
  |        orderName,
  |        successUrl: /payment/success,
  |        failUrl: /payment/fail
  |      })
  |
  4. [Toss 결제 완료 -> /payment/success?paymentKey=...&orderId=...&amount=...]
  |
  5. payment/success/page.tsx:
     POST /api/payment/confirm
       body: { paymentKey, orderId, amount }
       <- { status: "completed" | "refunded" }
```

### 8.4 Mapbox 레이어 구성

```
Mapbox Map (satellite-streets-v12)
  |
  +-- Source: "catalog-footprints" (GeoJSON)
  |     |
  |     +-- Layer: "catalog-footprints-fill" (fill)
  |     |     paint:
  |     |       fill-color: 선택됨 ? #3b82f6 : #6366f1
  |     |       fill-opacity: 선택됨 ? 0.25 : 0.1
  |     |
  |     +-- Layer: "catalog-footprints-outline" (line)
  |           paint:
  |             line-color: 선택됨 ? #3b82f6 : #6366f1
  |             line-width: 선택됨 ? 2 : 1
  |
  +-- MapboxDraw Controls (top-left)
  |     +-- polygon: 폴리곤 그리기
  |     +-- trash: 삭제
  |
  +-- NavigationControl (top-right)
  |     +-- zoom in/out
  |     +-- compass
  |
  +-- 카탈로그 카운트 인디케이터 (bottom-left)
        "N개 영상 검색됨"
```

**카탈로그 검색 트리거**:
- 지도 `moveend` 이벤트 -> 500ms debounce -> `searchCatalog()`
- 현재 뷰포트의 bounds를 `GET /api/catalog/search`에 전달
- 결과를 GeoJSON FeatureCollection으로 변환 -> source 업데이트

### 8.5 대시보드 v4.2 설계 (Professional Discovery + Discovery Feed)

B2B 플랫폼에 맞는 전문적 대시보드. 게이미피케이션(XP, 레벨, 뱃지, 스트릭) 제거.
서비스 연결과 다양한 콘텐츠 타입(AI 분석, 숏츠, 뉴스, 커뮤니티 등) 기반 Discovery Feed 중심.

#### 8.5.1 레이아웃 구조

```
Dashboard v4.2 구조:
  |
  +-- 전체 화면 Mapbox 위성 지도 (배경, 인터랙티브)
  |
  +-- 헤더 오버레이 (서비스 네비게이션)
  |     +-- [EARTHPAPER] [홈|지도|채팅|촬영요청|내주문] [🔔(N)|이메일|로그아웃]
  |
  +-- 3-Column Floating Panels (glass-morphism)
        |
        +-- 좌측 (380px): Discovery Feed
        |     +-- 필터 탭: [전체|분석|뉴스|포스트|숏츠|트렌딩]
        |     +-- 혼합 콘텐츠 피드 (무한 스크롤)
        |         +-- AI 분석 카드 (변화탐지, NDVI, 도시열섬)
        |         +-- 숏츠 카드 (타임랩스, 전후비교)
        |         +-- 트렌딩 위치 (compact ranked list)
        |         +-- 뉴스/보고서 카드
        |         +-- 커뮤니티 포스트 (위치태그 + 반응)
        |
        +-- 중앙 (420px): 오늘의 위성 사진 + 내 주문
        |     +-- 오늘의 위성 사진 (→ /map 연결)
        |     +-- 최근 주문 상태 + 진행률 바 (→ /portal 연결)
        |
        +-- 우측 (320px): 퀵 도구
              +-- 랜덤 탐험 버튼
              +-- AI 위성 상담사 채팅 위젯 (→ /chat 확장)
              +-- 촬영 요청 CTA (→ /tasking)
              +-- 내 계정 요약 (보유영상, 분석면적, 가입일)
              +-- 관심지역 Watchlist (→ /map?aoi=)
```

#### 8.5.2 Discovery Feed 콘텐츠 타입

| 타입 | badge 색상 | 데이터 소스 | Sprint A 구현 | 비고 |
|------|-----------|-----------|--------------|------|
| AI 분석 | cyan `#22d3ee` | `feed_items` (type='analysis') | 시드 데이터 | 변화탐지, NDVI, 도시열섬 |
| 숏츠 | pink `#ec4899` | `feed_items` (type='shorts') | 시드 데이터 | 타임랩스, 전후비교 영상 |
| 트렌딩 | gold `#f59e0b` | `feed_items` (type='trending') | 집계 쿼리 | 인기 위치 Top 5 |
| 뉴스 | purple `#8b5cf6` | `feed_items` (type='news') | 시드 데이터 | 외부 뉴스 링크 |
| 커뮤니티 | green `#10b981` | `feed_items` (type='community') | 시드 데이터 | 사용자 포스트 (향후 UGC) |
| 주간 리포트 | orange `#f97316` | `feed_items` (type='report') | 시드 데이터 | 주간/월간 분석 요약 |

#### 8.5.3 새 테이블: `feed_items`

```sql
-- 마이그레이션: 00005_dashboard_feed.sql

CREATE TABLE public.feed_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN (
    'analysis', 'shorts', 'trending', 'news', 'community', 'report'
  )),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  link_url TEXT,                          -- 외부 링크 또는 내부 경로
  link_action TEXT DEFAULT 'navigate',    -- 'navigate' | 'external' | 'inline'

  -- 콘텐츠 타입별 메타데이터 (JSONB)
  metadata JSONB DEFAULT '{}',
  /*
    analysis: { analysis_type, location, lat, lng, date, visualization_type }
    shorts:   { duration_sec, views, video_url, before_url, after_url }
    trending: { rank, lat, lng, resolution, acquired_at, satellite }
    news:     { source, category, published_at }
    community:{ author_name, author_avatar, location_tag, reactions }
    report:   { period, summary }
  */

  -- 정렬/필터
  priority INT DEFAULT 0,                -- 높을수록 상단 노출
  published_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_feed_type ON feed_items(type) WHERE is_active = true;
CREATE INDEX idx_feed_published ON feed_items(published_at DESC) WHERE is_active = true;
CREATE INDEX idx_feed_priority ON feed_items(priority DESC, published_at DESC)
  WHERE is_active = true;

-- RLS: 모든 인증 사용자가 읽기 가능 (관리자만 쓰기)
ALTER TABLE feed_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feed_items_read" ON feed_items
  FOR SELECT TO authenticated USING (is_active = true);
```

#### 8.5.4 새 테이블: `watchlist_areas`

```sql
-- 마이그레이션: 00005_dashboard_feed.sql (같은 파일)

CREATE TABLE public.watchlist_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  geometry GEOMETRY(Polygon, 4326) NOT NULL,
  new_images_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_watchlist_user ON watchlist_areas(user_id);

ALTER TABLE watchlist_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "watchlist_own" ON watchlist_areas
  FOR ALL TO authenticated USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### 8.5.5 새 API 엔드포인트

##### GET /api/dashboard/feed

```
Query Parameters:
  type:    "all" | "analysis" | "shorts" | "trending" | "news"
           | "community" | "report"  (기본: "all")
  cursor:  string (ISO 8601, 페이지네이션 커서)
  limit:   number (1~20, 기본 10)

Response 200:
{
  items: FeedItem[],
  nextCursor: string | null    // 다음 페이지 커서 (없으면 끝)
}

FeedItem:
{
  id: string,
  type: "analysis" | "shorts" | "trending" | "news" | "community" | "report",
  title: string,
  description: string | null,
  thumbnail_url: string | null,
  link_url: string | null,
  link_action: "navigate" | "external" | "inline",
  metadata: {
    // 타입별 상이 (8.5.3 참조)
  },
  published_at: string (ISO 8601)
}
```

##### GET /api/dashboard/summary

```
Response 200:
{
  dailyScene: {
    id: string,
    satellite: string,
    location: string,
    acquired_at: string,
    resolution: string,
    thumbnail_url: string | null
  } | null,
  recentOrders: Order[],          // 최근 4건
  stats: {
    totalImages: number,          // 보유 영상 수
    totalAreaKm2: number,         // 총 분석 면적
    memberSince: string           // 가입일
  },
  watchlist: WatchlistArea[],     // 사용자 관심지역
  pendingTaskings: number         // 진행 중 촬영 요청 수
}
```

##### GET /api/dashboard/watchlist

```
Response 200:
{
  areas: WatchlistArea[]
}

WatchlistArea:
{
  id: string,
  name: string,
  geometry: GeoJSON.Polygon,
  new_images_count: number,
  created_at: string
}
```

##### POST /api/dashboard/watchlist

```
Request:
{
  name: string,
  geometry: GeoJSON.Polygon
}

Response 201: { id: string, name: string }
Error 400: { error: "관심지역 이름을 입력해주세요" }
```

##### DELETE /api/dashboard/watchlist/[id]

```
Response 200: { success: true }
Error 404: { error: "관심지역을 찾을 수 없습니다" }
```

#### 8.5.6 대시보드 컴포넌트 구조

```
src/app/(main)/dashboard/page.tsx (Server Component)
  |
  +-- DashboardClient.tsx (Client Component, 상태 관리)
        |
        +-- MapBackground (Mapbox 위성 지도 배경, 인터랙션 제한)
        |
        +-- DiscoveryFeedPanel (좌측 380px)
        |     +-- FeedFilterTabs (전체/분석/뉴스/포스트/숏츠/트렌딩)
        |     +-- FeedList (무한 스크롤, cursor 기반)
        |           +-- AnalysisCard
        |           +-- ShortsCard
        |           +-- TrendingList (compact ranked)
        |           +-- NewsCard
        |           +-- CommunityPostCard
        |           +-- ReportCard
        |
        +-- CenterPanel (중앙 420px)
        |     +-- DailySceneCard (오늘의 위성 사진)
        |     +-- RecentOrdersList (내 주문 3-4건)
        |           +-- OrderCard (상태 뱃지 + 진행률 바)
        |
        +-- QuickToolsPanel (우측 320px)
              +-- RandomExploreButton
              +-- ChatWidget (미니 입력, /chat 확장)
              +-- TaskingCTA (촬영 요청 버튼 + 뱃지)
              +-- AccountSummary (보유영상, 분석면적, 가입일)
              +-- WatchlistWidget (관심지역 목록)
```

**DashboardClient 상태 흐름**:

```typescript
// DashboardClient.tsx 주요 상태
interface DashboardState {
  // Discovery Feed
  feedFilter: FeedType | 'all';
  feedItems: FeedItem[];
  feedCursor: string | null;
  feedLoading: boolean;

  // Center Panel
  dailyScene: CatalogItem | null;
  recentOrders: Order[];

  // Right Panel
  stats: UserStats;
  watchlist: WatchlistArea[];
  pendingTaskings: number;

  // Map Background
  mapCenter: { lat: number; lng: number };
  mapZoom: number;
}

// 초기 로드: GET /api/dashboard/summary (SSR에서 prefetch)
// 피드 로드: GET /api/dashboard/feed?type={filter}&limit=10
// 무한 스크롤: GET /api/dashboard/feed?type={filter}&cursor={lastItem.published_at}
```

#### 8.5.7 서비스 연결 아키텍처

| 대시보드 요소 | 클릭 액션 | 이동 경로 | 전달 파라미터 |
|--------------|----------|----------|-------------|
| AI 분석 카드 | "상세 보기" | `/map` | `lat`, `lng`, `zoom`, `overlay=analysis` |
| 숏츠 카드 | 카드 클릭 | 인라인 재생 | - |
| 트렌딩 위치 | "지도에서 보기" | `/map` | `lat`, `lng`, `zoom` |
| 뉴스 카드 | 카드 클릭 | 외부 링크 | `target=_blank` |
| 커뮤니티 포스트 | 카드 클릭 | (향후) `/community/[id]` | - |
| 오늘의 사진 | "지도에서 보기" | `/map` | `scene_id` |
| 내 주문 | 카드 클릭 | `/portal` | `order_id` |
| 내 주문 | 다운로드 | 직접 다운로드 | `download_url` |
| AI 채팅 | 입력 포커스 | `/chat` | `query` (선택) |
| 촬영 요청 CTA | 버튼 클릭 | `/tasking` | - |
| 관심지역 | 카드 클릭 | `/map` | `aoi_id` |
| 랜덤 탐험 | 버튼 클릭 | 배경 지도 이동 | 랜덤 `lat`, `lng` |

#### 8.5.8 Glass-morphism 디자인 토큰

```css
/* 공통 패널 스타일 */
--glass-bg: rgba(10, 15, 30, 0.72);
--glass-border: rgba(255, 255, 255, 0.08);
--glass-hover: rgba(255, 255, 255, 0.12);
--glass-blur: blur(20px);
--radius: 16px;
--radius-sm: 10px;

/* 콘텐츠 타입별 badge 색상 */
--badge-analysis: #22d3ee;   /* cyan */
--badge-shorts: #ec4899;     /* pink */
--badge-trending: #f59e0b;   /* gold */
--badge-news: #8b5cf6;       /* purple */
--badge-community: #10b981;  /* green */
--badge-report: #f97316;     /* orange */
```

#### 8.5.9 시드 데이터 (Sprint A)

Sprint A에서는 Discovery Feed 콘텐츠를 시드 데이터로 제공한다.
실제 AI 분석 파이프라인이나 커뮤니티 기능은 Sprint B 이후 구현.

```sql
-- seed_feed.sql (예시)
INSERT INTO feed_items (type, title, description, metadata, priority) VALUES
-- AI 분석
('analysis', '서울 강남구 변화 탐지', '2025년 대비 2026년 건물 변화 분석',
 '{"analysis_type":"change_detection","location":"서울 강남구","lat":37.4979,"lng":127.0276}', 10),
('analysis', '제주도 해안선 NDVI 식생 분석', '해안 녹지 변화 추적',
 '{"analysis_type":"ndvi","location":"제주도","lat":33.4890,"lng":126.4983}', 8),
-- 숏츠
('shorts', '두바이 팜 아일랜드 타임랩스', '2020-2026 위성 타임랩스',
 '{"duration_sec":45,"views":12400,"video_url":null}', 9),
-- 트렌딩
('trending', '부산 해운대', null,
 '{"rank":1,"lat":35.1586,"lng":129.1603,"resolution":"25cm","satellite":"spaceeye-t"}', 5),
-- 뉴스
('news', '한국 위성영상 시장 2026년 전망', '시장 규모 15% 성장 예측',
 '{"source":"SpaceNews Korea","category":"commercial","published_at":"2026-06-20"}', 7),
-- 커뮤니티
('community', '경복궁 초고해상도 촬영', 'SpaceEye-T 25cm로 촬영한 경복궁',
 '{"author_name":"위성러버","author_avatar":null,"location_tag":"서울 종로구","reactions":{"likes":24,"comments":5,"shares":3}}', 6);
```

Sprint A에서 대시보드 v4.2의 **전체 UI + Discovery Feed + 서비스 연결 라우팅**을 구현한다.
별도 게이미피케이션 백엔드는 불필요. 커뮤니티 UGC 기능은 Sprint B 이후.

---

## 9. 가격 계산 로직

```typescript
// src/constants/satellite.ts
SATELLITE_CONFIG = {
  observer: {
    name: 'Observer',
    resolution: '1.5m',
    supersolution: '1m',
    pricePerKm2: 7,        // $7/km²
    minAreaKm2: 1           // 최소 1km²
  },
  'spaceeye-t': {
    name: 'SpaceEye-T',
    resolution: '25cm',
    supersolution: '8.3cm',
    pricePerKm2: 15,        // $15/km²
    minAreaKm2: 25           // 최소 25km²
  }
}

EARTH_TASKING_PRICE_PER_KM2 = 12;  // 촬영 요청 참고 가격

// src/lib/geo.ts
calculateAreaKm2(polygon)       // Shoelace + WGS84 근사
  -> coords[0] 순회
  -> 구면 초과 근사: area += toRadians(lon2-lon1) * (2 + sin(lat1) + sin(lat2))
  -> Math.abs(area * 6371² / 2)
  -> 소수점 2자리 반올림

validateAoi(area, satellite)    // 최소/최대 면적 체크
  -> area < config.minAreaKm2 -> 에러 메시지
  -> area > 10,000 -> 에러 메시지
  -> null (유효)

calculatePrice(area, satellite) // area * pricePerKm2
  -> 소수점 2자리 반올림
```

**검증 게이트** (결제 전 2단계 차단):

```
1단계: 클라이언트 (AoiPanel)
  +-- calculateAreaKm2(polygon)
  +-- validateAoi(area, satellite)
  +-- validationError 표시 -> 구매 버튼 비활성화

2단계: 서버 (api/payment/create)
  +-- calculateAreaKm2(parsed.aoi)
  +-- validateAoi(area, satellite)
  +-- 400 에러 반환 (클라이언트 우회 방지)
```

---

## 10. DB 마이그레이션 목록

| # | 파일 | 내용 | 상태 |
|---|------|------|------|
| 1 | `00001_initial_schema.sql` | 8개 테이블 + RLS + PostGIS + Trigger + 인덱스 | 완료 |
| 2 | `00002_chat_tokens_rpc.sql` | `increment_chat_tokens()` RPC 함수 | 완료 |
| 3 | `00003_notifications.sql` | notifications 테이블 + `notify_user()` + 자동 알림 trigger | 완료 |
| 4 | `00004_catalog_spatial_rpc.sql` | `search_catalog_by_bbox()` PostGIS RPC | **TODO** |
| 5 | `00005_dashboard_feed.sql` | `feed_items` + `watchlist_areas` 테이블 + RLS + 인덱스 | **TODO** |

**Seed 데이터**: `seed.sql`에 7개 카탈로그 항목 (Observer 4, SpaceEye-T 3)
**Seed 데이터**: `seed_feed.sql`에 Discovery Feed 시드 콘텐츠 (섹션 8.5.9 참조)

---

## 11. 외부 서비스 연동

| 서비스 | 용도 | 환경변수 | 상태 | 비고 |
|--------|------|---------|------|------|
| Supabase Cloud | Auth + DB + RLS + PostGIS | `NEXT_PUBLIC_SUPABASE_URL`, `*_ANON_KEY`, `SERVICE_ROLE_KEY` | 연결됨 | |
| Mapbox GL JS | 지도 렌더링 + AOI 그리기 | `NEXT_PUBLIC_MAPBOX_TOKEN` | 연결됨 | satellite-streets-v12 |
| Gemini API | AI 채팅 (무료) | `GEMINI_API_KEY`, `GEMINI_MODEL_ID` | 연결됨 | gemini-2.0-flash |
| Toss Payments | 결제 | `NEXT_PUBLIC_TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY` | **키 미설정** | 테스트 키 발급 필요 |
| AWS Lambda | COG 클리핑 | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` | **키 미설정** | ap-northeast-2 |
| AWS S3 | COG 원본 + 클리핑 결과 | `S3_BUCKET_COG`, `CLIP_OUTPUT_BUCKET` | **키 미설정** | earthpaper-clips |
| AWS Bedrock | AI 채팅 (유료, 선택) | `LLM_PROVIDER=bedrock` | 대기 | Claude 3.5 Sonnet |

### 11.1 Toss Payments 연동 상세

**클라이언트 (widget.ts)**:
```
loadTossPayments(NEXT_PUBLIC_TOSS_CLIENT_KEY)
  -> tossPayments.payment({ customerKey: email })
  -> payment.requestPayment({
       method: 'CARD',
       amount: { currency: 'KRW', value: amount },
       orderId,        // UUID (서버 생성)
       orderName,      // "observer 위성영상 (42.5km²)"
       successUrl,     // /payment/success
       failUrl         // /payment/fail
     })
```

**서버 (client.ts)**:
```
confirmPayment({ paymentKey, orderId, amount })
  -> POST https://api.tosspayments.com/v1/payments/confirm
  -> Authorization: Basic base64(secretKey + ":")

cancelPayment({ paymentKey, cancelReason })
  -> POST https://api.tosspayments.com/v1/payments/{paymentKey}/cancel

getPayment(paymentKey)
  -> GET https://api.tosspayments.com/v1/payments/{paymentKey}
```

**TossError 처리**:
- `code`: Toss 에러 코드 (CARD_DECLINED, INVALID_AMOUNT 등)
- `message`: 사용자에게 표시할 한국어 메시지

### 11.2 AWS Lambda 클리핑 상세

**Lambda 함수명**: `earthpaper-clip` (환경변수 `CLIP_LAMBDA_FUNCTION_NAME`)

**호출 방식**: `InvokeCommand` (동기, RequestResponse)

```
Request Payload:
{
  cogUrl: string,        // S3 COG 파일 URL
  aoi: GeoJSON.Polygon,  // 클리핑 영역
  outputBucket: string,  // 출력 S3 버킷
  outputKey: string       // "clips/{userId}/{orderId}.tif"
}

Response Payload:
{
  outputUrl: string,     // 클리핑된 파일 S3 URL
  fileSize: number       // 파일 크기 (bytes)
}

Error (FunctionError):
{
  errorMessage: string   // Lambda 에러 메시지
}
```

**S3 키 구조**:
```
s3://earthpaper-cog/          # COG 원본 (카탈로그)
  observer/
    {scene_id}.tif

s3://earthpaper-clips/        # 클리핑 결과
  clips/
    {user_id}/
      {order_id}.tif          # 7일 후 수동 정리 또는 Lifecycle Policy
```

---

## 12. 보안 설계

### 12.1 인증/인가

- Supabase Auth: JWT 기반 세션, HttpOnly 쿠키
- Middleware: 보호 경로 사전 차단 (5개 경로)
- API Route: 매 요청마다 `getUser()` 검증
- RLS: DB 레벨에서 데이터 격리 (user_id 기반)

### 12.2 입력 검증

모든 API Route에서 Zod 스키마 검증:

| API | 검증 항목 |
|-----|----------|
| payment/create | catalogItemId: UUID, aoi: Polygon 구조 |
| payment/confirm | paymentKey: string, orderId: UUID, amount: positive number |
| catalog/search | west/south/east/north: 경위도 범위, satellite: enum, limit: 1~100 |
| chat | sessionId: UUID, message: string |
| chat/save | sessionId: UUID, content: string |
| dashboard/feed | type: feed_type enum, cursor: ISO 8601, limit: 1~50 |
| dashboard/watchlist POST | name: string (1~50자), geometry: Polygon 구조 |

### 12.3 LLM 보안 (F8)

| 방어층 | 구현 | 코드 위치 |
|--------|------|----------|
| 입력 길이 | 2,000자 제한 | `security.ts:26` |
| 빈 메시지 | trim 후 0자 차단 | `security.ts:35` |
| 프롬프트 인젝션 | 10개 정규식 패턴 차단 | `security.ts:8-19` |
| 시스템 프롬프트 | 하드코딩, 사용자 수정 불가 | `security.ts:54-71` |
| 토큰 한도 | free: 1,000 / pro,annual: 20,000 | `satellite.ts:31-35` |
| 역할 제한 | 위성 영상 상담만 (시스템 프롬프트) | `security.ts:56` |

### 12.4 결제 보안

```
보안 게이트 체인:

1. 클라이언트 금액 계산 (참고용, 신뢰하지 않음)
2. 서버 금액 재계산 (payment/create)
   -> calculateAreaKm2(aoi) * pricePerKm2
   -> 이 값이 order.total_price로 저장
3. 결제 확인 시 금액 대조 (payment/confirm)
   -> Number(order.total_price) !== amount -> 400 차단
4. 주문 소유권 검증
   -> order.user_id === auth.uid() (RLS)
   -> order.status === 'pending' (중복 결제 방지)
5. Admin Client로 상태 변경 (RLS 우회)
   -> 사용자가 직접 주문 상태를 변경할 수 없음
```

### 12.5 환경변수 보안

```
# 클라이언트 노출 (NEXT_PUBLIC_ 접두사)
NEXT_PUBLIC_SUPABASE_URL        # 공개 API URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   # 공개 anon key (RLS로 보호)
NEXT_PUBLIC_MAPBOX_TOKEN        # 지도 렌더링용
NEXT_PUBLIC_TOSS_CLIENT_KEY     # Toss 위젯용

# 서버 전용 (절대 클라이언트 노출 금지)
SUPABASE_SERVICE_ROLE_KEY       # RLS 우회
TOSS_SECRET_KEY                 # 결제 인증
AWS_ACCESS_KEY_ID               # Lambda/S3 접근
AWS_SECRET_ACCESS_KEY           # Lambda/S3 접근
GEMINI_API_KEY                  # LLM 호출
```

---

## 13. 기술 스택

| 레이어 | 기술 | 버전 |
|--------|------|------|
| Framework | Next.js (App Router) | 16.2.9 |
| UI | React + Tailwind CSS | 19.2.4 / v4 |
| Language | TypeScript | 5.x |
| Map | Mapbox GL JS + Draw | 3.25.0 |
| Auth + DB | Supabase (Cloud) | ssr 0.12, js 2.108 |
| Spatial DB | PostGIS (Supabase 내장) | - |
| Payment | Toss Payments SDK | 2.7.1 |
| LLM (free) | Google Generative AI | 0.24.1 |
| LLM (paid) | AWS Bedrock Runtime | 3.1075 |
| Clipping | AWS Lambda + S3 | 3.1075 |
| Validation | Zod | (Next.js 내장) |
| Test | Vitest | 4.1.9 |
| PWA | Next.js manifest.ts | - |

---

## 14. 파일 구조 전체 맵

```
earthpaper/
  +-- src/
  |   +-- app/                        Next.js App Router
  |   |   +-- (auth)/                 인증 페이지 그룹
  |   |   |   +-- layout.tsx          센터 정렬 레이아웃
  |   |   |   +-- login/page.tsx      로그인 (이메일+비밀번호)
  |   |   |   +-- signup/page.tsx     회원가입 (이름+이메일+비밀번호)
  |   |   +-- (main)/                 메인 앱 페이지 그룹
  |   |   |   +-- layout.tsx          Header 포함 레이아웃
  |   |   |   +-- dashboard/page.tsx  포털 대시보드 (Server Component)
  |   |   |   +-- map/page.tsx        지도 (Client Component, Toss 연동)
  |   |   |   +-- portal/page.tsx     내 주문 목록
  |   |   |   +-- chat/page.tsx       AI 채팅 (세션 사이드바+스트리밍)
  |   |   |   +-- tasking/page.tsx    촬영 요청 (폼+목록)
  |   |   |   +-- payment/
  |   |   |       +-- success/page.tsx Toss 성공 redirect -> confirm API 호출
  |   |   |       +-- fail/page.tsx    Toss 실패 redirect -> 에러 표시
  |   |   +-- api/                    12개 API Route
  |   |   |   +-- catalog/search/route.ts    GET  카탈로그 검색
  |   |   |   +-- payment/create/route.ts    POST 주문 생성 (AOI+가격 계산)
  |   |   |   +-- payment/confirm/route.ts   POST 결제 확인+클리핑+환불
  |   |   |   +-- orders/route.ts            GET  주문 목록
  |   |   |   +-- orders/[id]/status/route.ts GET  주문 상태
  |   |   |   +-- download/[orderId]/route.ts GET  S3 Presigned URL
  |   |   |   +-- chat/route.ts              POST 채팅 (SSE 스트리밍)
  |   |   |   +-- chat/save/route.ts         POST 응답 저장+토큰 증가
  |   |   |   +-- chat/sessions/route.ts     GET/POST 세션 관리
  |   |   |   +-- notifications/route.ts     GET  알림 목록
  |   |   |   +-- notifications/[id]/read/route.ts PATCH 읽음 처리
  |   |   |   +-- tasking/route.ts           GET/POST 촬영 요청
  |   |   |   +-- dashboard/feed/route.ts   GET  Discovery Feed
  |   |   |   +-- dashboard/summary/route.ts GET  대시보드 요약
  |   |   |   +-- dashboard/watchlist/route.ts GET/POST 관심지역
  |   |   |   +-- dashboard/watchlist/[id]/route.ts DELETE 관심지역 삭제
  |   |   +-- auth/callback/route.ts  OAuth code exchange
  |   |   +-- layout.tsx              루트 레이아웃 (Geist 폰트)
  |   |   +-- manifest.ts             PWA 매니페스트
  |   |   +-- page.tsx                랜딩 (비로그인 전용)
  |   |
  |   +-- components/
  |   |   +-- layout/Header.tsx       네비게이션 (5메뉴+알림+로그아웃)
  |   |   +-- layout/NotificationBell.tsx  미읽음 카운트+드롭다운
  |   |   +-- map/EarthMap.tsx        Mapbox GL+Draw+카탈로그 레이어
  |   |   +-- map/AoiPanel.tsx        위성선택+면적+가격+구매버튼
  |   |   +-- dashboard/
  |   |       +-- DashboardClient.tsx      대시보드 클라이언트 컴포넌트 (상태 관리)
  |   |       +-- MapBackground.tsx        배경 위성 지도 (인터랙션 제한)
  |   |       +-- DiscoveryFeedPanel.tsx   좌측 Discovery Feed 패널
  |   |       +-- FeedFilterTabs.tsx       피드 필터 탭 (전체/분석/뉴스/...)
  |   |       +-- FeedList.tsx             무한 스크롤 피드 리스트
  |   |       +-- cards/AnalysisCard.tsx   AI 분석 카드
  |   |       +-- cards/ShortsCard.tsx     숏츠 카드
  |   |       +-- cards/TrendingList.tsx   트렌딩 위치 (compact)
  |   |       +-- cards/NewsCard.tsx       뉴스/보고서 카드
  |   |       +-- cards/CommunityPostCard.tsx  커뮤니티 포스트 카드
  |   |       +-- cards/ReportCard.tsx     주간 리포트 카드
  |   |       +-- CenterPanel.tsx          중앙 패널 (오늘의 사진 + 주문)
  |   |       +-- DailySceneCard.tsx       오늘의 위성 사진 카드
  |   |       +-- RecentOrdersList.tsx     최근 주문 목록
  |   |       +-- QuickToolsPanel.tsx      우측 퀵 도구 패널
  |   |       +-- ChatWidget.tsx           미니 채팅 위젯
  |   |       +-- WatchlistWidget.tsx      관심지역 위젯
  |   |       +-- AccountSummary.tsx       내 계정 요약
  |   |
  |   +-- constants/satellite.ts      위성 설정 (가격, 최소면적, 토큰한도)
  |   +-- hooks/                      (확장 예정)
  |   +-- lib/
  |   |   +-- aws/lambda.ts           Lambda 동기 호출 (InvokeCommand)
  |   |   +-- aws/s3.ts               S3 Presigned URL 생성
  |   |   +-- llm/bedrock.ts          Bedrock 스트리밍+동기
  |   |   +-- llm/gemini.ts           Gemini 스트리밍+동기
  |   |   +-- llm/provider.ts         환경변수 기반 Provider 분기
  |   |   +-- llm/security.ts         F8 3중 방어 (입력+인젝션+시스템프롬프트)
  |   |   +-- supabase/admin.ts       Admin Client (service_role, RLS 우회)
  |   |   +-- supabase/client.ts      Browser Client (anon key)
  |   |   +-- supabase/server.ts      Server Client (anon key + cookie)
  |   |   +-- toss/client.ts          Toss 서버 API (confirm/cancel/get)
  |   |   +-- toss/widget.ts          Toss 위젯 SDK (클라이언트)
  |   |   +-- geo.ts                  면적 계산+AOI 검증+가격 계산
  |   |   +-- geo.test.ts             면적 계산 테스트
  |   |   +-- order.ts                주문 유틸리티
  |   |   +-- order.test.ts           주문 유틸리티 테스트
  |   |
  |   +-- middleware.ts               인증 미들웨어 (5개 보호 경로)
  |   +-- types/
  |       +-- database.ts             수동 DB 타입 (9개 인터페이스+6개 enum)
  |       +-- supabase.ts             자동생성 Supabase 타입
  |       +-- mapbox-gl-draw.d.ts     Mapbox Draw 타입 선언
  |
  +-- supabase/
  |   +-- migrations/
  |   |   +-- 00001_initial_schema.sql    8테이블+RLS+PostGIS+Trigger
  |   |   +-- 00002_chat_tokens_rpc.sql   increment_chat_tokens() RPC
  |   |   +-- 00003_notifications.sql     notifications+자동 알림 trigger
  |   |   +-- 00004_catalog_spatial_rpc.sql  search_catalog_by_bbox() (TODO)
  |   |   +-- 00005_dashboard_feed.sql    feed_items+watchlist_areas (TODO)
  |   +-- seed.sql                        7개 카탈로그 시드 데이터
  |   +-- seed_feed.sql                   Discovery Feed 시드 콘텐츠 (TODO)
  |   +-- config.toml                     Supabase CLI 설정
  |
  +-- docs/
  |   +-- SPRINT_A_TECHNICAL_DESIGN.md    이 문서
  |   +-- ui-design-brief.md              UI 디자인 브리프
  |
  +-- public/icon.svg                     PWA/파비콘 아이콘
  +-- package.json
  +-- .env.local                          환경변수
  +-- .env.example                        환경변수 템플릿
  +-- vitest.config.ts                    테스트 설정
```

---

## 15. 테스트 전략

### 15.1 현재 테스트 현황

| 레이어 | 도구 | 대상 | 현황 |
|--------|------|------|------|
| 단위 테스트 | Vitest | `geo.ts` (면적 계산, AOI 검증, 가격 계산) | 통과 |
| 단위 테스트 | Vitest | `security.ts` (입력 검증, 인젝션 탐지) | 통과 |
| 단위 테스트 | Vitest | `order.ts` (주문 유틸리티) | 통과 |
| 단위 테스트 | Vitest | `mock-dashboard.ts` (ID 고유성, 타입 유효성, /ko/ URL, YouTube ID, 플랫폼 커버리지) | 통과 |
| 단위 테스트 | Vitest | Feed API 로직 (필터링, 정렬, 커서 페이지네이션, limit 클램핑) | 통과 |
| 단위 테스트 | Vitest | Analytics (이벤트 트래킹) | 통과 |
| API 테스트 | (계획) | 각 API Route 입력 검증 | - |
| E2E 테스트 | (계획) | 결제 플로우, 채팅 플로우 | - |

**총 71개 테스트 통과 (7 파일)**, `npm test` 또는 `vitest run`으로 실행.

### 15.2 추가 테스트 계획

**API Route 테스트** (Vitest + 모킹):

```
payment/create:
  - 미인증 요청 -> 401
  - Zod 검증 실패 (잘못된 UUID, 잘못된 GeoJSON) -> 400
  - 카탈로그 미존재 -> 404
  - AOI 면적 부족 -> 400
  - 정상 주문 -> 200 + { orderId, amount }

payment/confirm:
  - 금액 불일치 -> 400
  - 이미 처리된 주문 -> 404
  - Toss 결제 실패 -> 400 + TossError
  - Lambda 실패 -> 200 + { status: "refunded" }
  - 환불 실패 -> 500 + { status: "refund_failed" }
  - 정상 완료 -> 200 + { status: "completed" }

chat:
  - 2,000자 초과 -> 400
  - 프롬프트 인젝션 -> 400
  - 토큰 한도 초과 -> 429
  - 세션 미소유 -> 404
  - 정상 -> SSE 스트림
```

---

## 16. 미완성 항목 및 우선순위

### P0: 즉시 필요 (코드 수정)

| # | 항목 | 설명 |
|---|------|------|
| P0-1 | `manifest.ts` 아이콘 수정 | SVG -> PNG 참조로 변경 필요 (또는 PNG 생성) |
| P0-2 | PostGIS RPC 함수 추가 | `00004_catalog_spatial_rpc.sql` 작성 + API 수정 |
| P0-3 | Supabase 이메일 템플릿 한글화 | 확인/비밀번호 재설정 이메일 |
| P0-4 | Dashboard Feed 마이그레이션 | `00005_dashboard_feed.sql` (feed_items + watchlist_areas) |
| P0-5 | Dashboard Feed 시드 데이터 | `seed_feed.sql` Discovery Feed 초기 콘텐츠 |

### P1: 외부 서비스 키 설정

| # | 항목 | 필요 작업 |
|---|------|----------|
| P1-1 | Toss Payments 테스트 키 | Toss 개발자 센터에서 발급 -> `.env.local` |
| P1-2 | AWS 계정 설정 | IAM 사용자 생성 + Lambda 함수 배포 + S3 버킷 생성 |

### P2: 기능 보완

| # | 항목 | 복잡도 | 설명 |
|---|------|--------|------|
| P2-1 | 알림 Realtime 전환 | M | polling -> Supabase Realtime subscription |
| P2-2 | 다운로드 만료 처리 | S | 만료된 downloads 표시 처리 |
| P2-3 | 채팅 Realtime | M | 현재 polling -> Realtime subscription |
| P2-4 | ~~대시보드 v4.2 적용~~ | ~~L~~ | **완료** — Bloomberg 에디토리얼 매거진으로 구현. Breaking Strip + Live Feed + Shorts + 플랫폼 리포트 |

### Sprint B 예정

- Admin 대시보드 (주문 관리, 사용자 관리, Feed 콘텐츠 관리)
- 촬영 요청 관리자 인터페이스
- 사용량 분석 및 과금
- 관심지역(Watchlist) 고급 기능 (자동 알림, AOI 분석 리포트)
- 커뮤니티 UGC 기능 (사용자 포스트 작성, 댓글, 좋아요)
- AI 분석 파이프라인 (자동 변화탐지, NDVI 분석)
- 숏츠 영상 업로드 및 인라인 재생
- 결제 통화 다중화 (USD/KRW)

## GSTACK REVIEW REPORT

### Runs

| # | Reviewer | Skill | Date | Verdict |
|---|----------|-------|------|---------|
| 1 | CEO Review | plan-ceo-review | 2025-06-26 | PASS WITH CONDITIONS (20 issues, T1-T28 tasks) |
| 2 | Eng Review | plan-eng-review | 2025-06-26 | PASS WITH CONDITIONS (27 findings) |

### Status

All 4 review sections completed. Outside Voice (Claude subagent) completed. All findings approved by user.

### Findings

| ID | Section | Severity | Finding | Recommendation | Status |
|----|---------|----------|---------|----------------|--------|
| A1 | Architecture | CRITICAL | payment/confirm에 7개 순차 DB 작업이 트랜잭션 없이 실행. Lambda 실패 시 결제 확인됐으나 주문 미완료 상태 발생 | Supabase RPC로 트랜잭션 래핑. `BEGIN...COMMIT` 블록 내에서 payments INSERT + orders UPDATE 원자적 실행 | APPROVED |
| A2 | Architecture | CRITICAL | 결제 확인 엔드포인트에 멱등성 키 없음. 네트워크 재시도 시 이중 결제/이중 주문 발생 가능 | `FOR UPDATE` 패턴: `UPDATE orders SET status='payment_held' WHERE id=$1 AND status='pending' RETURNING *` — 동시 요청 중 하나만 성공 | APPROVED |
| A3 | Architecture | HIGH | chat/route.ts에서 `tokens: 0` 하드코딩. 스트림 반환 후 서버 측 토큰 카운팅 없음. 클라이언트 주도 저장은 조작 가능 | 스트림 완료 콜백에서 서버 측 토큰 카운팅 후 DB 업데이트 | APPROVED |
| A4 | Architecture | MEDIUM | 12개 API 라우트에 동일한 10줄 인증 보일러플레이트 반복 | `withAuth(handler)` HOF 추출. 인증 로직 단일화 | APPROVED |
| A5 | Architecture | HIGH | Lambda 클리핑 호출에 타임아웃/재시도 전략 없음. 대용량 AOI에서 Lambda 15분 제한 초과 가능 | Lambda 타임아웃 명시적 설정 + Step Functions 또는 폴링 패턴으로 비동기 처리 | APPROVED |
| A6 | Architecture | HIGH | middleware.ts의 `PROTECTED_PATHS`가 페이지만 커버. `/api/*` 라우트는 미들웨어 보호 없음 | `/api` 경로를 PROTECTED_PATHS에 추가하거나 API 라우트 전용 미들웨어 매처 설정 | APPROVED |
| A7 | Architecture | LOW | 대시보드 피드 커서 기반 페이지네이션에서 동시 삽입 시 커서 충돌 가능 | `created_at` + `id` 복합 커서로 안정적 정렬 보장 | APPROVED |
| A8 | Architecture | MEDIUM | dashboard/page.tsx에서 3개 Supabase 쿼리 순차 실행 (profiles, orders, notifications) | `Promise.all()` 로 병렬화 | APPROVED |
| C1 | Code Quality | HIGH | payment/confirm에서 `res.json()` 호출 시 응답이 JSON인지 확인 안 함. HTML 에러 페이지 반환 시 크래시 | `content-type` 헤더 확인 후 파싱. non-JSON 시 원시 텍스트로 에러 로깅 | APPROVED |
| C2 | Code Quality | MEDIUM | dashboard/page.tsx에서 `user!.id` non-null assertion 3회 사용. 미들웨어 우회 시 런타임 크래시 | null 체크 + 리다이렉트 패턴으로 교체 | APPROVED |
| C3 | Code Quality | MEDIUM | lambda.ts에서 `process.env.AWS_ACCESS_KEY_ID!` non-null assertion. 환경변수 누락 시 불명확한 에러 | 시작 시 환경변수 검증 유틸리티. 누락 시 명확한 에러 메시지 | APPROVED |
| C4 | Code Quality | MEDIUM | lambda.ts에서 요청마다 `new LambdaClient()` 생성. 연결 풀 재사용 불가 | 모듈 레벨 싱글턴으로 LambdaClient 추출 | APPROVED |
| C5 | Code Quality | LOW | llm/provider.ts에 Bedrock 분기가 Gemini와 거의 동일한 구조로 중복 | 공통 인터페이스로 추상화 (현재 스코프에서는 낮은 우선순위) | APPROVED |
| C6 | Code Quality | MEDIUM | toss/client.ts에서 에러 응답에 대해 `res.json()` 무조건 호출. Toss가 HTML 에러 반환 시 크래시 | `content-type` 확인 후 안전한 파싱 | APPROVED |
| C7 | Code Quality | LOW | API 라우트 간 에러 응답 형식 불일치 (`{ error }` vs `{ message }` vs 평문) | 표준 에러 응답 형식 `{ error: string, code?: string }` 통일 | APPROVED |
| C8 | Code Quality | LOW | Gemini API 호출 코드가 chat/route.ts와 분석 모듈에서 중복 | llm/provider.ts의 추상화 계층 활용으로 통일 | APPROVED |
| T1 | Tests | CRITICAL | 결제 흐름(payment/create, payment/confirm) 테스트 0개. 가장 위험한 코드 경로가 무방비 | payment/confirm 통합 테스트: 정상 흐름, Lambda 실패 + 자동환불, 이중 요청, 잘못된 상태 전이 | APPROVED |
| T2 | Tests | HIGH | Supabase RLS 정책 테스트 0개. 8개 테이블의 행 수준 보안이 검증 안 됨 | RLS 통합 테스트: user_a가 user_b의 orders/downloads 접근 불가 확인 | APPROVED |
| T3 | Tests | MEDIUM | order.test.ts에 상태 전이 검증 함수(isValidOrderTransition) 존재하나, 실제 결제 흐름에서 호출되지 않음 | payment/confirm에서 상태 전이 시 검증 함수 호출 강제 | APPROVED |
| T4 | Tests | MEDIUM | chat/route.ts의 토큰 카운터가 `tokens: 0` 하드코딩이라 테스트 불가 | 서버 측 토큰 카운팅 구현 후 단위 테스트 추가 | APPROVED |
| T5 | Tests | HIGH | middleware.ts 테스트 0개. 인증 우회, 리다이렉트 로직, 보호 경로 목록 검증 없음 | 미들웨어 단위 테스트: 보호 경로 접근 시 리다이렉트, 인증 사용자 통과, 공개 경로 허용 | APPROVED |
| T6 | Tests | MEDIUM | downloads 테이블의 `expires_at` 만료 처리 로직 테스트 없음 | 다운로드 만료 검증 테스트: 만료 전 허용, 만료 후 차단 | APPROVED |
| P1 | Performance | CRITICAL | catalog/search에서 `west/south/east/north` 파라미터를 검증하지만 쿼리에 사용 안 함. PostGIS 공간 필터 미구현으로 전체 테이블 스캔 | `ST_Intersects` PostGIS RPC 구현. 공간 인덱스 활용 | APPROVED |
| P2 | Performance | HIGH | orders API에 `.limit()` 없음. 주문 수 증가 시 전체 조회로 성능 저하 | 커서 기반 페이지네이션 + `.limit(20)` 기본 적용 | APPROVED |
| P3 | Performance | MEDIUM | 위성 카탈로그, 가격 정보 등 정적 데이터에 캐싱 전략 없음 | 위성 스펙/가격은 빌드 타임 상수 또는 1시간 캐시. 카탈로그는 `stale-while-revalidate` | APPROVED |
| P4 | Performance | MEDIUM | 대시보드 피드에서 콘텐츠 타입별 조회 시 N+1 쿼리 발생 가능 | 피드 전용 Supabase RPC로 단일 쿼리 조회. 또는 `select` 조인 활용 | APPROVED |
| P5 | Performance | LOW | notifications API에서 `created_at` 정렬만 적용. 미읽음 우선 정렬 누락 | `.order('read', { ascending: true }).order('created_at', { ascending: false })` | APPROVED |

### Outside Voice (Claude Subagent)

Independent review confirmed 5/6 major findings. Key addition: `FOR UPDATE` SQL pattern for atomic race-condition prevention in payment flow (`UPDATE orders SET status='payment_held' WHERE id=$1 AND status='pending' RETURNING *`). Disagreed on v4.2 dashboard scope (called it overbuilt), but this is CEO-approved scope and stands.

### VERDICT

**PASS WITH CONDITIONS**

27 findings total: 4 CRITICAL, 7 HIGH, 10 MEDIUM, 6 LOW. All approved by user.

Conditions for implementation:
1. **Before any other work**: A1 (transaction wrapping) + A2 (idempotency) + T1 (payment tests) + P1 (spatial filter) — these are safety-critical
2. **Before deploy**: A3 (token counter) + A5 (Lambda timeout) + A6 (middleware scope) + T2 (RLS tests) + T5 (middleware tests)
3. **During sprint**: All remaining MEDIUM/LOW findings as part of normal implementation

### NOT in scope (deferred)

- Admin dashboard (Sprint B)
- 촬영 요청 관리자 인터페이스 (Sprint B)
- 커뮤니티 UGC (Sprint B)
- AI 분석 파이프라인 (Sprint B)
- 결제 통화 다중화 (Sprint B)

NO UNRESOLVED DECISIONS
