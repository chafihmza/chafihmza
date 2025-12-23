import { describe, it, expect } from 'vitest';
import { normalizeRemotePath } from '../src/utils/path.js';

describe('path normalization', () => {
  it('keeps within base path', () => {
    const base = '/home/uploads';
    const target = '../uploads/file.txt';
    const normalized = normalizeRemotePath(base, target);
    expect(normalized).toBe('/home/uploads/file.txt');
  });

  it('rejects traversal', () => {
    const base = '/data';
    expect(() => normalizeRemotePath(base, '../../etc/passwd')).toThrow();
  });
});
