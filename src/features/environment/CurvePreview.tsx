import { useEffect, useRef } from 'react';
import { Empty, Spin } from 'antd';
import type { ApiRecord } from '@/types/api';

interface CurvePreviewProps {
  data?: ApiRecord;
  loading?: boolean;
  unit?: string;
}

function normalizeObject(value: unknown): ApiRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as ApiRecord : {};
}

export function buildCurveOption(data: ApiRecord, unit?: string) {
  const xAxis = normalizeObject(data.XAxis);
  const yAxis = normalizeObject(data.YAxis);
  const series = Array.isArray(data.series) ? data.series : [];

  return {
    color: ['#0f766e', '#2563eb', '#d97706'],
    tooltip: { trigger: 'axis' },
    grid: { left: 56, right: 24, top: 28, bottom: 68 },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#cbd5e1' } },
      axisLabel: { color: '#64748b' },
      ...xAxis,
    },
    yAxis: {
      type: 'value',
      name: unit,
      nameTextStyle: { color: '#475569', padding: [0, 0, 4, 0] },
      splitLine: { lineStyle: { color: '#e8edf3' } },
      axisLabel: { color: '#64748b' },
      ...yAxis,
    },
    dataZoom: [
      { type: 'slider', start: 0, end: 100 },
      { type: 'inside', start: 0, end: 100 },
    ],
    series,
  };
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
      chart.setOption(buildCurveOption(data, unit));

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
      <div className="curve-preview" ref={chartRef} />
    </Spin>
  );
}
