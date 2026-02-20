/**
 * unmong-main 프로젝트 테스트 설정
 */
export const config = {
  // 프로젝트 정보
  name: 'unmong-main',
  description: '운몽시스템즈 통합 서비스 포털',

  // GitHub 저장소 정보 (이슈 등록용)
  github: {
    owner: 'bluevlad',
    repo: 'unmong-main',
    issueLabels: ['bug', 'enhancement', 'qa-test'],
  },

  // 테스트 대상 URL
  urls: {
    base: process.env.UNMONG_MAIN_URL || 'http://localhost:80',
  },

  // 서비스 링크 검증 대상 (환경변수로 설정)
  serviceLinks: {
    academyInsight: process.env.ACADEMYINSIGHT_URL || 'http://localhost:4020',
    teacherHub: process.env.TEACHERHUB_URL || 'http://localhost:4010',
    healthPulse: process.env.HEALTHPULSE_URL || 'http://localhost:4030',
    allergyInsight: process.env.ALLERGYINSIGHT_URL || 'http://localhost:4040',
    hopenvision: process.env.HOPENVISION_URL || 'http://localhost:4060',
    newsletterPlatform: process.env.NEWSLETTERPLATFORM_URL || 'http://localhost:4055',
  },
};

export type ProjectConfig = typeof config;
