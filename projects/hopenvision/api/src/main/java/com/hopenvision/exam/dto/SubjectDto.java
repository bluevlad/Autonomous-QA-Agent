package com.hopenvision.exam.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class SubjectDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private String examCd;
        private String subjectCd;
        private String subjectNm;
        private String subjectType;
        private Integer questionCnt;
        private BigDecimal scorePerQ;
        private String questionType;
        private BigDecimal cutLine;
        private Integer sortOrder;
        private String isUse;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private String examCd;
        private String subjectCd;
        private String subjectNm;
        private String subjectType;
        private Integer questionCnt;
        private BigDecimal scorePerQ;
        private String questionType;
        private BigDecimal cutLine;
        private Integer sortOrder;
        private String isUse;
        private LocalDateTime regDt;
        private Long answerCnt;
    }
}
