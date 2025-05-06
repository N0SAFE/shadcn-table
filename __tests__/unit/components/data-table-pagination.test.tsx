import { describe, it, expect } from 'vitest';
import { DataTablePagination } from '../../../src/components/data-table-pagination';
import { render } from '@testing-library/react';

describe('DataTablePagination', () => {
  it('renders pagination container', () => {
    const table = {
      setPageSize: () => {},
      getFilteredSelectedRowModel: () => ({ rows: [] }),
      getFilteredRowModel: () => ({ rows: [] }),
      previousPage: () => {},
      nextPage: () => {},
      getCanPreviousPage: () => false,
      getCanNextPage: () => false,
      getPageCount: () => 1,
      getState: () => ({ pagination: { pageIndex: 0, pageSize: 10 } }),
      setPageIndex: () => {},
    } as any;
    render(<DataTablePagination table={table} />);
    expect(document.querySelector('.flex')).toBeTruthy();
  });
});
