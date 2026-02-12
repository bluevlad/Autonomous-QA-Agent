# HealthPulse 테스트

## 프로젝트 정보

| 항목 | 내용 |
|------|------|
| **서비스명** | HealthPulse |
| **설명** | 헬스케어 뉴스레터 서비스 |
| **URL** | http://study.unmong.com:4030 |
| **API Docs** | http://study.unmong.com:4030/docs |
| **GitHub** | [bluevlad/HealthPulse](https://github.com/bluevlad/HealthPulse) |

## 테스트 현황

### E2E 테스트

| 테스트 파일 | 테스트 케이스 | 상태 |
|-------------|---------------|------|
| main.spec.ts | 메인 페이지 (4개) | ✅ Pass |
| main.spec.ts | 구독 페이지 (6개) | ⚠️ 1 Failed |
| main.spec.ts | 관리자 대시보드 (4개) | ✅ Pass |
| main.spec.ts | 구독자 관리 (4개) | ⚠️ 1 Failed |
| main.spec.ts | 발송 이력 (4개) | ⚠️ 1 Failed |
| main.spec.ts | 아티클 관리/구독해지 (8개) | ✅ Pass |
| main.spec.ts | 반응형/접근성 (8개) | ✅ Pass |

### API 테스트

| 테스트 파일 | 테스트 케이스 | 상태 |
|-------------|---------------|------|
| api.spec.ts | Health/Count API (4개) | ✅ Pass |
| api.spec.ts | Subscribe/Verify API (8개) | ✅ Pass |
| api.spec.ts | Admin API (6개) | ✅ Pass |
| api.spec.ts | OpenAPI/에러 처리 (6개) | ✅ Pass |
| api.spec.ts | 성능 테스트 (3개) | ⚠️ 2 Failed |

**총 테스트: 65개 (60 passed, 5 failed)**

## 테스트 실행 방법

```bash
# HealthPulse 프로젝트만 테스트
npx playwright test --project=healthpulse

# 특정 테스트 파일 실행
npx playwright test projects/HealthPulse/e2e/main.spec.ts
```

## 등록된 GitHub Issues

| Issue # | 유형 | 제목 |
|---------|------|------|
| [#1](https://github.com/bluevlad/HealthPulse/issues/1) | BUG | 구독 인증 페이지 리다이렉트 문제 |
| [#2](https://github.com/bluevlad/HealthPulse/issues/2) | BUG | 페이지 로딩 성능 저하 |
| [#3](https://github.com/bluevlad/HealthPulse/issues/3) | BUG | 중복 요소로 인한 Locator 모호성 |
| [#4](https://github.com/bluevlad/HealthPulse/issues/4) | Enhancement | Admin 페이지 인증 추가 |
| [#5](https://github.com/bluevlad/HealthPulse/issues/5) | Enhancement | Rate Limiting 구현 |
| [#6](https://github.com/bluevlad/HealthPulse/issues/6) | Enhancement | 이메일 검증 강화 |
| [#7](https://github.com/bluevlad/HealthPulse/issues/7) | Enhancement | 통계 대시보드 개선 |
| [#8](https://github.com/bluevlad/HealthPulse/issues/8) | Enhancement | 구독자 내보내기 기능 |

## 주요 기능

- 뉴스레터 구독 신청/해지
- 이메일 인증 (6자리 코드)
- 관리자 대시보드
- 구독자 관리
- 발송 이력 조회
- 아티클 관리

## API 엔드포인트

| 엔드포인트 | 설명 |
|------------|------|
| GET /api/health | 서버 상태 |
| GET /api/subscriber/count | 구독자 수 |
| POST /api/subscribe | 구독 신청 |
| POST /api/verify | 이메일 인증 |
| GET /admin/dashboard | 관리자 대시보드 |
| GET /admin/subscribers | 구독자 목록 |

## 기술 스택

- **Frontend**: Jinja2 Templates + Bootstrap
- **Backend**: FastAPI (Python)
- **Database**: SQLite/PostgreSQL
- **Email**: SMTP
