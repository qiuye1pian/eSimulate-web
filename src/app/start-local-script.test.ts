import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const scriptPath = resolve(__dirname, '../../start-local.sh');

describe('start-local.sh', () => {
  it('starts the local Vite dev server from the project directory', () => {
    const stat = statSync(scriptPath);
    const content = readFileSync(scriptPath, 'utf8');

    expect(stat.mode & 0o111).toBeGreaterThan(0);
    expect(content).toContain('set -euo pipefail');
    expect(content).toContain('cd "$SCRIPT_DIR"');
    expect(content).toContain('npm install');
    expect(content).toContain('API_PROXY_TARGET="${1:-${VITE_API_PROXY_TARGET:-http://39.97.247.145:8080}}"');
    expect(content).toContain('export VITE_API_PROXY_TARGET="$API_PROXY_TARGET"');
    expect(content).toContain('npm run dev -- --host 0.0.0.0');
  });
});
