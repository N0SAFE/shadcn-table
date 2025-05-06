// Example: Using filter components directly
import { TextFilter } from '../src/components/filter/text-filter';
import { DateFilter } from '../src/components/filter/date-filter';
import { MultiSelectFilter } from '../src/components/filter/multi-select-filter';
import { SelectFilter } from '../src/components/filter/new-select-filter';
import { BooleanSelectInput } from '../src/components/filter/boolean-select';

export default function FilterComponentsExample() {
  // You would normally provide value, onChange, operator, and meta props
  return (
    <div>
      <TextFilter value="" onChange={() => {}} operator="eq" />
      <DateFilter value={null} onChange={() => {}} operator="eq" />
      <MultiSelectFilter value={[]} onChange={() => {}} operator="eq" meta={{ options: [] }} />
      <SelectFilter value="" onChange={() => {}} operator="eq" meta={() => ({ options: [], placeholder: 'Select...' })} />
      <BooleanSelectInput value={true} onChange={() => {}} disabled={false} />
    </div>
  );
}
