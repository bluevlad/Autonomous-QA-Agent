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
    base: process.env.UNMONG_MAIN_URL || 'http://www.unmong.com',
  },

  // 서비스 링크 검증 대상
  serviceLinks: {
    academyInsight: 'http://study.unmong.com:4020',
    teacherHub: 'http://study.unmong.com:4010',
    healthPulse: 'http://study.unmong.com:4030',
    allergyInsight: 'http://www.unmong.com:4040',
    hopenvision: 'http://study.unmong.com:4060',
    newsletterPlatform: 'http://www.unmong.com:4055',
  },
};

export type ProjectConfig = typeof config;
