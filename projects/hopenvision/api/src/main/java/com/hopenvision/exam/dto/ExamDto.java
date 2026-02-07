package com.hopenvision.exam.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class ExamDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private String examCd;
        private String examNm;
        private String examType;
        private String examYear;
        private Integer examRound;
        private LocalDate examDate;
        private BigDecimal totalScore;
        private BigDecimal passScore;
        private String isUse;
        private List<SubjectDto.Request> subjects;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private String examCd;
        private String examNm;
        private String examType;
        private String examYear;
        private Integer examRound;
        private LocalDate examDate;
        private BigDecimal totalScore;
        private BigDecimal passScore;
        private String isUse;
        private LocalDateTime regDt;
        private LocalDateTime updDt;
        private Long subjectCnt;
        private Long applicantCnt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DetailResponse {
        private String examCd;
        private String examNm;
        private String examType;
        private String examYear;
        private Integer examRound;
        private LocalDate examDate;
        private BigDecimal totalScore;
        private BigDecimal passScore;
        private String isUse;
        private LocalDateTime regDt;
        private LocalDateTime updDt;
        private List<SubjectDto.Response> subjects;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SearchRequest {
        private String keyword;
        private String examType;
        private String examYear;
        private String isUse;
        private int page = 0;
        private int size = 10;
    }
}
