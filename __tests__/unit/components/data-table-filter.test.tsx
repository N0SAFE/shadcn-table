import { describe, it, expect } from 'vitest';
import { DataTableFilter } from '../../../src/components/data-table-filter';
import { render } from '@testing-library/react';

describe('DataTableFilter', () => {
  it('renders without crashing', () => {
    const instance = { actions: {}, config: { adapter: {}, filters: { value: [] } } } as any;
    render(<DataTableFilter instance={instance} />);
    expect(document.body).toBeDefined();
  });
});
