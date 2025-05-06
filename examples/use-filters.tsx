// Example: Using useFilters hook
import { useFilters } from '../src/hooks/use-filters';

export default function UseFiltersExample() {
  // You would normally provide a config and onChange handler
  const { filters, addFilter, removeFilter } = useFilters({ config: {} as any });
  return (
    <div>
      <h2>Filters</h2>
      <button onClick={() => addFilter({ id: '1', type: 'text', value: '', operator: 'eq' })}>
        Add Filter
      </button>
      <ul>
        {filters.map((filter) => (
          <li key={filter.id}>{filter.type}</li>
        ))}
      </ul>
    </div>
  );
}
