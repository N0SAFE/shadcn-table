import { describe, it, expect } from 'vitest';
import { DataTableSortableRow } from '../../../src/components/data-table-sortable-row';
import { render } from '@testing-library/react';

describe('DataTableSortableRow', () => {
  it('renders without crashing', () => {
    render(
      <DataTableSortableRow id="row-1">
        <td>Row Content</td>
      </DataTableSortableRow>
    );
    expect(document.body).toBeDefined();
  });
});
