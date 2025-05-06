import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DataTableColumnHeader } from '../../../src/components/data-table-column-header';

describe('DataTableColumnHeader', () => {
  it('renders title', () => {
    const column = { getCanSort: () => false, getCanHide: () => false } as any;
    render(<DataTableColumnHeader column={column} title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
