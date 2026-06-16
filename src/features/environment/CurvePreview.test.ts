import { describe, expect, it } from 'vitest';
import { buildCurveOption } from './CurvePreview';

describe('buildCurveOption', () => {
  it('keeps the legacy backend axis objects and series data', () => {
    const option = buildCurveOption({
      XAxis: {
        type: 'category',
        boundaryGap: false,
        data: [0, 1, 2],
        axisLabel: { formatter: '{value} m/s' },
      },
      YAxis: { max: '133' },
      series: [{ type: 'line', name: '风机出力', data: [0, 50, 100] }],
    }, 'kWh');

    expect(option.xAxis).toMatchObject({
      type: 'category',
      boundaryGap: false,
      data: [0, 1, 2],
      axisLabel: { formatter: '{value} m/s' },
    });
    expect(option.yAxis).toMatchObject({ type: 'value', name: 'kWh', max: '133' });
    expect(option.series).toEqual([{ type: 'line', name: '风机出力', data: [0, 50, 100] }]);
    expect(option.color).toEqual(['#0f766e', '#2563eb', '#d97706']);
    expect(option.grid).toEqual({ left: 56, right: 24, top: 28, bottom: 68 });
  });
});
