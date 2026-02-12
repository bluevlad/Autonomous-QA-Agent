/**
 * AcademyInsight 프로젝트 테스트 설정
 */
export const config = {
  // 프로젝트 정보
  name: 'AcademyInsight',
  description: '학원 온라인 평판 모니터링 시스템',

  // GitHub 저장소 정보 (이슈 등록용)
  github: {
    owner: 'bluevlad',
    repo: 'AcademyInsight',
    issueLabels: ['bug', 'enhancement', 'qa-test'],
  },

  // 테스트 대상 URL
  urls: {
    frontend: process.env.ACADEMYINSIGHT_URL || 'http://study.unmong.com:4020',
    backend: process.env.ACADEMYINSIGHT_API_URL || 'http://study.unmong.com:8082',
  },

  // API 엔드포인트
  apiEndpoints: {
    health: '/api/health',
    dashboard: '/api/dashboard',
    crawlStatus: '/api/crawl/status',
    teachers: '/api/teachers',
    academies: '/api/academies',
    mentions: '/api/mentions',
    stats: '/api/stats',
  },
};

export type ProjectConfig = typeof config;
