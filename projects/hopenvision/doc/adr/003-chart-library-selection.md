# ADR-003: 차트 라이브러리 선정

## 상태

Accepted

## 일자

2025-02-06

## 컨텍스트

관리자 대시보드와 사용자 성적 분석을 위해 차트/그래프 라이브러리가 필요합니다.

**필요한 차트 유형:**
- 막대 차트 (점수 분포)
- 파이 차트 (과목별 비율)
- 라인 차트 (추이)
- 게이지 차트 (목표 달성률)

**요구사항:**
- 무료 오픈소스
- React 호환
- Ant Design과 디자인 통일
- 한글 지원

## 결정

**Ant Design Charts** (@ant-design/charts)를 선택합니다.

```bash
npm install @ant-design/charts
```

## 고려한 대안

### 옵션 1: Recharts
- 장점: 가볍고 React 친화적, 커스터마이징 용이
- 단점: Ant Design과 스타일 불일치

### 옵션 2: Chart.js (react-chartjs-2)
- 장점: 널리 사용됨, 다양한 차트 타입
- 단점: React 래퍼 필요, 스타일 커스터마이징 번거로움

### 옵션 3: ECharts (echarts-for-react)
- 장점: 고성능, 복잡한 시각화 가능
- 단점: 러닝커브, 번들 크기 큼

### 옵션 4: Ant Design Charts (선택)
- 장점: Ant Design 통합, 간편 사용, 다양한 차트
- 단점: 커스터마이징 제한적 (대부분 경우 충분)

## 결과

**긍정적 결과:**
- Ant Design과 일관된 디자인
- 빠른 개발 속도
- 공식 지원 및 문서화

**부정적 결과/트레이드오프:**
- 고급 커스터마이징 필요 시 제약
- 필요 시 ECharts로 마이그레이션 검토

## 사용 예시

```tsx
import { Column, Pie, Line } from '@ant-design/charts';

// 점수 분포 차트
<Column
  data={scoreData}
  xField="scoreRange"
  yField="count"
  color="#1890ff"
/>
```

## 관련 문서

- [IMPLEMENTATION_PROPOSAL.md](../IMPLEMENTATION_PROPOSAL.md)
