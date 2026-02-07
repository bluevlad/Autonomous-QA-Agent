export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ExamResponse {
  examCd: string;
  examNm: string;
  examType: string;
  examYear: string;
  examRound: number;
  examDate: string;
  totalScore: number;
  passScore: number;
  isUse: string;
  regDt: string;
  updDt: string;
  subjectCnt: number;
  applicantCnt: number;
}

export interface ExamDetailResponse extends ExamResponse {
  subjects: SubjectResponse[];
}

export interface ExamRequest {
  examCd: string;
  examNm: string;
  examType: string;
  examYear: string;
  examRound?: number;
  examDate?: string;
  totalScore?: number;
  passScore?: number;
  isUse?: string;
  subjects?: SubjectRequest[];
}

export interface SubjectResponse {
  examCd: string;
  subjectCd: string;
  subjectNm: string;
  subjectType: string;
  questionCnt: number;
  scorePerQ: number;
  questionType: string;
  cutLine: number;
  sortOrder: number;
  isUse: string;
  regDt: string;
  answerCnt: number;
}

export interface SubjectRequest {
  subjectCd: string;
  subjectNm: string;
  subjectType?: string;
  questionCnt?: number;
  scorePerQ?: number;
  questionType?: string;
  cutLine?: number;
  sortOrder?: number;
  isUse?: string;
}

export interface AnswerKeyResponse {
  examCd: string;
  subjectCd: string;
  subjectNm?: string;
  questionNo: number;
  correctAns: string;
  score: number;
  isMultiAns: string;
  regDt: string;
  updDt: string;
}

export interface AnswerKeyBulkRequest {
  subjectCd: string;
  answers: AnswerItem[];
}

export interface AnswerItem {
  questionNo: number;
  correctAns: string;
  score?: number;
  isMultiAns?: string;
}

// 시험 유형
export const EXAM_TYPES = [
  { value: '9LEVEL', label: '9급 공무원' },
  { value: '7LEVEL', label: '7급 공무원' },
  { value: 'POLICE', label: '경찰 공무원' },
  { value: 'FIRE', label: '소방 공무원' },
  { value: 'COURT', label: '법원직' },
  { value: 'TAX', label: '세무직' },
  { value: 'OTHER', label: '기타' },
];

// 과목 유형
export const SUBJECT_TYPES = [
  { value: 'M', label: '필수' },
  { value: 'S', label: '선택' },
];

// 문제 유형
export const QUESTION_TYPES = [
  { value: 'CHOICE', label: '객관식' },
  { value: 'ESSAY', label: '주관식' },
  { value: 'MIX', label: '혼합' },
];

// Excel 가져오기 결과
export interface ExcelImportResult {
  totalRows: number;
  successCount: number;
  failCount: number;
  errors: string[];
  importedKeys: ImportedAnswerKey[];
}

export interface ImportedAnswerKey {
  subjectCode: string;
  subjectName: string;
  questionNo: number;
  correctAnswer: number;
  score: number | null;
}
