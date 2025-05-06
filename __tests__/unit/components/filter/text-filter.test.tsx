import { describe, it, expect } from 'vitest';
import { TextFilter } from '@/components/filter/text-filter';
import { render } from '@testing-library/react';

describe('TextFilter', () => {
  it('renders without crashing', () => {
    render(<TextFilter value="" onChange={() => {}} operator="eq" meta={{ placeholder: 'Filter...', test: '' }} label="Test" />);
    expect(document.body).toBeDefined();
  });
});
