import { describe, it, expect } from 'vitest';
import { DataTableSortList } from '../../../src/components/data-table-sort-list';
import { render } from '@testing-library/react';

describe('DataTableSortList', () => {
  it('renders without crashing', () => {
    const table = {
      getState: () => ({ sorting: [] }),
      initialState: {},
      getAllColumns: () => [
        { id: 'col1', getCanSort: () => true, columnDef: { header: 'Col 1' } },
        { id: 'col2', getCanSort: () => true, columnDef: { header: 'Col 2' } },
      ],
      setSorting: () => {},
    } as any;
    render(<DataTableSortList table={table} debounceMs={300} />);
    expect(document.body).toBeDefined();
  });
});
