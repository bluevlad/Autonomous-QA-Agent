# TeacherHub 테스트

## 프로젝트 정보

| 항목 | 내용 |
|------|------|
| **서비스명** | TeacherHub |
| **설명** | 공무원 학원 강사 선호도 조사 |
| **URL** | http://localhost:4010 |
| **API URL** | http://localhost:8081 |
| **GitHub** | [bluevlad/TeacherHub](https://github.com/bluevlad/TeacherHub) |

## 테스트 현황

### E2E 테스트

| 테스트 파일 | 테스트 케이스 | 상태 |
|-------------|---------------|------|
| main.spec.ts | 메인 페이지/대시보드 (8개) | ⚠️ 1 Failed |
| main.spec.ts | 기간 선택기 테스트 (3개) | ⚠️ 1 Failed |
| main.spec.ts | 강사 목록/상세 (6개) | ✅ Pass |
| main.spec.ts | 학원 선택/필터 (4개) | ✅ Pass |
| main.spec.ts | 반응형/접근성/성능 (8개) | ✅ Pass |

### API 테스트

| 테스트 파일 | 테스트 케이스 | 상태 |
|-------------|---------------|------|
| api.spec.ts | Academy API (5개) | ✅ Pass |
| api.spec.ts | Teacher API (8개) | ✅ Pass |
| api.spec.ts | Reports API (6개) | ✅ Pass |
| api.spec.ts | Weekly/Analysis API (6개) | ✅ Pass |
| api.spec.ts | Mentions/Crawl API (4개) | ✅ Pass |
| api.spec.ts | 에러 처리/성능 (6개) | ⚠️ 1 Failed |

**총 테스트: 64개 (62 passed, 2 failed)**

## 테스트 실행 방법

```bash
# TeacherHub 프로젝트만 테스트
npx playwright test --project=teacherhub

# 특정 테스트 파일 실행
npx playwright test projects/TeacherHub/e2e/main.spec.ts
```

## 등록된 GitHub Issues

| Issue # | 유형 | 제목 |
|---------|------|------|
| [#1](https://github.com/bluevlad/TeacherHub/issues/1) | BUG | 일부 API에서 404 응답 발생 |
| [#2](https://github.com/bluevlad/TeacherHub/issues/2) | BUG | 강사 멘션 API 미구현 |
| [#3](https://github.com/bluevlad/TeacherHub/issues/3) | BUG | 강사 리포트 API 미구현 |
| [#4](https://github.com/bluevlad/TeacherHub/issues/4) | Enhancement | CORS 헤더 설정 필요 |
| [#5](https://github.com/bluevlad/TeacherHub/issues/5) | Enhancement | API 응답 시간 최적화 |
| [#6](https://github.com/bluevlad/TeacherHub/issues/6) | Enhancement | 기간 선택 UI 개선 |
| [#7](https://github.com/bluevlad/TeacherHub/issues/7) | Enhancement | 에러 메시지 표준화 |
| [#8](https://github.com/bluevlad/TeacherHub/issues/8) | Enhancement | 페이지네이션 추가 |

## 주요 기능

- 학원별 강사 목록 조회
- 강사 선호도 분석
- 주간/월간 리포트
- 멘션 분석
- 크롤링 데이터 관리

## API 엔드포인트

| 엔드포인트 | 설명 |
|------------|------|
| GET /api/v2/academies | 학원 목록 |
| GET /api/v2/academies/:id/teachers | 학원별 강사 |
| GET /api/v2/teachers/:id | 강사 상세 |
| GET /api/v2/reports/weekly | 주간 리포트 |
| GET /api/v2/analysis/trends | 트렌드 분석 |

## 기술 스택

- **Frontend**: React + Material UI
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
