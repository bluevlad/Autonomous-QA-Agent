# HopenVision 구현 방안 제안서

## 1. 시스템 구분

### 1.1 사용자 시스템 (User)
| 기능 | 설명 |
|------|------|
| 답안 입력 | 자신의 답안지 입력 또는 Excel/OMR 업로드 |
| 즉시 채점 | 입력 즉시 채점 결과 확인 |
| 성적 비교 | 다른 응시자들과 점수 비교 |
| 등수 확인 | 전체/지역별/유형별 본인 등수 |
| 분포도 확인 | 점수 분포 내 자신의 위치 시각화 |

### 1.2 관리자 시스템 (Admin)
| 기능 | 설명 |
|------|------|
| 시험 관리 | 시험 정보 등록/수정/삭제 |
| 정답 관리 | 정답지 등록 (Excel 업로드) |
| 응시자 관리 | 응시자 정보 조회/관리 |
| 통계 대시보드 | 전체 채점 결과 통계 시각화 |
| 배치 관리 | 통계 배치 작업 실행/모니터링 |

### 1.3 배치 시스템 (Batch)
| 기능 | 설명 |
|------|------|
| 통계 집계 | 전체 응시자 합계/평균 산출 |
| 순위 계산 | 전체/지역별/유형별 순위 계산 |
| 분포도 생성 | 점수대별 분포 데이터 생성 |
| 합격 판정 | 합격선 기준 합격 여부 판정 |

---

## 2. 시스템 아키텍처

### 2.1 전체 구조

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                         │
├────────────────────────────┬────────────────────────────────────┤
│      사용자 웹 (User)       │        관리자 웹 (Admin)            │
│     hopenvision.com        │    admin.hopenvision.com           │
│         :4050              │           :4051                    │
└────────────────────────────┴────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API Gateway (Nginx)                          │
│                        :80 / :443                                │
└─────────────────────────────┬───────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  User API     │    │  Admin API    │    │  Batch API    │
│    :9050      │    │    :9051      │    │    :9052      │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             ▼
                    ┌───────────────┐
                    │  PostgreSQL   │
                    │     :5432     │
                    └───────────────┘
```

### 2.2 간소화 구조 (권장 - Phase 1)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                         │
├────────────────────────────┬────────────────────────────────────┤
│      사용자 웹 (User)       │        관리자 웹 (Admin)            │
│       /user/*              │          /admin/*                  │
│         :4050              │           :4050                    │
└────────────────────────────┴────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Spring Boot API (통합)                              │
│                        :9050                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ User API    │  │ Admin API   │  │ Batch Job   │              │
│  │ /api/user/* │  │ /api/admin/*│  │ @Scheduled  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
                    ┌───────────────┐
                    │  PostgreSQL   │
                    │     :5432     │
                    └───────────────┘
```

---

## 3. 데이터 흐름 설계

### 3.1 사용자 채점 흐름

```
[사용자 답안 입력]
        │
        ▼
┌───────────────────┐
│ 1. 답안 임시 저장  │ ──→ USER_ANSWER (개인 답안)
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ 2. 즉시 채점      │ ──→ 정답과 비교 (메모리 내 처리)
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ 3. 채점 결과 저장  │ ──→ USER_SCORE (개인 점수)
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ 4. 임시 순위 표시  │ ──→ 현재 집계된 통계 기준 (배치 결과)
└───────────────────┘
```

### 3.2 배치 처리 흐름

```
[배치 스케줄러] (매 10분 / 매시간)
        │
        ▼
┌───────────────────┐
│ 1. 신규 채점 조회  │ ──→ USER_SCORE (BATCH_YN = 'N')
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ 2. 통계 집계      │ ──→ 합계, 평균, 최고점, 최저점
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ 3. 순위 계산      │ ──→ 전체/지역별/유형별 순위
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ 4. 분포도 생성    │ ──→ 점수대별 인원수
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ 5. 통계 테이블 갱신│ ──→ EXAM_STAT, USER_SCORE.RANKING 갱신
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ 6. 배치 완료 표시  │ ──→ USER_SCORE.BATCH_YN = 'Y'
└───────────────────┘
```

