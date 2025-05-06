import { describe, it, expect } from 'vitest';
import { DataTableEditableCell } from '../../../src/components/data-table-editable-cell';
import { render } from '@testing-library/react';

describe('DataTableEditableCell', () => {
  it('renders without crashing', () => {
    const onValueChange = async () => {};
    render(
      <DataTableEditableCell
        value="test"
        row={{}}
        onValueChange={onValueChange}
      />
    );
    expect(document.body).toBeDefined();
  });
});
