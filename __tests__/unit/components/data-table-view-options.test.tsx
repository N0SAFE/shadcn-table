import { describe, it, expect } from 'vitest';
import { DataTableViewOptions } from '../../../src/components/data-table-view-options';
import { render } from '@testing-library/react';

describe('DataTableViewOptions', () => {
  it('renders without crashing', () => {
    const table = {
      getState: () => ({}),
      getAllColumns: () => [
        {
          id: 'col1',
          accessorFn: () => {},
          getCanHide: () => true,
          getIsVisible: () => true,
          toggleVisibility: () => {},
        },
      ],
    } as any;
    render(<DataTableViewOptions table={table} />);
    expect(document.body).toBeDefined();
  });
});