---

## 4. 추가 테이블 설계

### 4.1 사용자 답안 테이블 (USER_ANSWER)

```sql
CREATE TABLE USER_ANSWER (
    USER_ID         VARCHAR(50)     NOT NULL,   -- 사용자 ID
    EXAM_CD         VARCHAR(50)     NOT NULL,   -- 시험코드
    SUBJECT_CD      VARCHAR(50)     NOT NULL,   -- 과목코드
    QUESTION_NO     INTEGER         NOT NULL,   -- 문항번호
    USER_ANS        VARCHAR(100),               -- 사용자 답안
    IS_CORRECT      CHAR(1),                    -- 정답여부 (Y/N)
    REG_DT          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (USER_ID, EXAM_CD, SUBJECT_CD, QUESTION_NO)
);
```

### 4.2 사용자 점수 테이블 (USER_SCORE)

```sql
CREATE TABLE USER_SCORE (
    USER_ID         VARCHAR(50)     NOT NULL,   -- 사용자 ID
    EXAM_CD         VARCHAR(50)     NOT NULL,   -- 시험코드
    SUBJECT_CD      VARCHAR(50)     NOT NULL,   -- 과목코드
    RAW_SCORE       DECIMAL(5,2),               -- 원점수
    CORRECT_CNT     INTEGER,                    -- 정답 개수
    WRONG_CNT       INTEGER,                    -- 오답 개수
    RANKING         INTEGER,                    -- 순위 (배치 계산)
    PERCENTILE      DECIMAL(5,2),               -- 상위 % (배치 계산)
    BATCH_YN        CHAR(1)         DEFAULT 'N',-- 배치 처리 여부
    REG_DT          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    UPD_DT          TIMESTAMP,
    PRIMARY KEY (USER_ID, EXAM_CD, SUBJECT_CD)
);
```

### 4.3 사용자 총점 테이블 (USER_TOTAL_SCORE)

```sql
CREATE TABLE USER_TOTAL_SCORE (
    USER_ID         VARCHAR(50)     NOT NULL,   -- 사용자 ID
    EXAM_CD         VARCHAR(50)     NOT NULL,   -- 시험코드
    TOTAL_SCORE     DECIMAL(5,2),               -- 총점
    AVG_SCORE       DECIMAL(5,2),               -- 평균점수
    TOTAL_RANKING   INTEGER,                    -- 전체 순위
    AREA_RANKING    INTEGER,                    -- 지역별 순위
    TYPE_RANKING    INTEGER,                    -- 유형별 순위
    PERCENTILE      DECIMAL(5,2),               -- 상위 %
    PASS_YN         CHAR(1),                    -- 합격여부
    CUT_FAIL_YN     CHAR(1)         DEFAULT 'N',-- 과락여부
    BATCH_YN        CHAR(1)         DEFAULT 'N',
    REG_DT          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    UPD_DT          TIMESTAMP,
    PRIMARY KEY (USER_ID, EXAM_CD)
);
```

### 4.4 점수 분포 테이블 (EXAM_SCORE_DIST)

```sql
CREATE TABLE EXAM_SCORE_DIST (
    EXAM_CD         VARCHAR(50)     NOT NULL,   -- 시험코드
    SUBJECT_CD      VARCHAR(50)     NOT NULL,   -- 과목코드 ('ALL' = 전체)
    SCORE_RANGE     VARCHAR(20)     NOT NULL,   -- 점수대 (0-10, 10-20, ...)
    USER_CNT        INTEGER         DEFAULT 0,  -- 해당 점수대 인원
    PERCENTAGE      DECIMAL(5,2),               -- 비율 (%)
    BATCH_DT        TIMESTAMP,                  -- 배치 처리 일시
    PRIMARY KEY (EXAM_CD, SUBJECT_CD, SCORE_RANGE)
);
```

