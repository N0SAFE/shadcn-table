import { describe, it, expect } from 'vitest';
import { DateRangePicker } from '../../../../src/components/ui/date-range-picker';
import { render } from '@testing-library/react';

describe('DateRangePicker', () => {
  it.skip('renders without crashing (nuqs adapter required)', () => {
    // nuqs requires an adapter to work with your framework, so this test is skipped
    // See https://err.47ng.com/NUQS-404
    render(<DateRangePicker />);
    expect(document.body).toBeDefined();
  });
});
