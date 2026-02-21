/**
 * QA 자동 점검 스케줄러 - 설정
 *
 * 환경변수 기반 설정 + 9개 프로젝트 Health Check URL 매핑
 */

import type { ProjectHealthConfig } from './types.js';

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
    name: 'teacherhub',
    playwrightProject: 'teacherhub',
    description: '강사 평판 분석 시스템',
    endpoints: [
      {
        url: process.env.TEACHERHUB_API_URL
          ? `${process.env.TEACHERHUB_API_URL}/api/health`
          : 'http://localhost:8081/api/health',
        label: 'Backend API',
        strategy: 'json-health',
      },
      {
        url: process.env.TEACHERHUB_URL || 'http://localhost:4010',
        label: 'Frontend',
        strategy: 'page-load',
      },
    ],
  },
  {
    name: 'healthpulse',
    playwrightProject: 'healthpulse',
    description: '헬스케어 뉴스레터 서비스',
    endpoints: [
      {
        url: process.env.HEALTHPULSE_URL
          ? `${process.env.HEALTHPULSE_URL}/api/health`
          : 'http://localhost:4030/api/health',
        label: 'API',
        strategy: 'json-health',
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
    name: 'allergynewsletter',
    playwrightProject: 'allergynewsletter',
    description: '알러지 뉴스 브리핑 서비스',
    endpoints: [
      {
        url: process.env.ALLERGYNEWSLETTER_URL
          ? `${process.env.ALLERGYNEWSLETTER_URL}/api/health`
          : 'http://localhost:4050/api/health',
        label: 'API',
        strategy: 'json-health',
      },
    ],
  },
  {
    name: 'academyinsight',
    playwrightProject: 'academyinsight',
    description: '학원 온라인 평판 모니터링',
    endpoints: [
      {
        url: process.env.ACADEMYINSIGHT_API_URL
          ? `${process.env.ACADEMYINSIGHT_API_URL}/api/health`
          : 'http://localhost:8082/api/health',
        label: 'Backend API',
        strategy: 'json-health',
      },
      {
        url: process.env.ACADEMYINSIGHT_URL || 'http://localhost:4020',
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
