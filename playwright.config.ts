import { defineConfig, devices } from '@playwright/test';

/**
 * Autonomous QA Agent - 통합 Playwright 설정
 *
 * 각 프로젝트별 테스트를 관리합니다.
 * 새 프로젝트 추가 시 projects 배열에 추가하세요.
 */
export default defineConfig({
  // 테스트 디렉토리 (각 프로젝트의 e2e 폴더)
  testDir: './projects',
  testMatch: '**/e2e/**/*.spec.ts',

  // 병렬 실행
  fullyParallel: true,

  // CI 환경에서만 실패 시 재시도
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  // 워커 수
  workers: process.env.CI ? 1 : undefined,

  // 리포터
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  // 공통 설정
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // 프로젝트별 설정
  projects: [
    // ============================================
    // HopenVision 프로젝트
    // ============================================
    {
      name: 'hopenvision',
      testDir: './projects/hopenvision/e2e',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.HOPENVISION_URL || 'http://study.unmong.com:4060',
      },
      metadata: {
        description: '공무원 시험 채점 시스템',
        github: 'bluevlad/hopenvision',
        apiUrl: process.env.HOPENVISION_API_URL || 'http://study.unmong.com:9050',
      },
    },

    // ============================================
    // 새 프로젝트 추가 시 여기에 추가
    // ============================================
    // {
    //   name: 'new-project',
    //   testDir: './projects/new-project/e2e',
    //   use: {
    //     ...devices['Desktop Chrome'],
    //     baseURL: process.env.NEW_PROJECT_URL || 'http://localhost:3000',
    //   },
    //   metadata: {
    //     description: '프로젝트 설명',
    //     github: 'owner/repo',
    //     apiUrl: process.env.NEW_PROJECT_API_URL || 'http://localhost:8080',
    //   },
    // },
  ],
});
