import { describe, it, expect } from 'vitest';
import { DataTableSkeleton } from '../../../src/components/data-table-skeleton';
import { render } from '@testing-library/react';

describe('DataTableSkeleton', () => {
  it('renders skeleton', () => {
    render(<DataTableSkeleton columnCount={3} />);
    expect(document.querySelector('.animate-pulse')).toBeTruthy();
  });
});
