import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CsvUploadModal } from './CsvUploadModal';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('CsvUploadModal state reset', () => {
  it('clears scheme name and selected file after the parent closes and reopens it for another resource', async () => {
    const props = {
      uploading: false,
      onCancel: vi.fn(),
      onSubmit: vi.fn(),
    };
    const { rerender } = render(
      <CsvUploadModal open title="光照数据" {...props} />,
    );

    fireEvent.change(screen.getByPlaceholderText('请输入方案名称'), {
      target: { value: '晴天光照' },
    });

    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();

    fireEvent.change(fileInput as HTMLInputElement, {
      target: {
        files: [new File(['时间,负荷值\n2026-01-01 00:00:00,1'], 'sunlight.csv', { type: 'text/csv' })],
      },
    });

    expect(screen.getByDisplayValue('晴天光照')).toBeInTheDocument();
    expect(screen.getByText('sunlight.csv')).toBeInTheDocument();

    rerender(<CsvUploadModal open={false} title="光照数据" {...props} />);
    rerender(<CsvUploadModal open title="温度数据" {...props} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('请输入方案名称')).toHaveValue('');
      expect(screen.queryByText('sunlight.csv')).not.toBeInTheDocument();
    });
  });
});
