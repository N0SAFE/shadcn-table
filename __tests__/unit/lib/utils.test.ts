import { describe, it, expect } from 'vitest';
import { cn, formatDate, toSentenceCase, composeEventHandlers } from '../../../src/lib/utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toContain('foo');
    expect(cn('foo', 'bar')).toContain('bar');
  });
});

describe('formatDate', () => {
  it('formats a date string', () => {
    expect(formatDate('2024-01-01')).toMatch(/January|Jan/);
  });
  it('formats a Date object', () => {
    expect(formatDate(new Date('2024-01-01'))).toMatch(/January|Jan/);
  });
});

describe('toSentenceCase', () => {
  it('converts snake_case to sentence case', () => {
    expect(toSentenceCase('foo_bar_baz')).toBe('Foo bar baz');
  });
  it('converts camelCase to sentence case', () => {
    expect(toSentenceCase('fooBarBaz')).toBe('Foo bar baz');
  });
});

describe('composeEventHandlers', () => {
  it('calls both handlers if not prevented', () => {
    let called = '';
    const orig = () => { called += 'a'; };
    const ours = () => { called += 'b'; };
    const handler = composeEventHandlers(orig, ours);
    handler({} as any);
    expect(called).toBe('ab');
  });
  it('does not call ourEventHandler if defaultPrevented is true', () => {
    let called = '';
    const orig = (e: any) => { e.defaultPrevented = true; called += 'a'; };
    const ours = () => { called += 'b'; };
    const handler = composeEventHandlers(orig, ours);
    handler({ defaultPrevented: false } as any);
    expect(called).toBe('a');
  });
});
