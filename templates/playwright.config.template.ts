import { defineConfig, devices } from '@playwright/test';

/**
 * 프로젝트별 Playwright 설정 템플릿
 *
 * 사용법:
 * 1. 이 파일을 프로젝트의 e2e/playwright.config.ts로 복사
 * 2. {{PROJECT_NAME}}, {{BASE_URL}}, {{API_URL}} 등을 실제 값으로 교체
 * 3. webServer 설정을 프로젝트에 맞게 수정
 */

export default defineConfig({
  // 테스트 디렉토리
  testDir: './tests',

  // 테스트 파일 패턴
  testMatch: '**/*.spec.ts',

  // 병렬 실행
  fullyParallel: true,

  // CI 환경 설정
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // 타임아웃 설정
  timeout: 30000,
  expect: {
    timeout: 5000,
  },

  // 리포터 설정
  reporter: [
    ['list'],
    ['html', { outputFolder: './playwright-report', open: 'never' }],
    ['json', { outputFile: './test-results.json' }],
    ['junit', { outputFile: './junit-results.xml' }],
  ],

  // 공통 설정
  use: {
    // 기본 URL (환경 변수로 오버라이드 가능)
    baseURL: process.env.BASE_URL || '{{BASE_URL}}',

    // 추적 및 스크린샷
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // 브라우저 설정
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    // 로케일 설정
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
  },

  // 브라우저 프로젝트
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // 추가 브라우저 (필요시 주석 해제)
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // 모바일 테스트
    // {
    //   name: 'mobile-chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  // 로컬 개발 서버 (선택)
  // webServer: {
  //   command: '{{START_COMMAND}}',
  //   url: '{{BASE_URL}}',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120000,
  // },

  // 출력 디렉토리
  outputDir: './test-results',
});
