# HopenVision

공무원 시험 채점 시스템

## 프로젝트 개요

HopenVision은 공무원 시험의 시험 정보, 과목, 정답, 응시자, 채점 결과를 통합 관리하는 웹 기반 시스템입니다.

### 주요 기능

- **시험 관리**: 시험 마스터 정보 (시험코드, 시험명, 유형, 년도, 합격기준)
- **과목 관리**: 시험별 과목 정보 (과목명, 문항수, 배점, 과락 기준)
- **정답 관리**: 문항별 정답 입력, Excel 일괄 가져오기
- **응시자 관리**: 수험번호, 이름, 응시지역, 답안 입력
- **자동 채점**: 정답 대비 자동 채점 및 성적 처리
- **통계 분석**: 평균, 최고점, 최저점, 순위, 합격률 통계

## 기술 스택

### Backend
| 항목 | 기술 |
|------|------|
| Framework | Spring Boot 3.2.2 |
| Language | Java 17 |
| Database | PostgreSQL 16 |
| ORM | Spring Data JPA |
| API 문서 | Springdoc OpenAPI (Swagger) |
| Excel 처리 | Apache POI |

### Frontend
| 항목 | 기술 |
|------|------|
| Framework | React 19 |
| Language | TypeScript 5.9 |
| Build Tool | Vite 7 |
| UI Library | Ant Design 6 |
| State | TanStack React Query |
| HTTP Client | Axios |

## 프로젝트 구조

```
hopenvision/
├── api/                    # Spring Boot Backend
│   └── src/main/java/com/hopenvision/
├── web/                    # React Frontend
│   └── src/
├── doc/                    # 문서
│   ├── PROJECT_OVERVIEW.md
│   ├── WBS.md
│   ├── dev/                # 개발 표준
│   └── sql/                # DB 스키마
├── scripts/                # 자동화 스크립트
└── docker-compose.yml
```

## 시작하기

### 사전 요구사항

- Java 17+
- Node.js 20+
- Docker & Docker Compose

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/bluevlad/hopenvision.git
cd hopenvision

# 데이터베이스 시작
docker compose up -d

# Backend 실행 (api 폴더)
cd api
./gradlew bootRun

# Frontend 실행 (web 폴더, 새 터미널)
cd web
npm install
npm run dev
```

### 접속 URL

| 서비스 | URL |
|--------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |

### 스크립트 사용 (Windows)

```powershell
# 전체 서비스 시작
.\scripts\start-all.ps1

# 서비스 상태 확인
.\scripts\status.ps1

# 전체 서비스 중지
.\scripts\stop-all.ps1
```

## 환경 설정

### Backend (application.yml)

| 프로필 | 용도 | 데이터베이스 |
|--------|------|------------|
| local | 로컬 개발 | H2 인메모리 |
| dev | 개발 서버 | PostgreSQL |
| prod | 운영 서버 | PostgreSQL |

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:8080
```

## 문서

| 문서 | 설명 |
|------|------|
| [PROJECT_OVERVIEW.md](doc/PROJECT_OVERVIEW.md) | 프로젝트 개요 및 아키텍처 |
| [WBS.md](doc/WBS.md) | 작업 분류 체계 |
| [DEVELOPMENT_STANDARDS.md](doc/dev/DEVELOPMENT_STANDARDS.md) | 개발 표준 |
| [SERVER_CONFIGURATION.md](doc/dev/SERVER_CONFIGURATION.md) | 서버 설정 가이드 |

## 라이선스

Private - All Rights Reserved
