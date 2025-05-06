// Example: Using DataTableAdvancedToolbar for advanced filtering
import { DataTableAdvancedToolbar } from '../src/components/data-table-advanced-toolbar';
import { useState } from 'react';

export default function AdvancedFilterExample() {
  // You would normally provide a table and config instance
  const table = {} as any;
  const config = {} as any;
  return <DataTableAdvancedToolbar table={table} config={config} />;
}
