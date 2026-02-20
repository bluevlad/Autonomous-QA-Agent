# HopenVision 개발 표준

## 1. Git 컨벤션

### 1.1 커밋 메시지 규칙

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type 종류
| Type | 설명 |
|------|------|
| `feat` | 새로운 기능 |
| `fix` | 버그 수정 |
| `docs` | 문서 변경 |
| `style` | 코드 포맷팅 (기능 변경 X) |
| `refactor` | 코드 리팩토링 |
| `test` | 테스트 추가/수정 |
| `build` | 빌드 설정 변경 |
| `ci` | CI 설정 변경 |
| `chore` | 기타 작업 |
| `perf` | 성능 개선 |

#### Scope 예시
- `exam`: 시험 관리
- `applicant`: 응시자 관리
- `scoring`: 채점
- `stats`: 통계
- `api`: API 관련
- `ui`: UI 컴포넌트
- `config`: 설정

#### 예시
```
feat(exam): 시험 목록 페이지 추가

- ExamList.tsx 컴포넌트 구현
- 검색 필터 기능 추가
- 페이징 처리

Closes #12
```

### 1.2 브랜치 전략

```
main ─────────────────────► prod
  │                           │
  ├─ feature/exam-list        └─► 자동 배포
  ├─ feature/applicant-import
  └─ bugfix/exam-save-error
```

#### 브랜치 네이밍
```
<type>/<description>

예시:
- feature/exam-list
- feature/excel-import
- bugfix/answer-save-error
- hotfix/critical-security-fix
```

#### 주요 브랜치
| 브랜치 | 설명 |
|--------|------|
| `main` | 개발 기준 브랜치 |
| `prod` | 배포 트리거 브랜치 |
| `feature/*` | 기능 개발 |
| `bugfix/*` | 버그 수정 |
| `hotfix/*` | 긴급 수정 |

---

## 2. Backend 개발 표준 (Spring Boot)

### 2.1 패키지 구조

```
com.hopenvision/
├── HopenvisionApiApplication.java    # 메인 클래스
├── common/                            # 공통 모듈
│   ├── config/                        # 설정
│   │   ├── WebConfig.java
│   │   ├── SwaggerConfig.java
│   │   └── JpaConfig.java
│   ├── dto/                           # 공통 DTO
│   │   └── ApiResponse.java
│   ├── exception/                     # 예외 처리
│   │   ├── GlobalExceptionHandler.java
│   │   ├── BusinessException.java
│   │   └── ErrorCode.java
│   └── util/                          # 유틸리티
│       └── DateUtils.java
│
└── exam/                              # 도메인 모듈
    ├── controller/                    # REST Controller
    │   └── ExamController.java
    ├── service/                       # 비즈니스 로직
    │   └── ExamService.java
    ├── repository/                    # 데이터 접근
    │   └── ExamRepository.java
    ├── entity/                        # JPA Entity
    │   └── Exam.java
    └── dto/                           # DTO
        ├── ExamDto.java
        └── ExamSearchDto.java
```

### 2.2 네이밍 규칙

| 구분 | 규칙 | 예시 |
|------|------|------|
| 클래스 | PascalCase | `ExamService` |
| 메서드 | camelCase | `findByExamCd()` |
| 상수 | UPPER_SNAKE | `MAX_QUESTION_COUNT` |
| 패키지 | lowercase | `com.hopenvision.exam` |
| 테이블 | UPPER_SNAKE | `EXAM_MST` |
| 컬럼 | UPPER_SNAKE | `EXAM_CD` |

### 2.3 Controller 작성 규칙

```java
@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
@Tag(name = "시험 관리", description = "시험 CRUD API")
public class ExamController {

    private final ExamService examService;

    @GetMapping
    @Operation(summary = "시험 목록 조회")
    public ApiResponse<Page<ExamDto>> getExams(
            @RequestParam(required = false) String examType,
            @RequestParam(required = false) String examYear,
            Pageable pageable) {
        return ApiResponse.success(examService.findExams(examType, examYear, pageable));
    }

    @GetMapping("/{examCd}")
    @Operation(summary = "시험 상세 조회")
    public ApiResponse<ExamDto> getExam(@PathVariable String examCd) {
        return ApiResponse.success(examService.findByExamCd(examCd));
    }

    @PostMapping
    @Operation(summary = "시험 등록")
    public ApiResponse<ExamDto> createExam(@Valid @RequestBody ExamDto dto) {
        return ApiResponse.success(examService.create(dto));
    }
}
```

