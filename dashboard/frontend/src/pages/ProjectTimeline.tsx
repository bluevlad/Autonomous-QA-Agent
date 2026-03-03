import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Typography, Spin, Alert, Card, Statistic, Row, Col, Table, Tag } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import HealthTimeline from '../components/HealthTimeline';
import { api } from '../api/client';
import type { TimelinePoint, ProjectItem } from '../api/client';

const { Title } = Typography;

export default function ProjectTimeline() {
  const { name } = useParams<{ name: string }>();
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [project, setProject] = useState<ProjectItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name) return;
    Promise.all([
      api.getProjectTimeline(name),
      api.getProjects(),
    ])
      .then(([tRes, pRes]) => {
        setTimeline(tRes.timeline);
        const found = pRes.projects.find((p) => p.project_name === name);
        setProject(found || null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [name]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (error) return <Alert type="error" message={error} style={{ margin: 24 }} />;

  return (
    <div style={{ padding: 24 }}>
      <Link to="/"><ArrowLeftOutlined /> Back to Dashboard</Link>
      <Title level={3} style={{ marginTop: 16 }}>{name}</Title>

      {project && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Status"
                value={project.last_healthy ? 'UP' : 'DOWN'}
                valueStyle={{ color: project.last_healthy ? '#3f8600' : '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Pass Rate" value={project.avg_pass_rate ?? 0} precision={1} suffix="%" />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Total Runs" value={project.total_runs} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Recent Failures" value={project.recent_failures} />
            </Card>
          </Col>
        </Row>
      )}

      <Card title="Health Timeline (30 days)" style={{ marginBottom: 24 }}>
        {timeline.length > 0 ? (
          <HealthTimeline timeline={timeline} />
        ) : (
          <p>No data available</p>
        )}
      </Card>

      <Title level={4}>Daily Results</Title>
      <Table
        dataSource={[...timeline].sort((a, b) => b.date.localeCompare(a.date))}
        rowKey="date"
        size="small"
        pagination={{ pageSize: 15 }}
        columns={[
          { title: 'Date', dataIndex: 'date', key: 'date' },
          {
            title: 'Health',
            dataIndex: 'healthy',
            key: 'healthy',
            render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'UP' : 'DOWN'}</Tag>,
          },
          { title: 'Passed', dataIndex: 'passed', key: 'passed' },
          {
            title: 'Failed',
            dataIndex: 'failed',
            key: 'failed',
            render: (v: number) => v > 0 ? <Tag color="red">{v}</Tag> : 0,
          },
          { title: 'Total', dataIndex: 'total', key: 'total' },
          {
            title: 'Avg RT',
            dataIndex: 'responseTimeMs',
            key: 'responseTimeMs',
            render: (v: number | null) => v ? `${v}ms` : '-',
          },
        ]}
      />
    </div>
  );
}
