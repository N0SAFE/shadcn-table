import { describe, it, expect } from 'vitest';
import { SelectFilter } from '@/components/filter/new-select-filter';
import { render } from '@testing-library/react';

describe('SelectFilter', () => {
  it('renders without crashing', () => {
    render(<SelectFilter value="" onChange={() => {}} operator="eq" meta={() => ({ options: [], placeholder: 'Select...' })} label="Test" />);
    expect(document.body).toBeDefined();
  });
});