### 2.4 Service 작성 규칙

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExamService {

    private final ExamRepository examRepository;
    private final ExamMapper examMapper;

    public Page<ExamDto> findExams(String examType, String examYear, Pageable pageable) {
        return examRepository.findByConditions(examType, examYear, pageable)
                .map(examMapper::toDto);
    }

    @Transactional
    public ExamDto create(ExamDto dto) {
        if (examRepository.existsById(dto.getExamCd())) {
            throw new BusinessException(ErrorCode.DUPLICATE_EXAM);
        }
        Exam exam = examMapper.toEntity(dto);
        return examMapper.toDto(examRepository.save(exam));
    }
}
```

### 2.5 Entity 작성 규칙

```java
@Entity
@Table(name = "EXAM_MST")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Exam {

    @Id
    @Column(name = "EXAM_CD", length = 50)
    private String examCd;

    @Column(name = "EXAM_NM", nullable = false, length = 200)
    private String examNm;

    @Column(name = "EXAM_TYPE", length = 50)
    private String examType;

    @Column(name = "REG_DT")
    private LocalDateTime regDt;

    @PrePersist
    public void prePersist() {
        this.regDt = LocalDateTime.now();
    }
}
```

### 2.6 공통 응답 클래스

```java
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private ErrorInfo error;

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null);
    }

    public static <T> ApiResponse<T> error(ErrorCode code) {
        return new ApiResponse<>(false, null, new ErrorInfo(code));
    }

    @Getter
    @AllArgsConstructor
    public static class ErrorInfo {
        private String code;
        private String message;

        public ErrorInfo(ErrorCode errorCode) {
            this.code = errorCode.getCode();
            this.message = errorCode.getMessage();
        }
    }
}
```

---

## 3. Frontend 개발 표준 (React + TypeScript)

### 3.1 디렉토리 구조

```
src/
├── main.tsx                    # 진입점
├── App.tsx                     # 라우팅
├── api/                        # API 통신
│   ├── client.ts               # Axios 인스턴스
│   ├── examApi.ts              # 시험 API
│   └── applicantApi.ts         # 응시자 API
├── components/                 # 컴포넌트
│   ├── common/                 # 공통 컴포넌트
│   │   ├── DataTable.tsx
│   │   ├── SearchFilter.tsx
│   │   └── ConfirmModal.tsx
│   └── layout/                 # 레이아웃
│       ├── Layout.tsx
│       ├── Header.tsx
│       └── Sidebar.tsx
├── pages/                      # 페이지
│   ├── exam/
│   │   ├── ExamList.tsx
│   │   ├── ExamForm.tsx
│   │   └── AnswerKeyForm.tsx
│   ├── applicant/
│   └── statistics/
├── hooks/                      # 커스텀 훅
│   ├── useExam.ts
│   └── usePagination.ts
├── types/                      # 타입 정의
│   ├── exam.ts
│   └── common.ts
├── utils/                      # 유틸리티
│   ├── format.ts
│   └── validation.ts
└── styles/                     # 스타일
    └── global.css
```

### 3.2 네이밍 규칙

| 구분 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `ExamList.tsx` |
| 함수/변수 | camelCase | `handleSubmit` |
| 상수 | UPPER_SNAKE | `MAX_FILE_SIZE` |
| 타입/인터페이스 | PascalCase | `ExamDto` |
| 커스텀 훅 | use 접두사 | `useExam` |
| API 함수 | 동사 + 명사 | `getExamList` |

### 3.3 컴포넌트 작성 규칙

```tsx
import { useState, useEffect } from 'react';
import { Table, Button, message } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getExamList } from '@/api/examApi';
import type { ExamDto, ExamSearchParams } from '@/types/exam';

interface ExamListProps {
  defaultPageSize?: number;
}

export function ExamList({ defaultPageSize = 10 }: ExamListProps) {
  const [searchParams, setSearchParams] = useState<ExamSearchParams>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ['exams', searchParams],
    queryFn: () => getExamList(searchParams),
  });

  if (error) {
    message.error('데이터 조회에 실패했습니다.');
  }

  return (
    <div>
      <Table
        dataSource={data?.content}
        loading={isLoading}
        pagination={{ pageSize: defaultPageSize }}
      />
    </div>
  );
}
```

### 3.4 API 클라이언트 작성 규칙

```typescript
// api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error?.message || '오류가 발생했습니다.';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
```

```typescript
// api/examApi.ts
import apiClient from './client';
import type { ApiResponse, ExamDto, PageResponse } from '@/types';

export const getExamList = (params?: ExamSearchParams): Promise<ApiResponse<PageResponse<ExamDto>>> => {
  return apiClient.get('/api/exams', { params });
};

export const getExam = (examCd: string): Promise<ApiResponse<ExamDto>> => {
  return apiClient.get(`/api/exams/${examCd}`);
};

export const createExam = (data: ExamDto): Promise<ApiResponse<ExamDto>> => {
  return apiClient.post('/api/exams', data);
};

export const updateExam = (examCd: string, data: ExamDto): Promise<ApiResponse<ExamDto>> => {
  return apiClient.put(`/api/exams/${examCd}`, data);
};

