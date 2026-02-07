# Changelog

이 문서는 HopenVision 프로젝트의 주요 변경 사항을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따르며,
버전 관리는 [Semantic Versioning](https://semver.org/lang/ko/)을 준수합니다.

## [Unreleased]

### Added
- 사용자 시스템 설계 (답안 입력, 채점, 순위 확인)
- 배치 시스템 설계 (통계 집계, 순위 계산)

### Changed
- WBS 업데이트: 사용자/관리자/배치 시스템 구분

### Planned
- Phase 3: 사용자 답안 입력 및 채점 기능
- Phase 4: 배치 시스템 구현

---

## [0.2.0] - 2025-02-06

### Added
- 구현 방안 제안서 (doc/IMPLEMENTATION_PROPOSAL.md)
- ADR (Architecture Decision Records) 구조
  - ADR-001: 시스템 아키텍처 결정
  - ADR-002: 배치 시스템 설계
  - ADR-003: 차트 라이브러리 선정
- 변경 관리 체계 (CHANGELOG.md)

### Changed
- WBS 전면 개편: 6개 Phase로 재구성
- 시스템을 사용자/관리자/배치로 구분

### Documentation
- 프로젝트 개요 문서 (PROJECT_OVERVIEW.md)
- 개발 표준 문서 (DEVELOPMENT_STANDARDS.md)
- 서버 설정 가이드 (SERVER_CONFIGURATION.md)

---

## [0.1.0] - 2025-02-06

### Added
- 프로젝트 초기 설정
- Spring Boot Backend (api/)
  - 시험 관리 API (CRUD)
  - 과목 관리 기능
  - 정답 관리 기능
  - Excel 가져오기 기능
- React Frontend (web/)
  - 시험 목록 페이지
  - 시험 등록/수정 페이지
  - 정답 입력 페이지
  - Excel 가져오기 페이지
- Docker Compose 설정 (PostgreSQL)
- 자동화 스크립트 (start, stop, status)
- VS Code 설정

### Infrastructure
- Git 저장소 초기화
- GitHub 저장소 연결 (bluevlad/hopenvision)

---

## 버전 규칙

- **MAJOR**: 호환되지 않는 API 변경
- **MINOR**: 하위 호환성 있는 기능 추가
- **PATCH**: 하위 호환성 있는 버그 수정

## 변경 유형

- `Added`: 새로운 기능
- `Changed`: 기존 기능 변경
- `Deprecated`: 곧 제거될 기능
- `Removed`: 제거된 기능
- `Fixed`: 버그 수정
- `Security`: 보안 관련 변경
- `Documentation`: 문서 변경
- `Infrastructure`: 인프라 변경
