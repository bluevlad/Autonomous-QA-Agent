/**
 * HealthPulse 프로젝트 테스트 설정
 */
export const config = {
  // 프로젝트 정보
  name: 'HealthPulse',
  description: '디지털 헬스케어 뉴스레터 구독 서비스',

  // GitHub 저장소 정보 (이슈 등록용)
  github: {
    owner: 'bluevlad',
    repo: 'HealthPulse',
    issueLabels: ['bug', 'enhancement', 'qa-test'],
  },

  // 테스트 대상 URL
  urls: {
    base: process.env.HEALTHPULSE_URL || 'http://study.unmong.com:4030',
  },

  // API 엔드포인트
  apiEndpoints: {
    health: '/api/health',
    subscriberCount: '/api/subscribers/count',
    adminStats: '/api/admin/stats',
    subscribe: '/subscribe',
    verify: '/verify',
    completeSubscription: '/complete-subscription',
    resendCode: '/resend-code',
    sendNow: '/send-now',
    unsubscribe: '/unsubscribe/{token}',
    manage: '/manage/{token}',
    admin: '/admin',
    adminSubscribers: '/admin/subscribers',
    adminSendHistory: '/admin/send-history',
    adminArticles: '/admin/articles',
  },
};

export type ProjectConfig = typeof config;
