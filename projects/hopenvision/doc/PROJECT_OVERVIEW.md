# HopenVision 프로젝트 개요

## 1. 프로젝트 정의

### 1.1 프로젝트명
**HopenVision** - 공무원 시험 채점 시스템

### 1.2 프로젝트 목적
공무원 시험의 시험 정보, 과목, 정답, 응시자, 채점 결과를 통합 관리하는 웹 기반 시스템 구축

### 1.3 핵심 기능
| 기능 | 설명 |
|------|------|
| 시험 관리 | 시험 마스터 정보 (시험코드, 시험명, 유형, 년도, 일자, 합격기준) |
| 과목 관리 | 시험별 과목 정보 (과목명, 문항수, 배점, 과락 기준) |
| 정답 관리 | 문항별 정답 입력, 배점 설정, Excel 일괄 가져오기 |
| 응시자 관리 | 수험번호, 이름, 응시지역, 응시유형, 답안 입력 |
| 자동 채점 | 정답 대비 자동 채점 및 성적 처리 |
| 통계 분석 | 평균, 최고점, 최저점, 순위, 합격률 통계 |

---

## 2. 기술 스택

### 2.1 Backend
| 항목 | 기술 |
|------|------|
| Framework | Spring Boot 3.2.2 |
| Language | Java 17 |
| Database | PostgreSQL 16 (운영), H2 (로컬) |
| ORM | Spring Data JPA / Hibernate |
| API 문서 | Springdoc OpenAPI 2.3.0 (Swagger) |
| DTO 매핑 | MapStruct 1.5.5 |
| Excel 처리 | Apache POI 5.2.5 |
| 빌드 도구 | Gradle 8.x |

### 2.2 Frontend
| 항목 | 기술 |
|------|------|
| Framework | React 19.2.0 |
| Language | TypeScript 5.9.3 |
| Build Tool | Vite 7.2.4 |
| UI Library | Ant Design 6.2.3 |
| State Management | TanStack React Query 5.90 |
| HTTP Client | Axios 1.13.4 |
| Routing | React Router DOM 7.13.0 |
| Date | dayjs 1.11.19 |

### 2.3 Infrastructure
| 항목 | 기술 |
|------|------|
| Container | Docker / Docker Compose |
| Reverse Proxy | Nginx |
| CI/CD | GitHub Actions (Self-hosted Runner) |
| Version Control | Git / GitHub |

---

## 3. 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
┌─────────────────────────▼───────────────────────────────────┐
│                     Nginx (Reverse Proxy)                    │
│                    :80 / :443 (unmong.com)                   │
└──────────┬──────────────────────────────────┬───────────────┘
           │                                  │
┌──────────▼──────────┐          ┌───────────▼───────────────┐
│   Frontend (React)  │          │    Backend (Spring Boot)   │
│       :4050         │◄────────►│          :9050             │
└─────────────────────┘   API    └───────────┬───────────────┘
                                             │
                                 ┌───────────▼───────────────┐
                                 │   PostgreSQL Database      │
                                 │         :5432              │
                                 └───────────────────────────┘
```

---

## 4. 포트 할당 (표준 준수)

| 서비스 | 포트 | 설명 |
|--------|------|------|
| hopenvision-frontend | 4050 | React 웹 애플리케이션 |
| hopenvision-backend | 9050 | Spring Boot REST API |
| hopenvision-db | 5432 | PostgreSQL 데이터베이스 |

> 포트 규칙: Frontend 4xxx, Backend 9xxx (기존 서비스와 충돌 방지)

---

## 5. 디렉토리 구조

```
hopenvision/
├── api/                          # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/hopenvision/
│   │   │   │   ├── common/       # 공통 모듈
│   │   │   │   │   ├── config/   # 설정
│   │   │   │   │   ├── dto/      # 공통 DTO
│   │   │   │   │   ├── exception/# 예외 처리
│   │   │   │   │   └── util/     # 유틸리티
│   │   │   │   └── exam/         # 시험 도메인
│   │   │   │       ├── controller/
│   │   │   │       ├── service/
│   │   │   │       ├── repository/
│   │   │   │       ├── entity/
│   │   │   │       └── dto/
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       └── application-{profile}.yml
│   │   └── test/
│   ├── build.gradle
│   └── Dockerfile
│
├── web/                          # React Frontend
│   ├── src/
│   │   ├── api/                  # API 통신
│   │   ├── components/           # 재사용 컴포넌트
│   │   │   ├── common/           # 공통 UI
│   │   │   └── layout/           # 레이아웃
│   │   ├── pages/                # 페이지 컴포넌트
│   │   │   ├── exam/
│   │   │   ├── applicant/
│   │   │   └── statistics/
│   │   ├── hooks/                # 커스텀 훅
│   │   ├── types/                # TypeScript 타입
│   │   ├── utils/                # 유틸리티
│   │   └── styles/               # 스타일
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
│
├── doc/                          # 문서
│   ├── sql/                      # 데이터베이스 스키마
│   ├── api/                      # API 문서
│   └── dev/                      # 개발 가이드
│
├── docker/                       # Docker 설정
│   ├── docker-compose.local.yml
│   └── docker-compose.prod.yml
│
├── scripts/                      # 자동화 스크립트
│   ├── start-all.ps1
│   ├── stop-all.ps1
│   └── deploy.ps1
│
├── .github/                      # GitHub 설정
│   └── workflows/
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 6. 데이터 모델

