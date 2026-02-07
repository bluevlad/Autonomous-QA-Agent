package com.hopenvision.exam.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "exam_subject")
@IdClass(ExamSubjectId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamSubject {

    @Id
    @Column(name = "exam_cd", length = 50)
    private String examCd;

    @Id
    @Column(name = "subject_cd", length = 20)
    private String subjectCd;

    @Column(name = "subject_nm", length = 100, nullable = false)
    private String subjectNm;

    @Column(name = "subject_type", length = 1)
    @Builder.Default
    private String subjectType = "M";

    @Column(name = "question_cnt")
    @Builder.Default
    private Integer questionCnt = 20;

    @Column(name = "score_per_q", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal scorePerQ = new BigDecimal("5");

    @Column(name = "question_type", length = 20)
    @Builder.Default
    private String questionType = "CHOICE";

    @Column(name = "cut_line", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal cutLine = new BigDecimal("40");

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 1;

    @Column(name = "is_use", length = 1)
    @Builder.Default
    private String isUse = "Y";

    @CreationTimestamp
    @Column(name = "reg_dt", updatable = false)
    private LocalDateTime regDt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_cd", insertable = false, updatable = false)
    private Exam exam;

    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ExamAnswerKey> answerKeys = new ArrayList<>();
}
