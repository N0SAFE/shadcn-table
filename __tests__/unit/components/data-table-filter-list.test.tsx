import { describe, it, expect } from 'vitest';
import { DataTableFilterList } from '../../../src/components/data-table-filter-list';
import { render } from '@testing-library/react';

describe('DataTableFilterList', () => {
  it('renders without crashing', () => {
    const instance = { actions: { generateFilter: () => {} }, config: { adapter: {}, filters: { value: [] } } } as any;
    render(
      <DataTableFilterList
        selectedFilters={[]}
        setSelectedFilters={() => {}}
        instance={instance}
        filters={[]}
      />
    );
    expect(document.body).toBeDefined();
  });
});
