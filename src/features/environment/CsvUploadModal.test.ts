import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(resolve(__dirname, 'CsvUploadModal.tsx'), 'utf8');

describe('CsvUploadModal', () => {
  it('uses a real Ant Design upload button instead of an unstyled span', () => {
    expect(source).toContain('UploadOutlined');
    expect(source).toContain('<Button');
    expect(source).toContain('csv-upload-picker');
    expect(source).not.toContain('className="ant-btn"');
  });
});
