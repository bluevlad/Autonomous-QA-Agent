import { useEffect, useState } from 'react';
import { Row, Col, Typography, Spin, Alert, Statistic, Card } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExperimentOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';
import ProjectCard from '../components/ProjectCard';
import RunList from '../components/RunList';
import { api } from '../api/client';
import type { ProjectItem, RunListItem } from '../api/client';

const { Title } = Typography;

export default function Dashboard() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [runs, setRuns] = useState<RunListItem[]>([]);
  const [runsTotal, setRunsTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getProjects(), api.getRuns(page)])
      .then(([pRes, rRes]) => {
        setProjects(pRes.projects);
        setRuns(rRes.runs);
        setRunsTotal(rRes.total);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (error) return <Alert type="error" message={error} style={{ margin: 24 }} />;

  const healthyCount = projects.filter((p) => p.last_healthy === true).length;
  const avgPassRate = projects.length > 0
    ? projects.reduce((sum, p) => sum + (p.avg_pass_rate ?? 0), 0) / projects.length
    : 0;

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>QA Dashboard</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Projects"
              value={projects.length}
              prefix={<ExperimentOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Healthy"
              value={healthyCount}
              suffix={`/ ${projects.length}`}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: healthyCount === projects.length ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg Pass Rate"
              value={avgPassRate}
              precision={1}
              suffix="%"
              prefix={avgPassRate >= 90 ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              valueStyle={{ color: avgPassRate >= 90 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Runs (30d)"
              value={runsTotal}
              prefix={<FieldTimeOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Title level={4}>Projects</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {projects.map((p) => (
          <Col key={p.project_name} xs={24} sm={12} lg={8}>
            <ProjectCard project={p} />
          </Col>
        ))}
      </Row>

      <Title level={4}>Recent Runs</Title>
      <RunList
        runs={runs}
        total={runsTotal}
        page={page}
        limit={20}
        onPageChange={setPage}
      />
    </div>
  );
}
