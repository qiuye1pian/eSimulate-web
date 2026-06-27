import { useEffect, useRef } from 'react';
import { Card, Col, Empty, Row, Statistic } from 'antd';
import type { ApiRecord } from '@/types/api';
import type { NormalizedSimulationResult, SimulationIndicator, SimulationPieIndicator } from './simulation-utils';

function normalizeObject(value: unknown): ApiRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as ApiRecord : {};
}

export function buildPieOption(indicator: SimulationPieIndicator) {
  return {
    color: ['#0f766e', '#cbd5e1'],
    title: {
      text: indicator.label,
      left: 'center',
      top: 8,
      textStyle: { color: '#172033', fontSize: 14, fontWeight: 700 },
    },
    tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
    legend: {
      bottom: 8,
      left: 'center',
      textStyle: { color: '#64748b' },
    },
    series: [
      {
        type: 'pie',
        radius: ['42%', '66%'],
        center: ['50%', '50%'],
        data: [
          { value: indicator.partOneValue, name: indicator.partOne },
          { value: indicator.partTwoValue, name: indicator.partTwo },
        ],
        label: { formatter: '{d}%' },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(15, 23, 42, 0.18)',
          },
        },
      },
    ],
  };
}

export function buildStackedChartOption(data: unknown, energyLabel: string) {
  const chartData = normalizeObject(data);
  return {
    color: ['#0f766e', '#2563eb', '#d97706', '#7c3aed', '#dc2626', '#0891b2', '#65a30d'],
    title: {
      text: `生产运行模拟示意图(${energyLabel})`,
      textStyle: { color: '#172033', fontSize: 15, fontWeight: 700 },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross', label: { backgroundColor: '#64748b' } },
    },
    legend: {
      type: 'scroll',
      top: 28,
      textStyle: { color: '#64748b' },
    },
    toolbox: { feature: { saveAsImage: {} } },
    grid: { left: 56, right: 28, top: 80, bottom: 54 },
    xAxis: Object.keys(chartData).length ? [chartData.XAxis] : [{ type: 'category', boundaryGap: false, data: [] }],
    yAxis: [
      {
        type: 'value',
        splitLine: { lineStyle: { color: '#e8edf3' } },
        axisLabel: { color: '#64748b' },
      },
    ],
    series: Array.isArray(chartData.series) ? chartData.series : [],
  };
}

interface ChartPanelProps {
  option?: Record<string, unknown>;
  className?: string;
  emptyText: string;
}

function ChartPanel({ option, className, emptyText }: ChartPanelProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chartRef.current || !option) {
      return undefined;
    }

    let disposed = false;
    let cleanup: (() => void) | undefined;

    import('echarts').then((echarts) => {
      if (!chartRef.current || disposed) {
        return;
      }
      const chart = echarts.init(chartRef.current);
      chart.setOption(option as Parameters<typeof chart.setOption>[0]);
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
  }, [option]);

  if (!option) {
    return <Empty description={emptyText} />;
  }

  return <div className={className ?? 'simulation-chart'} ref={chartRef} />;
}

function getIndicatorDescription(indicator: SimulationIndicator) {
  return String(indicator.description ?? indicator.indicationName ?? '-');
}

function getIndicatorValue(indicator: SimulationIndicator) {
  const value = Number(indicator.indication);
  return Number.isFinite(value) ? value : 0;
}

export function SimulationResultPanel({ result }: { result?: NormalizedSimulationResult }) {
  if (!result) {
    return <Empty description="运行仿真后展示结果" />;
  }

  return (
    <div className="simulation-results">
      <Row gutter={[12, 12]}>
        {result.statIndicators.length ? result.statIndicators.map(indicator => (
          <Col xs={24} md={12} key={String(indicator.indicationName ?? indicator.description)}>
            <Card>
              <Statistic
                title={getIndicatorDescription(indicator)}
                value={getIndicatorValue(indicator)}
                precision={2}
                valueStyle={{ color: '#0f766e' }}
              />
            </Card>
          </Col>
        )) : (
          <Col span={24}>
            <Empty description="暂无指标数据" />
          </Col>
        )}
      </Row>

      <div className="simulation-pie-grid">
        {result.pieIndicators.length ? result.pieIndicators.map(indicator => (
          <Card key={indicator.indicationName}>
            <ChartPanel
              className="simulation-pie-chart"
              option={buildPieOption(indicator)}
              emptyText="暂无占比数据"
            />
          </Card>
        )) : <Empty description="暂无占比数据" />}
      </div>

      <Card>
        <ChartPanel
          option={buildStackedChartOption(result.electricStackedChart, '电')}
          emptyText="暂无电侧运行图"
        />
      </Card>

      <Card>
        <ChartPanel
          option={buildStackedChartOption(result.thermalStackedChart, '热')}
          emptyText="暂无热侧运行图"
        />
      </Card>
    </div>
  );
}
