# AI 건강검진 분석 서비스

건강검진 결과지를 AI로 분석하여 부위별 위험도를 산정하고, 맞춤 보험상품을 추천하는 웹 서비스입니다.

> **참고:** 본 서비스의 분석 결과는 AI가 생성한 참고용 정보이며, 의료법상 의료행위(진단·치료)에 해당하지 않습니다.

---

## 주요 기능

### 건강검진 AI 분석
- **파일 업로드** (PDF, JPG, PNG, 최대 20MB) 또는 **텍스트 직접 입력**
- **3단계 분석 파이프라인**으로 일관되고 정확한 결과 제공
- 부위별 위험도 점수 (1~10), 종합 위험도, 주요 질병 위험, 생활습관 권고사항
- 검진 수치 기반 맞춤 보험상품 추천

### 결과 공유
- 랜덤 토큰 기반 공유 URL 생성
- 카카오톡, X(Twitter), Facebook, 텍스트 복사 공유
- 모바일/데스크톱 환경 모두 지원

### 관리자 대시보드 (`/admin`)
- 비밀번호 인증 (SHA-256 해시, 쿠키 기반 8시간 세션)
- 분석 결과 목록 조회 (페이지네이션, 검색)
- 상세 보기, 메모 작성, 삭제
- 비밀번호 변경

### 개인정보 보호
- 업로드 시 이름, 연락처, 주민등록번호 자동 마스킹
- 공유 페이지에서 연락처 등 민감정보 제외
- SQLite 로컬 저장, 원본 파일 미저장

---

## 기술 스택

| 분류 | 기술 |
|---|---|
| **프레임워크** | Next.js 16 (App Router), React 19, TypeScript |
| **스타일링** | Tailwind CSS 4 |
| **AI** | Google Gemini 2.5 Flash (`@google/generative-ai`) |
| **데이터베이스** | SQLite (`better-sqlite3`) |
| **아이콘** | Lucide React |
| **파일 업로드** | react-dropzone |
| **배포** | Docker (멀티스테이지 빌드) |

---

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx                      # 메인 페이지 (입력 폼 + 결과 표시)
│   ├── layout.tsx                    # 루트 레이아웃
│   ├── globals.css                   # 글로벌 스타일 (Tailwind 테마)
│   ├── admin/
│   │   └── page.tsx                  # 관리자 대시보드
│   ├── results/
│   │   └── [token]/
│   │       └── page.tsx              # 공유 결과 페이지
│   └── api/
│       ├── analyze/
│       │   └── route.ts              # POST - AI 분석 (3단계 파이프라인)
│       ├── results/
│       │   └── [token]/
│       │       └── route.ts          # GET - 공유 결과 조회
│       └── admin/
│           ├── auth/
│           │   └── route.ts          # POST/DELETE/PATCH - 인증/로그아웃/비밀번호 변경
│           └── results/
│               ├── route.ts          # GET/DELETE/PATCH - 목록/삭제/메모
│               └── [id]/
│                   └── route.ts      # GET - 단건 상세 조회
├── components/
│   └── AnalysisResults.tsx           # 결과 표시 컴포넌트 모음
└── lib/
    ├── types.ts                      # 타입 정의
    ├── db.ts                         # SQLite DB 모듈
    ├── health-scoring.ts             # 규칙 기반 점수 산정 엔진
    ├── insurance-products.ts         # 보험상품 데이터 (11개)
    ├── risk-utils.ts                 # 위험도 색상/스타일 유틸
    └── sample-result.ts              # 샘플 결과 데이터 (데모용)
```

---

## 3단계 분석 파이프라인

일관성과 정확성을 위해 AI 단독 판단이 아닌, **코드 기반 결정적 점수 산정** 구조를 사용합니다.

```
┌─────────────────────────────────────────────────────┐
│  Step 1. 수치 추출 (AI, temperature=0, JSON mode)    │
│  - 건강검진 파일/텍스트에서 18개 수치 추출             │
│  - 민감정보 자동 마스킹 후 전송                       │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│  Step 2. 점수 산정 (서버 코드, 100% 결정적)           │
│  - 성별 기반 정상 참고치 판정                         │
│  - 카테고리별 위험 점수 (1~10) 산출                   │
│  - 종합 위험도 결정 (low/moderate/high/critical)     │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│  Step 3. 소견 생성 (AI, temperature=0, JSON mode)    │
│  - 고정된 점수를 기반으로 소견 텍스트 생성             │
│  - 질병 위험, 보험 추천, 생활습관 권고사항 생성        │
└─────────────────────────────────────────────────────┘
```

### 점수 산정 기준 (보수적)
- 정상 참고치를 일반 의학 기준보다 좁게 설정 (예: 공복혈당 정상 < 95mg/dL)
- 경계 수치 1개 → 최소 4점, 이상 수치 1개 → 최소 6점
- 종합: 카테고리 1개라도 5점 이상 → moderate, 7점 이상 → high

### 분석 카테고리
| 카테고리 | 주요 수치 |
|---|---|
| 심혈관계 | 혈압(수축기/이완기), 총콜레스테롤, LDL, HDL, 중성지방 |
| 간 기능 | AST(GOT), ALT(GPT), GGT |
| 신장 기능 | 크레아티닌, eGFR |
| 대사 기능 | 공복혈당, HbA1c, 중성지방 |
| 체성분 | BMI, 허리둘레 |

---

## 시작하기

### 사전 요구사항
- Node.js 20 이상
- Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/)에서 발급)

### 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 생성합니다.

```env
GEMINI_API_KEY=your_gemini_api_key_here
ADMIN_PASSWORD=your_admin_password    # 미설정 시 기본값: admin1234
```

### 로컬 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

### 프로덕션 빌드

```bash
npm run build
npm start
```

---

## Docker 배포

### Docker Compose (권장)

```bash
# .env 파일에 GEMINI_API_KEY 설정 후
docker compose up -d
```

### 수동 빌드 & 실행

```bash
# 이미지 빌드
docker build -t bomai .

