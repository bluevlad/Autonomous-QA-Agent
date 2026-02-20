# AllergyInsight 테스트

## 프로젝트 정보

| 항목 | 내용 |
|------|------|
| **서비스명** | AllergyInsight |
| **설명** | 알러지 논문 검색 시스템 |
| **URL** | http://localhost:4040 |
| **API URL** | http://localhost:4040/api |
| **GitHub** | [bluevlad/AllergyInsight](https://github.com/bluevlad/AllergyInsight) |

## 테스트 현황

### E2E 테스트

| 테스트 파일 | 테스트 케이스 | 상태 |
|-------------|---------------|------|
| main.spec.ts | 메인 페이지 (2개) | ✅ Pass |
| main.spec.ts | 알러젠 선택 (3개) | ✅ Pass |
| main.spec.ts | 논문 검색 (2개) | ✅ Pass |
| main.spec.ts | 논문 상세 정보 (2개) | ✅ Pass |
| main.spec.ts | 반응형 디자인 (3개) | ✅ Pass |
| main.spec.ts | 접근성/성능/에러 (4개) | ✅ Pass |
| main.spec.ts | 외부 링크 (1개) | ✅ Pass |

### API 테스트

| 테스트 파일 | 테스트 케이스 | 상태 |
|-------------|---------------|------|
| api.spec.ts | Health API (1개) | ✅ Pass |
| api.spec.ts | Allergens API (3개) | ✅ Pass |
| api.spec.ts | Papers API (6개) | ✅ Pass |
| api.spec.ts | Search API (4개) | ✅ Pass |
| api.spec.ts | 에러 처리 (3개) | ✅ Pass |
| api.spec.ts | 응답 형식 (2개) | ✅ Pass |
| api.spec.ts | 성능 테스트 (3개) | ✅ Pass |
| api.spec.ts | 페이지네이션 (2개) | ✅ Pass |
| api.spec.ts | 데이터 무결성 (4개) | ✅ Pass |
| api.spec.ts | 알러젠 링크 타입 (2개) | ✅ Pass |

**총 테스트: 47개 (모두 통과)**

## 테스트 실행 방법

```bash
# AllergyInsight 프로젝트만 테스트
npx playwright test --project=allergyinsight

# 특정 테스트 파일 실행
npx playwright test projects/AllergyInsight/e2e/api.spec.ts
```

## 등록된 GitHub Issues

| Issue # | 유형 | 제목 |
|---------|------|------|
| [#10](https://github.com/bluevlad/AllergyInsight/issues/10) | BUG | abstract_kr 필드가 null로 반환됨 |
| [#11](https://github.com/bluevlad/AllergyInsight/issues/11) | BUG | 중복 논문 데이터 존재 (WAO Anaphylaxis) |
| [#12](https://github.com/bluevlad/AllergyInsight/issues/12) | Enhancement | 일부 논문에 allergen_links 데이터 누락 |
| [#13](https://github.com/bluevlad/AllergyInsight/issues/13) | Enhancement | Statistics API 엔드포인트 추가 요청 |
| [#14](https://github.com/bluevlad/AllergyInsight/issues/14) | Enhancement | PDF URL 데이터 보강 필요 |
| [#15](https://github.com/bluevlad/AllergyInsight/issues/15) | Enhancement | 한글 표기 일관성 개선 ("알러지" vs "알레르기") |
| [#16](https://github.com/bluevlad/AllergyInsight/issues/16) | Enhancement | Search API 응답 시간 최적화 필요 |

## 주요 기능

- 알러젠별 논문 검색
- 식품/흡입성 알러젠 분류
- PubMed 연동 검색
- 논문 상세 정보 조회
- 알러젠-논문 연관 관계

## 알러젠 분류

### 식품 알러젠 (21개)
땅콩, 우유, 계란, 밀, 대두, 생선, 갑각류, 견과류 등

### 흡입성 알러젠 (15개)
집먼지진드기, 꽃가루, 곰팡이, 고양이, 개 등

## API 엔드포인트

| 엔드포인트 | 설명 |
|------------|------|
| GET /api/health | 서버 상태 |
| GET /api/allergens | 알러젠 목록 |
| GET /api/papers | 논문 목록 |
| GET /api/papers/:id | 논문 상세 |
| POST /api/search | 논문 검색 |

## 기술 스택

- **Frontend**: React (Vite)
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **외부 API**: PubMed, Semantic Scholar
