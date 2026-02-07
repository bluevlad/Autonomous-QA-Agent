package com.hopenvision.exam.entity;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ExamSubjectId implements Serializable {
    private String examCd;
    private String subjectCd;
}
