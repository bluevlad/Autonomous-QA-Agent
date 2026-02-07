# 새 프로젝트 추가 가이드

Autonomous QA Agent에 새로운 테스트 대상 프로젝트를 추가하는 방법입니다.

## 1. 프로젝트 폴더 생성

```bash
mkdir -p projects/[project-name]/e2e
mkdir -p projects/[project-name]/issues
```

## 2. 프로젝트 설정 파일 작성

`projects/[project-name]/config.ts` 파일을 생성합니다:

```typescript
export const config = {
  name: 'project-name',
  description: '프로젝트 설명',

  github: {
    owner: 'owner',
    repo: 'repo-name',
    issueLabels: ['bug', 'enhancement'],
  },

  urls: {
    frontend: process.env.PROJECT_URL || 'http://localhost:3000',
    backend: process.env.PROJECT_API_URL || 'http://localhost:8080',
  },

  testData: {
    // 테스트에 사용할 기본 데이터
  },

  apiEndpoints: {
    // API 엔드포인트 정의
  },
};
```

## 3. Playwright 설정에 프로젝트 추가

`playwright.config.ts`의 projects 배열에 추가:

```typescript
{
  name: 'project-name',
  testDir: './projects/project-name/e2e',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env.PROJECT_URL || 'http://localhost:3000',
  },
  metadata: {
    description: '프로젝트 설명',
    github: 'owner/repo',
    apiUrl: process.env.PROJECT_API_URL || 'http://localhost:8080',
  },
},
```

## 4. E2E 테스트 파일 작성

`projects/[project-name]/e2e/` 폴더에 테스트 파일을 작성합니다:

```typescript
// example.spec.ts
import { test, expect } from '@playwright/test';

test.describe('기능 테스트', () => {
  test('페이지가 로드되어야 함', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/title/i);
  });
});
```

## 5. README 작성

`projects/[project-name]/TEST_README.md` 파일을 작성합니다:

- 프로젝트 정보
- 테스트 범위
- 테스트 실행 방법
- 발견된 이슈 목록

## 6. 테스트 실행

```bash
# 새 프로젝트 테스트
npm run test:[project-name]

# 또는
npx playwright test --project=[project-name]
```

## 7. 메인 README 업데이트

루트 README.md의 프로젝트 목록 테이블에 새 프로젝트를 추가합니다.

## 프로젝트 구조 예시

```
projects/
└── new-project/
    ├── config.ts           # 프로젝트 설정
    ├── TEST_README.md      # 테스트 문서
    ├── e2e/                # E2E 테스트
    │   ├── home.spec.ts
    │   ├── login.spec.ts
    │   └── api.spec.ts
    └── issues/             # 이슈 기록
        └── ISSUE_001.md
```
