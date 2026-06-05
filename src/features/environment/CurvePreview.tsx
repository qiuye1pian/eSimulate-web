import { useEffect, useRef } from 'react';
import { Empty, Spin } from 'antd';
import type { ApiRecord } from '@/types/api';

interface CurvePreviewProps {
  data?: ApiRecord;
  loading?: boolean;
  unit?: string;
}

function normalizeArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function CurvePreview({ data, loading = false, unit }: CurvePreviewProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chartRef.current || !data) {
      return undefined;
    }

    let disposed = false;
    let cleanup: (() => void) | undefined;

    import('echarts').then((echarts) => {
      if (!chartRef.current || disposed) {
        return;
      }

      const chart = echarts.init(chartRef.current);
      const xAxis = normalizeArray(data.XAxis);
      const series = normalizeArray(data.series);
      const yAxis = data.YAxis && typeof data.YAxis === 'object' ? data.YAxis : {};

      chart.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: 48, right: 24, top: 32, bottom: 64 },
        xAxis: { type: 'category', boundaryGap: false, data: xAxis },
        yAxis: { type: 'value', name: unit, ...yAxis },
        dataZoom: [
          { type: 'slider', start: 0, end: 100 },
          { type: 'inside', start: 0, end: 100 },
        ],
        series,
      });

      const resize = () => chart.resize();
      window.addEventListener('resize', resize);

      cleanup = () => {
        window.removeEventListener('resize', resize);
        chart.dispose();
      };
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [data, unit]);

  if (!data) {
    return <Empty description="选择一条数据后预览曲线" />;
  }

  return (
    <Spin spinning={loading}>
      <div ref={chartRef} style={{ height: 360, width: '100%' }} />
    </Spin>
  );
}
