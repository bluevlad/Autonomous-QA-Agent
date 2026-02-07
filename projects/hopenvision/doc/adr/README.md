# Architecture Decision Records (ADR)

## 개요

ADR(Architecture Decision Records)은 프로젝트에서 내린 중요한 아키텍처 결정을 기록하는 문서입니다.

## 목적

- 의사결정의 맥락과 이유를 기록
- 새로운 팀원의 빠른 온보딩
- 과거 결정의 배경 파악
- 동일한 논의의 반복 방지

## ADR 작성 시점

- 새로운 기술 스택 선정
- 아키텍처 패턴 변경
- 중요한 설계 결정
- 기존 결정의 변경

## 파일 명명 규칙

```
NNN-제목.md

예시:
001-use-react-with-typescript.md
002-database-selection-postgresql.md
003-batch-system-design.md
```

## ADR 상태

| 상태 | 설명 |
|------|------|
| **Proposed** | 제안됨 (검토 중) |
| **Accepted** | 승인됨 (적용 중) |
| **Deprecated** | 폐기됨 (더 이상 사용 안 함) |
| **Superseded** | 대체됨 (다른 ADR로 대체) |

## ADR 목록

| ID | 제목 | 상태 | 일자 |
|----|------|------|------|
| [001](001-system-architecture.md) | 시스템 아키텍처 결정 | Accepted | 2025-02-06 |
| [002](002-batch-system-design.md) | 배치 시스템 설계 | Accepted | 2025-02-06 |
| [003](003-chart-library-selection.md) | 차트 라이브러리 선정 | Accepted | 2025-02-06 |

## 템플릿

새 ADR 작성 시 [000-template.md](000-template.md) 파일을 복사하여 사용하세요.
