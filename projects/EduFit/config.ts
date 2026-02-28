/**
 * EduFit 프로젝트 테스트 설정
 */
export const config = {
  // 프로젝트 정보
  name: 'edufit',
  description: '학원/강사 평판 분석 통합 플랫폼',

  // GitHub 저장소 정보 (이슈 등록용)
  github: {
    owner: 'bluevlad',
    repo: 'EduFit',
    issueLabels: ['bug', 'enhancement', 'qa-test'],
  },

  // 테스트 대상 URL
  urls: {
    frontend: process.env.EDUFIT_URL || 'http://localhost:4070',
    backend: process.env.EDUFIT_API_URL || 'http://localhost:9070',
  },

  // API 엔드포인트
  apiEndpoints: {
    health: '/api/health',
  },
};

export type ProjectConfig = typeof config;
