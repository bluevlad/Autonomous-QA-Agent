# 프로젝트별 QA 테스트 허브 구축 가이드

> 각 프로젝트 레포지토리에 독립적인 E2E 테스트 환경을 구축하는 방법

## 1. 기본 구조

### 디렉토리 구조

```
{project}/
├── e2e/
│   ├── tests/
│   │   ├── main.spec.ts      # UI/E2E 테스트
│   │   └── api.spec.ts       # API 테스트
│   ├── fixtures/
│   │   └── test-data.json    # 테스트 데이터
│   ├── utils/
│   │   └── helpers.ts        # 공통 헬퍼 함수
│   └── playwright.config.ts  # Playwright 설정
├── .github/
│   └── workflows/
│       └── e2e-test.yml      # GitHub Actions
├── package.json
└── e2e.md                    # 테스트 문서
```

## 2. 설정 파일 템플릿

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',

  // 병렬 실행
  fullyParallel: true,

  // CI 환경 설정
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // 리포터
  reporter: [
    ['list'],
    ['html', { outputFolder: 'e2e/playwright-report' }],
    ['json', { outputFile: 'e2e/test-results.json' }],
  ],

  // 공통 설정
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // 브라우저 설정
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // 필요시 다른 브라우저 추가
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
  ],
});
```

### package.json (테스트 스크립트 추가)

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:report": "playwright show-report e2e/playwright-report",
    "test:e2e:update": "playwright test --update-snapshots"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0"
  }
}
```

### .github/workflows/e2e-test.yml

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          BASE_URL: ${{ vars.BASE_URL }}

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: e2e/playwright-report/
          retention-days: 30
```

## 3. 프로젝트별 설정 예시

### TeacherHub (React + FastAPI)

```typescript
// e2e/playwright.config.ts
export default defineConfig({
  testDir: './e2e/tests',
  use: {
    baseURL: process.env.TEACHERHUB_URL || 'http://localhost:4010',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4010',
    reuseExistingServer: !process.env.CI,
  },
});
```

### HealthPulse (FastAPI + Jinja2)

```typescript
// e2e/playwright.config.ts
export default defineConfig({
  testDir: './e2e/tests',
  use: {
    baseURL: process.env.HEALTHPULSE_URL || 'http://localhost:4030',
  },
  webServer: {
    command: 'uvicorn main:app --port 4030',
    url: 'http://localhost:4030',
    reuseExistingServer: !process.env.CI,
  },
});
```

### AllergyInsight (React + FastAPI)

```typescript
// e2e/playwright.config.ts
export default defineConfig({
  testDir: './e2e/tests',
  use: {
    baseURL: process.env.ALLERGYINSIGHT_URL || 'http://localhost:4040',
  },
  webServer: [
    {
      command: 'cd backend && uvicorn main:app --port 8000',
      url: 'http://localhost:8000/api/health',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'cd frontend && npm run dev',
      url: 'http://localhost:4040',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
```

### AllergyNewsLetter (FastAPI + Jinja2)

```typescript
// e2e/playwright.config.ts
export default defineConfig({
  testDir: './e2e/tests',
  use: {
    baseURL: process.env.ALLERGYNEWSLETTER_URL || 'http://localhost:4050',
  },
  webServer: {
    command: 'uvicorn main:app --port 4050',
    url: 'http://localhost:4050',
    reuseExistingServer: !process.env.CI,
  },
});
```

## 4. 공통 유틸리티

### e2e/utils/helpers.ts

```typescript
import { Page, expect } from '@playwright/test';

/**
 * 페이지 로드 완료 대기
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
}

/**
 * API 응답 대기
 */
export async function waitForApiResponse(page: Page, urlPattern: string | RegExp) {
  return page.waitForResponse(response =>
    response.url().match(urlPattern) !== null && response.status() === 200
  );
}

/**
 * 토스트/알림 메시지 확인
 */
export async function expectToast(page: Page, message: string) {
  const toast = page.locator('.ant-message, .toast, [role="alert"]');
  await expect(toast.filter({ hasText: message })).toBeVisible();
}

/**
 * 폼 필드 채우기
 */
export async function fillForm(page: Page, fields: Record<string, string>) {
  for (const [name, value] of Object.entries(fields)) {
    const input = page.locator(`[name="${name}"], [id="${name}"]`);
    await input.fill(value);
  }
}

/**
 * 테이블 데이터 확인
 */
export async function expectTableRow(page: Page, rowData: string[]) {
  const row = page.locator('tr').filter({ hasText: rowData[0] });
  for (const data of rowData) {
    await expect(row.getByText(data)).toBeVisible();
  }
}
```

### e2e/utils/api-helpers.ts

```typescript
import { APIRequestContext, expect } from '@playwright/test';

/**
 * API 헬스 체크
 */
export async function checkApiHealth(request: APIRequestContext, baseUrl: string) {
  const response = await request.get(`${baseUrl}/api/health`);
  expect(response.status()).toBe(200);
  return response.json();
}

/**
 * API 응답 시간 측정
 */
export async function measureResponseTime(
  request: APIRequestContext,
  url: string,
  maxTime: number = 3000
) {
  const start = Date.now();
  const response = await request.get(url);
  const duration = Date.now() - start;

  expect(duration).toBeLessThan(maxTime);
  return { response, duration };
}

/**
 * API 에러 응답 검증
 */
export async function expectApiError(
  request: APIRequestContext,
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  expectedStatus: number
) {
  const response = await request[method.toLowerCase()](url);
  expect(response.status()).toBe(expectedStatus);
}
```

## 5. 테스트 파일 템플릿

### e2e/tests/main.spec.ts

```typescript
import { test, expect } from '@playwright/test';
import { waitForPageLoad } from '../utils/helpers';

test.describe('메인 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
  });

  test('페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await expect(page).toHaveTitle(/프로젝트명/);
  });

  test('주요 UI 요소가 표시되어야 함', async ({ page }) => {
    // 헤더
    await expect(page.locator('header')).toBeVisible();

    // 메인 콘텐츠
    await expect(page.locator('main')).toBeVisible();

    // 푸터
    await expect(page.locator('footer')).toBeVisible();
  });
});

