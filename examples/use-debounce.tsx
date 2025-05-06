// Example: Using useDebounce hook
import { useDebounce } from '../src/hooks/use-debounce';
import { useState } from 'react';

export default function UseDebounceExample() {
  const [value, setValue] = useState('');
  const debouncedValue = useDebounce(value, 500);
  return (
    <div>
      <input value={value} onChange={e => setValue(e.target.value)} />
      <div>Debounced: {debouncedValue}</div>
    </div>
  );
}
