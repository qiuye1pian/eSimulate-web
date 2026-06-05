import { describe, expect, it } from 'vitest';
import { assertApiSuccess } from './request';

describe('assertApiSuccess', () => {
  it('returns successful old backend responses', () => {
    const response = { code: 200, data: { id: 1 }, message: 'ok' };

    expect(assertApiSuccess(response)).toBe(response);
  });

  it('throws for non-200 business codes', () => {
    expect(() => assertApiSuccess({ code: 500, data: null, message: '保存失败' })).toThrow('保存失败');
  });

  it('uses msg when message is absent', () => {
    expect(() => assertApiSuccess({ code: 401, data: null, msg: '登录过期' })).toThrow('登录过期');
  });
});
