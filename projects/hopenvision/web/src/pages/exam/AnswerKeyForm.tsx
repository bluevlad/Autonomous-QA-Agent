import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  Select,
  Button,
  Space,
  Table,
  Radio,
  message,
  Alert,
  Row,
  Col,
  Statistic,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined, FileExcelOutlined } from '@ant-design/icons';
import { examApi } from '../../api/examApi';
import type { SubjectResponse, AnswerItem } from '../../types/exam';

export default function AnswerKeyForm() {
  const navigate = useNavigate();
  const { examCd } = useParams();
  const queryClient = useQueryClient();

  const [selectedSubject, setSelectedSubject] = useState<SubjectResponse | null>(null);
  const [answers, setAnswers] = useState<AnswerItem[]>([]);

  // 시험 상세 조회
  const { data: examData, isLoading: examLoading } = useQuery({
    queryKey: ['exam', examCd],
    queryFn: () => examApi.getExamDetail(examCd!),
    enabled: !!examCd,
  });

  // 정답 목록 조회
  const { data: answerData, isLoading: answerLoading } = useQuery({
    queryKey: ['answers', examCd, selectedSubject?.subjectCd],
    queryFn: () => examApi.getAnswerKeyList(examCd!, selectedSubject?.subjectCd),
    enabled: !!examCd && !!selectedSubject,
  });

  // 정답 저장
  const saveMutation = useMutation({
    mutationFn: () =>
      examApi.saveAnswerKeys(examCd!, {
        subjectCd: selectedSubject!.subjectCd,
        answers: answers,
      }),
    onSuccess: () => {
      message.success('정답이 저장되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['answers', examCd] });
      queryClient.invalidateQueries({ queryKey: ['exam', examCd] });
    },
    onError: () => {
      message.error('정답 저장 중 오류가 발생했습니다.');
    },
  });

  // 과목 선택 시 정답 초기화
  useEffect(() => {
    if (selectedSubject) {
      if (answerData?.data && answerData.data.length > 0) {
        // 기존 정답이 있으면 로드
        setAnswers(
          answerData.data.map((a) => ({
            questionNo: a.questionNo,
            correctAns: a.correctAns,
            score: a.score,
            isMultiAns: a.isMultiAns,
          }))
        );
      } else {
        // 새로 생성
        const questionCnt = selectedSubject.questionCnt || 20;
        const scorePerQ = selectedSubject.scorePerQ || 5;
        setAnswers(
          Array.from({ length: questionCnt }, (_, i) => ({
            questionNo: i + 1,
            correctAns: '',
            score: scorePerQ,
            isMultiAns: 'N',
          }))
        );
      }
    }
  }, [selectedSubject, answerData]);

  // 정답 변경
  const handleAnswerChange = (questionNo: number, value: string) => {
    setAnswers((prev) =>
      prev.map((a) => (a.questionNo === questionNo ? { ...a, correctAns: value } : a))
    );
  };

  // 저장
  const handleSave = () => {
    // 모든 정답이 입력되었는지 확인
    const emptyAnswers = answers.filter((a) => !a.correctAns);
    if (emptyAnswers.length > 0) {
      message.warning(`${emptyAnswers.length}개 문항의 정답이 입력되지 않았습니다.`);
    }
    saveMutation.mutate();
  };

  const columns = [
    {
      title: '문항',
      dataIndex: 'questionNo',
      key: 'questionNo',
      width: 60,
      align: 'center' as const,
    },
    {
      title: '정답',
      dataIndex: 'correctAns',
      key: 'correctAns',
      align: 'center' as const,
      render: (_: any, record: AnswerItem) => (
        <Radio.Group
          value={record.correctAns}
          onChange={(e) => handleAnswerChange(record.questionNo, e.target.value)}
          optionType="button"
          buttonStyle="solid"
          size="small"
        >
          <Radio.Button value="1">1</Radio.Button>
          <Radio.Button value="2">2</Radio.Button>
          <Radio.Button value="3">3</Radio.Button>
          <Radio.Button value="4">4</Radio.Button>
          <Radio.Button value="5">5</Radio.Button>
        </Radio.Group>
      ),
    },
    {
      title: '배점',
      dataIndex: 'score',
      key: 'score',
      width: 80,
      align: 'center' as const,
      render: (value: number) => `${value}점`,
    },
  ];

  const filledCount = answers.filter((a) => a.correctAns).length;
  const totalCount = answers.length;

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(`/exam/${examCd}`)}
        style={{ marginBottom: 16 }}
      >
        시험 정보로 돌아가기
      </Button>

      <Card
        title={`정답 등록 - ${examData?.data?.examNm || ''}`}
        loading={examLoading}
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Select
              placeholder="과목을 선택하세요"
              style={{ width: '100%' }}
              loading={examLoading}
              onChange={(value) => {
                const subject = examData?.data?.subjects?.find(
                  (s) => s.subjectCd === value
                );
                setSelectedSubject(subject || null);
              }}
              value={selectedSubject?.subjectCd}
              options={examData?.data?.subjects?.map((s) => ({
                value: s.subjectCd,
                label: `${s.subjectNm} (${s.subjectType === 'M' ? '필수' : '선택'})`,
              }))}
            />
          </Col>
          <Col span={8}>
            {selectedSubject && (
              <Space size="large">
                <Statistic
                  title="입력 현황"
                  value={filledCount}
                  suffix={`/ ${totalCount}`}
                  valueStyle={{
                    color: filledCount === totalCount ? '#52c41a' : '#faad14',
                  }}
                />
              </Space>
            )}
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <Space>
              <Button
                icon={<FileExcelOutlined />}
                onClick={() => navigate(`/exam/${examCd}/import`)}
              >
                Excel 가져오기
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={saveMutation.isPending}
                disabled={!selectedSubject}
              >
                정답 저장
              </Button>
            </Space>
          </Col>
        </Row>

        {!selectedSubject ? (
          <Alert
            message="과목을 선택하세요"
            description="정답을 등록할 과목을 선택해주세요."
            type="info"
            showIcon
          />
        ) : (
          <>
            <Alert
              message={`${selectedSubject.subjectNm} - 총 ${selectedSubject.questionCnt}문항 (문항당 ${selectedSubject.scorePerQ}점)`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Table
              columns={columns}
              dataSource={answers}
              rowKey="questionNo"
              pagination={false}
              size="small"
              loading={answerLoading}
              scroll={{ y: 500 }}
            />
          </>
        )}
      </Card>
    </div>
  );
}
