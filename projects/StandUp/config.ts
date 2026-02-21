/**
 * StandUp 프로젝트 테스트 설정
 */
export const config = {
  // 프로젝트 정보
  name: 'StandUp',
  description: '업무보고 관리 자동화 Agent',

  // GitHub 저장소 정보 (이슈 등록용)
  github: {
    owner: 'bluevlad',
    repo: 'StandUp',
    issueLabels: ['bug', 'enhancement', 'qa-test'],
  },

  // 테스트 대상 URL
  urls: {
    backend: process.env.STANDUP_API_URL || 'http://localhost:9060',
    docs: process.env.STANDUP_API_URL
      ? `${process.env.STANDUP_API_URL}/docs`
      : 'http://localhost:9060/docs',
  },

  // API 엔드포인트
  apiEndpoints: {
    health: '/api/v1/health',
    stats: '/api/v1/stats',
    agentLogs: '/api/v1/agent-logs',
    workItems: '/api/v1/work-items',
    workItemsScan: '/api/v1/work-items/scan',
    reports: '/api/v1/reports',
    reportTrigger: '/api/v1/reports/trigger',
  },
};

export type ProjectConfig = typeof config;
