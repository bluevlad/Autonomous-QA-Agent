# WBS (Work Breakdown Structure) 작성 가이드

## 개요

WBS는 프로젝트의 기능 요구사항과 테스트 파일 간의 매핑을 정의합니다. QA Agent가 테스트 실패 시 영향받는 기능을 자동으로 식별하여 GitHub Issues에 표시합니다.

## 파일 위치

각 프로젝트의 루트에 `wbs.yml` 파일을 생성합니다.

```
projects/
├── hopenvision/
│   ├── wbs.yml          ← 여기
│   ├── config.ts
│   └── e2e/
├── AllergyInsight/
│   ├── wbs.yml          ← 여기
│   └── ...
```

## YAML 형식

```yaml
project: hopenvision          # 프로젝트명 (playwright 프로젝트명과 일치)
version: "1.0"                # WBS 버전 (선택)
features:
  - id: HV-EXAM-001           # 고유 식별자 (프로젝트 접두사-기능그룹-번호)
    name: 시험 목록 조회        # 기능명
    owner: bluevlad            # 담당자 (선택)
    testFiles:                 # 관련 테스트 파일 경로 (e2e/ 기준 상대경로)
      - e2e/exam-list.spec.ts
      - e2e/api.spec.ts
    testCases:                 # 개별 테스트 케이스명 (선택, 미구현)
      - 시험 목록 페이지가 정상적으로 로드되어야 함
```

## ID 명명 규칙

| 프로젝트 | 접두사 | 예시 |
|----------|--------|------|
| hopenvision | HV | HV-EXAM-001, HV-SEC-001 |
| AllergyInsight | AI | AI-MAIN-001, AI-API-001 |
| EduFit | EF | EF-CORE-001 |
| NewsLetterPlatform | NL | NL-MAIN-001, NL-API-001 |
| unmong-main | UM | UM-MAIN-001, UM-SEC-001 |
| StandUp | SU | SU-HEALTH-001, SU-API-001 |

## 기능 그룹 접미사

| 그룹 | 설명 | 예시 |
|------|------|------|
| MAIN | 메인 UI/페이지 | HV-MAIN-001 |
| EXAM | 시험 관련 | HV-EXAM-001 |
| API | API 엔드포인트 | AI-API-001 |
| SEC | 보안 | HV-SEC-001 |
| HEALTH | 헬스체크 | SU-HEALTH-001 |
| CORE | 핵심 기능 | EF-CORE-001 |

## 매핑 동작

1. 테스트 실패 시 `FailureDetail.filePath`에서 파일 경로 추출
2. WBS의 `testFiles`와 매칭하여 영향받는 기능 식별
3. GitHub 이슈 본문에 "영향받는 기능 (WBS)" 섹션으로 표시

예시 출력:
```markdown
### 영향받는 기능 (WBS)

- **HV-EXAM-001** 시험 목록 조회 (담당: bluevlad)
- **HV-SEC-001** 보안 방어 (담당: bluevlad)
```

## 새 프로젝트 추가 시

1. `projects/[name]/wbs.yml` 파일 생성
2. `scheduler/wbs-parser.ts`의 `projectDirMap`에 디렉토리명 매핑 추가
3. 기능별 테스트 파일 매핑 작성

## 주의사항

- `testFiles` 경로는 프로젝트 폴더 내 상대경로 (`e2e/xxx.spec.ts`)
- 하나의 테스트 파일이 여러 기능에 매핑될 수 있음
- 테스트 파일이 없는 기능도 등록 가능 (커버리지 추적용)
