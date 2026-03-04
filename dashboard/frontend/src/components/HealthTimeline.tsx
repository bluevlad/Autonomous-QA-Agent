import { Tooltip } from 'antd';
import type { TimelinePoint } from '../api/client';

interface Props {
  timeline: TimelinePoint[];
}

export default function HealthTimeline({ timeline }: Props) {
  const sorted = [...timeline].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      {sorted.map((point) => {
        const passRate = point.total > 0 ? (point.passed / point.total) * 100 : 0;
        let color = '#d9d9d9';
        if (point.healthy && passRate >= 90) color = '#52c41a';
        else if (point.healthy && passRate >= 70) color = '#a0d911';
        else if (point.healthy) color = '#faad14';
        else color = '#ff4d4f';

        return (
          <Tooltip
            key={point.date}
            title={
              <>
                <div>{point.date}</div>
                <div>{point.healthy ? 'Healthy' : 'Down'}</div>
                <div>Pass: {point.passed}/{point.total}</div>
                {point.responseTimeMs && <div>RT: {point.responseTimeMs}ms</div>}
              </>
            }
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 3,
                backgroundColor: color,
                cursor: 'pointer',
              }}
            />
          </Tooltip>
        );
      })}
    </div>
  );
}
