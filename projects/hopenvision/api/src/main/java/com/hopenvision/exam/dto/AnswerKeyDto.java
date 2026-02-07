package com.hopenvision.exam.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class AnswerKeyDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private String examCd;
        private String subjectCd;
        private Integer questionNo;
        private String correctAns;
        private BigDecimal score;
        private String isMultiAns;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BulkRequest {
        private String examCd;
        private String subjectCd;
        private List<AnswerItem> answers;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AnswerItem {
        private Integer questionNo;
        private String correctAns;
        private BigDecimal score;
        private String isMultiAns;
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
        private Integer questionNo;
        private String correctAns;
        private BigDecimal score;
        private String isMultiAns;
        private LocalDateTime regDt;
        private LocalDateTime updDt;
    }
}
