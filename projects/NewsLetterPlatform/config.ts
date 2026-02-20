/**
 * NewsLetterPlatform 프로젝트 테스트 설정
 */
export const config = {
  // 프로젝트 정보
  name: 'NewsLetterPlatform',
  description: '멀티테넌트 뉴스레터 통합 플랫폼',

  // GitHub 저장소 정보 (이슈 등록용)
  github: {
    owner: 'bluevlad',
    repo: 'NewsLetterPlatform',
    issueLabels: ['bug', 'enhancement', 'qa-test'],
  },

  // 테스트 대상 URL
  urls: {
    base: process.env.NEWSLETTERPLATFORM_URL || 'http://localhost:4055',
  },

  // API 엔드포인트
  apiEndpoints: {
    health: '/api/health',
    tenants: '/api/tenants',
    subscribe: '/subscribe',
    unsubscribe: '/unsubscribe',
    newsletters: '/api/newsletters',
    sendHistory: '/api/send-history',
  },
};

export type ProjectConfig = typeof config;
