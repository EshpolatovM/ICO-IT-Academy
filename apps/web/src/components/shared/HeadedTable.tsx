import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui';

import type { ReactNode } from 'react';

/** Amallar ustuni sarlavhasi bo'sh — `key` uchun nom. */
const EMPTY_HEADER_KEY = 'actions';

export interface HeadedTableProps {
  /** Scroll hududi nomi (`Table` `scrollLabel`). */
  label: string;
  headers: readonly string[];
  /** `TableRow` lar yoki `TableEmpty`. */
  children: ReactNode;
}

/** Oddiy (saralanmaydigan) jadval: sarlavhalar qatori + tana. */
export function HeadedTable({ label, headers, children }: HeadedTableProps) {
  return (
    <Table scrollLabel={label}>
      <TableHeader>
        <TableRow>
          {headers.map((header) => (
            <TableHead key={header === '' ? EMPTY_HEADER_KEY : header}>{header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>{children}</TableBody>
    </Table>
  );
}
