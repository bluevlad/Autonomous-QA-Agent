package com.hopenvision.exam.controller;

import com.hopenvision.exam.dto.ExcelImportResultDto;
import com.hopenvision.exam.service.ExcelImportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Excel Import", description = "Excel 파일 가져오기 API")
@RestController
@RequestMapping("/api/import")
@RequiredArgsConstructor
public class ExcelImportController {

    private final ExcelImportService excelImportService;

    @Operation(summary = "정답 답안지 Excel 미리보기", description = "Excel 파일을 파싱하여 미리보기 (저장하지 않음)")
    @PostMapping(value = "/answer-keys/preview", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ExcelImportResultDto> previewAnswerKeys(
            @Parameter(description = "Excel 파일 (.xls, .xlsx)")
            @RequestParam("file") MultipartFile file) {

        validateExcelFile(file);
        ExcelImportResultDto result = excelImportService.previewAnswerKeys(file);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "정답 답안지 Excel 가져오기", description = "Excel 파일을 파싱하여 DB에 저장")
    @PostMapping(value = "/exams/{examCd}/answer-keys", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ExcelImportResultDto> importAnswerKeys(
            @Parameter(description = "시험 코드")
            @PathVariable String examCd,
            @Parameter(description = "Excel 파일 (.xls, .xlsx)")
            @RequestParam("file") MultipartFile file) {

        validateExcelFile(file);
        ExcelImportResultDto result = excelImportService.importAnswerKeys(examCd, file);
        return ResponseEntity.ok(result);
    }

    private void validateExcelFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다");
        }

        String filename = file.getOriginalFilename();
        if (filename == null ||
                (!filename.toLowerCase().endsWith(".xls") && !filename.toLowerCase().endsWith(".xlsx"))) {
            throw new IllegalArgumentException("Excel 파일만 업로드 가능합니다 (.xls, .xlsx)");
        }
    }
}
