import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Card,
  Tag,
  Popconfirm,
  message,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { examApi } from '../../api/examApi';
import type { ExamResponse } from '../../types/exam';
import { EXAM_TYPES } from '../../types/exam';

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - i);

export default function ExamList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchParams, setSearchParams] = useState({
    keyword: '',
    examType: '',
    examYear: '',
    isUse: '',
    page: 0,
    size: 10,
  });

  // 시험 목록 조회
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['exams', searchParams],
    queryFn: () => examApi.getExamList(searchParams),
  });

  // 시험 삭제
  const deleteMutation = useMutation({
    mutationFn: examApi.deleteExam,
    onSuccess: () => {
      message.success('시험이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
    onError: () => {
      message.error('삭제 중 오류가 발생했습니다.');
    },
  });

  const handleSearch = () => {
    setSearchParams((prev) => ({ ...prev, page: 0 }));
    refetch();
  };

  const handleReset = () => {
    setSearchParams({
      keyword: '',
      examType: '',
      examYear: '',
      isUse: '',
      page: 0,
      size: 10,
    });
  };

  const columns: ColumnsType<ExamResponse> = [
    {
      title: '시험코드',
      dataIndex: 'examCd',
      key: 'examCd',
      width: 150,
    },
    {
      title: '시험명',
      dataIndex: 'examNm',
      key: 'examNm',
      render: (text, record) => (
        <a onClick={() => navigate(`/exam/${record.examCd}`)}>{text}</a>
      ),
    },
    {
      title: '시험유형',
      dataIndex: 'examType',
      key: 'examType',
      width: 120,
      render: (value) => {
        const type = EXAM_TYPES.find((t) => t.value === value);
        return type?.label || value;
      },
    },
    {
      title: '시험일',
      dataIndex: 'examDate',
      key: 'examDate',
      width: 120,
    },
    {
      title: '과목수',
      dataIndex: 'subjectCnt',
      key: 'subjectCnt',
      width: 80,
      align: 'center',
      render: (value) => `${value}개`,
    },
    {
      title: '응시자수',
      dataIndex: 'applicantCnt',
      key: 'applicantCnt',
      width: 100,
      align: 'center',
      render: (value) => `${value}명`,
    },
    {
      title: '합격기준',
      dataIndex: 'passScore',
      key: 'passScore',
      width: 100,
      align: 'center',
      render: (value) => `${value}점`,
    },
    {
      title: '사용여부',
      dataIndex: 'isUse',
      key: 'isUse',
      width: 80,
      align: 'center',
      render: (value) => (
        <Tag color={value === 'Y' ? 'green' : 'red'}>
          {value === 'Y' ? '사용' : '미사용'}
        </Tag>
      ),
    },
    {
      title: '등록일',
      dataIndex: 'regDt',
      key: 'regDt',
      width: 150,
      render: (value) => value?.substring(0, 16),
    },
    {
      title: '관리',
      key: 'action',
      width: 180,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/exam/${record.examCd}`)}
          >
            수정
          </Button>
          <Button
            size="small"
            icon={<FileTextOutlined />}
            onClick={() => navigate(`/exam/${record.examCd}/answers`)}
          >
            정답
          </Button>
          <Popconfirm
            title="시험을 삭제하시겠습니까?"
            description="관련된 과목, 정답 정보도 함께 삭제됩니다."
            onConfirm={() => deleteMutation.mutate(record.examCd)}
            okText="삭제"
            cancelText="취소"
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              삭제
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <Select
              placeholder="시험유형"
              allowClear
              style={{ width: 140 }}
              value={searchParams.examType || undefined}
              onChange={(value) =>
                setSearchParams((prev) => ({ ...prev, examType: value || '' }))
              }
              options={EXAM_TYPES}
            />
          </Col>
          <Col>
            <Select
              placeholder="시험년도"
              allowClear
              style={{ width: 120 }}
              value={searchParams.examYear || undefined}
              onChange={(value) =>
                setSearchParams((prev) => ({ ...prev, examYear: value || '' }))
              }
              options={YEARS.map((y) => ({ value: String(y), label: `${y}년` }))}
            />
          </Col>
          <Col>
            <Select
              placeholder="사용여부"
              allowClear
              style={{ width: 100 }}
              value={searchParams.isUse || undefined}
              onChange={(value) =>
                setSearchParams((prev) => ({ ...prev, isUse: value || '' }))
              }
              options={[
                { value: 'Y', label: '사용' },
                { value: 'N', label: '미사용' },
              ]}
            />
          </Col>
          <Col flex="auto">
            <Input
              placeholder="시험명 또는 시험코드 검색"
              value={searchParams.keyword}
              onChange={(e) =>
                setSearchParams((prev) => ({ ...prev, keyword: e.target.value }))
              }
              onPressEnter={handleSearch}
              style={{ width: 250 }}
            />
          </Col>
          <Col>
            <Space>
              <Button icon={<SearchOutlined />} type="primary" onClick={handleSearch}>
                검색
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                초기화
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card
        title={
          <span>
            시험 목록 (총 <strong>{data?.data?.totalElements || 0}</strong>건)
          </span>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/exam/new')}>
            시험 등록
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data?.data?.content || []}
          rowKey="examCd"
          loading={isLoading}
          pagination={{
            current: searchParams.page + 1,
            pageSize: searchParams.size,
            total: data?.data?.totalElements || 0,
            showSizeChanger: true,
            showTotal: (total) => `총 ${total}건`,
            onChange: (page, pageSize) => {
              setSearchParams((prev) => ({
                ...prev,
                page: page - 1,
                size: pageSize,
              }));
            },
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
}