export const deleteExam = (examCd: string): Promise<ApiResponse<void>> => {
  return apiClient.delete(`/api/exams/${examCd}`);
};
```

### 3.5 타입 정의 규칙

```typescript
// types/exam.ts
export interface ExamDto {
  examCd: string;
  examNm: string;
  examType: string;
  examYear: string;
  examRound?: number;
  examDate?: string;
  totalScore: number;
  passScore: number;
  isUse: string;
  regDt?: string;
  updDt?: string;
  subjects?: SubjectDto[];
}

export interface SubjectDto {
  examCd: string;
  subjectCd: string;
  subjectNm: string;
  subjectType: 'M' | 'S';  // M: 필수, S: 선택
  questionCnt: number;
  scorePerQ: number;
  questionType: 'CHOICE' | 'ESSAY' | 'MIX';
  cutLine: number;
  sortOrder: number;
  isUse: string;
}

export interface ExamSearchParams {
  examType?: string;
  examYear?: string;
  keyword?: string;
  isUse?: string;
  page?: number;
  size?: number;
}
```

### 3.6 커스텀 훅 작성 규칙

```typescript
// hooks/useExam.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { getExamList, createExam, updateExam, deleteExam } from '@/api/examApi';
import type { ExamDto, ExamSearchParams } from '@/types/exam';

export function useExamList(params: ExamSearchParams) {
  return useQuery({
    queryKey: ['exams', params],
    queryFn: () => getExamList(params),
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      message.success('시험이 등록되었습니다.');
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });
}
```

---

## 4. 코드 리뷰 체크리스트

### 4.1 코멘트 태그
| 태그 | 설명 |
|------|------|
| `[MUST]` | 필수 수정 |
| `[SHOULD]` | 권장 수정 |
| `[COULD]` | 선택 수정 |
| `[QUESTION]` | 질문 |
| `[NICE]` | 칭찬 |
| `[NIT]` | 사소한 의견 |

### 4.2 리뷰 항목

#### 기능성
- [ ] 요구사항을 충족하는가?
- [ ] 엣지 케이스를 처리하는가?
- [ ] 에러 처리가 적절한가?

#### 가독성
- [ ] 코드가 이해하기 쉬운가?
- [ ] 네이밍이 명확한가?
- [ ] 불필요한 복잡성이 없는가?

#### 보안
- [ ] SQL Injection 방지
- [ ] XSS 방지
- [ ] 입력값 검증

#### 성능
- [ ] N+1 쿼리 문제가 없는가?
- [ ] 불필요한 API 호출이 없는가?

---

## 5. 테스트 가이드

### 5.1 Backend 테스트

```java
@SpringBootTest
@Transactional
class ExamServiceTest {

    @Autowired
    private ExamService examService;

    @Autowired
    private ExamRepository examRepository;

    @Test
    @DisplayName("시험 등록 성공")
    void createExam_Success() {
        // given
        ExamDto dto = ExamDto.builder()
                .examCd("EXAM001")
                .examNm("2024년 9급 공채")
                .examType("9급")
                .build();

        // when
        ExamDto result = examService.create(dto);

        // then
        assertThat(result.getExamCd()).isEqualTo("EXAM001");
        assertThat(examRepository.findById("EXAM001")).isPresent();
    }
}
```

### 5.2 Frontend 테스트

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ExamList } from './ExamList';

describe('ExamList', () => {
  it('renders exam list correctly', async () => {
    render(<ExamList />);

    expect(await screen.findByText('시험 목록')).toBeInTheDocument();
  });

  it('opens form on create button click', () => {
    render(<ExamList />);

    fireEvent.click(screen.getByText('신규 등록'));

    expect(screen.getByText('시험 등록')).toBeInTheDocument();
  });
});
```

---

## 6. 환경 설정

### 6.1 환경변수

#### Backend (.env 또는 application-{profile}.yml)
```yaml
# 개발 환경
DB_URL=jdbc:postgresql://localhost:5432/hopenvision
DB_USERNAME=hopenvision
DB_PASSWORD=<YOUR_DB_PASSWORD>
```

#### Frontend (.env)
```bash
# 개발 환경
VITE_API_URL=http://localhost:8080

# 운영 환경
VITE_API_URL=http://api.hopenvision.com
```

### 6.2 프로필

| 프로필 | 용도 | 데이터베이스 |
|--------|------|------------|
| `local` | 로컬 개발 | H2 인메모리 |
| `dev` | 개발 서버 | PostgreSQL (개발) |
| `prod` | 운영 서버 | PostgreSQL (운영) |

---

## 7. 문서화 규칙

### 7.1 API 문서
- Swagger/OpenAPI 자동 생성 활용
- 모든 API에 `@Operation`, `@Tag` 어노테이션 추가
- 요청/응답 예시 포함

### 7.2 코드 주석
- 복잡한 비즈니스 로직에만 주석 추가
- JavaDoc/JSDoc 형식 사용
- TODO 주석은 이슈로 등록 후 삭제

---

## 변경 이력

| 버전 | 일자 | 변경 내용 |
|------|------|----------|
| 1.0 | 2025-02-06 | 초안 작성 |
