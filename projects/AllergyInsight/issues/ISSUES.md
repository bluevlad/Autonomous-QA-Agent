# AllergyInsight - 등록된 GitHub Issues

> GitHub Repository: [bluevlad/AllergyInsight](https://github.com/bluevlad/AllergyInsight)

## 버그 (BUG)

| Issue # | 제목 | 상태 | 우선순위 |
|---------|------|------|----------|
| [#10](https://github.com/bluevlad/AllergyInsight/issues/10) | abstract_kr 필드가 null로 반환됨 | Open | Medium |
| [#11](https://github.com/bluevlad/AllergyInsight/issues/11) | 중복 논문 데이터 존재 (WAO Anaphylaxis Guidance 2020) | Open | Medium |

## 개선 사항 (Enhancement)

| Issue # | 제목 | 상태 | 우선순위 |
|---------|------|------|----------|
| [#12](https://github.com/bluevlad/AllergyInsight/issues/12) | 일부 논문에 allergen_links 데이터 누락 | Open | Medium |
| [#13](https://github.com/bluevlad/AllergyInsight/issues/13) | Statistics API 엔드포인트 추가 요청 | Open | Low |
| [#14](https://github.com/bluevlad/AllergyInsight/issues/14) | PDF URL 데이터 보강 필요 | Open | Low |
| [#15](https://github.com/bluevlad/AllergyInsight/issues/15) | 한글 표기 일관성 개선 ("알러지" vs "알레르기") | Open | Low |
| [#16](https://github.com/bluevlad/AllergyInsight/issues/16) | Search API 응답 시간 최적화 필요 | Open | Medium |

## 상세 내용

### #10: abstract_kr 필드 null 문제
- 모든 논문에서 `abstract_kr` (한글 초록)이 null로 반환됨
- 한글 초록 번역 데이터 추가 필요

### #11: 중복 논문 데이터
- "World Allergy Organization Anaphylaxis Guidance 2020" 논문이 중복 저장
- PMID 기준 중복 체크 로직 필요

### #15: 한글 표기 불일치
- ID 2: "세계알러지기구"
- ID 11: "세계알레르기기구"
- 국립국어원 표준은 "알레르기"

### #16: Search API 성능
- 외부 PubMed API 호출로 인해 5-10초 소요
- 캐싱 또는 비동기 처리 필요

---

## 2차 QA 점검 결과 (2026-02-16)

### P0 - 즉시 수정 필요

| Issue # | 제목 | 상태 | 라벨 |
|---------|------|------|------|
| [#24](https://github.com/bluevlad/AllergyInsight/issues/24) | Consumer Kit PIN 평문 비교 및 brute-force 방어 부재 | Open | P0, security |
| [#25](https://github.com/bluevlad/AllergyInsight/issues/25) | .env 파일이 Git에 커밋됨 - DB 비밀번호/JWT 시크릿 노출 | Open | P0, security |

### P1 - 빠른 수정 필요

| Issue # | 제목 | 상태 | 라벨 |
|---------|------|------|------|
| [#26](https://github.com/bluevlad/AllergyInsight/issues/26) | 환자 등록 시 access_pin 평문 저장 | Open | P1, security |
| [#27](https://github.com/bluevlad/AllergyInsight/issues/27) | 인증 없는 의료 데이터 API 엔드포인트 다수 | Open | P1, security |
| [#28](https://github.com/bluevlad/AllergyInsight/issues/28) | 로그인 brute-force 공격 방어 부재 | Open | P1, security |
| [#29](https://github.com/bluevlad/AllergyInsight/issues/29) | ThreadPoolExecutor 자원 누수 | Open | P1 |
| [#30](https://github.com/bluevlad/AllergyInsight/issues/30) | 전역 mutable 상태 통계 관리 - race condition | Open | P1 |

### P2 - 계획적 수정

| Issue # | 제목 | 상태 | 라벨 |
|---------|------|------|------|
| [#31](https://github.com/bluevlad/AllergyInsight/issues/31) | DiagnosisRepository 메모리 기반 - 데이터 손실 | Open | P2 |
| [#32](https://github.com/bluevlad/AllergyInsight/issues/32) | seed_users() 운영 환경 테스트 계정 생성 | Open | P2, security |
| [#33](https://github.com/bluevlad/AllergyInsight/issues/33) | 의존성 패키지 보안 취약점 (python-jose 등) | Open | P2, security |
| [#34](https://github.com/bluevlad/AllergyInsight/issues/34) | 환자 목록/가이드 API N+1 쿼리 (200~500+ SQL) | Open | P2 |
| [#35](https://github.com/bluevlad/AllergyInsight/issues/35) | Dockerfile root 실행, JWT 24시간 만료 | Open | P2 |
| [#36](https://github.com/bluevlad/AllergyInsight/issues/36) | 알러젠 정보 하드코딩 3회 중복 | Open | P2 |

### P3 - 개선 권장

| Issue # | 제목 | 상태 | 라벨 |
|---------|------|------|------|
| [#37](https://github.com/bluevlad/AllergyInsight/issues/37) | deprecated API 사용 (declarative_base, datetime.utcnow) | Open | enhancement |
| [#38](https://github.com/bluevlad/AllergyInsight/issues/38) | 환자 전화번호 검색 시 개인정보 과다 노출 | Open | enhancement |
| [#39](https://github.com/bluevlad/AllergyInsight/issues/39) | 미사용 import 및 데드 코드 정리 | Open | enhancement |

---
*1차 점검: Autonomous QA Agent - 2026-02-07*
*2차 점검: Autonomous QA Agent - 2026-02-16 (18건 등록)*
