/**
 * QA 자동 점검 스케줄러 - 설정
 *
 * 환경변수 기반 설정 + 6개 프로젝트 Health Check URL 매핑
 */

import type { ProjectHealthConfig } from './types.js';

/** 프로젝트명 → GitHub 저장소 매핑 */
export const githubRepoMap: Record<string, string> = {
  hopenvision: 'bluevlad/hopenvision',
  allergyinsight: 'bluevlad/AllergyInsight',
  edufit: 'bluevlad/EduFit',
  newsletterplatform: 'bluevlad/NewsLetterPlatform',
  'unmong-main': 'bluevlad/unmong-main',
  standup: 'bluevlad/StandUp',
};

export const schedulerConfig = {
  cron: process.env.SCHEDULER_CRON || '0 22 * * *',
  timezone: 'Asia/Seoul',
  healthCheckTimeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT || '10000', 10),
  testTimeout: parseInt(process.env.TEST_TIMEOUT || '300000', 10),
  logDir: process.env.SCHEDULER_LOG_DIR || './scheduler/logs',
  logRetentionDays: 30,
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL || '',
};

export const projects: ProjectHealthConfig[] = [
  {
    name: 'hopenvision',
    playwrightProject: 'hopenvision',
    description: '공무원 시험 채점 시스템',
    endpoints: [
      {
        url: process.env.HOPENVISION_API_URL
          ? `${process.env.HOPENVISION_API_URL}/api/exams`
          : 'http://localhost:9050/api/exams',
        label: 'Backend API',
        strategy: 'status-ok',
      },
      {
        url: process.env.HOPENVISION_URL || 'http://localhost:4060',
        label: 'Frontend',
        strategy: 'page-load',
      },
    ],
  },
  {
    name: 'allergyinsight',
    playwrightProject: 'allergyinsight',
    description: '알러지 논문 검색 시스템',
    endpoints: [
      {
        url: process.env.ALLERGYINSIGHT_API_URL
          ? `${process.env.ALLERGYINSIGHT_API_URL}/api/health`
          : 'http://localhost:9040/api/health',
        label: 'Backend API',
        strategy: 'json-health',
      },
      {
        url: process.env.ALLERGYINSIGHT_URL || 'http://localhost:4040',
        label: 'Frontend',
        strategy: 'page-load',
      },
    ],
  },
  {
    name: 'edufit',
    playwrightProject: 'edufit',
    description: '학원/강사 평판 분석 통합 플랫폼',
    endpoints: [
      {
        url: process.env.EDUFIT_API_URL
          ? `${process.env.EDUFIT_API_URL}/api/health`
          : 'http://localhost:9070/api/health',
        label: 'Backend API',
        strategy: 'json-health',
      },
      {
        url: process.env.EDUFIT_URL || 'http://localhost:4070',
        label: 'Frontend',
        strategy: 'page-load',
      },
    ],
  },
  {
    name: 'newsletterplatform',
    playwrightProject: 'newsletterplatform',
    description: '멀티테넌트 뉴스레터 플랫폼',
    endpoints: [
      {
        url: process.env.NEWSLETTERPLATFORM_URL
          ? `${process.env.NEWSLETTERPLATFORM_URL}/api/health`
          : 'http://localhost:4055/api/health',
        label: 'API',
        strategy: 'json-health',
      },
    ],
  },
  {
    name: 'unmong-main',
    playwrightProject: 'unmong-main',
    description: '운몽시스템즈 통합 포털',
    endpoints: [
      {
        url: process.env.UNMONG_MAIN_URL || 'http://localhost:80',
        label: 'Portal',
        strategy: 'page-load',
      },
    ],
  },
  {
    name: 'standup',
    playwrightProject: 'standup',
    description: '업무보고 관리 자동화 Agent',
    endpoints: [
      {
        url: process.env.STANDUP_API_URL
          ? `${process.env.STANDUP_API_URL}/api/v1/health`
          : 'http://localhost:9060/api/v1/health',
        label: 'API',
        strategy: 'json-health',
      },
    ],
  },
];
