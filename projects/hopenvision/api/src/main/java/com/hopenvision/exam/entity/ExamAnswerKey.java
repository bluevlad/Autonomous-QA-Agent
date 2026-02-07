package com.hopenvision.exam.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "exam_answer_key")
@IdClass(ExamAnswerKeyId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamAnswerKey {

    @Id
    @Column(name = "exam_cd", length = 50)
    private String examCd;

    @Id
    @Column(name = "subject_cd", length = 20)
    private String subjectCd;

    @Id
    @Column(name = "question_no")
    private Integer questionNo;

    @Column(name = "correct_ans", length = 10, nullable = false)
    private String correctAns;

    @Column(name = "score", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal score = new BigDecimal("5");

    @Column(name = "is_multi_ans", length = 1)
    @Builder.Default
    private String isMultiAns = "N";

    @CreationTimestamp
    @Column(name = "reg_dt", updatable = false)
    private LocalDateTime regDt;

    @UpdateTimestamp
    @Column(name = "upd_dt")
    private LocalDateTime updDt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
        @JoinColumn(name = "exam_cd", referencedColumnName = "exam_cd", insertable = false, updatable = false),
        @JoinColumn(name = "subject_cd", referencedColumnName = "subject_cd", insertable = false, updatable = false)
    })
    private ExamSubject subject;
}
