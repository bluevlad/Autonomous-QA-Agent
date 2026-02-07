# E2E 테스트 가이드

HopenVision 웹 애플리케이션의 E2E(End-to-End) 테스트 가이드입니다.

## 테스트 환경 설정

### 1. 의존성 설치

```bash
cd web
npm install
npx playwright install
```

### 2. 환경 변수 설정 (선택)

기본 URL을 변경하려면 환경 변수를 설정합니다:

```bash
# Windows PowerShell
$env:BASE_URL = "http://localhost:5173"
$env:API_URL = "http://localhost:8080"

# Linux/Mac
export BASE_URL="http://localhost:5173"
export API_URL="http://localhost:8080"
```

## 테스트 실행

### 기본 실행 (Headless)
```bash
npm run test:e2e
```

### UI 모드로 실행
```bash
npm run test:e2e:ui
```

### 브라우저 표시하며 실행
```bash
npm run test:e2e:headed
```

### 특정 테스트 파일만 실행
```bash
npx playwright test exam-list.spec.ts
npx playwright test api.spec.ts
```

### 테스트 결과 리포트 보기
```bash
npm run test:e2e:report
```

## 테스트 구조

```
e2e/
├── exam-list.spec.ts    # 시험 목록 페이지 테스트
├── exam-form.spec.ts    # 시험 등록/수정 페이지 테스트
├── answer-key.spec.ts   # 정답 입력 페이지 테스트
├── api.spec.ts          # API 엔드포인트 테스트
└── README.md            # 이 문서
```

## 테스트 케이스 설명

### exam-list.spec.ts
- 시험 목록 페이지 로드
- 검색 필터 동작
- 시험 등록 버튼 동작
- 테이블 컬럼 확인
- [BUG] passScore null 표시 검증

### exam-form.spec.ts
- 시험 등록 폼 표시
- 유효성 검사
- 시험 등록 성공
- 과목 추가 동작
- 시험 수정 폼 로드

### answer-key.spec.ts
- 정답 입력 페이지 로드
- 과목 선택 동작
- 정답 선택 동작
- 정답 저장 동작
- Excel 가져오기 동작

### api.spec.ts
- 시험 목록 조회 API
- 시험 상세 조회 API
- 시험 등록/삭제 API
- [BUG] 에러 응답 검증

## 버그 검증 테스트

현재 발견된 버그를 검증하는 테스트:

1. **`[BUG]` 태그가 붙은 테스트**: 현재 버그 상태를 확인
2. 버그 수정 후 테스트 기대값 변경 필요

## CI/CD 통합

GitHub Actions에서 사용 예시:

```yaml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E Tests
  run: npm run test:e2e
  env:
    BASE_URL: ${{ vars.BASE_URL }}
    API_URL: ${{ vars.API_URL }}
```
