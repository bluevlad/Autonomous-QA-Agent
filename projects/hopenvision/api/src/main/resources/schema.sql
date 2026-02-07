-- ============================================
-- 공무원 시험 채점 시스템 DB 스키마
-- PostgreSQL Database
-- ============================================

-- 1. 시험 마스터 테이블
CREATE TABLE IF NOT EXISTS exam_mst (
    exam_cd         VARCHAR(50) PRIMARY KEY,
    exam_nm         VARCHAR(200) NOT NULL,
    exam_type       VARCHAR(20),
    exam_year       VARCHAR(4),
    exam_round      INTEGER,
    exam_date       DATE,
    total_score     NUMERIC(5,2) DEFAULT 100,
    pass_score      NUMERIC(5,2),
    is_use          CHAR(1) DEFAULT 'Y',
    reg_dt          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    upd_dt          TIMESTAMP
);

COMMENT ON TABLE exam_mst IS '시험 마스터';
COMMENT ON COLUMN exam_mst.exam_cd IS '시험코드';
COMMENT ON COLUMN exam_mst.exam_nm IS '시험명';
COMMENT ON COLUMN exam_mst.pass_score IS '합격 기준 총점';

-- 2. 과목 테이블
CREATE TABLE IF NOT EXISTS exam_subject (
    exam_cd         VARCHAR(50) NOT NULL,
    subject_cd      VARCHAR(20) NOT NULL,
    subject_nm      VARCHAR(100) NOT NULL,
    subject_type    CHAR(1) DEFAULT 'M',
    question_cnt    INTEGER DEFAULT 20,
    score_per_q     NUMERIC(5,2) DEFAULT 5,
    question_type   VARCHAR(20) DEFAULT 'CHOICE',
    cut_line        NUMERIC(5,2) DEFAULT 40,
    sort_order      INTEGER DEFAULT 1,
    is_use          CHAR(1) DEFAULT 'Y',
    reg_dt          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (exam_cd, subject_cd),
    FOREIGN KEY (exam_cd) REFERENCES exam_mst(exam_cd) ON DELETE CASCADE
);

COMMENT ON TABLE exam_subject IS '과목 정보';
COMMENT ON COLUMN exam_subject.subject_type IS '과목유형 (M:필수, S:선택)';
COMMENT ON COLUMN exam_subject.question_type IS '문제유형 (CHOICE:객관식, ESSAY:주관식)';
COMMENT ON COLUMN exam_subject.cut_line IS '과목별 커트라인 (과락 기준)';

-- 3. 정답 테이블 (문항별 정답)
CREATE TABLE IF NOT EXISTS exam_answer_key (
    exam_cd         VARCHAR(50) NOT NULL,
    subject_cd      VARCHAR(20) NOT NULL,
    question_no     INTEGER NOT NULL,
    correct_ans     VARCHAR(10) NOT NULL,
    score           NUMERIC(5,2) DEFAULT 5,
    is_multi_ans    CHAR(1) DEFAULT 'N',
    reg_dt          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    upd_dt          TIMESTAMP,
    PRIMARY KEY (exam_cd, subject_cd, question_no),
    FOREIGN KEY (exam_cd, subject_cd) REFERENCES exam_subject(exam_cd, subject_cd) ON DELETE CASCADE
);

COMMENT ON TABLE exam_answer_key IS '시험 정답';
COMMENT ON COLUMN exam_answer_key.correct_ans IS '정답 (객관식:1~5, 주관식:텍스트)';
COMMENT ON COLUMN exam_answer_key.is_multi_ans IS '복수정답 여부';

-- 4. 응시자 마스터 테이블
CREATE TABLE IF NOT EXISTS exam_applicant (
    exam_cd         VARCHAR(50) NOT NULL,
    applicant_no    VARCHAR(20) NOT NULL,
    user_id         VARCHAR(50),
    user_nm         VARCHAR(100),
    apply_area      VARCHAR(50),
    apply_type      VARCHAR(20),
    add_score       NUMERIC(5,2) DEFAULT 0,
    total_score     NUMERIC(5,2),
    avg_score       NUMERIC(5,2),
    ranking         INTEGER,
    pass_yn         CHAR(1),
    score_status    CHAR(1) DEFAULT 'N',
    reg_dt          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    upd_dt          TIMESTAMP,
    PRIMARY KEY (exam_cd, applicant_no),
    FOREIGN KEY (exam_cd) REFERENCES exam_mst(exam_cd) ON DELETE CASCADE
);

COMMENT ON TABLE exam_applicant IS '응시자 정보';
COMMENT ON COLUMN exam_applicant.add_score IS '가산점';
COMMENT ON COLUMN exam_applicant.pass_yn IS '합격여부 (Y:합격, N:불합격, P:예비합격)';

