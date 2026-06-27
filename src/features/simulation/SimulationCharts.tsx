import { useEffect, useRef } from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Alert, Card, Empty, Popover, Progress } from 'antd';
import type { ApiRecord } from '@/types/api';
import type {
  NormalizedSimulationResult,
  SimulationIndicatorTone,
  SimulationSummaryIndicator,
} from './simulation-utils';

function normalizeObject(value: unknown): ApiRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as ApiRecord : {};
}

export function buildStackedChartOption(data: unknown, energyLabel: string) {
  const chartData = normalizeObject(data);
  const titleText = energyLabel === '电' ? '电侧功率平衡' : '热侧供需平衡';
  return {
    color: ['#0f766e', '#2563eb', '#d97706', '#7c3aed', '#dc2626', '#0891b2', '#65a30d'],
    title: {
      text: titleText,
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

export function getSummaryToneClass(tone: SimulationIndicatorTone) {
  return `simulation-summary-card--${tone}`;
}

export function getSummaryHelp(indicationName: string) {
  if (indicationName !== 'TotalCost') {
    return undefined;
  }
  return {
    title: '年度总成本计算方法',
    lines: [
      '年度总成本 = 年化投资成本 + 公共电网交互费用 + 年度运行维护费用 + 可控机组启停及运行成本',
      '年化投资成本由各设备建设成本、设备数量、折现率和使用年限折算得到。',
    ],
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

function getProgressColor(tone: SimulationIndicatorTone) {
  if (tone === 'warning') {
    return '#d97706';
  }
  if (tone === 'good') {
    return '#0f766e';
  }
  return '#2563eb';
}

function SimulationSummaryCard({ indicator }: { indicator: SimulationSummaryIndicator }) {
  const isPercent = indicator.unit === '%';
  const help = getSummaryHelp(indicator.indicationName);

  return (
    <Card className={`simulation-summary-card ${getSummaryToneClass(indicator.tone)}`}>
      <div className="simulation-summary-card__label">
        <span>{indicator.label}</span>
        {help ? (
          <Popover
            title={help.title}
            content={(
              <div className="simulation-summary-help">
                {help.lines.map(line => <p key={line}>{line}</p>)}
              </div>
            )}
          >
            <QuestionCircleOutlined className="simulation-summary-card__help" />
          </Popover>
        ) : null}
      </div>
      <div className="simulation-summary-card__value">
        <strong>{indicator.formattedValue}</strong>
        <span>{indicator.unit}</span>
      </div>
      {indicator.magnitudeText ? (
        <div className="simulation-summary-card__magnitude">{indicator.magnitudeText}</div>
      ) : null}
      {isPercent ? (
        <Progress
          percent={indicator.value}
          size="small"
          strokeColor={getProgressColor(indicator.tone)}
          showInfo={false}
        />
      ) : null}
    </Card>
  );
}

export function SimulationResultPanel({ result }: { result?: NormalizedSimulationResult }) {
  if (!result) {
    return <Empty description="运行仿真后展示结果" />;
  }

  if (result.resultType === 'FAILED') {
    return (
      <Alert
        showIcon
        type="warning"
        message="仿真失败"
        description={result.message || '请检查负荷、模型、环境和数量配置后重新运行。'}
      />
    );
  }

  return (
    <div className="simulation-results">
      {result.summaryIndicators.length ? (
        <div className="simulation-summary-grid">
          {result.summaryIndicators.map(indicator => (
            <SimulationSummaryCard key={indicator.indicationName} indicator={indicator} />
          ))}
        </div>
      ) : <Empty description="暂无指标数据" />}

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