### 4.5 배치 작업 이력 테이블 (BATCH_JOB_HISTORY)

```sql
CREATE TABLE BATCH_JOB_HISTORY (
    JOB_ID          BIGSERIAL       PRIMARY KEY,
    JOB_NAME        VARCHAR(100)    NOT NULL,   -- 작업명
    EXAM_CD         VARCHAR(50),                -- 대상 시험코드
    STATUS          VARCHAR(20)     NOT NULL,   -- RUNNING, COMPLETED, FAILED
    PROCESSED_CNT   INTEGER         DEFAULT 0,  -- 처리 건수
    START_DT        TIMESTAMP       NOT NULL,
    END_DT          TIMESTAMP,
    ERROR_MSG       TEXT,
    CREATED_BY      VARCHAR(50)
);
```

---

## 5. API 설계

### 5.1 사용자 API (/api/user)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /exams | 채점 가능한 시험 목록 |
| GET | /exams/{examCd} | 시험 상세 (과목, 문항수) |
| POST | /exams/{examCd}/answers | 답안 제출 및 즉시 채점 |
| GET | /exams/{examCd}/result | 내 채점 결과 조회 |
| GET | /exams/{examCd}/ranking | 내 순위 및 분포도 |
| GET | /exams/{examCd}/compare | 다른 응시자와 비교 |
| GET | /my/history | 내 채점 이력 |

### 5.2 관리자 API (/api/admin)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /exams | 시험 목록 (관리자용) |
| POST | /exams | 시험 등록 |
| PUT | /exams/{examCd} | 시험 수정 |
| DELETE | /exams/{examCd} | 시험 삭제 |
| POST | /exams/{examCd}/answers | 정답 등록 |
| GET | /exams/{examCd}/statistics | 시험 통계 |
| GET | /exams/{examCd}/users | 응시자 목록 |
| GET | /dashboard | 대시보드 데이터 |
| POST | /batch/statistics | 통계 배치 수동 실행 |
| GET | /batch/history | 배치 이력 조회 |

---

## 6. 차트/그래프 라이브러리

### 6.1 권장 라이브러리

| 라이브러리 | 특징 | 적합한 용도 |
|-----------|------|------------|
| **Recharts** | React 친화적, 가볍고 커스터마이징 용이 | 점수 분포, 순위 차트 |
| **Chart.js** | 다양한 차트 타입, 널리 사용 | 파이 차트, 바 차트 |
| **ECharts** | 고성능, 복잡한 시각화 | 대시보드 전체 |
| **Ant Design Charts** | Ant Design과 통합, 간편 사용 | 빠른 개발 |

### 6.2 권장: Ant Design Charts (추천)

```bash
npm install @ant-design/charts
```

**장점:**
- Ant Design과 디자인 통일
- 간단한 사용법
- 다양한 차트 타입 제공
- 무료 오픈소스

### 6.3 차트 적용 예시

```tsx
import { Column, Pie, Line } from '@ant-design/charts';

// 점수 분포 막대 차트
const ScoreDistributionChart = ({ data }) => {
  const config = {
    data,
    xField: 'scoreRange',
    yField: 'count',
    label: { position: 'top' },
    color: '#1890ff',
  };
  return <Column {...config} />;
};

// 과목별 점수 파이 차트
const SubjectScoreChart = ({ data }) => {
  const config = {
    data,
    angleField: 'score',
    colorField: 'subject',
    radius: 0.8,
    label: { type: 'outer' },
  };
  return <Pie {...config} />;
};

// 순위 추이 라인 차트
const RankingTrendChart = ({ data }) => {
  const config = {
    data,
    xField: 'date',
    yField: 'ranking',
    smooth: true,
    point: { size: 3 },
  };
  return <Line {...config} />;
};
```

---

## 7. 배치 시스템 설계

### 7.1 Spring Batch + Scheduler

