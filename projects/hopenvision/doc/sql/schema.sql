-- ============================================
-- 공무원 시험 채점 시스템 DB 스키마
-- Oracle Database
-- ============================================

-- 1. 시험 마스터 테이블
CREATE TABLE EXAM_MST (
    EXAM_CD         VARCHAR2(50) PRIMARY KEY,       -- 시험코드 (예: 2024_9LEVEL_1)
    EXAM_NM         VARCHAR2(200) NOT NULL,         -- 시험명
    EXAM_TYPE       VARCHAR2(20),                   -- 시험유형 (9급/7급/경찰 등)
    EXAM_YEAR       VARCHAR2(4),                    -- 시험년도
    EXAM_ROUND      NUMBER(2),                      -- 시험회차
    EXAM_DATE       DATE,                           -- 시험일자
    TOTAL_SCORE     NUMBER(5,2) DEFAULT 100,        -- 총점 기준
    PASS_SCORE      NUMBER(5,2),                    -- 합격 기준 점수
    IS_USE          CHAR(1) DEFAULT 'Y',            -- 사용여부
    REG_DT          DATE DEFAULT SYSDATE,           -- 등록일시
    UPD_DT          DATE                            -- 수정일시
);

COMMENT ON TABLE EXAM_MST IS '시험 마스터';
COMMENT ON COLUMN EXAM_MST.EXAM_CD IS '시험코드';
COMMENT ON COLUMN EXAM_MST.EXAM_NM IS '시험명';
COMMENT ON COLUMN EXAM_MST.PASS_SCORE IS '합격 기준 총점';

-- 2. 과목 테이블
CREATE TABLE EXAM_SUBJECT (
    EXAM_CD         VARCHAR2(50) NOT NULL,          -- 시험코드
    SUBJECT_CD      VARCHAR2(20) NOT NULL,          -- 과목코드
    SUBJECT_NM      VARCHAR2(100) NOT NULL,         -- 과목명
    SUBJECT_TYPE    CHAR(1) DEFAULT 'M',            -- 과목유형 (M:필수, S:선택)
    QUESTION_CNT    NUMBER(3) DEFAULT 20,           -- 문항수
    SCORE_PER_Q     NUMBER(5,2) DEFAULT 5,          -- 문항당 배점
    QUESTION_TYPE   VARCHAR2(20) DEFAULT 'CHOICE',  -- 문제유형 (CHOICE:객관식, ESSAY:주관식, MIX:혼합)
    CUT_LINE        NUMBER(5,2) DEFAULT 40,         -- 과목별 커트라인 (과락 기준)
    SORT_ORDER      NUMBER(3) DEFAULT 1,            -- 정렬순서
    IS_USE          CHAR(1) DEFAULT 'Y',            -- 사용여부
    REG_DT          DATE DEFAULT SYSDATE,
    CONSTRAINT PK_EXAM_SUBJECT PRIMARY KEY (EXAM_CD, SUBJECT_CD),
    CONSTRAINT FK_EXAM_SUBJECT_MST FOREIGN KEY (EXAM_CD) REFERENCES EXAM_MST(EXAM_CD)
);

COMMENT ON TABLE EXAM_SUBJECT IS '과목 정보';
COMMENT ON COLUMN EXAM_SUBJECT.SUBJECT_TYPE IS '과목유형 (M:필수, S:선택)';
COMMENT ON COLUMN EXAM_SUBJECT.QUESTION_TYPE IS '문제유형 (CHOICE:객관식, ESSAY:주관식)';
COMMENT ON COLUMN EXAM_SUBJECT.CUT_LINE IS '과목별 커트라인 (과락 기준)';

-- 3. 정답 테이블 (문항별 정답)
CREATE TABLE EXAM_ANSWER_KEY (
    EXAM_CD         VARCHAR2(50) NOT NULL,          -- 시험코드
    SUBJECT_CD      VARCHAR2(20) NOT NULL,          -- 과목코드
    QUESTION_NO     NUMBER(3) NOT NULL,             -- 문항번호
    CORRECT_ANS     VARCHAR2(10) NOT NULL,          -- 정답 (객관식: 1~5, 주관식: 텍스트)
    SCORE           NUMBER(5,2) DEFAULT 5,          -- 배점
    IS_MULTI_ANS    CHAR(1) DEFAULT 'N',            -- 복수정답 여부
    REG_DT          DATE DEFAULT SYSDATE,
    UPD_DT          DATE,
    CONSTRAINT PK_EXAM_ANSWER_KEY PRIMARY KEY (EXAM_CD, SUBJECT_CD, QUESTION_NO),
    CONSTRAINT FK_EXAM_ANS_KEY_SUBJ FOREIGN KEY (EXAM_CD, SUBJECT_CD) REFERENCES EXAM_SUBJECT(EXAM_CD, SUBJECT_CD)
);

