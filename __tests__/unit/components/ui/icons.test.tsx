import { describe, it, expect } from 'vitest';
import { Icons } from '../../../../src/components/ui/icons';

// Only a smoke test as Icons is a collection of functions

describe('Icons', () => {
  it('exports gitHub icon', () => {
    expect(Icons.gitHub).toBeDefined();
  });
});
