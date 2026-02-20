# Autonomous QA Agent

자율적인 QA(Quality Assurance) 테스트 관리 시스템입니다. 여러 웹 프로젝트의 테스트를 중앙에서 관리하고, 발견된 이슈를 각 프로젝트의 GitHub Issues에 자동으로 등록합니다.

## 개요

이 저장소는 다양한 웹 애플리케이션의 QA 테스트를 통합 관리하기 위한 허브 역할을 합니다.

### 주요 기능

- **통합 테스트 관리**: 여러 프로젝트의 E2E/API 테스트를 한 곳에서 관리
- **자동화된 테스트**: Playwright 기반 E2E 테스트 자동화
- **이슈 자동 등록**: 발견된 버그/개선사항을 해당 프로젝트의 GitHub Issues에 자동 등록
- **테스트 리포트**: 프로젝트별 테스트 결과 리포트 생성

## 프로젝트 구조

```
Autonomous-QA-Agent/
├── README.md                    # 이 문서
├── CLAUDE.md                    # Claude Code 가이드
├── package.json                 # 공통 의존성
├── playwright.config.base.ts    # 공통 Playwright 설정
├── shared/                      # 공통 유틸리티
│   ├── utils/                   # 테스트 유틸리티
│   ├── fixtures/                # 테스트 픽스처
│   └── reporters/               # 커스텀 리포터
├── projects/                    # 테스트 대상 프로젝트들
│   ├── hopenvision/             # HopenVision 테스트
│   │   ├── README.md
│   │   ├── config.ts
│   │   ├── e2e/
│   │   └── issues/
│   └── [project-name]/          # 다른 프로젝트들
└── docs/                        # 문서
    ├── TESTING_GUIDE.md
    ├── ADDING_PROJECT.md
    └── ISSUE_WORKFLOW.md
```

## 테스트 대상 프로젝트

| 프로젝트 | 설명 | 테스트 URL | GitHub |
|----------|------|------------|--------|
| [hopenvision](./projects/hopenvision/) | 공무원 시험 채점 시스템 | http://localhost:4060 | [bluevlad/hopenvision](https://github.com/bluevlad/hopenvision) |

## 시작하기

### 사전 요구사항

- Node.js 20+
- Git
- GitHub CLI (`gh`)

### 설치

```bash
# 저장소 클론
git clone https://github.com/bluevlad/Autonomous-QA-Agent.git
cd Autonomous-QA-Agent

# 의존성 설치
npm install

# Playwright 브라우저 설치
npx playwright install
```

### 테스트 실행

```bash
# 전체 프로젝트 테스트
npm run test:all

# 특정 프로젝트 테스트
npm run test:hopenvision

# UI 모드로 테스트
npm run test:ui
```

## 새 프로젝트 추가

1. `projects/` 폴더에 새 프로젝트 폴더 생성
2. `config.ts` 파일에 프로젝트 설정 작성
3. `e2e/` 폴더에 테스트 파일 작성
4. 이 README의 프로젝트 목록에 추가

자세한 내용은 [ADDING_PROJECT.md](./docs/ADDING_PROJECT.md)를 참조하세요.

## 이슈 워크플로우

1. **테스트 실행**: 자동화된 테스트 또는 수동 탐색적 테스트
2. **이슈 발견**: 버그 또는 개선사항 발견
3. **GitHub 등록**: `gh` CLI를 통해 해당 프로젝트의 GitHub Issues에 등록
4. **추적**: 이슈 번호와 함께 테스트 케이스 업데이트

> 이슈 기록 상세는 Private 저장소(Claude-Opus-bluevlad)에서 관리됩니다.

## 라이선스

MIT License
