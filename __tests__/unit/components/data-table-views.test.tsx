import { describe, it, expect } from 'vitest';
import { DataTableViews } from '../../../src/components/data-table-views';
import { render } from '@testing-library/react';

describe('DataTableViews', () => {
  it('renders without crashing', () => {
    const table = { getState: () => ({}) } as any;
    render(
      <DataTableViews
        table={table}
        tableId="test-table"
        filters={[]}
        joinOperator="and"
        onViewChange={() => {}}
      />
    );
    expect(document.body).toBeDefined();
  });
});