```java
@Configuration
@EnableScheduling
public class BatchConfig {

    // 10분마다 통계 갱신
    @Scheduled(fixedRate = 600000)
    public void updateStatistics() {
        // 신규 채점 결과 집계
    }

    // 매시간 순위 재계산
    @Scheduled(cron = "0 0 * * * *")
    public void calculateRanking() {
        // 전체 순위 재계산
    }

    // 매일 새벽 3시 전체 통계 재생성
    @Scheduled(cron = "0 0 3 * * *")
    public void regenerateAllStatistics() {
        // 전체 통계 재생성
    }
}
```

### 7.2 배치 처리 단계

```
[Step 1] 신규 채점 조회
    └── SELECT * FROM USER_SCORE WHERE BATCH_YN = 'N'

[Step 2] 과목별 통계 집계
    └── 합계, 평균, 최고점, 최저점, 표준편차

[Step 3] 순위 계산
    └── RANK() OVER (ORDER BY TOTAL_SCORE DESC)

[Step 4] 분포도 갱신
    └── GROUP BY 점수대

[Step 5] 상위 % 계산
    └── PERCENT_RANK() OVER (ORDER BY TOTAL_SCORE DESC)

[Step 6] 배치 완료 처리
    └── UPDATE USER_SCORE SET BATCH_YN = 'Y'
```

---

## 8. 추가 구현 제안

### 8.1 사용자 경험 개선

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| **OMR 카드 UI** | 실제 시험지처럼 답안 입력 | 높음 |
| **실시간 채점** | 답안 입력 즉시 정답/오답 표시 | 높음 |
| **오답 노트** | 틀린 문제 모아보기 | 중간 |
| **과목별 분석** | 취약 과목 분석 리포트 | 중간 |
| **목표 점수 설정** | 목표 달성률 표시 | 낮음 |

### 8.2 관리자 기능 개선

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| **실시간 대시보드** | 현재 응시자 수, 채점 현황 | 높음 |
| **시험별 리포트** | PDF/Excel 다운로드 | 높음 |
| **이상 탐지** | 비정상 채점 패턴 감지 | 중간 |
| **공지사항 관리** | 시험 관련 공지 | 낮음 |

### 8.3 시스템 기능

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| **회원 가입/로그인** | JWT 인증 | 높음 |
| **소셜 로그인** | 카카오, 네이버, 구글 | 중간 |
| **알림 시스템** | 채점 완료, 순위 변동 알림 | 중간 |
| **캐싱** | Redis 캐싱으로 성능 향상 | 중간 |
| **API Rate Limiting** | 과도한 요청 제한 | 낮음 |

### 8.4 데이터 분석

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| **예상 합격선** | 이전 데이터 기반 예측 | 중간 |
| **난이도 분석** | 문항별 정답률 기반 | 중간 |
| **트렌드 분석** | 연도별 점수 추이 | 낮음 |

---

## 9. 포트 할당 (수정)

| 서비스 | 포트 | 설명 |
|--------|------|------|
| hopenvision-user-web | 4050 | 사용자 웹 |
| hopenvision-admin-web | 4051 | 관리자 웹 |
| hopenvision-api | 9050 | 통합 API |
| hopenvision-db | 5432 | PostgreSQL |

---

## 10. 개발 단계 제안

### Phase 1: 핵심 기능 (MVP)
1. 관리자: 시험/정답 등록
2. 사용자: 답안 입력 및 즉시 채점
3. 사용자: 기본 점수 확인

### Phase 2: 통계 및 비교
1. 배치 시스템 구현
2. 순위 계산 및 표시
3. 점수 분포 차트

### Phase 3: 고도화
1. 회원 시스템
2. 실시간 대시보드
3. 리포트 다운로드
4. 알림 시스템

---

## 변경 이력

| 버전 | 일자 | 변경 내용 |
|------|------|----------|
| 1.0 | 2025-02-06 | 초안 작성 |
