import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormulaPanel } from './FormulaPanel';
import type { ModelFormulaDefinition } from './types';

const formula: ModelFormulaDefinition = {
  title: '小水电机组配置',
  rows: [
    {
      tokens: [
        { text: 'η1', fieldKey: 'turbineEfficiency' },
        { text: '×' },
        { text: 'η2', fieldKey: 'generatorEfficiency' },
      ],
    },
  ],
};

describe('FormulaPanel', () => {
  it('renders model formulas and highlights the active field token', () => {
    render(<FormulaPanel formula={formula} activeField="turbineEfficiency" />);

    expect(screen.getByText('小水电机组配置')).toBeInTheDocument();
    expect(screen.getByText('η1')).toHaveClass('model-formula-token--active');
    expect(screen.getByText('η2')).not.toHaveClass('model-formula-token--active');
  });
});
