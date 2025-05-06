// Example: Using useDebouncedCallback hook
import { useDebouncedCallback } from '../src/hooks/use-debounced-callback';
import { useState } from 'react';

export default function UseDebouncedCallbackExample() {
  const [value, setValue] = useState('');
  const debouncedLog = useDebouncedCallback((val: string) => {
    // This would be debounced
    console.log('Debounced:', val);
  }, 500);
  return (
    <div>
      <input value={value} onChange={e => {
        setValue(e.target.value);
        debouncedLog(e.target.value);
      }} />
    </div>
  );
}
