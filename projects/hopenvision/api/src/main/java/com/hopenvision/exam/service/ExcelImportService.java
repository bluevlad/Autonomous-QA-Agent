package com.hopenvision.exam.service;

import com.hopenvision.exam.dto.ExcelImportResultDto;
import com.hopenvision.exam.entity.ExamAnswerKey;
import com.hopenvision.exam.entity.ExamSubject;
import com.hopenvision.exam.entity.ExamSubjectId;
import com.hopenvision.exam.repository.ExamAnswerKeyRepository;
import com.hopenvision.exam.repository.ExamSubjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExcelImportService {

    private final ExamSubjectRepository examSubjectRepository;
    private final ExamAnswerKeyRepository examAnswerKeyRepository;

    /**
     * 정답 답안지 Excel 파일을 파싱하여 DB에 저장
     *
     * Excel 형식:
     * | 과목코드 | 과목명 | 문항번호 | 정답 | 배점 |
     * | SUBJ001 | 국어   | 1       | 3    | 2.0  |
     * | SUBJ001 | 국어   | 2       | 1    | 2.0  |
     * ...
     */
    @Transactional
    public ExcelImportResultDto importAnswerKeys(String examCd, MultipartFile file) {
        List<String> errors = new ArrayList<>();
        List<ExcelImportResultDto.ImportedAnswerKey> importedKeys = new ArrayList<>();
        int totalRows = 0;
        int successCount = 0;
        int failCount = 0;

        try (InputStream is = file.getInputStream()) {
            Workbook workbook = createWorkbook(file.getOriginalFilename(), is);
            Sheet sheet = workbook.getSheetAt(0);

            // 첫 번째 행은 헤더로 스킵
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isEmptyRow(row)) {
                    continue;
                }

                totalRows++;
                try {
                    ExcelImportResultDto.ImportedAnswerKey imported = processRow(examCd, row, i + 1);
                    importedKeys.add(imported);
                    successCount++;
                } catch (Exception e) {
                    failCount++;
                    errors.add("행 " + (i + 1) + ": " + e.getMessage());
                    log.error("행 {} 처리 중 오류: {}", i + 1, e.getMessage());
                }
            }

            workbook.close();

        } catch (IOException e) {
            log.error("Excel 파일 읽기 오류: {}", e.getMessage());
            errors.add("Excel 파일을 읽을 수 없습니다: " + e.getMessage());
            failCount = 1;
        }

        return ExcelImportResultDto.builder()
                .totalRows(totalRows)
                .successCount(successCount)
                .failCount(failCount)
                .errors(errors)
                .importedKeys(importedKeys)
                .build();
    }

    /**
     * 정답 답안지 Excel 파일 미리보기 (저장하지 않고 파싱만)
     */
    public ExcelImportResultDto previewAnswerKeys(MultipartFile file) {
        List<ExcelImportResultDto.ImportedAnswerKey> importedKeys = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        int totalRows = 0;
        int successCount = 0;
        int failCount = 0;

        try (InputStream is = file.getInputStream()) {
            Workbook workbook = createWorkbook(file.getOriginalFilename(), is);
            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isEmptyRow(row)) {
                    continue;
                }

                totalRows++;
                try {
                    ExcelImportResultDto.ImportedAnswerKey imported = parseRow(row, i + 1);
                    importedKeys.add(imported);
                    successCount++;
                } catch (Exception e) {
                    failCount++;
                    errors.add("행 " + (i + 1) + ": " + e.getMessage());
                }
            }

            workbook.close();
        } catch (IOException e) {
            errors.add("Excel 파일을 읽을 수 없습니다: " + e.getMessage());
        }

        return ExcelImportResultDto.builder()
                .totalRows(totalRows)
                .successCount(successCount)
                .failCount(failCount)
                .errors(errors)
                .importedKeys(importedKeys)
                .build();
    }

    private Workbook createWorkbook(String filename, InputStream is) throws IOException {
        if (filename != null && filename.toLowerCase().endsWith(".xlsx")) {
            return new XSSFWorkbook(is);
        } else {
            return new HSSFWorkbook(is);
        }
    }

    private boolean isEmptyRow(Row row) {
        for (int i = 0; i < 5; i++) {
            Cell cell = row.getCell(i);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                String value = getCellStringValue(cell);
                if (value != null && !value.trim().isEmpty()) {
                    return false;
                }
            }
        }
        return true;
    }

    private ExcelImportResultDto.ImportedAnswerKey processRow(String examCd, Row row, int rowNum) {
        // 과목코드
        String subjectCode = getCellStringValue(row.getCell(0));
        if (subjectCode == null || subjectCode.trim().isEmpty()) {
            throw new IllegalArgumentException("과목코드가 비어있습니다");
        }

        // 과목명
        String subjectName = getCellStringValue(row.getCell(1));
        if (subjectName == null || subjectName.trim().isEmpty()) {
            throw new IllegalArgumentException("과목명이 비어있습니다");
        }

        // 문항번호
        int questionNo = getCellIntValue(row.getCell(2));
        if (questionNo <= 0) {
            throw new IllegalArgumentException("문항번호가 유효하지 않습니다: " + questionNo);
        }

        // 정답
        int correctAnswer = getCellIntValue(row.getCell(3));
        if (correctAnswer < 1 || correctAnswer > 5) {
            throw new IllegalArgumentException("정답은 1~5 사이여야 합니다: " + correctAnswer);
        }

        // 배점 (선택)
        Double scoreValue = null;
        Cell scoreCell = row.getCell(4);
        if (scoreCell != null && scoreCell.getCellType() != CellType.BLANK) {
            scoreValue = getCellDoubleValue(scoreCell);
        }

        // 과목이 존재하는지 확인하고 없으면 생성
        ExamSubjectId subjectId = new ExamSubjectId(examCd, subjectCode);
        if (!examSubjectRepository.existsById(subjectId)) {
            ExamSubject subject = ExamSubject.builder()
                    .examCd(examCd)
                    .subjectCd(subjectCode)
                    .subjectNm(subjectName)
                    .subjectType("M")
                    .questionType("CHOICE")
                    .questionCnt(0)
                    .scorePerQ(new BigDecimal("5"))
                    .build();
            examSubjectRepository.save(subject);
        }

        // 정답 저장
        BigDecimal score = scoreValue != null ? BigDecimal.valueOf(scoreValue) : new BigDecimal("2.0");
        ExamAnswerKey answerKey = ExamAnswerKey.builder()
                .examCd(examCd)
                .subjectCd(subjectCode)
                .questionNo(questionNo)
                .correctAns(String.valueOf(correctAnswer))
                .score(score)
                .build();
        examAnswerKeyRepository.save(answerKey);

        return ExcelImportResultDto.ImportedAnswerKey.builder()
                .subjectCode(subjectCode)
                .subjectName(subjectName)
                .questionNo(questionNo)
                .correctAnswer(correctAnswer)
                .score(scoreValue)
                .build();
    }

    private ExcelImportResultDto.ImportedAnswerKey parseRow(Row row, int rowNum) {
        String subjectCode = getCellStringValue(row.getCell(0));
        if (subjectCode == null || subjectCode.trim().isEmpty()) {
            throw new IllegalArgumentException("과목코드가 비어있습니다");
        }

        String subjectName = getCellStringValue(row.getCell(1));
        int questionNo = getCellIntValue(row.getCell(2));
        int correctAnswer = getCellIntValue(row.getCell(3));

        Double score = null;
        Cell scoreCell = row.getCell(4);
        if (scoreCell != null && scoreCell.getCellType() != CellType.BLANK) {
            score = getCellDoubleValue(scoreCell);
        }

        return ExcelImportResultDto.ImportedAnswerKey.builder()
                .subjectCode(subjectCode)
                .subjectName(subjectName)
                .questionNo(questionNo)
                .correctAnswer(correctAnswer)
                .score(score)
                .build();
    }

    private String getCellStringValue(Cell cell) {
        if (cell == null) {
            return null;
        }
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                return String.valueOf((int) cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            default:
                return null;
        }
    }

    private int getCellIntValue(Cell cell) {
        if (cell == null) {
            return 0;
        }
        switch (cell.getCellType()) {
            case NUMERIC:
                return (int) cell.getNumericCellValue();
            case STRING:
                try {
                    return Integer.parseInt(cell.getStringCellValue().trim());
                } catch (NumberFormatException e) {
                    return 0;
                }
            default:
                return 0;
        }
    }

    private Double getCellDoubleValue(Cell cell) {
        if (cell == null) {
            return null;
        }
        switch (cell.getCellType()) {
            case NUMERIC:
                return cell.getNumericCellValue();
            case STRING:
                try {
                    return Double.parseDouble(cell.getStringCellValue().trim());
                } catch (NumberFormatException e) {
                    return null;
                }
            default:
                return null;
        }
    }
}
