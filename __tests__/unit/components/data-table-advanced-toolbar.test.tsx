import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DataTableAdvancedToolbar } from '../../../src/components/data-table-advanced-toolbar';

describe('DataTableAdvancedToolbar', () => {
  it('renders without crashing', () => {
    // Minimal required props
    const table = {
      getState: () => ({ sorting: [] }),
      initialState: { sorting: [] },
      options: {},
      getAllColumns: () => [],
    } as any;
    const instance = { actions: {}, config: { adapter: {}, filters: { value: [] } } } as any;
    render(
      <DataTableAdvancedToolbar table={table} instance={instance} />
    );
    expect(screen.getByRole('toolbar', { hidden: true })).toBeDefined();
  });
});
