import { describe, it, expect } from 'vitest';
import { Kbd } from '../../../../src/components/ui/kbd';
import { render } from '@testing-library/react';

describe('Kbd', () => {
  it('renders kbd', () => {
    render(<Kbd>⌘</Kbd>);
    expect(document.body).toBeDefined();
  });
});
