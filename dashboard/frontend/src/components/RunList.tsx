import { Table, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { RunListItem } from '../api/client';

interface Props {
  runs: RunListItem[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export default function RunList({ runs, total, page, limit, onPageChange, loading }: Props) {
  const navigate = useNavigate();

  const columns = [
    {
      title: 'Run ID',
      dataIndex: 'run_id',
      key: 'run_id',
      render: (v: string) => <a onClick={() => navigate(`/runs/${v}`)}>{v}</a>,
    },
    {
      title: 'Started',
      dataIndex: 'started_at',
      key: 'started_at',
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Duration',
      dataIndex: 'duration_ms',
      key: 'duration_ms',
      render: (v: number) => `${Math.round(v / 1000)}s`,
    },
    {
      title: 'Health',
      key: 'health',
      render: (_: unknown, r: RunListItem) => (
        <Tag color={r.healthy_projects === r.total_projects ? 'green' : 'red'}>
          {r.healthy_projects}/{r.total_projects}
        </Tag>
      ),
    },
    {
      title: 'Tests',
      key: 'tests',
      render: (_: unknown, r: RunListItem) => (
        <>
          <Tag color="green">{r.total_passed}</Tag>
          {r.total_failed > 0 && <Tag color="red">{r.total_failed}</Tag>}
          {r.total_skipped > 0 && <Tag>{r.total_skipped}</Tag>}
        </>
      ),
    },
  ];

  return (
    <Table
      dataSource={runs}
      columns={columns}
      rowKey="id"
      loading={loading}
      pagination={{
        current: page,
        pageSize: limit,
        total,
        onChange: onPageChange,
        showSizeChanger: false,
      }}
      size="middle"
    />
  );
}
