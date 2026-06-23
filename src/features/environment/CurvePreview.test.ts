import { describe, expect, it } from 'vitest';
import { buildCurveOption, buildSolarPower3DOption } from './CurvePreview';

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

describe('buildSolarPower3DOption', () => {
  it('builds a 3D photovoltaic output chart from backend point arrays', () => {
    const option = buildSolarPower3DOption([
      [-40, 0, 0],
      [25, 1000, 100],
    ]);

    expect(option.xAxis3D).toMatchObject({ type: 'value', name: '温度' });
    expect(option.yAxis3D).toMatchObject({ type: 'value', name: '辐照强度' });
    expect(option.zAxis3D).toMatchObject({ type: 'value', name: '功率' });
    expect(option.series).toEqual([
      expect.objectContaining({
        type: 'bar3D',
        itemStyle: { color: '#f59e0b' },
        emphasis: { itemStyle: { color: '#fbbf24' }, label: { show: false } },
        data: [
          [-40, 0, 0],
          [25, 1000, 100],
        ],
      }),
    ]);
  });
});
