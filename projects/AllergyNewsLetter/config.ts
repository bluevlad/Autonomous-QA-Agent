/**
 * AllergyNewsLetter 프로젝트 테스트 설정
 */
export const config = {
  // 프로젝트 정보
  name: 'AllergyNewsLetter',
  description: '알러지 뉴스 브리핑 서비스',

  // GitHub 저장소 정보 (이슈 등록용)
  github: {
    owner: 'bluevlad',
    repo: 'AllergyNewsLetter',
    issueLabels: ['bug', 'enhancement', 'qa-test'],
  },

  // 테스트 대상 URL
  urls: {
    base: process.env.ALLERGYNEWSLETTER_URL || 'http://localhost:4050',
  },

  // API 엔드포인트
  apiEndpoints: {
    health: '/api/health',
    subscribe: '/subscribe',
    unsubscribe: '/unsubscribe',
    articles: '/api/articles',
  },
};

export type ProjectConfig = typeof config;
