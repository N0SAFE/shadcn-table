// Example: Using DataTableToolbar with filters
import { DataTableToolbar } from '../src/components/data-table-toolbar';
import { useState } from 'react';

export default function ToolbarUsageExample() {
  // You would normally provide a table and config instance
  const table = {} as any;
  const config = {} as any;
  return <DataTableToolbar table={table} config={config} />;
}