test.describe('반응형 디자인', () => {
  test('모바일에서 정상 동작해야 함', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // 모바일 네비게이션 확인
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  });
});
```

### e2e/tests/api.spec.ts

```typescript
import { test, expect } from '@playwright/test';
import { checkApiHealth, measureResponseTime } from '../utils/api-helpers';

const API_BASE_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('API 테스트', () => {
  test('헬스 체크', async ({ request }) => {
    await checkApiHealth(request, API_BASE_URL);
  });

  test('응답 시간 측정', async ({ request }) => {
    const { duration } = await measureResponseTime(
      request,
      `${API_BASE_URL}/api/health`,
      1000
    );
    console.log(`API 응답 시간: ${duration}ms`);
  });
});
```

## 6. 마이그레이션 스크립트

각 프로젝트에 테스트를 복사하는 스크립트:

```bash
#!/bin/bash
# migrate-tests.sh

PROJECT=$1
SOURCE_DIR="./projects/${PROJECT}/e2e"
TARGET_REPO="../${PROJECT}"

if [ -z "$PROJECT" ]; then
  echo "Usage: ./migrate-tests.sh <project-name>"
  exit 1
fi

# 디렉토리 생성
mkdir -p "${TARGET_REPO}/e2e/tests"
mkdir -p "${TARGET_REPO}/e2e/utils"
mkdir -p "${TARGET_REPO}/e2e/fixtures"
mkdir -p "${TARGET_REPO}/.github/workflows"

# 테스트 파일 복사
cp -r "${SOURCE_DIR}"/*.spec.ts "${TARGET_REPO}/e2e/tests/"

# 설정 파일 복사
cp ./templates/playwright.config.ts "${TARGET_REPO}/e2e/"
cp ./templates/e2e-test.yml "${TARGET_REPO}/.github/workflows/"

echo "✅ ${PROJECT} 테스트 마이그레이션 완료"
```

## 7. 구축 체크리스트

각 프로젝트에서 다음을 확인하세요:

- [ ] e2e 폴더 구조 생성
- [ ] playwright.config.ts 설정
- [ ] package.json에 테스트 스크립트 추가
- [ ] .github/workflows/e2e-test.yml 추가
- [ ] 테스트 파일 마이그레이션
- [ ] 환경 변수 설정 (GitHub Secrets)
- [ ] README 업데이트
- [ ] 첫 테스트 실행 확인

## 8. 중앙 허브와 연동

Autonomous-QA-Agent와 개별 프로젝트를 연동하려면:

### Git Submodule 방식

```bash
# 중앙 허브에서
git submodule add https://github.com/bluevlad/TeacherHub.git projects/TeacherHub
git submodule add https://github.com/bluevlad/HealthPulse.git projects/HealthPulse
```

### 테스트 결과 수집

```yaml
# .github/workflows/collect-results.yml
name: Collect Test Results

on:
  workflow_run:
    workflows: ["E2E Tests"]
    types: [completed]

jobs:
  collect:
    runs-on: ubuntu-latest
    steps:
      - name: Download artifacts
        uses: dawidd6/action-download-artifact@v3
        with:
          workflow: e2e-test.yml

      - name: Aggregate results
        run: |
          # 결과 수집 및 리포트 생성
          node scripts/aggregate-results.js
```

---

## 다음 단계

1. **즉시 적용**: 이 가이드의 설정 파일을 각 프로젝트에 복사
2. **점진적 마이그레이션**: 테스트 파일을 단계적으로 이동
3. **CI/CD 설정**: GitHub Actions 워크플로우 활성화
4. **모니터링**: 테스트 결과 대시보드 구축

---
*Generated by Autonomous QA Agent - 2026-02-07*
