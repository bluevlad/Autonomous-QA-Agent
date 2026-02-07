package com.hopenvision.exam.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "exam_applicant")
@IdClass(ExamApplicantId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamApplicant {

    @Id
    @Column(name = "exam_cd", length = 50)
    private String examCd;

    @Id
    @Column(name = "applicant_no", length = 20)
    private String applicantNo;

    @Column(name = "user_id", length = 50)
    private String userId;

    @Column(name = "user_nm", length = 100)
    private String userNm;

    @Column(name = "apply_area", length = 50)
    private String applyArea;

    @Column(name = "apply_type", length = 20)
    private String applyType;

    @Column(name = "add_score", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal addScore = BigDecimal.ZERO;

    @Column(name = "total_score", precision = 5, scale = 2)
    private BigDecimal totalScore;

    @Column(name = "avg_score", precision = 5, scale = 2)
    private BigDecimal avgScore;

    @Column(name = "ranking")
    private Integer ranking;

    @Column(name = "pass_yn", length = 1)
    private String passYn;

    @Column(name = "score_status", length = 1)
    @Builder.Default
    private String scoreStatus = "N";

    @CreationTimestamp
    @Column(name = "reg_dt", updatable = false)
    private LocalDateTime regDt;

    @UpdateTimestamp
    @Column(name = "upd_dt")
    private LocalDateTime updDt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_cd", insertable = false, updatable = false)
    private Exam exam;

    @OneToMany(mappedBy = "applicant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ExamApplicantScore> scores = new ArrayList<>();
}
