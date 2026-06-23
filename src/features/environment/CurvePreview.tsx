import { useEffect, useRef } from 'react';
import { Empty, Spin } from 'antd';
import type { ApiRecord } from '@/types/api';

interface CurvePreviewProps {
  data?: unknown;
  loading?: boolean;
  type?: 'line' | 'solar-3d';
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

export function buildSolarPower3DOption(data: unknown) {
  const seriesData = Array.isArray(data) ? data : [];

  return {
    tooltip: {
      show: true,
      trigger: 'item',
      formatter(params: { data?: unknown[] }) {
        const point = Array.isArray(params.data) ? params.data : [];
        return [
          `温度: ${point[0] ?? '-'} ℃<br/>`,
          `辐照强度: ${point[1] ?? '-'} W/m²<br/>`,
          `功率: ${point[2] ?? '-'} kW`,
        ].join('');
      },
    },
    xAxis3D: {
      type: 'value',
      name: '温度',
      nameTextStyle: { color: '#475569' },
      axisLabel: { color: '#64748b' },
    },
    yAxis3D: {
      type: 'value',
      name: '辐照强度',
      nameTextStyle: { color: '#475569' },
      axisLabel: { color: '#64748b' },
    },
    zAxis3D: {
      type: 'value',
      name: '功率',
      nameTextStyle: { color: '#475569' },
      axisLabel: { color: '#64748b' },
    },
    grid3D: {
      environment: '#ffffff',
      boxWidth: 150,
      boxDepth: 82,
      viewControl: { projection: 'perspective', alpha: 24, beta: 38, distance: 220 },
      light: {
        main: { intensity: 1.1, shadow: true },
        ambient: { intensity: 0.35 },
      },
    },
    series: [
      {
        type: 'bar3D',
        data: seriesData,
        barSize: 3,
        bevelSize: 0.25,
        bevelSmoothness: 2,
        shading: 'lambert',
        itemStyle: { color: '#f59e0b' },
        emphasis: { itemStyle: { color: '#fbbf24' }, label: { show: false } },
      },
    ],
  };
}

export function CurvePreview({ data, loading = false, type = 'line', unit }: CurvePreviewProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chartRef.current || !data) {
      return undefined;
    }

    let disposed = false;
    let cleanup: (() => void) | undefined;

    import('echarts').then(async (echarts) => {
      if (!chartRef.current || disposed) {
        return;
      }

      if (type === 'solar-3d') {
        await import('echarts-gl');
      }

      if (!chartRef.current || disposed) {
        return;
      }

      const chart = echarts.init(chartRef.current);
      chart.setOption(type === 'solar-3d' ? buildSolarPower3DOption(data) : buildCurveOption(data as ApiRecord, unit));

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
