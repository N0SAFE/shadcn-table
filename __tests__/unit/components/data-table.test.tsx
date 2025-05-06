import { describe, it, expect } from 'vitest';
import { DataTable } from '../../../src/components/data-table';
import { render } from '@testing-library/react';

describe('DataTable', () => {
  it('renders without crashing', () => {
    const table = {
      getState: () => ({
        pagination: {
          pageSize: 10,
          pageIndex: 0,
        }
      }),
      getRowModel: () => ({ rows: [] }),
      getAllColumns: () => [],
      getHeaderGroups: () => [],
      getFilteredSelectedRowModel: () => ({ rows: [] }),
      getFilteredRowModel: () => ({ rows: [] }),
      getPageCount: () => 1,
      getCanPreviousPage: () => false,
      getCanNextPage: () => false,
    } as any;
    render(<DataTable table={table} />);
    expect(document.body).toBeDefined();
  });
});
