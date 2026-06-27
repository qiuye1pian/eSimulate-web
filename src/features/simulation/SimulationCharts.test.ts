import { describe, expect, it } from 'vitest';
import { buildPieOption, buildStackedChartOption } from './SimulationCharts';

describe('simulation chart options', () => {
  it('builds pie option from normalized indicator data', () => {
    const option = buildPieOption({
      indicationName: 'RenewableEnergyShare',
      label: '可再生能源占比',
      partOne: '可再生能源',
      partTwo: '不可再生能源',
      partOneValue: 70,
      partTwoValue: 30,
    });

    expect(option.title).toMatchObject({ text: '可再生能源占比' });
    expect(option.series[0]).toMatchObject({
      type: 'pie',
      data: [
        { value: 70, name: '可再生能源' },
        { value: 30, name: '不可再生能源' },
      ],
    });
  });

  it('builds stacked chart option from backend chart DTO', () => {
    const option = buildStackedChartOption(
      {
        XAxis: { data: ['00:00'] },
        series: [{ name: '风电', type: 'line', data: [1] }],
      },
      '电',
    );

    expect(option.title).toMatchObject({ text: '生产运行模拟示意图(电)' });
    expect(option.xAxis).toEqual([{ data: ['00:00'] }]);
    expect(option.series).toEqual([{ name: '风电', type: 'line', data: [1] }]);
  });
});
