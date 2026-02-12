/**
 * AllergyInsight 프로젝트 테스트 설정
 */
export const config = {
  // 프로젝트 정보
  name: 'AllergyInsight',
  description: '알러지 검사 결과 기반 지능형 정보 시스템',

  // GitHub 저장소 정보 (이슈 등록용)
  github: {
    owner: 'bluevlad',
    repo: 'AllergyInsight',
    issueLabels: ['bug', 'enhancement', 'qa-test'],
  },

  // 테스트 대상 URL
  urls: {
    frontend: process.env.ALLERGYINSIGHT_URL || 'http://www.unmong.com:4040',
    backend: process.env.ALLERGYINSIGHT_API_URL || 'http://www.unmong.com:9040',
  },

  // API 엔드포인트
  apiEndpoints: {
    health: '/api/health',
    search: '/api/search',
    papers: '/api/papers',
    allergens: '/api/allergens',
    statistics: '/api/statistics',
  },
};

export type ProjectConfig = typeof config;
