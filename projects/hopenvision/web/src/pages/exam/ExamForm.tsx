import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Card,
  Space,
  Table,
  message,
  Row,
  Col,
  Popconfirm,
} from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { examApi } from '../../api/examApi';
import type { SubjectRequest, SubjectResponse } from '../../types/exam';
import { EXAM_TYPES, SUBJECT_TYPES, QUESTION_TYPES } from '../../types/exam';

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - i);

export default function ExamForm() {
  const navigate = useNavigate();
  const { examCd } = useParams();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [subjectForm] = Form.useForm();
  const isEdit = !!examCd;

  const [subjects, setSubjects] = useState<SubjectRequest[]>([]);

  // 시험 상세 조회
  const { data: examData, isLoading } = useQuery({
    queryKey: ['exam', examCd],
    queryFn: () => examApi.getExamDetail(examCd!),
    enabled: isEdit,
  });

  // 시험 등록
  const createMutation = useMutation({
    mutationFn: examApi.createExam,
    onSuccess: () => {
      message.success('시험이 등록되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      navigate('/exam');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '등록 중 오류가 발생했습니다.');
    },
  });

  // 시험 수정
  const updateMutation = useMutation({
    mutationFn: ({ examCd, data }: { examCd: string; data: any }) =>
      examApi.updateExam(examCd, data),
    onSuccess: () => {
      message.success('시험이 수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['exam', examCd] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '수정 중 오류가 발생했습니다.');
    },
  });

  // 과목 저장
  const saveSubjectMutation = useMutation({
    mutationFn: ({ examCd, data }: { examCd: string; data: SubjectRequest }) =>
      examApi.saveSubject(examCd, data),
    onSuccess: () => {
      message.success('과목이 저장되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['exam', examCd] });
      subjectForm.resetFields();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '과목 저장 중 오류가 발생했습니다.');
    },
  });

  // 과목 삭제
  const deleteSubjectMutation = useMutation({
    mutationFn: ({ examCd, subjectCd }: { examCd: string; subjectCd: string }) =>
      examApi.deleteSubject(examCd, subjectCd),
    onSuccess: () => {
      message.success('과목이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['exam', examCd] });
    },
    onError: () => {
      message.error('과목 삭제 중 오류가 발생했습니다.');
    },
  });

  // 데이터 로드
  useEffect(() => {
    if (examData?.data) {
      const exam = examData.data;
      form.setFieldsValue({
        ...exam,
        examDate: exam.examDate ? dayjs(exam.examDate) : undefined,
      });
    }
  }, [examData, form]);

  // 폼 제출
  const handleSubmit = async (values: any) => {
    const data = {
      ...values,
      examDate: values.examDate?.format('YYYY-MM-DD'),
      subjects: isEdit ? undefined : subjects,
    };

    if (isEdit) {
      updateMutation.mutate({ examCd: examCd!, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // 과목 추가 (등록 모드)
  const handleAddSubject = () => {
    subjectForm.validateFields().then((values) => {
      setSubjects((prev) => [
        ...prev,
        { ...values, sortOrder: prev.length + 1 },
      ]);
      subjectForm.resetFields();
    });
  };

  // 과목 삭제 (등록 모드)
  const handleRemoveSubject = (index: number) => {
    setSubjects((prev) => prev.filter((_, i) => i !== index));
  };

  // 과목 저장 (수정 모드)
  const handleSaveSubject = () => {
    subjectForm.validateFields().then((values) => {
      saveSubjectMutation.mutate({
        examCd: examCd!,
        data: { ...values, sortOrder: (examData?.data?.subjects?.length || 0) + 1 },
      });
    });
  };

  const subjectColumns: ColumnsType<SubjectResponse | SubjectRequest> = [
    { title: '순서', dataIndex: 'sortOrder', key: 'sortOrder', width: 60, align: 'center' },
    { title: '과목코드', dataIndex: 'subjectCd', key: 'subjectCd', width: 100 },
    { title: '과목명', dataIndex: 'subjectNm', key: 'subjectNm' },
    {
      title: '유형',
      dataIndex: 'subjectType',
      key: 'subjectType',
      width: 80,
      render: (v) => (v === 'M' ? '필수' : '선택'),
    },
    { title: '문항수', dataIndex: 'questionCnt', key: 'questionCnt', width: 80, align: 'center' },
    { title: '배점', dataIndex: 'scorePerQ', key: 'scorePerQ', width: 80, align: 'center' },
    { title: '과락', dataIndex: 'cutLine', key: 'cutLine', width: 80, align: 'center' },
    {
      title: '정답등록',
      dataIndex: 'answerCnt',
      key: 'answerCnt',
      width: 100,
      align: 'center',
      render: (v, record: any) =>
        record.questionCnt ? `${v || 0}/${record.questionCnt}` : '-',
    },
    {
      title: '관리',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, record, index) =>
        isEdit ? (
          <Popconfirm
            title="과목을 삭제하시겠습니까?"
            onConfirm={() =>
              deleteSubjectMutation.mutate({
                examCd: examCd!,
                subjectCd: (record as SubjectResponse).subjectCd,
              })
            }
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        ) : (
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleRemoveSubject(index)}
          />
        ),
    },
  ];

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/exam')}
        style={{ marginBottom: 16 }}
      >
        목록으로
      </Button>

      <Card title={isEdit ? '시험 수정' : '시험 등록'} loading={isLoading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            totalScore: 100,
            passScore: 60,
            examRound: 1,
            isUse: 'Y',
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="examCd"
                label="시험코드"
                rules={[{ required: true, message: '시험코드를 입력하세요' }]}
              >
                <Input placeholder="예: 2024_9LEVEL_1" disabled={isEdit} />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="examNm"
                label="시험명"
                rules={[{ required: true, message: '시험명을 입력하세요' }]}
              >
                <Input placeholder="예: 2024년 9급 공무원 1차 시험" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="examType"
                label="시험유형"
                rules={[{ required: true, message: '시험유형을 선택하세요' }]}
              >
                <Select options={EXAM_TYPES} placeholder="선택" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="examYear"
                label="시험년도"
                rules={[{ required: true, message: '시험년도를 선택하세요' }]}
              >
                <Select
                  options={YEARS.map((y) => ({ value: String(y), label: `${y}년` }))}
                  placeholder="선택"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="examRound" label="시험회차">
                <Select
                  options={[1, 2, 3].map((r) => ({ value: r, label: `${r}차` }))}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="examDate" label="시험일자">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="totalScore" label="총점 기준">
                <InputNumber min={0} max={1000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="passScore"
                label="합격 기준 점수"
                rules={[{ required: true, message: '합격 기준 점수를 입력하세요' }]}
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="isUse" label="사용여부">
                <Select
                  options={[
                    { value: 'Y', label: '사용' },
                    { value: 'N', label: '미사용' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
                {isEdit ? '수정' : '등록'}
              </Button>
              <Button onClick={() => navigate('/exam')}>취소</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title="과목 설정" style={{ marginTop: 16 }}>
        <Form form={subjectForm} layout="inline" style={{ marginBottom: 16 }}>
          <Form.Item
            name="subjectCd"
            rules={[{ required: true, message: '과목코드 필수' }]}
          >
            <Input placeholder="과목코드" style={{ width: 100 }} />
          </Form.Item>
          <Form.Item
            name="subjectNm"
            rules={[{ required: true, message: '과목명 필수' }]}
          >
            <Input placeholder="과목명" style={{ width: 120 }} />
          </Form.Item>
          <Form.Item name="subjectType" initialValue="M">
            <Select options={SUBJECT_TYPES} style={{ width: 80 }} />
          </Form.Item>
          <Form.Item name="questionCnt" initialValue={20}>
            <InputNumber placeholder="문항수" min={1} style={{ width: 80 }} />
          </Form.Item>
          <Form.Item name="scorePerQ" initialValue={5}>
            <InputNumber placeholder="배점" min={1} step={0.5} style={{ width: 80 }} />
          </Form.Item>
          <Form.Item name="cutLine" initialValue={40}>
            <InputNumber placeholder="과락점수" min={0} style={{ width: 80 }} />
          </Form.Item>
          <Form.Item name="questionType" initialValue="CHOICE">
            <Select options={QUESTION_TYPES} style={{ width: 100 }} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={isEdit ? handleSaveSubject : handleAddSubject}
              loading={saveSubjectMutation.isPending}
            >
              추가
            </Button>
          </Form.Item>
        </Form>

        <Table
          columns={subjectColumns}
          dataSource={isEdit ? examData?.data?.subjects : subjects}
          rowKey="subjectCd"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
}
