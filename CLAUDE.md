# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Autonomous QA Agent는 여러 웹 프로젝트의 QA 테스트를 통합 관리하는 허브입니다. Playwright 기반 E2E/API 테스트 자동화와 GitHub Issues 연동을 제공합니다.

## Project Structure

```
Autonomous-QA-Agent/
├── playwright.config.ts    # 통합 Playwright 설정 (9개 프로젝트)
├── package.json            # 공통 의존성 및 스크립트
├── .env.example            # 환경변수 템플릿 (Slack Webhook 등)
├── shared/                 # 공통 유틸리티
│   ├── utils/
│   │   ├── issue-creator.ts    # GitHub 이슈 생성
│   │   └── test-helpers.ts     # 테스트 헬퍼 함수
│   ├── fixtures/
│   └── reporters/
│       └── slack-layout.ts     # Slack 리포트 커스텀 레이아웃
├── scheduler/              # QA 자동 점검 스케줄러
│   ├── index.ts            # 엔트리포인트 (cron/즉시 실행)
│   ├── types.ts            # 공통 타입 정의
│   ├── config.ts           # 9개 프로젝트 Health Check URL 매핑
│   ├── health-checker.ts   # Health Check 모듈 (fetch + AbortController)
│   ├── test-runner.ts      # Playwright 실행 모듈 (child_process.spawn)
│   ├── slack-notifier.ts   # 스케줄러 전용 Slack Block Kit 알림
│   ├── logger.ts           # JSON 로그 저장/조회/정리
│   └── logs/               # 실행 로그 (gitignore)
├── projects/               # 테스트 대상 프로젝트들 (9개)
│   ├── hopenvision/        # 공무원 시험 채점 시스템
│   ├── TeacherHub/         # 강사 평판 분석 시스템
│   ├── AllergyInsight/     # 알러지 논문 검색 시스템
│   ├── StandUp/            # 업무보고 관리 자동화 Agent
│   ├── HealthPulse/        # 헬스케어 뉴스레터 서비스
│   ├── AllergyNewsLetter/  # 알러지 뉴스 브리핑 서비스
│   ├── AcademyInsight/     # 학원 온라인 평판 모니터링
│   ├── NewsLetterPlatform/ # 멀티테넌트 뉴스레터 플랫폼
│   └── unmong-main/        # 운몽시스템즈 통합 포털
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
npm run test:standup            # StandUp만 테스트
npm run test:ui                 # UI 모드로 테스트
npm run test:headed             # 브라우저 표시하며 테스트
npm run test:report             # 테스트 리포트 보기
```

### 스케줄러 (자동 점검)
```bash
npm run scheduler:start     # cron 모드 (매일 22:00 KST 자동 실행, 프로세스 상주)
npm run scheduler:run       # 즉시 1회 실행 후 종료
```

동작 흐름: Health Check (9개 병렬) → Playwright 테스트 (healthy만 순차) → 로그 저장 → Slack 알림 → 오래된 로그 정리

환경변수 (`.env`):
- `SCHEDULER_CRON`: cron 표현식 (기본: `0 22 * * *`)
- `HEALTH_CHECK_TIMEOUT`: Health Check 타임아웃 ms (기본: `10000`)
- `TEST_TIMEOUT`: 테스트 타임아웃 ms (기본: `300000`)
- `SCHEDULER_LOG_DIR`: 로그 디렉토리 (기본: `./scheduler/logs`)

### Slack 알림 (환경변수 설정 시 자동 활성화)
```bash
cp .env.example .env            # 환경변수 파일 생성
# .env에서 SLACK_WEBHOOK_URL 설정 후 테스트 실행하면 Slack 알림 전송
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
- **보안 테스트**: 보안 취약점 검증 (`security.spec.ts`)
- **버그 검증 테스트**: `[BUG]` 태그로 버그 재현 테스트

### 4. Slack 연동
- `playwright-slack-report` 패키지로 테스트 결과 Slack 자동 알림
- `.env`에 `SLACK_WEBHOOK_URL` 설정 시 활성화 (미설정 시 비활성화)
- 커스텀 레이아웃: `shared/reporters/slack-layout.ts`
- 프로젝트별 통과/실패 요약 + 실패 상세 스레드 표시

### 5. 자동 점검 스케줄러
- `scheduler/index.ts`가 node-cron으로 매일 22:00 KST에 자동 실행
- Health Check로 서비스 상태 확인 → 살아있는 프로젝트만 Playwright 테스트
- 스케줄러 실행 시 `SCHEDULER_MODE=true`로 Playwright Slack reporter 비활성화 (이중 알림 방지)
- 스케줄러 전용 Slack 알림: 서비스 상태 + 테스트 요약 + 응답시간
- 실행 로그: `scheduler/logs/run-YYYYMMDD-HHmmss.json` (30일 보관)

## Current Projects

| 프로젝트 | 설명 | URL | GitHub |
|----------|------|-----|--------|
| hopenvision | 공무원 시험 채점 시스템 | http://localhost:4060 | bluevlad/hopenvision |
| TeacherHub | 강사 평판 분석 시스템 | http://localhost:4010 | bluevlad/TeacherHub |
| HealthPulse | 헬스케어 뉴스레터 서비스 | http://localhost:4030 | bluevlad/HealthPulse |
| AllergyInsight | 알러지 논문 검색 시스템 | http://localhost:4040 | bluevlad/AllergyInsight |
| AllergyNewsLetter | 알러지 뉴스 브리핑 서비스 | http://localhost:4050 | bluevlad/AllergyNewsLetter |
| AcademyInsight | 학원 온라인 평판 모니터링 | http://localhost:4020 | bluevlad/AcademyInsight |
| NewsLetterPlatform | 멀티테넌트 뉴스레터 플랫폼 | http://localhost:4055 | bluevlad/NewsLetterPlatform |
| unmong-main | 운몽시스템즈 통합 포털 | http://localhost:80 | bluevlad/unmong-main |
| StandUp | 업무보고 관리 자동화 Agent | http://localhost:9060 | bluevlad/StandUp |

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

## Private 문서 참조 (Claude-Opus-bluevlad)

전략/계획/이슈/서버설정 등 민감 문서는 Private 저장소에서 관리합니다.

| 문서 | 경로 (Claude-Opus-bluevlad) |
|------|---------------------------|
| 프로젝트 개요 | `docs/Autonomous-QA-Agent/PROJECT_OVERVIEW.md` |
| Agent 분리 계획 | `docs/Autonomous-QA-Agent/AGENT_SEPARATION_PLAN.md` |
| 테스트 허브 구축 가이드 | `docs/Autonomous-QA-Agent/SETUP_GUIDE.md` |
| 테스트 결과 리포트 | `docs/Autonomous-QA-Agent/TEST_RESULTS.md` |
| 프로젝트별 이슈 기록 | `docs/Autonomous-QA-Agent/issues/[프로젝트명]-ISSUES.md` |
| QA 점검 보고서 | `docs/QA_REVIEW_2026-02.md` |
| 개선 로드맵 | `docs/IMPROVEMENT_ROADMAP.md` |
