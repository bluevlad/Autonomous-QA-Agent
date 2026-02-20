# HopenVision - 등록된 GitHub Issues

> GitHub Repository: [bluevlad/hopenvision](https://github.com/bluevlad/hopenvision)

## 버그 (BUG)

| Issue # | 제목 | 상태 | 우선순위 |
|---------|------|------|----------|
| [#1](https://github.com/bluevlad/hopenvision/issues/1) | 존재하지 않는 시험 조회 시 500 에러 대신 404 반환 필요 | Open | High |
| [#2](https://github.com/bluevlad/hopenvision/issues/2) | passScore가 null일 때 "null점" 표시 문제 | Fixed | Medium |
| [#3](https://github.com/bluevlad/hopenvision/issues/3) | Excel 가져오기 페이지에서 잘못된 경로(/exams)로 이동 | Fixed | Medium |
| [#4](https://github.com/bluevlad/hopenvision/issues/4) | 빈 객체로 시험 등록 시 500 에러 대신 400 반환 필요 | Open | High |

## 개선 사항 (Enhancement)

| Issue # | 제목 | 상태 | 우선순위 |
|---------|------|------|----------|
| [#5](https://github.com/bluevlad/hopenvision/issues/5) | API 응답 형식 표준화 필요 | Open | Medium |
| [#6](https://github.com/bluevlad/hopenvision/issues/6) | 시험 등록 시 과목 필수 입력 검증 추가 | Open | Low |
| [#7](https://github.com/bluevlad/hopenvision/issues/7) | API 에러 메시지 표준화 | Open | Medium |
| [#8](https://github.com/bluevlad/hopenvision/issues/8) | Swagger/OpenAPI 문서 추가 | Open | Low |

## 테스트 관련 이슈

테스트 코드에서 `[BUG-#N]` 태그로 관련 이슈를 표시하고 있습니다:

- `exam-list.spec.ts`: `[BUG-#2]` passScore null 표시 검증
- `answer-key.spec.ts`: `[BUG-#3]` Excel 가져오기 경로 검증
- `api.spec.ts`: `[BUG-#1]` 404 응답 검증, `[BUG-#4]` 400 응답 검증

---

## 2차 QA 점검 결과 (2026-02-16)

### P0 - 즉시 수정 필요

| Issue # | 제목 | 상태 | 라벨 |
|---------|------|------|------|
| [#24](https://github.com/bluevlad/hopenvision/issues/24) | .env.dev/.env.local DB 비밀번호 Git 이력 노출 | Open | P0, security |

### P1 - 빠른 수정 필요

| Issue # | 제목 | 상태 | 라벨 |
|---------|------|------|------|
| [#25](https://github.com/bluevlad/hopenvision/issues/25) | 사용자 API 인증 부재 - X-User-Id 헤더 위변조 가능 | Open | P1, security |
| [#26](https://github.com/bluevlad/hopenvision/issues/26) | 답안 재제출로 성적 조작 가능 (Race Condition) | Open | P1, security |
| [#27](https://github.com/bluevlad/hopenvision/issues/27) | Swagger/OpenAPI 운영 환경 노출 | Open | P1, security |
| [#28](https://github.com/bluevlad/hopenvision/issues/28) | ExamService.toSubjectResponse N+1 쿼리 | Open | P1, performance |
| [#29](https://github.com/bluevlad/hopenvision/issues/29) | ScoreAnalysisService 전체 점수 데이터 메모리 로딩 | Open | P1, performance |

### P2 - 계획적 수정

| Issue # | 제목 | 상태 | 라벨 |
|---------|------|------|------|
| [#30](https://github.com/bluevlad/hopenvision/issues/30) | UserScoringService 트랜잭션 모드 불일치 | Open | P2 |
| [#31](https://github.com/bluevlad/hopenvision/issues/31) | ScoreAnalysisService 과목별 통계 N+1 쿼리 | Open | P2 |
| [#32](https://github.com/bluevlad/hopenvision/issues/32) | UserExamService.getAvailableExams N+1 쿼리 | Open | P2 |
| [#33](https://github.com/bluevlad/hopenvision/issues/33) | ExcelImportService 건별 save - bulk insert 미사용 | Open | P2 |
| [#34](https://github.com/bluevlad/hopenvision/issues/34) | RuntimeException 사용 + @Modifying 누락 | Open | P2 |
| [#35](https://github.com/bluevlad/hopenvision/issues/35) | Docker JVM 힙 사이즈 제한 미설정 | Open | P2 |

### P3 - 개선 권장

| Issue # | 제목 | 상태 | 라벨 |
|---------|------|------|------|
| [#36](https://github.com/bluevlad/hopenvision/issues/36) | MapStruct 의존성 미사용 | Open | enhancement |
| [#37](https://github.com/bluevlad/hopenvision/issues/37) | UserProfileDto 사용자 ID 검증 패턴 중복 | Open | enhancement |
| [#38](https://github.com/bluevlad/hopenvision/issues/38) | 프론트엔드 API 에러 핸들링 미비 | Open | enhancement |
| [#39](https://github.com/bluevlad/hopenvision/issues/39) | 배포 스크립트 health check 실패 시 rollback 미지원 | Open | enhancement |

---
*1차 점검: Autonomous QA Agent - 2026-02-07*
*2차 점검: Autonomous QA Agent - 2026-02-16 (17건 등록)*
