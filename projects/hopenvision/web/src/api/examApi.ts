import client from './client';
import type {
  ApiResponse,
  ExamResponse,
  ExamDetailResponse,
  ExamRequest,
  SubjectResponse,
  SubjectRequest,
  AnswerKeyResponse,
  AnswerKeyBulkRequest,
  PageResponse,
  ExcelImportResult
} from '../types/exam';

const BASE_PATH = '/api/exams';

export const examApi = {
  // 시험 목록 조회
  getExamList: async (params: {
    keyword?: string;
    examType?: string;
    examYear?: string;
    isUse?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PageResponse<ExamResponse>>> => {
    const response = await client.get(BASE_PATH, { params });
    return response.data;
  },

  // 시험 상세 조회
  getExamDetail: async (examCd: string): Promise<ApiResponse<ExamDetailResponse>> => {
    const response = await client.get(`${BASE_PATH}/${examCd}`);
    return response.data;
  },

  // 시험 등록
  createExam: async (data: ExamRequest): Promise<ApiResponse<ExamResponse>> => {
    const response = await client.post(BASE_PATH, data);
    return response.data;
  },

  // 시험 수정
  updateExam: async (examCd: string, data: ExamRequest): Promise<ApiResponse<ExamResponse>> => {
    const response = await client.put(`${BASE_PATH}/${examCd}`, data);
    return response.data;
  },

  // 시험 삭제
  deleteExam: async (examCd: string): Promise<ApiResponse<void>> => {
    const response = await client.delete(`${BASE_PATH}/${examCd}`);
    return response.data;
  },

  // 과목 목록 조회
  getSubjectList: async (examCd: string): Promise<ApiResponse<SubjectResponse[]>> => {
    const response = await client.get(`${BASE_PATH}/${examCd}/subjects`);
    return response.data;
  },

  // 과목 등록/수정
  saveSubject: async (examCd: string, data: SubjectRequest): Promise<ApiResponse<SubjectResponse>> => {
    const response = await client.post(`${BASE_PATH}/${examCd}/subjects`, data);
    return response.data;
  },

  // 과목 삭제
  deleteSubject: async (examCd: string, subjectCd: string): Promise<ApiResponse<void>> => {
    const response = await client.delete(`${BASE_PATH}/${examCd}/subjects/${subjectCd}`);
    return response.data;
  },

  // 정답 목록 조회
  getAnswerKeyList: async (examCd: string, subjectCd?: string): Promise<ApiResponse<AnswerKeyResponse[]>> => {
    const response = await client.get(`${BASE_PATH}/${examCd}/answers`, {
      params: { subjectCd }
    });
    return response.data;
  },

  // 정답 일괄 등록
  saveAnswerKeys: async (examCd: string, data: AnswerKeyBulkRequest): Promise<ApiResponse<void>> => {
    const response = await client.post(`${BASE_PATH}/${examCd}/answers`, data);
    return response.data;
  },

  // Excel 정답 미리보기
  previewExcelAnswerKeys: async (file: File): Promise<ExcelImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await client.post('/api/import/answer-keys/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Excel 정답 가져오기
  importExcelAnswerKeys: async (examCd: string, file: File): Promise<ExcelImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await client.post(`/api/import/exams/${examCd}/answer-keys`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
