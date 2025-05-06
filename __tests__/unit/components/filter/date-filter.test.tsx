import { describe, it, expect } from 'vitest';
import { DateFilter } from '@/components/filter/date-filter';
import { render } from '@testing-library/react';

describe('DateFilter', () => {
  it('renders without crashing', () => {
    render(<DateFilter value={null} onChange={() => {}} operator="eq" label="Test" />);
    expect(document.body).toBeDefined();
  });
});
