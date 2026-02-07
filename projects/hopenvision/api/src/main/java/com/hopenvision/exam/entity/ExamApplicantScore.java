package com.hopenvision.exam.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "exam_applicant_score")
@IdClass(ExamApplicantScoreId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamApplicantScore {

    @Id
    @Column(name = "exam_cd", length = 50)
    private String examCd;

    @Id
    @Column(name = "applicant_no", length = 20)
    private String applicantNo;

    @Id
    @Column(name = "subject_cd", length = 20)
    private String subjectCd;

    @Column(name = "raw_score", precision = 5, scale = 2)
    private BigDecimal rawScore;

    @Column(name = "adj_score", precision = 5, scale = 2)
    private BigDecimal adjScore;

    @Column(name = "correct_cnt")
    private Integer correctCnt;

    @Column(name = "wrong_cnt")
    private Integer wrongCnt;

    @Column(name = "subject_rank")
    private Integer subjectRank;

    @Column(name = "cut_pass_yn", length = 1)
    private String cutPassYn;

    @CreationTimestamp
    @Column(name = "reg_dt", updatable = false)
    private LocalDateTime regDt;

    @UpdateTimestamp
    @Column(name = "upd_dt")
    private LocalDateTime updDt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
        @JoinColumn(name = "exam_cd", referencedColumnName = "exam_cd", insertable = false, updatable = false),
        @JoinColumn(name = "applicant_no", referencedColumnName = "applicant_no", insertable = false, updatable = false)
    })
    private ExamApplicant applicant;
}
