// Example: Using DataTableFilterList for advanced filtering
import { DataTableFilterList } from '../src/components/data-table-filter-list';
import { useState } from 'react';

export default function FilterListUsageExample() {
  // You would normally provide a table and config instance
  const table = {} as any;
  const config = {} as any;
  return <DataTableFilterList table={table} debounceMs={300} config={config} />;
}
