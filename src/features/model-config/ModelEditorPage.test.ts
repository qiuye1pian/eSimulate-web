import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(resolve(__dirname, 'ModelEditorPage.tsx'), 'utf8');

describe('ModelEditorPage workspace structure', () => {
  it('provides stable regions for the model catalog, curve, and parameters', () => {
    expect(source).toContain('model-workspace__catalog');
    expect(source).toContain('model-workspace__chart');
    expect(source).toContain('model-workspace__parameters');
    expect(source).toContain('model-parameter-grid');
  });

  it('keeps shared economic and environmental fields in a consistent group', () => {
    expect(source).toContain('经济与环境');
    expect(source).toContain('technicalFields');
    expect(source).toContain('sharedFields');
    expect(source).toContain('model-parameter-section');
  });

  it('places save and reset actions in the parameter panel heading', () => {
    expect(source).toContain('model-panel-heading__actions');
    expect(source).toContain('model-panel-heading__context');
    expect(source).not.toContain("'编辑模式' : '新增模式'");
    expect(source).not.toContain('model-parameter-actions');
  });

  it('only warns about unsaved data after the user changes a field', () => {
    expect(source).toContain('const [isDirty, setIsDirty] = useState(false)');
    expect(source).toContain('if (isDirty)');
    expect(source).toContain('setIsDirty(true)');
    expect(source).not.toContain('form.isFieldsTouched()');
  });
});
