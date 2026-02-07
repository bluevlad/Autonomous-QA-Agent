package com.hopenvision.exam.controller;

import com.hopenvision.exam.dto.*;
import com.hopenvision.exam.service.ExamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "시험 관리", description = "시험, 과목, 정답 관리 API")
@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
@Slf4j
public class ExamController {

    private final ExamService examService;

    // ==================== 시험 관리 ====================

    @Operation(summary = "시험 목록 조회", description = "페이징 및 검색 조건으로 시험 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ExamDto.Response>>> getExamList(
            @Parameter(description = "검색어 (시험명, 시험코드)") @RequestParam(required = false) String keyword,
            @Parameter(description = "시험유형") @RequestParam(required = false) String examType,
            @Parameter(description = "시험년도") @RequestParam(required = false) String examYear,
            @Parameter(description = "사용여부") @RequestParam(required = false) String isUse,
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "10") int size
    ) {
        ExamDto.SearchRequest request = ExamDto.SearchRequest.builder()
                .keyword(keyword)
                .examType(examType)
                .examYear(examYear)
                .isUse(isUse)
                .page(page)
                .size(size)
                .build();

        Page<ExamDto.Response> result = examService.getExamList(request);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "시험 상세 조회", description = "시험코드로 시험 상세 정보를 조회합니다.")
    @GetMapping("/{examCd}")
    public ResponseEntity<ApiResponse<ExamDto.DetailResponse>> getExamDetail(
            @Parameter(description = "시험코드") @PathVariable String examCd
    ) {
        ExamDto.DetailResponse result = examService.getExamDetail(examCd);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "시험 등록", description = "새로운 시험을 등록합니다.")
    @PostMapping
    public ResponseEntity<ApiResponse<ExamDto.Response>> createExam(
            @RequestBody ExamDto.Request request
    ) {
        ExamDto.Response result = examService.createExam(request);
        return ResponseEntity.ok(ApiResponse.success("시험이 등록되었습니다.", result));
    }

    @Operation(summary = "시험 수정", description = "기존 시험 정보를 수정합니다.")
    @PutMapping("/{examCd}")
    public ResponseEntity<ApiResponse<ExamDto.Response>> updateExam(
            @Parameter(description = "시험코드") @PathVariable String examCd,
            @RequestBody ExamDto.Request request
    ) {
        ExamDto.Response result = examService.updateExam(examCd, request);
        return ResponseEntity.ok(ApiResponse.success("시험이 수정되었습니다.", result));
    }

    @Operation(summary = "시험 삭제", description = "시험을 삭제합니다. (관련 과목, 정답도 함께 삭제)")
    @DeleteMapping("/{examCd}")
    public ResponseEntity<ApiResponse<Void>> deleteExam(
            @Parameter(description = "시험코드") @PathVariable String examCd
    ) {
        examService.deleteExam(examCd);
        return ResponseEntity.ok(ApiResponse.success("시험이 삭제되었습니다.", null));
    }

    // ==================== 과목 관리 ====================

    @Operation(summary = "과목 목록 조회", description = "시험의 과목 목록을 조회합니다.")
    @GetMapping("/{examCd}/subjects")
    public ResponseEntity<ApiResponse<List<SubjectDto.Response>>> getSubjectList(
            @Parameter(description = "시험코드") @PathVariable String examCd
    ) {
        List<SubjectDto.Response> result = examService.getSubjectList(examCd);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "과목 등록/수정", description = "과목을 등록하거나 수정합니다.")
    @PostMapping("/{examCd}/subjects")
    public ResponseEntity<ApiResponse<SubjectDto.Response>> saveSubject(
            @Parameter(description = "시험코드") @PathVariable String examCd,
            @RequestBody SubjectDto.Request request
    ) {
        request.setExamCd(examCd);
        SubjectDto.Response result = examService.saveSubject(request);
        return ResponseEntity.ok(ApiResponse.success("과목이 저장되었습니다.", result));
    }

    @Operation(summary = "과목 삭제", description = "과목을 삭제합니다. (관련 정답도 함께 삭제)")
    @DeleteMapping("/{examCd}/subjects/{subjectCd}")
    public ResponseEntity<ApiResponse<Void>> deleteSubject(
            @Parameter(description = "시험코드") @PathVariable String examCd,
            @Parameter(description = "과목코드") @PathVariable String subjectCd
    ) {
        examService.deleteSubject(examCd, subjectCd);
        return ResponseEntity.ok(ApiResponse.success("과목이 삭제되었습니다.", null));
    }

    // ==================== 정답 관리 ====================

    @Operation(summary = "정답 목록 조회", description = "시험/과목의 정답 목록을 조회합니다.")
    @GetMapping("/{examCd}/answers")
    public ResponseEntity<ApiResponse<List<AnswerKeyDto.Response>>> getAnswerKeyList(
            @Parameter(description = "시험코드") @PathVariable String examCd,
            @Parameter(description = "과목코드 (선택)") @RequestParam(required = false) String subjectCd
    ) {
        List<AnswerKeyDto.Response> result = examService.getAnswerKeyList(examCd, subjectCd);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "정답 일괄 등록", description = "과목의 정답을 일괄 등록합니다. (기존 정답은 삭제)")
    @PostMapping("/{examCd}/answers")
    public ResponseEntity<ApiResponse<Void>> saveAnswerKeys(
            @Parameter(description = "시험코드") @PathVariable String examCd,
            @RequestBody AnswerKeyDto.BulkRequest request
    ) {
        request.setExamCd(examCd);
        examService.saveAnswerKeys(request);
        return ResponseEntity.ok(ApiResponse.success("정답이 저장되었습니다.", null));
    }
}