# 실행
docker run -d \
  --name bomai-app \
  -p 3000:3000 \
  -e GEMINI_API_KEY=your_key \
  -e ADMIN_PASSWORD=your_password \
  -v bomai-data:/app/data \
  bomai
```

### 크로스 플랫폼 빌드 (Apple Silicon → amd64 서버)

```bash
# amd64 이미지 빌드 & Docker Hub 푸시
docker buildx build --platform linux/amd64 -t hisosic/bomai:latest --push .

# 서버에서 풀 & 재시작
ssh user@server "cd ~/bomai && sudo docker compose pull -q && sudo docker compose up -d"
```

### Docker Compose 설정

```yaml
services:
  app:
    build: .
    container_name: bomai-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin1234}
    volumes:
      - bomai-data:/app/data

volumes:
  bomai-data:
    driver: local
```

SQLite 데이터베이스는 `bomai-data` 볼륨에 영속 저장됩니다.

---

## 데이터베이스

SQLite를 사용하며, 앱 시작 시 자동으로 테이블이 생성됩니다.

### 테이블 구조

**analysis_results** - 분석 결과 저장

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | INTEGER (PK) | 자동 증가 ID |
| `share_token` | TEXT (UNIQUE) | 공유용 랜덤 토큰 |
| `name` | TEXT | 수진자 이름 |
| `age` | INTEGER | 나이 |
| `gender` | TEXT | 성별 |
| `phone` | TEXT | 연락처 |
| `overall_risk_level` | TEXT | 종합 위험도 (low/moderate/high/critical) |
| `summary` | TEXT | AI 생성 요약 |
| `analysis_json` | TEXT | 전체 분석 결과 JSON |
| `memo` | TEXT | 관리자 메모 |
| `created_at` | TEXT | 생성 일시 |

**admin_settings** - 관리자 설정

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `key` | TEXT (PK) | 설정 키 |
| `value` | TEXT | 설정 값 (비밀번호 해시 등) |

---

## API 엔드포인트

| 메서드 | 경로 | 인증 | 설명 |
|---|---|---|---|
| `POST` | `/api/analyze` | - | 건강검진 분석 요청 |
| `GET` | `/api/results/[token]` | - | 공유 결과 조회 |
| `POST` | `/api/admin/auth` | - | 관리자 로그인 |
| `DELETE` | `/api/admin/auth` | Cookie | 관리자 로그아웃 |
| `PATCH` | `/api/admin/auth` | Cookie | 비밀번호 변경 |
| `GET` | `/api/admin/results` | Cookie | 분석 목록 조회 (page, limit, search) |
| `DELETE` | `/api/admin/results` | Cookie | 분석 결과 삭제 |
| `PATCH` | `/api/admin/results` | Cookie | 메모 저장 |
| `GET` | `/api/admin/results/[id]` | Cookie | 단건 상세 조회 |

---

## 법적 고지

### 동의 항목 (서비스 이용 전 필수)
1. **개인정보 수집·이용 동의** - 개인정보보호법 제15조, 제17조
2. **민감정보(건강정보) 수집·이용 동의** - 개인정보보호법 제23조, Google Gemini API 제3자 전송 고지 포함
3. **서비스 이용 안내 확인** - 의료법/보험업법 면책

### 면책 사항
- 본 서비스의 분석 결과는 AI가 생성한 **참고용 정보**이며, 의료법상 의료행위(진단·치료)에 해당하지 않습니다.
- 보험상품 추천은 AI가 생성한 **참고 정보**이며, 보험업법상 보험 모집 또는 보험 계약 체결의 권유에 해당하지 않습니다.
- 건강 상태에 대한 정확한 판단은 반드시 의료기관의 전문의 상담을 통해 확인하시기 바랍니다.

---

## 스크립트

```bash
npm run dev      # 개발 서버 (Turbopack)
npm run build    # 프로덕션 빌드
npm start        # 프로덕션 서버
npm run lint     # ESLint 검사
```

---

## 라이선스

Private - All rights reserved.
