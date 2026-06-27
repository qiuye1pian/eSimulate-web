import { describe, expect, it } from 'vitest';
import { buildStackedChartOption, getSummaryHelp, getSummaryToneClass } from './SimulationCharts';

describe('simulation chart options', () => {
  it('maps summary tones to stable class names', () => {
    expect(getSummaryToneClass('good')).toBe('simulation-summary-card--good');
    expect(getSummaryToneClass('warning')).toBe('simulation-summary-card--warning');
    expect(getSummaryToneClass('cost')).toBe('simulation-summary-card--cost');
    expect(getSummaryToneClass('emission')).toBe('simulation-summary-card--emission');
  });

  it('explains the annual total cost calculation', () => {
    expect(getSummaryHelp('TotalCost')).toEqual({
      title: '年度总成本计算方法',
      lines: [
        '年度总成本 = 年化投资成本 + 公共电网交互费用 + 年度运行维护费用 + 可控机组启停及运行成本',
        '年化投资成本由各设备建设成本、设备数量、折现率和使用年限折算得到。',
      ],
    });
    expect(getSummaryHelp('CarbonEmission')).toBeUndefined();
  });

  it('builds stacked chart option from backend chart DTO', () => {
    const option = buildStackedChartOption(
      {
        XAxis: { data: ['00:00'] },
        series: [{ name: '风电', type: 'line', data: [1] }],
      },
      '电',
    );

    expect(option.title).toMatchObject({ text: '电侧功率平衡' });
    expect(option.xAxis).toEqual([{ data: ['00:00'] }]);
    expect(option.series).toEqual([{ name: '风电', type: 'line', data: [1] }]);
  });
});
