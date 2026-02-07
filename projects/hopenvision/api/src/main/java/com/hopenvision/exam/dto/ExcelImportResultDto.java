package com.hopenvision.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExcelImportResultDto {

    private int totalRows;
    private int successCount;
    private int failCount;

    @Builder.Default
    private List<String> errors = new ArrayList<>();

    @Builder.Default
    private List<ImportedAnswerKey> importedKeys = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportedAnswerKey {
        private String subjectCode;
        private String subjectName;
        private int questionNo;
        private int correctAnswer;
        private Double score;
    }
}
