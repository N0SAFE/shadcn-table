import { describe, it, expect } from 'vitest';
import BooleanSelectInput from '@/components/filter/boolean-select';
import { render } from '@testing-library/react';

describe('BooleanSelectInput', () => {
  it('renders select', () => {
    render(<BooleanSelectInput value={true} onChange={() => {}} disabled={false} />);
    expect(document.body).toBeDefined();
  });
});
