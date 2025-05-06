import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DataTableDragHandle } from '../../../src/components/data-table-drag-handle';

describe('DataTableDragHandle', () => {
  it('renders drag handle', () => {
    render(<DataTableDragHandle id="row-1" />);
    // Just check it renders, as dnd-kit is hard to test without full context
    expect(document.querySelector('.cursor-grab')).toBeTruthy();
  });
});