-- 5. 응시자 답안 테이블
CREATE TABLE IF NOT EXISTS exam_applicant_ans (
    exam_cd         VARCHAR(50) NOT NULL,
    applicant_no    VARCHAR(20) NOT NULL,
    subject_cd      VARCHAR(20) NOT NULL,
    question_no     INTEGER NOT NULL,
    user_ans        VARCHAR(10),
    is_correct      CHAR(1),
    reg_dt          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (exam_cd, applicant_no, subject_cd, question_no),
    FOREIGN KEY (exam_cd, applicant_no) REFERENCES exam_applicant(exam_cd, applicant_no) ON DELETE CASCADE
);

COMMENT ON TABLE exam_applicant_ans IS '응시자 답안';
COMMENT ON COLUMN exam_applicant_ans.is_correct IS '정답여부';

-- 6. 응시자 과목별 성적 테이블
CREATE TABLE IF NOT EXISTS exam_applicant_score (
    exam_cd         VARCHAR(50) NOT NULL,
    applicant_no    VARCHAR(20) NOT NULL,
    subject_cd      VARCHAR(20) NOT NULL,
    raw_score       NUMERIC(5,2),
    adj_score       NUMERIC(5,2),
    correct_cnt     INTEGER,
    wrong_cnt       INTEGER,
    subject_rank    INTEGER,
    cut_pass_yn     CHAR(1),
    reg_dt          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    upd_dt          TIMESTAMP,
    PRIMARY KEY (exam_cd, applicant_no, subject_cd),
    FOREIGN KEY (exam_cd, applicant_no) REFERENCES exam_applicant(exam_cd, applicant_no) ON DELETE CASCADE
);

COMMENT ON TABLE exam_applicant_score IS '응시자 과목별 성적';
COMMENT ON COLUMN exam_applicant_score.raw_score IS '원점수';
COMMENT ON COLUMN exam_applicant_score.adj_score IS '조정점수';
COMMENT ON COLUMN exam_applicant_score.cut_pass_yn IS '과락여부 (Y:통과, N:과락)';

-- 7. 합격선 설정 테이블 (지역/유형별)
CREATE TABLE IF NOT EXISTS exam_pass_line (
    exam_cd         VARCHAR(50) NOT NULL,
    apply_area      VARCHAR(50) NOT NULL,
    apply_type      VARCHAR(20) NOT NULL,
    recruit_cnt     INTEGER,
    pass_line       NUMERIC(5,2),
    cut_line_must   NUMERIC(5,2) DEFAULT 40,
    cut_line_sel    NUMERIC(5,2) DEFAULT 40,
    pass_ranking    INTEGER,
    is_use          CHAR(1) DEFAULT 'Y',
    reg_dt          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    upd_dt          TIMESTAMP,
    PRIMARY KEY (exam_cd, apply_area, apply_type),
    FOREIGN KEY (exam_cd) REFERENCES exam_mst(exam_cd) ON DELETE CASCADE
);

COMMENT ON TABLE exam_pass_line IS '합격선 설정';
COMMENT ON COLUMN exam_pass_line.pass_line IS '합격 커트라인';
COMMENT ON COLUMN exam_pass_line.cut_line_must IS '필수과목 과락 기준';
COMMENT ON COLUMN exam_pass_line.cut_line_sel IS '선택과목 과락 기준';

-- 8. 시험 통계 테이블
CREATE TABLE IF NOT EXISTS exam_stat (
    id              SERIAL PRIMARY KEY,
    exam_cd         VARCHAR(50) NOT NULL,
    apply_area      VARCHAR(50) DEFAULT 'ALL',
    subject_cd      VARCHAR(20) DEFAULT 'ALL',
    applicant_cnt   INTEGER,
    avg_score       NUMERIC(5,2),
    max_score       NUMERIC(5,2),
    min_score       NUMERIC(5,2),
    top_3_score     NUMERIC(5,2),
    top_10_score    NUMERIC(5,2),
    score_1_per     NUMERIC(5,2),
    score_2_per     NUMERIC(5,2),
    score_3_per     NUMERIC(5,2),
    score_4_per     NUMERIC(5,2),
    score_5_per     NUMERIC(5,2),
    reg_dt          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    upd_dt          TIMESTAMP,
    UNIQUE (exam_cd, apply_area, subject_cd)
);

COMMENT ON TABLE exam_stat IS '시험 통계';

-- ============================================
-- 인덱스 생성
-- ============================================
CREATE INDEX IF NOT EXISTS idx_exam_applicant_user ON exam_applicant(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_applicant_area ON exam_applicant(exam_cd, apply_area);
CREATE INDEX IF NOT EXISTS idx_exam_app_score_subj ON exam_applicant_score(exam_cd, subject_cd);
