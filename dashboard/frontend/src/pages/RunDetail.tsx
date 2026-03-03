import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Typography,
  Spin,
  Alert,
  Card,
  Descriptions,
  Tag,
  Table,
  Collapse,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import FailureTable from '../components/FailureTable';
import { api } from '../api/client';
import type { RunDetail as RunDetailType } from '../api/client';

const { Title } = Typography;

export default function RunDetail() {
  const { runId } = useParams<{ runId: string }>();
  const [data, setData] = useState<RunDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) return;
    api.getRunDetail(runId)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [runId]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (error || !data) return <Alert type="error" message={error || 'Not found'} style={{ margin: 24 }} />;

  const { summary } = data;

  return (
    <div style={{ padding: 24 }}>
      <Link to="/"><ArrowLeftOutlined /> Back to Dashboard</Link>
      <Title level={3} style={{ marginTop: 16 }}>Run: {data.runId}</Title>

      <Card style={{ marginBottom: 24 }}>
        <Descriptions bordered column={3} size="small">
          <Descriptions.Item label="Started">{dayjs(data.startedAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
          <Descriptions.Item label="Duration">{Math.round(data.durationMs / 1000)}s</Descriptions.Item>
          <Descriptions.Item label="Projects">{summary.totalProjects}</Descriptions.Item>
          <Descriptions.Item label="Healthy">
            <Tag color={summary.healthyProjects === summary.totalProjects ? 'green' : 'red'}>
              {summary.healthyProjects}/{summary.totalProjects}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Tests">{summary.totalTests}</Descriptions.Item>
          <Descriptions.Item label="Results">
            <Tag color="green">{summary.totalPassed} passed</Tag>
            {summary.totalFailed > 0 && <Tag color="red">{summary.totalFailed} failed</Tag>}
            {summary.totalSkipped > 0 && <Tag>{summary.totalSkipped} skipped</Tag>}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Title level={4}>Health Check</Title>
      <Table
        dataSource={data.healthResults}
        rowKey="id"
        size="small"
        pagination={false}
        style={{ marginBottom: 24 }}
        columns={[
          { title: 'Project', dataIndex: 'project_name', key: 'project_name' },
          {
            title: 'Status',
            dataIndex: 'healthy',
            key: 'healthy',
            render: (v: boolean) => v
              ? <Tag icon={<CheckCircleOutlined />} color="success">UP</Tag>
              : <Tag icon={<CloseCircleOutlined />} color="error">DOWN</Tag>,
          },
          {
            title: 'Endpoints',
            dataIndex: 'endpoints',
            key: 'endpoints',
            render: (eps: Array<{ label: string; healthy: boolean; responseTimeMs: number }>) => (
              <>
                {eps.map((ep, i) => (
                  <Tag key={i} color={ep.healthy ? 'green' : 'red'}>
                    {ep.label}: {ep.healthy ? `${Math.round(ep.responseTimeMs)}ms` : 'FAIL'}
                  </Tag>
                ))}
              </>
            ),
          },
        ]}
      />

      <Title level={4}>Test Results</Title>
      <Table
        dataSource={data.testResults}
        rowKey="id"
        size="small"
        pagination={false}
        style={{ marginBottom: 24 }}
        columns={[
          { title: 'Project', dataIndex: 'project_name', key: 'project_name' },
          {
            title: 'Executed',
            dataIndex: 'executed',
            key: 'executed',
            render: (v: boolean, r: { skipped_reason?: string }) =>
              v ? <Tag color="blue">Yes</Tag> : <Tag>{r.skipped_reason || 'Skipped'}</Tag>,
          },
          { title: 'Passed', dataIndex: 'passed', key: 'passed' },
          { title: 'Failed', dataIndex: 'failed', key: 'failed', render: (v: number) => v > 0 ? <Tag color="red">{v}</Tag> : 0 },
          { title: 'Duration', dataIndex: 'duration_ms', key: 'duration_ms', render: (v: number) => `${Math.round(v / 1000)}s` },
        ]}
      />

      {data.failureDetails.length > 0 && (
        <>
          <Title level={4}>Failure Details</Title>
          <FailureTable failures={data.failureDetails} />
        </>
      )}

      {data.suggestions.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <Title level={4}>Improvement Suggestions</Title>
          <Collapse
            items={data.suggestions.map((s) => ({
              key: s.id,
              label: (
                <>
                  <Tag color={s.severity === 'warning' ? 'orange' : s.severity === 'critical' ? 'red' : 'blue'}>
                    {s.severity}
                  </Tag>
                  {s.title}
                  {s.project_name && <Tag style={{ marginLeft: 8 }}>{s.project_name}</Tag>}
                </>
              ),
              children: <p>{s.description}</p>,
            }))}
          />
        </div>
      )}
    </div>
  );
}