COMMENT ON TABLE EXAM_ANSWER_KEY IS '시험 정답';
COMMENT ON COLUMN EXAM_ANSWER_KEY.CORRECT_ANS IS '정답 (객관식:1~5, 주관식:텍스트)';
COMMENT ON COLUMN EXAM_ANSWER_KEY.IS_MULTI_ANS IS '복수정답 여부';

-- 4. 응시자 마스터 테이블
CREATE TABLE EXAM_APPLICANT (
    EXAM_CD         VARCHAR2(50) NOT NULL,          -- 시험코드
    APPLICANT_NO    VARCHAR2(20) NOT NULL,          -- 수험번호
    USER_ID         VARCHAR2(50),                   -- 사용자ID (회원인 경우)
    USER_NM         VARCHAR2(100),                  -- 이름
    APPLY_AREA      VARCHAR2(50),                   -- 응시지역
    APPLY_TYPE      VARCHAR2(20),                   -- 응시유형 (일반/경력 등)
    ADD_SCORE       NUMBER(5,2) DEFAULT 0,          -- 가산점
    TOTAL_SCORE     NUMBER(5,2),                    -- 총점
    AVG_SCORE       NUMBER(5,2),                    -- 평균점수
    RANKING         NUMBER(10),                     -- 순위
    PASS_YN         CHAR(1),                        -- 합격여부 (Y/N/P:예비합격)
    SCORE_STATUS    CHAR(1) DEFAULT 'N',            -- 채점상태 (N:미채점, Y:채점완료)
    REG_DT          DATE DEFAULT SYSDATE,
    UPD_DT          DATE,
    CONSTRAINT PK_EXAM_APPLICANT PRIMARY KEY (EXAM_CD, APPLICANT_NO),
    CONSTRAINT FK_EXAM_APPLICANT_MST FOREIGN KEY (EXAM_CD) REFERENCES EXAM_MST(EXAM_CD)
);

COMMENT ON TABLE EXAM_APPLICANT IS '응시자 정보';
COMMENT ON COLUMN EXAM_APPLICANT.ADD_SCORE IS '가산점';
COMMENT ON COLUMN EXAM_APPLICANT.PASS_YN IS '합격여부 (Y:합격, N:불합격, P:예비합격)';

-- 5. 응시자 답안 테이블
CREATE TABLE EXAM_APPLICANT_ANS (
    EXAM_CD         VARCHAR2(50) NOT NULL,          -- 시험코드
    APPLICANT_NO    VARCHAR2(20) NOT NULL,          -- 수험번호
    SUBJECT_CD      VARCHAR2(20) NOT NULL,          -- 과목코드
    QUESTION_NO     NUMBER(3) NOT NULL,             -- 문항번호
    USER_ANS        VARCHAR2(10),                   -- 응시자 답안
    IS_CORRECT      CHAR(1),                        -- 정답여부 (Y/N)
    REG_DT          DATE DEFAULT SYSDATE,
    CONSTRAINT PK_EXAM_APPLICANT_ANS PRIMARY KEY (EXAM_CD, APPLICANT_NO, SUBJECT_CD, QUESTION_NO),
    CONSTRAINT FK_EXAM_APP_ANS_APP FOREIGN KEY (EXAM_CD, APPLICANT_NO) REFERENCES EXAM_APPLICANT(EXAM_CD, APPLICANT_NO)
);

COMMENT ON TABLE EXAM_APPLICANT_ANS IS '응시자 답안';
COMMENT ON COLUMN EXAM_APPLICANT_ANS.IS_CORRECT IS '정답여부';

-- 6. 응시자 과목별 성적 테이블
CREATE TABLE EXAM_APPLICANT_SCORE (
    EXAM_CD         VARCHAR2(50) NOT NULL,          -- 시험코드
    APPLICANT_NO    VARCHAR2(20) NOT NULL,          -- 수험번호
    SUBJECT_CD      VARCHAR2(20) NOT NULL,          -- 과목코드
    RAW_SCORE       NUMBER(5,2),                    -- 원점수
    ADJ_SCORE       NUMBER(5,2),                    -- 조정점수
    CORRECT_CNT     NUMBER(3),                      -- 정답개수
    WRONG_CNT       NUMBER(3),                      -- 오답개수
    SUBJECT_RANK    NUMBER(10),                     -- 과목별 순위
    CUT_PASS_YN     CHAR(1),                        -- 과락여부 (Y:통과, N:과락)
    REG_DT          DATE DEFAULT SYSDATE,
    UPD_DT          DATE,
    CONSTRAINT PK_EXAM_APP_SCORE PRIMARY KEY (EXAM_CD, APPLICANT_NO, SUBJECT_CD),
    CONSTRAINT FK_EXAM_APP_SCORE_APP FOREIGN KEY (EXAM_CD, APPLICANT_NO) REFERENCES EXAM_APPLICANT(EXAM_CD, APPLICANT_NO)
);

