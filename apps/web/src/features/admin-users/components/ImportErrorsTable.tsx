import type { ImportRowError } from '@lms/shared';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';

/** `row = 0` — butun faylga oid xato (docs/12 §2.1). */
function rowLabel(row: number): string {
  return row === 0 ? 'Fayl' : String(row);
}

/** CSV import xatolari: qator raqami, ustun, xabar. */
export function ImportErrorsTable({ errors }: { errors: readonly ImportRowError[] }) {
  return (
    <Table scrollLabel="CSV xatolari">
      <TableHeader>
        <TableRow>
          <TableHead>Qator</TableHead>
          <TableHead>Ustun</TableHead>
          <TableHead>Xato</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {errors.map((error, index) => (
          <TableRow key={`${String(error.row)}-${error.field}-${String(index)}`}>
            <TableCell>{rowLabel(error.row)}</TableCell>
            <TableCell>{error.field === '' ? '—' : error.field}</TableCell>
            <TableCell>{error.message}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
