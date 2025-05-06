import { describe, it, expect } from 'vitest';
import { DataTableToolbar } from '../../../src/components/data-table-toolbar';
import { render } from '@testing-library/react';

describe('DataTableToolbar', () => {
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
    const instance = { actions: {}, config: { adapter: {}, filters: { value: [] } } } as any;
    render(
      <DataTableToolbar
        table={table}
        instance={instance}
        filters={[]}
        joinOperator="and"
      />
    );
    expect(document.body).toBeDefined();
  });
});
