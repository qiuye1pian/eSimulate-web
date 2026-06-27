import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(resolve(__dirname, 'OptimizationPage.tsx'), 'utf8');

describe('OptimizationPage migration', () => {
  it('implements PSO workflow instead of rendering the placeholder copy', () => {
    expect(source).not.toContain('复刻旧版 PSO 寻优任务提交、轮询、取消和结果表格展示流程。');
    expect(source).toContain('buildOptimizationRequest');
    expect(source).toContain('getOptimizationTaskState');
    expect(source).toContain('cancelOptimizationTask');
    expect(source).toContain('normalizeOptimizationResult');
    expect(source).toContain('开始寻优');
    expect(source).toContain('寻优结果');
  });
});
