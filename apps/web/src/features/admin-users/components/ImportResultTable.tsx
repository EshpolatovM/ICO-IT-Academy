import type { ImportedStudent } from '@lms/shared';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';

import { fullName } from '../lib/format';

/** Import natijasi: yaratilgan studentlar va vaqtinchalik parollari (BIR MARTA ko'rsatiladi). */
export function ImportResultTable({ students }: { students: readonly ImportedStudent[] }) {
  return (
    <Table scrollLabel="Yaratilgan studentlar">
      <TableHeader>
        <TableRow>
          <TableHead>Student ID</TableHead>
          <TableHead>Ism-familiya</TableHead>
          <TableHead>Guruh</TableHead>
          <TableHead>Vaqtinchalik parol</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.id}>
            <TableCell>{student.studentCode}</TableCell>
            <TableCell>{fullName(student)}</TableCell>
            <TableCell>{student.groupName ?? '—'}</TableCell>
            <TableCell className="font-mono">{student.temporaryPassword}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
