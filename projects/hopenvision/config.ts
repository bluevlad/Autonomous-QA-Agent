/**
 * HopenVision 프로젝트 테스트 설정
 */
export const config = {
  // 프로젝트 정보
  name: 'hopenvision',
  description: '공무원 시험 채점 시스템',

  // GitHub 저장소 정보 (이슈 등록용)
  github: {
    owner: 'bluevlad',
    repo: 'hopenvision',
    issueLabels: ['bug', 'enhancement', 'qa-test'],
  },

  // 테스트 대상 URL
  urls: {
    frontend: process.env.HOPENVISION_URL || 'http://localhost:4060',
    backend: process.env.HOPENVISION_API_URL || 'http://localhost:9050',
    swagger: process.env.HOPENVISION_API_URL ? `${process.env.HOPENVISION_API_URL}/swagger-ui.html` : 'http://localhost:9050/swagger-ui.html',
  },

  // 테스트 데이터
  testData: {
    existingExamCd: 'EXAM2026',
    testExamPrefix: 'TEST_',
  },

  // API 엔드포인트
  apiEndpoints: {
    exams: '/api/exams',
    subjects: '/api/exams/{examCd}/subjects',
    answers: '/api/exams/{examCd}/answers',
    import: '/api/import',
  },
};

export type ProjectConfig = typeof config;
