# TeacherHub - 등록된 GitHub Issues

> GitHub Repository: [bluevlad/TeacherHub](https://github.com/bluevlad/TeacherHub)

## 버그 (BUG)

| Issue # | 제목 | 상태 | 우선순위 |
|---------|------|------|----------|
| [#1](https://github.com/bluevlad/TeacherHub/issues/1) | 일부 API에서 404 응답 발생 | Open | High |
| [#2](https://github.com/bluevlad/TeacherHub/issues/2) | 강사 멘션 API 미구현 | Open | Medium |
| [#3](https://github.com/bluevlad/TeacherHub/issues/3) | 강사 리포트 API 미구현 | Open | Medium |

## 개선 사항 (Enhancement)

| Issue # | 제목 | 상태 | 우선순위 |
|---------|------|------|----------|
| [#4](https://github.com/bluevlad/TeacherHub/issues/4) | CORS 헤더 설정 필요 | Open | High |
| [#5](https://github.com/bluevlad/TeacherHub/issues/5) | API 응답 시간 최적화 | Open | Medium |
| [#6](https://github.com/bluevlad/TeacherHub/issues/6) | 기간 선택 UI 개선 | Open | Low |
| [#7](https://github.com/bluevlad/TeacherHub/issues/7) | 에러 메시지 표준화 | Open | Medium |
| [#8](https://github.com/bluevlad/TeacherHub/issues/8) | 페이지네이션 추가 | Open | Low |

## 테스트 실패 관련

현재 테스트에서 실패한 항목:

1. **CORS 헤더 확인** (`api.spec.ts:446`)
   - Access-Control-Allow-Origin 헤더가 응답에 포함되지 않음
   - Issue #4와 연관

2. **기간 선택 탭 표시** (`main.spec.ts:61`)
   - 기간 선택기 UI 요소를 찾을 수 없음
   - Issue #6과 연관

---

## 2차 QA 점검 결과 (2026-02-16)

### P0 - 즉시 수정 필요

| Issue # | 제목 | 상태 | 라벨 |
|---------|------|------|------|
| [#16](https://github.com/bluevlad/TeacherHub/issues/16) | SecurityConfig API 인증이 사실상 비활성화 | Open | P0, security |
| [#17](https://github.com/bluevlad/TeacherHub/issues/17) | Production docker-compose에 ddl-auto=update 설정 | Open | P0, security |
| [#18](https://github.com/bluevlad/TeacherHub/issues/18) | Production docker-compose 약한 기본 DB 비밀번호 | Open | P0, security |

### P1 - 빠른 수정 필요

| Issue # | 제목 | 상태 | 라벨 |
|---------|------|------|------|
| [#19](https://github.com/bluevlad/TeacherHub/issues/19) | GlobalExceptionHandler (@ControllerAdvice) 부재 | Open | P1 |
| [#20](https://github.com/bluevlad/TeacherHub/issues/20) | ReportController 300줄 비즈니스 로직 - Service 계층 부재 | Open | P1 |
| [#21](https://github.com/bluevlad/TeacherHub/issues/21) | ReputationController가 JPA Entity 직접 API 반환 | Open | P1 |
| [#22](https://github.com/bluevlad/TeacherHub/issues/22) | WeeklyReportController 입력 검증 부재 및 DTO null safety | Open | P1 |
| [#23](https://github.com/bluevlad/TeacherHub/issues/23) | Naver Cafe 크롤러 DOM evaluate로 자격증명 주입 | Open | P1, security |
| [#24](https://github.com/bluevlad/TeacherHub/issues/24) | WeeklyReportService.getWeeklySummary() null safety 미흡 | Open | P1 |

### P2 - 계획적 수정

| Issue # | 제목 | 상태 | 라벨 |
|---------|------|------|------|
| [#25](https://github.com/bluevlad/TeacherHub/issues/25) | WeeklyReportService.getAcademyTrend N+1 루프 쿼리 | Open | P2 |
| [#26](https://github.com/bluevlad/TeacherHub/issues/26) | WeeklyReportRepository JOIN FETCH 부재 - N+1 쿼리 | Open | P2 |
| [#27](https://github.com/bluevlad/TeacherHub/issues/27) | 크롤러 mention_extractor 건별 commit - 배치 처리 필요 | Open | P2 |
| [#28](https://github.com/bluevlad/TeacherHub/issues/28) | WeeklyReportController 중복 @CrossOrigin 설정 | Open | P2 |
| [#29](https://github.com/bluevlad/TeacherHub/issues/29) | ReputationRepository PostgreSQL 종속 JPQL 함수 | Open | P2 |
| [#30](https://github.com/bluevlad/TeacherHub/issues/30) | 크롤러 DB 커넥션 풀 설정 미흡 | Open | P2 |

### P3 - 개선 권장

| Issue # | 제목 | 상태 | 라벨 |
|---------|------|------|------|
| [#31](https://github.com/bluevlad/TeacherHub/issues/31) | App.js React Router 미설정 - 페이지 접근 불가 | Open | enhancement |
| [#32](https://github.com/bluevlad/TeacherHub/issues/32) | package.json 누락 의존성 | Open | enhancement |
| [#33](https://github.com/bluevlad/TeacherHub/issues/33) | API 클라이언트가 존재하지 않는 백엔드 엔드포인트 참조 | Open | enhancement |
| [#34](https://github.com/bluevlad/TeacherHub/issues/34) | 크롤러 서비스 print() 대신 logger 사용 필요 | Open | enhancement |
| [#35](https://github.com/bluevlad/TeacherHub/issues/35) | DC Inside 크롤러 bare except 사용 | Open | enhancement |
| [#36](https://github.com/bluevlad/TeacherHub/issues/36) | Frontend Dockerfile package-lock.json 삭제 후 install | Open | enhancement |
| [#37](https://github.com/bluevlad/TeacherHub/issues/37) | Backend Dockerfile JDK 대신 JRE 사용 필요 | Open | enhancement |
| [#38](https://github.com/bluevlad/TeacherHub/issues/38) | 크롤러 requirements.txt 버전 고정 미적용 | Open | enhancement |
| [#39](https://github.com/bluevlad/TeacherHub/issues/39) | 크롤러 순차 소스 처리 - 병렬 크롤링 미적용 | Open | enhancement |

---
*1차 점검: Autonomous QA Agent - 2026-02-07*
*2차 점검: Autonomous QA Agent - 2026-02-16 (26건 등록)*
