package com.hopenvision.exam.entity;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ExamApplicantScoreId implements Serializable {
    private String examCd;
    private String applicantNo;
    private String subjectCd;
}
