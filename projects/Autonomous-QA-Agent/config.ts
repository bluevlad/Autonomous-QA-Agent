/**
 * Autonomous-QA-Agent (자체 점검) 프로젝트 테스트 설정
 */
export const config = {
  name: 'qa-agent',
  description: 'QA Dashboard 관제 시스템',

  github: {
    owner: 'bluevlad',
    repo: 'Autonomous-QA-Agent',
    issueLabels: ['bug', 'enhancement', 'qa-test'],
  },

  urls: {
    dashboardApi: process.env.DASHBOARD_API_URL || 'http://172.30.1.72:9095',
    dashboardWeb: process.env.DASHBOARD_WEB_URL || 'http://172.30.1.72:4095',
  },
};

export type ProjectConfig = typeof config;
