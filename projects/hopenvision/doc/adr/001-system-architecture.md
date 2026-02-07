# ADR-001: 시스템 아키텍처 결정

## 상태

Accepted

## 일자

2025-02-06

## 컨텍스트

HopenVision 프로젝트는 공무원 시험 채점 시스템으로, 두 가지 유형의 사용자를 지원해야 합니다:
- **사용자**: 답안 입력, 채점, 순위 확인
- **관리자**: 시험/정답 관리, 통계 확인

또한 대량의 사용자 채점 시 DB 부하를 줄이기 위한 방안이 필요합니다.

## 결정

**간소화된 통합 아키텍처**를 선택합니다.

```
[Frontend - React]     [Backend - Spring Boot]     [Database]
    :4050         →         :9050            →     PostgreSQL
  /user/*                 /api/user/*
  /admin/*                /api/admin/*
                          @Scheduled (배치)
```

**결정 사항:**
1. Frontend: 단일 React 앱에서 라우팅으로 사용자/관리자 분리
2. Backend: 단일 Spring Boot 앱에서 패키지로 user/admin 분리
3. 배치: Spring Scheduler를 사용한 내장 배치 처리

## 고려한 대안

### 옵션 1: 완전 분리 아키텍처
- Frontend 2개 (사용자용, 관리자용)
- Backend 3개 (User API, Admin API, Batch)
- 장점: 독립적 배포, 확장성
- 단점: 복잡성 증가, 관리 부담

### 옵션 2: 간소화된 통합 아키텍처 (선택)
- Frontend 1개 (라우팅 분리)
- Backend 1개 (패키지 분리 + 내장 배치)
- 장점: 단순함, 빠른 개발, 쉬운 유지보수
- 단점: 대규모 확장 시 분리 필요

## 결과

**긍정적 결과:**
- 개발 속도 향상
- 배포 및 운영 단순화
- 코드 공유 용이

**부정적 결과/트레이드오프:**
- 대규모 트래픽 시 분리 필요 (Phase 3 이후 검토)
- 배치 작업이 API 서버에 영향 가능 (별도 인스턴스로 분리 가능)

## 관련 문서

- [IMPLEMENTATION_PROPOSAL.md](../IMPLEMENTATION_PROPOSAL.md)
- [ADR-002: 배치 시스템 설계](002-batch-system-design.md)
