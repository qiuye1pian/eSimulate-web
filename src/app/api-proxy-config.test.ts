import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = resolve(__dirname, '../..');

describe('local API proxy configuration', () => {
  it('keeps browser requests relative and proxies them to the local backend', () => {
    const viteConfig = readFileSync(resolve(projectRoot, 'vite.config.ts'), 'utf8');
    const envExample = readFileSync(resolve(projectRoot, '.env.example'), 'utf8');

    expect(viteConfig).toContain("env.VITE_API_PROXY_TARGET || 'http://localhost:8080'");
    expect(viteConfig).toContain('target: apiProxyTarget');
    expect(envExample).toContain('VITE_API_BASE_URL=');
    expect(envExample).toContain('VITE_API_PROXY_TARGET=http://localhost:8080');
  });
});
