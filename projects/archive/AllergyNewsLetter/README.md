# AllergyNewsLetter 테스트

## 프로젝트 정보

| 항목 | 내용 |
|------|------|
| **서비스명** | AllergyNewsLetter |
| **설명** | 알러지 뉴스 브리핑 서비스 |
| **URL** | http://localhost:4050 |
| **API Docs** | http://localhost:4050/docs |
| **GitHub** | [bluevlad/AllergyNewsLetter](https://github.com/bluevlad/AllergyNewsLetter) |

## 테스트 현황

### E2E 테스트

| 테스트 파일 | 테스트 케이스 | 상태 |
|-------------|---------------|------|
| main.spec.ts | 메인 페이지 (4개) | ✅ Pass |
| main.spec.ts | 구독 신청 (6개) | ✅ Pass |
| main.spec.ts | 구독 해지 (4개) | ✅ Pass |
| main.spec.ts | 인증 페이지 (2개) | ⚠️ 1 Failed |
| main.spec.ts | 결과 페이지 (2개) | ✅ Pass |
| main.spec.ts | 토큰 기반 해지 (1개) | ✅ Pass |
| main.spec.ts | 반응형 디자인 (2개) | ✅ Pass |
| main.spec.ts | 접근성/에러/성능 (4개) | ✅ Pass |

### API 테스트

| 테스트 파일 | 테스트 케이스 | 상태 |
|-------------|---------------|------|
| api.spec.ts | OpenAPI (2개) | ✅ Pass |
| api.spec.ts | 홈페이지 API (2개) | ✅ Pass |
| api.spec.ts | 구독 신청 API (5개) | ✅ Pass |
| api.spec.ts | 이메일 인증 API (3개) | ✅ Pass |
| api.spec.ts | 인증코드 재발송 (2개) | ✅ Pass |
| api.spec.ts | 결과 페이지 API (2개) | ✅ Pass |
| api.spec.ts | 구독 해지 API (4개) | ✅ Pass |
| api.spec.ts | 토큰 기반 해지 (2개) | ✅ Pass |
| api.spec.ts | 에러 처리 (2개) | ✅ Pass |
| api.spec.ts | 보안 테스트 (2개) | ✅ Pass |
| api.spec.ts | Content-Type (2개) | ✅ Pass |
| api.spec.ts | 응답 헤더 (3개) | ✅ Pass |
| api.spec.ts | 성능/한글 처리 (4개) | ✅ Pass |

**총 테스트: 60개 (59 passed, 1 failed)**

## 테스트 실행 방법

```bash
# AllergyNewsLetter 프로젝트만 테스트
npx playwright test --project=allergynewsletter

# 특정 테스트 파일 실행
npx playwright test projects/AllergyNewsLetter/e2e/main.spec.ts
```

## 등록된 GitHub Issues

| Issue # | 유형 | 제목 |
|---------|------|------|
| [#2](https://github.com/bluevlad/AllergyNewsLetter/issues/2) | BUG | HEAD 요청 시 405 Method Not Allowed 반환 |
| [#3](https://github.com/bluevlad/AllergyNewsLetter/issues/3) | BUG | 잘못된 토큰으로 구독 해지 시 성공 페이지 표시 |
| [#4](https://github.com/bluevlad/AllergyNewsLetter/issues/4) | Enhancement | 이메일 형식 서버 사이드 유효성 검증 추가 |
| [#5](https://github.com/bluevlad/AllergyNewsLetter/issues/5) | Enhancement | 저작권 년도 2024 → 2026 업데이트 필요 |
| [#6](https://github.com/bluevlad/AllergyNewsLetter/issues/6) | Enhancement | Rate Limiting 구현 필요 |
| [#7](https://github.com/bluevlad/AllergyNewsLetter/issues/7) | Enhancement | CSRF 토큰 구현 필요 |

## 주요 기능

- 알러지 뉴스 브리핑 구독
- 이메일 인증 (6자리 코드)
- 구독 해지 (이메일/토큰 방식)
- 매일 오전 8시 뉴스레터 발송
- PubMed 논문 브리핑

## 구독 플로우

```
1. 이메일/이름 입력 → /subscribe
2. 인증코드 입력 → /verify/{id}
3. 구독 완료 → /result
```

## 해지 플로우

```
방법 1: 이메일로 해지
1. 이메일 입력 → /unsubscribe
2. 인증코드 입력 → /unsubscribe/verify/{id}
3. 해지 완료 → /unsubscribe/result

방법 2: 토큰으로 해지 (뉴스레터 링크)
1. 토큰 링크 클릭 → /unsubscribe/token/{token}
2. 해지 완료
```

## API 엔드포인트

| 엔드포인트 | 메소드 | 설명 |
|------------|--------|------|
| / | GET | 홈페이지 |
| /subscribe | GET, POST | 구독 신청 |
| /verify/{id} | GET | 인증 페이지 |
| /verify | POST | 인증 확인 |
| /resend | POST | 인증코드 재발송 |
| /unsubscribe | GET, POST | 구독 해지 |
| /unsubscribe/token/{token} | GET | 토큰 기반 해지 |
| /docs | GET | Swagger UI |
| /openapi.json | GET | OpenAPI 스펙 |

## 기술 스택

- **Frontend**: Jinja2 Templates + CSS
- **Backend**: FastAPI (Python) + Uvicorn
- **Database**: SQLite/PostgreSQL
- **Email**: SMTP
