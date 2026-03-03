import { Card, Statistic, Tag, Progress, Row, Col } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ProjectItem } from '../api/client';

interface Props {
  project: ProjectItem;
}

export default function ProjectCard({ project }: Props) {
  const navigate = useNavigate();
  const isHealthy = project.last_healthy === true;
  const passRate = project.avg_pass_rate ?? 0;

  return (
    <Card
      hoverable
      onClick={() => navigate(`/projects/${project.project_name}`)}
      title={
        <span>
          <ExperimentOutlined style={{ marginRight: 8 }} />
          {project.project_name}
        </span>
      }
      extra={
        project.last_healthy === null ? (
          <Tag>NO DATA</Tag>
        ) : isHealthy ? (
          <Tag icon={<CheckCircleOutlined />} color="success">UP</Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="error">DOWN</Tag>
        )
      }
    >
      <Row gutter={16}>
        <Col span={12}>
          <Statistic title="Pass Rate" value={passRate} precision={1} suffix="%" />
        </Col>
        <Col span={12}>
          <Statistic title="Recent Failures" value={project.recent_failures} />
        </Col>
      </Row>
      <Progress
        percent={passRate}
        showInfo={false}
        strokeColor={passRate >= 90 ? '#52c41a' : passRate >= 70 ? '#faad14' : '#ff4d4f'}
        style={{ marginTop: 12 }}
      />
      <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
        {project.total_runs} runs (30d)
        {project.last_checked_at && (
          <> &middot; Last: {new Date(project.last_checked_at).toLocaleDateString('ko-KR')}</>
        )}
      </div>
    </Card>
  );
}
