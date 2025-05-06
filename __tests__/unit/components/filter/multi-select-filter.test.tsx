import { describe, it, expect } from 'vitest';
import { MultiSelectFilter } from '@/components/filter/multi-select-filter';
import { render } from '@testing-library/react';

describe('MultiSelectFilter', () => {
  it('renders without crashing', () => {
    render(<MultiSelectFilter value={[]} onChange={() => {}} operator="eq" meta={{ options: [] }} label="Test" />);
    expect(document.body).toBeDefined();
  });
});
