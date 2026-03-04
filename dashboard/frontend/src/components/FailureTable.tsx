import { Table, Tag } from 'antd';
import type { FailureDetail } from '../api/client';

interface Props {
  failures: FailureDetail[];
}

export default function FailureTable({ failures }: Props) {
  const columns = [
    {
      title: 'Test',
      dataIndex: 'test_name',
      key: 'test_name',
      ellipsis: true,
    },
    {
      title: 'Suite',
      dataIndex: 'suite_name',
      key: 'suite_name',
      ellipsis: true,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (v: string | undefined) => v ? <Tag>{v}</Tag> : '-',
    },
    {
      title: 'Error',
      dataIndex: 'error_message',
      key: 'error_message',
      ellipsis: true,
    },
    {
      title: 'File',
      dataIndex: 'file_path',
      key: 'file_path',
      ellipsis: true,
      render: (v: string | undefined) => v ? <code>{v}</code> : '-',
    },
  ];

  return (
    <Table
      dataSource={failures}
      columns={columns}
      rowKey="id"
      size="small"
      pagination={false}
    />
  );
}
