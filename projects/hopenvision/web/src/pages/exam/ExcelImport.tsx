import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Upload,
  Button,
  Table,
  Alert,
  Space,
  Typography,
  message,
  Tag,
  Result,
  Spin,
} from 'antd';
import {
  UploadOutlined,
  FileExcelOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { examApi } from '../../api/examApi';
import type { ExcelImportResult } from '../../types/exam';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

const ExcelImport: React.FC = () => {
  const navigate = useNavigate();
  const { examCd } = useParams<{ examCd: string }>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewResult, setPreviewResult] = useState<ExcelImportResult | null>(null);
  const [importResult, setImportResult] = useState<ExcelImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  const columns = [
    {
      title: '과목코드',
      dataIndex: 'subjectCode',
      key: 'subjectCode',
      width: 120,
    },
    {
      title: '과목명',
      dataIndex: 'subjectName',
      key: 'subjectName',
      width: 150,
    },
    {
      title: '문항번호',
      dataIndex: 'questionNo',
      key: 'questionNo',
      width: 100,
      align: 'center' as const,
    },
    {
      title: '정답',
      dataIndex: 'correctAnswer',
      key: 'correctAnswer',
      width: 80,
      align: 'center' as const,
      render: (value: number) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: '배점',
      dataIndex: 'score',
      key: 'score',
      width: 80,
      align: 'center' as const,
      render: (value: number | null) => value ?? '-',
    },
  ];

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xls,.xlsx',
    fileList,
    beforeUpload: (file) => {
      const isExcel =
        file.type === 'application/vnd.ms-excel' ||
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.name.endsWith('.xls') ||
        file.name.endsWith('.xlsx');

      if (!isExcel) {
        message.error('Excel 파일만 업로드 가능합니다 (.xls, .xlsx)');
        return Upload.LIST_IGNORE;
      }

      setFileList([file]);
      handlePreview(file);
      return false;
    },
    onRemove: () => {
      setFileList([]);
      setPreviewResult(null);
      setImportResult(null);
    },
  };

  const handlePreview = async (file: File) => {
    setLoading(true);
    setPreviewResult(null);
    setImportResult(null);

    try {
      const result = await examApi.previewExcelAnswerKeys(file);
      setPreviewResult(result);

      if (result.failCount > 0) {
        message.warning(`${result.failCount}건의 오류가 발견되었습니다. 오류 내용을 확인해주세요.`);
      } else {
        message.success(`${result.successCount}건의 데이터를 미리보기합니다.`);
      }
    } catch (error) {
      message.error('파일 미리보기에 실패했습니다.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!examCd || fileList.length === 0) {
      message.error('시험을 선택하고 파일을 업로드해주세요.');
      return;
    }

    setImporting(true);
    try {
      const file = fileList[0] as unknown as File;
      const result = await examApi.importExcelAnswerKeys(examCd, file);
      setImportResult(result);

      if (result.failCount > 0) {
        message.warning(`${result.successCount}건 저장 완료, ${result.failCount}건 오류`);
      } else {
        message.success(`${result.successCount}건의 정답이 저장되었습니다.`);
      }
    } catch (error) {
      message.error('정답 저장에 실패했습니다.');
      console.error(error);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    // 샘플 Excel 템플릿 다운로드
    const link = document.createElement('a');
    link.href = '/answer_template.csv';
    link.download = '정답_답안지_템플릿.csv';
    link.click();
    message.success('템플릿이 다운로드되었습니다. Excel에서 열어 편집 후 .xlsx로 저장하세요.');
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
            >
              뒤로가기
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              <FileExcelOutlined /> Excel 정답 가져오기
            </Title>
          </Space>
        </Card>

        <Card title="Excel 파일 형식 안내">
          <Alert
            type="info"
            showIcon
            message="Excel 파일 형식"
            description={
              <div>
                <Paragraph>
                  Excel 파일의 첫 번째 행은 헤더로, 다음 열 순서로 작성해주세요:
                </Paragraph>
                <table style={{ borderCollapse: 'collapse', marginBottom: 16 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                      <th style={{ border: '1px solid #ddd', padding: '8px' }}>A열: 과목코드</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px' }}>B열: 과목명</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px' }}>C열: 문항번호</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px' }}>D열: 정답</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px' }}>E열: 배점</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>KOREAN</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>국어</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>1</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>3</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>2</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>KOREAN</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>국어</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>2</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>1</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>2</td>
                    </tr>
                  </tbody>
                </table>
                <Text type="secondary">* 정답은 1~5 사이의 숫자입니다.</Text>
                <br />
                <Text type="secondary">* 배점은 생략 가능하며, 생략 시 기본 2점으로 설정됩니다.</Text>
              </div>
            }
          />
          <div style={{ marginTop: 16 }}>
            <Button
              icon={<DownloadOutlined />}
              onClick={downloadTemplate}
            >
              샘플 템플릿 다운로드
            </Button>
          </div>
        </Card>

        <Card title="파일 업로드">
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <FileExcelOutlined style={{ fontSize: 48, color: '#52c41a' }} />
            </p>
            <p className="ant-upload-text">
              클릭하거나 파일을 이 영역으로 드래그하세요
            </p>
            <p className="ant-upload-hint">
              Excel 파일 (.xls, .xlsx)만 업로드 가능합니다
            </p>
          </Dragger>
        </Card>

        {loading && (
          <Card>
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin size="large" />
              <p style={{ marginTop: 16 }}>파일을 분석하고 있습니다...</p>
            </div>
          </Card>
        )}

        {previewResult && !loading && (
          <Card
            title={
              <Space>
                미리보기 결과
                <Tag color="blue">{previewResult.totalRows}건</Tag>
                <Tag color="green">성공: {previewResult.successCount}건</Tag>
                {previewResult.failCount > 0 && (
                  <Tag color="red">실패: {previewResult.failCount}건</Tag>
                )}
              </Space>
            }
            extra={
              examCd && previewResult.successCount > 0 && !importResult && (
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  onClick={handleImport}
                  loading={importing}
                >
                  DB에 저장하기
                </Button>
              )
            }
          >
            {previewResult.errors.length > 0 && (
              <Alert
                type="error"
                showIcon
                message="오류 목록"
                description={
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {previewResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                }
                style={{ marginBottom: 16 }}
              />
            )}

            <Table
              columns={columns}
              dataSource={previewResult.importedKeys.map((item, index) => ({
                ...item,
                key: index,
              }))}
              size="small"
              pagination={{ pageSize: 20 }}
              scroll={{ y: 400 }}
            />
          </Card>
        )}

        {importResult && (
          <Card>
            <Result
              status={importResult.failCount === 0 ? 'success' : 'warning'}
              icon={importResult.failCount === 0 ? <CheckCircleOutlined /> : undefined}
              title={
                importResult.failCount === 0
                  ? '정답 저장 완료'
                  : '일부 데이터 저장 완료'
              }
              subTitle={
                <Space direction="vertical">
                  <Text>총 {importResult.totalRows}건 중 {importResult.successCount}건 저장 완료</Text>
                  {importResult.failCount > 0 && (
                    <Text type="danger">{importResult.failCount}건 저장 실패</Text>
                  )}
                </Space>
              }
              extra={[
                <Button
                  type="primary"
                  key="list"
                  onClick={() => navigate('/exams')}
                >
                  시험 목록으로
                </Button>,
                <Button
                  key="another"
                  onClick={() => {
                    setFileList([]);
                    setPreviewResult(null);
                    setImportResult(null);
                  }}
                >
                  다른 파일 업로드
                </Button>,
              ]}
            />
          </Card>
        )}

        {!examCd && fileList.length > 0 && previewResult && (
          <Alert
            type="warning"
            showIcon
            message="시험을 선택해주세요"
            description="정답을 저장하려면 먼저 시험 상세 페이지에서 'Excel 가져오기' 버튼을 클릭하세요."
          />
        )}
      </Space>
    </div>
  );
};

export default ExcelImport;
