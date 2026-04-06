import { extractFlag } from './args.ts';

describe('extractFlag', () => {
  it('extracts flag and its value', () => {
    const result = extractFlag(['--storage', 'github', '/path'], '--storage');

    expect(result.value).toBe('github');
    expect(result.rest).toEqual(['/path']);
  });

  it('returns undefined when flag not present', () => {
    const result = extractFlag(['/path'], '--storage');

    expect(result.value).toBeUndefined();
    expect(result.rest).toEqual(['/path']);
  });

  it('handles flag at end of args', () => {
    const result = extractFlag(['/path', '--storage', 'github'], '--storage');

    expect(result.value).toBe('github');
    expect(result.rest).toEqual(['/path']);
  });

  it('returns original args when flag absent', () => {
    const args = ['a', 'b', 'c'];
    const result = extractFlag(args, '--missing');

    expect(result.rest).toEqual(['a', 'b', 'c']);
  });

  it('handles flag without value', () => {
    const result = extractFlag(['--storage'], '--storage');

    expect(result.value).toBeUndefined();
    expect(result.rest).toEqual([]);
  });
});
