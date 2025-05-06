// Example: Basic usage of DataTable
import { DataTable } from '../src/components/data-table';
import { useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

const users: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
];

export default function BasicDataTableExample() {
  const [data] = useState(users);
  // You would normally provide a table instance from your table library
  const table = {} as any;
  return <DataTable table={table} />;
}
