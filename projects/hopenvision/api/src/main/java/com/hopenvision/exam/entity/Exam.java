package com.hopenvision.exam.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "exam_mst")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exam {

    @Id
    @Column(name = "exam_cd", length = 50)
    private String examCd;

    @Column(name = "exam_nm", length = 200, nullable = false)
    private String examNm;

    @Column(name = "exam_type", length = 20)
    private String examType;

    @Column(name = "exam_year", length = 4)
    private String examYear;

    @Column(name = "exam_round")
    private Integer examRound;

    @Column(name = "exam_date")
    private LocalDate examDate;

    @Column(name = "total_score", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal totalScore = new BigDecimal("100");

    @Column(name = "pass_score", precision = 5, scale = 2)
    private BigDecimal passScore;

    @Column(name = "is_use", length = 1)
    @Builder.Default
    private String isUse = "Y";

    @CreationTimestamp
    @Column(name = "reg_dt", updatable = false)
    private LocalDateTime regDt;

    @UpdateTimestamp
    @Column(name = "upd_dt")
    private LocalDateTime updDt;

    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ExamSubject> subjects = new ArrayList<>();

    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ExamApplicant> applicants = new ArrayList<>();

    public void addSubject(ExamSubject subject) {
        subjects.add(subject);
        subject.setExam(this);
    }

    public void removeSubject(ExamSubject subject) {
        subjects.remove(subject);
        subject.setExam(null);
    }
}
