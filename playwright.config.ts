import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

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
    // Slack 알림 (SLACK_WEBHOOK_URL 설정 시 활성화, 스케줄러 모드에서는 비활성화)
    ...(process.env.SLACK_WEBHOOK_URL && !process.env.SCHEDULER_MODE
      ? [
          [
            './node_modules/playwright-slack-report/dist/src/SlackReporter.js',
            {
              slackWebHookUrl: process.env.SLACK_WEBHOOK_URL,
              sendResults: 'always',
              maxNumberOfFailuresToShow: 10,
              meta: [
                {
                  key: '환경',
                  value: process.env.NODE_ENV || 'local',
                },
                {
                  key: '대상',
                  value: 'hopenvision, allergyinsight, edufit, standup 외 2개',
                },
              ],
            },
          ] as any,
        ]
      : []),
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
        baseURL: process.env.HOPENVISION_URL || 'http://localhost:4060',
      },
      metadata: {
        description: '공무원 시험 채점 시스템',
        github: 'bluevlad/hopenvision',
        apiUrl: process.env.HOPENVISION_API_URL || 'http://localhost:9050',
      },
    },

    // ============================================
    // AllergyInsight 프로젝트
    // ============================================
    {
      name: 'allergyinsight',
      testDir: './projects/AllergyInsight/e2e',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.ALLERGYINSIGHT_URL || 'http://localhost:4040',
      },
      metadata: {
        description: '알러지 논문 검색 시스템',
        github: 'bluevlad/AllergyInsight',
      },
    },

    // ============================================
    // EduFit 프로젝트
    // ============================================
    {
      name: 'edufit',
      testDir: './projects/EduFit/e2e',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.EDUFIT_URL || 'http://localhost:4070',
      },
      metadata: {
        description: '학원/강사 평판 분석 통합 플랫폼',
        github: 'bluevlad/EduFit',
        apiUrl: process.env.EDUFIT_API_URL || 'http://localhost:9070',
      },
    },

    // ============================================
    // NewsLetterPlatform 프로젝트
    // ============================================
    {
      name: 'newsletterplatform',
      testDir: './projects/NewsLetterPlatform/e2e',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.NEWSLETTERPLATFORM_URL || 'http://localhost:4055',
      },
      metadata: {
        description: '멀티테넌트 뉴스레터 통합 플랫폼',
        github: 'bluevlad/NewsLetterPlatform',
      },
    },

    // ============================================
    // unmong-main 프로젝트
    // ============================================
    {
      name: 'unmong-main',
      testDir: './projects/unmong-main/e2e',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.UNMONG_MAIN_URL || 'http://localhost:80',
      },
      metadata: {
        description: '운몽시스템즈 통합 서비스 포털',
        github: 'bluevlad/unmong-main',
      },
    },

    // ============================================
    // StandUp 프로젝트
    // ============================================
    {
      name: 'standup',
      testDir: './projects/StandUp/e2e',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.STANDUP_API_URL || 'http://localhost:9060',
      },
      metadata: {
        description: '업무보고 관리 자동화 Agent',
        github: 'bluevlad/StandUp',
      },
    },
  ],
});
