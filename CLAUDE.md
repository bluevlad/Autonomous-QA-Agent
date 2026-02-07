# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Autonomous QA Agent는 여러 웹 프로젝트의 QA 테스트를 통합 관리하는 허브입니다. Playwright 기반 E2E/API 테스트 자동화와 GitHub Issues 연동을 제공합니다.

## Project Structure

```
Autonomous-QA-Agent/
├── playwright.config.ts    # 통합 Playwright 설정 (모든 프로젝트)
├── package.json            # 공통 의존성 및 스크립트
├── shared/                 # 공통 유틸리티
│   ├── utils/
│   │   ├── issue-creator.ts    # GitHub 이슈 생성
│   │   └── test-helpers.ts     # 테스트 헬퍼 함수
│   ├── fixtures/
│   └── reporters/
├── projects/               # 테스트 대상 프로젝트들
│   └── hopenvision/        # HopenVision 프로젝트
│       ├── config.ts       # 프로젝트 설정
│       ├── e2e/            # E2E 테스트 파일들
│       └── issues/         # 발견된 이슈 기록
└── docs/                   # 문서
    ├── TESTING_GUIDE.md
    ├── ADDING_PROJECT.md
    └── ISSUE_WORKFLOW.md
```

## Commands

### 테스트 실행
```bash
npm install                     # 의존성 설치
npx playwright install          # 브라우저 설치
npm run test:all                # 전체 테스트
npm run test:hopenvision        # hopenvision만 테스트
npm run test:ui                 # UI 모드로 테스트
npm run test:headed             # 브라우저 표시하며 테스트
npm run test:report             # 테스트 리포트 보기
```

### GitHub 이슈 등록
```bash
gh issue create --repo bluevlad/hopenvision --title "[Bug] 제목" --body "내용"
```

## Key Concepts

### 1. 멀티 프로젝트 테스트
- `playwright.config.ts`에서 모든 프로젝트 설정 관리
- 각 프로젝트는 `projects/[name]/` 폴더에 독립적으로 구성
- 프로젝트별 baseURL, apiUrl 설정

### 2. 이슈 워크플로우
- 테스트 중 발견된 이슈는 `projects/[name]/issues/`에 기록
- GitHub CLI(`gh`)를 통해 해당 프로젝트 저장소에 이슈 등록
- 이슈 번호로 테스트 케이스 연결 (`[BUG-#123]`)

### 3. 테스트 유형
- **E2E 테스트**: 사용자 시나리오 기반 (`*.spec.ts`)
- **API 테스트**: REST API 엔드포인트 검증 (`api.spec.ts`)
- **버그 검증 테스트**: `[BUG]` 태그로 버그 재현 테스트

## Current Projects

| 프로젝트 | 설명 | URL | GitHub |
|----------|------|-----|--------|
| hopenvision | 공무원 시험 채점 시스템 | http://study.unmong.com:4060 | bluevlad/hopenvision |

## Adding New Projects

1. `projects/[name]/` 폴더 생성
2. `config.ts`, `e2e/`, `issues/` 구성
3. `playwright.config.ts`에 프로젝트 추가
4. README.md 업데이트

자세한 내용은 `docs/ADDING_PROJECT.md` 참조.

## Testing Guidelines

- 테스트 파일: `[기능].spec.ts`
- describe: 기능 영역
- test: `동작 + 기대 결과` 형식
- 버그 테스트: `[BUG]` 또는 `[BUG-#이슈번호]` 태그
- 공통 헬퍼: `shared/utils/test-helpers.ts` 활용