### 6.1 ERD 개요

```
┌─────────────┐       ┌─────────────────┐       ┌──────────────────┐
│  EXAM_MST   │──────<│  EXAM_SUBJECT   │──────<│  EXAM_ANSWER_KEY │
│  (시험마스터) │       │   (시험과목)      │       │    (정답답안지)    │
└─────────────┘       └─────────────────┘       └──────────────────┘
       │
       │              ┌─────────────────┐       ┌────────────────────┐
       └─────────────<│ EXAM_APPLICANT  │──────<│EXAM_APPLICANT_SCORE│
                      │   (응시자)        │       │   (과목별성적)      │
                      └─────────────────┘       └────────────────────┘
                             │
                             │              ┌─────────────────┐
                             └─────────────<│  EXAM_PASS_LINE │
                                            │   (합격선설정)    │
                                            └─────────────────┘
```

### 6.2 주요 테이블

| 테이블명 | 설명 | PK |
|----------|------|-----|
| EXAM_MST | 시험 마스터 | EXAM_CD |
| EXAM_SUBJECT | 시험 과목 | EXAM_CD, SUBJECT_CD |
| EXAM_ANSWER_KEY | 정답 답안지 | EXAM_CD, SUBJECT_CD, QUESTION_NO |
| EXAM_APPLICANT | 응시자 | EXAM_CD, APPLICANT_NO |
| EXAM_APPLICANT_SCORE | 응시자 과목별 성적 | EXAM_CD, APPLICANT_NO, SUBJECT_CD |
| EXAM_PASS_LINE | 합격선 설정 | EXAM_CD, APPLY_AREA, APPLY_TYPE |
| EXAM_STAT | 시험 통계 | EXAM_CD, APPLY_AREA, SUBJECT_CD |

---

## 7. 환경 구성

### 7.1 개발 환경 (Development)
- **OS**: Windows 11
- **IP**: ***REMOVED_IP***
- **Container**: Docker Desktop
- **IDE**: VS Code / IntelliJ IDEA
- **Profile**: `local` 또는 `dev`

### 7.2 운영 환경 (Production)
- **OS**: macOS (또는 Linux)
- **IP**: ***REMOVED_IP***
- **Container**: OrbStack / Docker
- **Domain**: unmong.com (예정)
- **Profile**: `prod`

---

## 8. API 설계 원칙

### 8.1 RESTful API 규칙
- HTTP 메서드: GET(조회), POST(생성), PUT(수정), DELETE(삭제)
- URL 네이밍: 복수형 명사 사용 (`/api/exams`)
- 응답 형식: JSON

### 8.2 공통 응답 구조
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERR001",
    "message": "에러 메시지"
  }
}
```

### 8.3 API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /api/exams | 시험 목록 조회 |
| GET | /api/exams/{examCd} | 시험 상세 조회 |
| POST | /api/exams | 시험 등록 |
| PUT | /api/exams/{examCd} | 시험 수정 |
| DELETE | /api/exams/{examCd} | 시험 삭제 |
| GET | /api/exams/{examCd}/subjects | 과목 목록 |
| POST | /api/exams/{examCd}/subjects | 과목 등록/수정 |
| GET | /api/exams/{examCd}/answers | 정답 조회 |
| POST | /api/exams/{examCd}/answers | 정답 등록 |
| POST | /api/import/answer-keys/preview | Excel 미리보기 |
| POST | /api/import/exams/{examCd}/answer-keys | Excel 저장 |

---

## 9. 보안 고려사항

### 9.1 인증/인가 (향후 구현)
- JWT 기반 인증
- Role 기반 권한 관리 (ADMIN, USER)

### 9.2 데이터 보호
- HTTPS 필수 적용
- 민감정보 암호화 (응시자 개인정보)
- SQL Injection 방지 (JPA 파라미터 바인딩)
- XSS 방지 (입력값 검증)

### 9.3 환경변수 관리
- DB 비밀번호, API 키 등은 환경변수로 관리
- `.env` 파일은 Git에서 제외

---

## 10. 참고 문서

| 문서 | 위치 |
|------|------|
| WBS | doc/WBS.md |
| 개발 표준 | doc/dev/DEVELOPMENT_STANDARDS.md |
| API 명세 | doc/api/API_SPECIFICATION.md |
| DB 스키마 | doc/sql/schema.sql |
| 서버 설정 | doc/dev/SERVER_CONFIGURATION.md |
