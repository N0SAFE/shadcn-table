import { directusFilterAdapter } from '@/utils/adapter/directus-filter-adapter';
import { describe, it, expect } from 'vitest';

describe('directusFilterAdapter', () => {
  it('should have text filter type', () => {
    expect(directusFilterAdapter.value).toHaveProperty('text');
  });
  it('should throw if filter type not found', () => {
    expect(() => directusFilterAdapter.getFilterTypeDef('not-exist' as any)).toThrow();
  });
  it('should return filter type def for text', () => {
    const def = directusFilterAdapter.getFilterTypeDef('text');
    expect(def).toHaveProperty('operators');
    expect(def).toHaveProperty('defaultOperator');
  });
});