COMMENT ON TABLE EXAM_APPLICANT_SCORE IS '응시자 과목별 성적';
COMMENT ON COLUMN EXAM_APPLICANT_SCORE.RAW_SCORE IS '원점수';
COMMENT ON COLUMN EXAM_APPLICANT_SCORE.ADJ_SCORE IS '조정점수';
COMMENT ON COLUMN EXAM_APPLICANT_SCORE.CUT_PASS_YN IS '과락여부 (Y:통과, N:과락)';

-- 7. 합격선 설정 테이블 (지역/유형별)
CREATE TABLE EXAM_PASS_LINE (
    EXAM_CD         VARCHAR2(50) NOT NULL,          -- 시험코드
    APPLY_AREA      VARCHAR2(50) NOT NULL,          -- 응시지역
    APPLY_TYPE      VARCHAR2(20) NOT NULL,          -- 응시유형
    RECRUIT_CNT     NUMBER(5),                      -- 모집인원
    PASS_LINE       NUMBER(5,2),                    -- 합격선 (커트라인)
    CUT_LINE_MUST   NUMBER(5,2) DEFAULT 40,         -- 필수과목 과락 기준
    CUT_LINE_SEL    NUMBER(5,2) DEFAULT 40,         -- 선택과목 과락 기준
    PASS_RANKING    NUMBER(5),                      -- 합격 순위 기준
    IS_USE          CHAR(1) DEFAULT 'Y',
    REG_DT          DATE DEFAULT SYSDATE,
    UPD_DT          DATE,
    CONSTRAINT PK_EXAM_PASS_LINE PRIMARY KEY (EXAM_CD, APPLY_AREA, APPLY_TYPE),
    CONSTRAINT FK_EXAM_PASS_LINE_MST FOREIGN KEY (EXAM_CD) REFERENCES EXAM_MST(EXAM_CD)
);

COMMENT ON TABLE EXAM_PASS_LINE IS '합격선 설정';
COMMENT ON COLUMN EXAM_PASS_LINE.PASS_LINE IS '합격 커트라인';
COMMENT ON COLUMN EXAM_PASS_LINE.CUT_LINE_MUST IS '필수과목 과락 기준';
COMMENT ON COLUMN EXAM_PASS_LINE.CUT_LINE_SEL IS '선택과목 과락 기준';

-- 8. 시험 통계 테이블
CREATE TABLE EXAM_STAT (
    EXAM_CD         VARCHAR2(50) NOT NULL,          -- 시험코드
    APPLY_AREA      VARCHAR2(50),                   -- 응시지역 (NULL이면 전체)
    SUBJECT_CD      VARCHAR2(20),                   -- 과목코드 (NULL이면 전체)
    APPLICANT_CNT   NUMBER(10),                     -- 응시자수
    AVG_SCORE       NUMBER(5,2),                    -- 평균점수
    MAX_SCORE       NUMBER(5,2),                    -- 최고점
    MIN_SCORE       NUMBER(5,2),                    -- 최저점
    TOP_3_SCORE     NUMBER(5,2),                    -- 상위 3% 점수
    TOP_10_SCORE    NUMBER(5,2),                    -- 상위 10% 점수
    SCORE_1_PER     NUMBER(5,2),                    -- 0~20점 비율
    SCORE_2_PER     NUMBER(5,2),                    -- 21~40점 비율
    SCORE_3_PER     NUMBER(5,2),                    -- 41~60점 비율
    SCORE_4_PER     NUMBER(5,2),                    -- 61~80점 비율
    SCORE_5_PER     NUMBER(5,2),                    -- 81~100점 비율
    REG_DT          DATE DEFAULT SYSDATE,
    UPD_DT          DATE,
    CONSTRAINT PK_EXAM_STAT PRIMARY KEY (EXAM_CD, NVL(APPLY_AREA,'ALL'), NVL(SUBJECT_CD,'ALL'))
);

COMMENT ON TABLE EXAM_STAT IS '시험 통계';

-- ============================================
-- 인덱스 생성
-- ============================================
CREATE INDEX IDX_EXAM_APPLICANT_USER ON EXAM_APPLICANT(USER_ID);
CREATE INDEX IDX_EXAM_APPLICANT_AREA ON EXAM_APPLICANT(EXAM_CD, APPLY_AREA);
CREATE INDEX IDX_EXAM_APP_SCORE_SUBJ ON EXAM_APPLICANT_SCORE(EXAM_CD, SUBJECT_CD);

-- ============================================
-- 시퀀스 생성 (필요시)
-- ============================================
-- CREATE SEQUENCE SEQ_EXAM_CD START WITH 1 INCREMENT BY 1;
