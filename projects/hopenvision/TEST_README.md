# HopenVision QA 테스트

공무원 시험 채점 시스템 HopenVision의 QA 테스트 문서입니다.

## 프로젝트 정보

| 항목 | 내용 |
|------|------|
| 프로젝트명 | HopenVision |
| 설명 | 공무원 시험 채점 시스템 |
| Frontend URL | http://localhost:4060 |
| Backend API | http://localhost:9050 |
| Swagger UI | http://localhost:9050/swagger-ui.html |
| GitHub | [bluevlad/hopenvision](https://github.com/bluevlad/hopenvision) |

## 테스트 범위

### 구현 완료 기능 (테스트 대상)

| 기능 | 페이지 | 테스트 파일 |
|------|--------|-------------|
| 시험 목록 조회 | ExamList.tsx | exam-list.spec.ts |
| 시험 등록/수정 | ExamForm.tsx | exam-form.spec.ts |
| 과목 관리 | ExamForm.tsx | exam-form.spec.ts |
| 정답 입력 | AnswerKeyForm.tsx | answer-key.spec.ts |
| Excel 가져오기 | ExcelImport.tsx | answer-key.spec.ts |
| API 엔드포인트 | - | api.spec.ts |

### 미구현 기능 (테스트 제외)

- 사용자 시스템 (답안 입력, 채점)
- 배치 시스템 (통계, 순위)
- 회원 시스템 (로그인)

## 테스트 실행

```bash
# 루트 디렉토리에서
npm run test:hopenvision

# UI 모드
npm run test:ui -- --project=hopenvision

# 특정 테스트 파일
npx playwright test projects/hopenvision/e2e/exam-list.spec.ts
```

## 발견된 이슈

### 등록된 GitHub Issues

| # | 제목 | 유형 | 상태 |
|---|------|------|------|
| [#1](https://github.com/bluevlad/hopenvision/issues/1) | API 에러 응답이 500으로 반환됨 | Bug | Open |
| [#2](https://github.com/bluevlad/hopenvision/issues/2) | passScore null일 때 'null점' 표시 | Bug | Open |
| [#3](https://github.com/bluevlad/hopenvision/issues/3) | Excel 가져오기 후 잘못된 경로 이동 | Bug | Open |
| [#4](https://github.com/bluevlad/hopenvision/issues/4) | 필수 필드 유효성 검사 누락 | Bug | Open |
| [#5](https://github.com/bluevlad/hopenvision/issues/5) | 글로벌 예외 처리기 추가 | Enhancement | Open |
| [#6](https://github.com/bluevlad/hopenvision/issues/6) | TypeScript nullable 타입 개선 | Enhancement | Open |
| [#7](https://github.com/bluevlad/hopenvision/issues/7) | 정답 미입력 저장 확인 다이얼로그 | Enhancement | Open |
| [#8](https://github.com/bluevlad/hopenvision/issues/8) | 과목 삭제 안내 메시지 개선 | Enhancement | Open |

### 이슈 등록 방법

```bash
# hopenvision 저장소에 이슈 등록
cd projects/hopenvision
gh issue create --repo bluevlad/hopenvision --title "[Bug] 제목" --body "내용"
```

## 테스트 케이스 목록

### exam-list.spec.ts
- 시험 목록 페이지 로드
- 검색 필터 동작
- 초기화 버튼
- 시험 등록 버튼 이동
- 테이블 컬럼 확인
- [BUG] passScore null 표시 검증

### exam-form.spec.ts
- 시험 등록 폼 표시
- 유효성 검사
- 시험 등록 성공
- 과목 추가
- 시험 수정 폼 로드

### answer-key.spec.ts
- 정답 입력 페이지 로드
- 과목 선택
- 정답 선택
- 정답 저장
- Excel 가져오기

### api.spec.ts
- GET /api/exams
- GET /api/exams/{examCd}
- POST /api/exams
- DELETE /api/exams/{examCd}
- [BUG] 에러 응답 검증

## 테스트 결과

테스트 실행 후 `playwright-report/` 폴더에서 HTML 리포트를 확인할 수 있습니다.

```bash
npm run test:report
```
