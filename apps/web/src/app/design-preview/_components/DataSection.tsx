'use client';

import { useState } from 'react';

import {
  Badge,
  DescriptionList,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@/components/ui';
import type { BadgeVariant, SortDirection } from '@/components/ui';

import { PreviewSection } from './PreviewSection';

const BADGE_VARIANTS: readonly BadgeVariant[] = ['neutral', 'success', 'warning', 'danger', 'info'];

const SAMPLE_ROWS = [
  { id: 'ST-10245', name: 'Ali Valiyev', group: 'Frontend-1', active: true },
  { id: 'ST-10246', name: 'Barno Karimova', group: 'Frontend-1', active: false },
  { id: 'ST-10247', name: 'Doniyor Tursunov', group: 'Python-2', active: true },
] as const;

const PREVIEW_PAGE_SIZE = 20;
const PREVIEW_TOTAL = 245;

function SampleTable() {
  const [direction, setDirection] = useState<SortDirection | null>(null);
  const rows = direction === 'desc' ? [...SAMPLE_ROWS].reverse() : SAMPLE_ROWS;

  return (
    <Table scrollLabel="Namuna jadval">
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead
            sortDirection={direction}
            onSort={() => {
              setDirection((value) => (value === 'asc' ? 'desc' : 'asc'));
            }}
          >
            Ism (saralanadi)
          </TableHead>
          <TableHead>Guruh</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-mono">{row.id}</TableCell>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.group}</TableCell>
            <TableCell>
              <Badge variant={row.active ? 'success' : 'neutral'}>
                {row.active ? 'Faol' : 'Nofaol'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function EmptyTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Ism</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableEmpty colSpan={2} title="Natija topilmadi" description="Qidiruvni o'zgartiring." />
      </TableBody>
    </Table>
  );
}

function PaginationPreview() {
  const [page, setPage] = useState(1);
  return (
    <Stack gap="3">
      <Pagination
        page={page}
        pageSize={PREVIEW_PAGE_SIZE}
        total={PREVIEW_TOTAL}
        onPageChange={setPage}
      />
      <Pagination
        page={1}
        pageSize={PREVIEW_PAGE_SIZE}
        total={7}
        onPageChange={setPage}
        label="Bitta sahifa"
      />
    </Stack>
  );
}

function BadgeAndListPreview() {
  return (
    <Stack gap="4">
      <Stack direction="horizontal" gap="2" wrap>
        {BADGE_VARIANTS.map((variant) => (
          <Badge key={variant} variant={variant}>
            {variant}
          </Badge>
        ))}
      </Stack>
      <DescriptionList
        items={[
          { term: 'Student ID', value: <span className="font-mono">ST-10245</span> },
          { term: 'Ism', value: 'Ali Valiyev' },
          { term: 'Status', value: <Badge variant="success">Faol</Badge> },
          { term: 'Guruh', value: null },
        ]}
      />
    </Stack>
  );
}

/** Jadval, Pagination, Badge, DescriptionList. */
export function DataSection() {
  return (
    <>
      <PreviewSection
        id="table"
        title="Table"
        description="Saralash (aria-sort), tor ekranda gorizontal scroll, bo'sh holat."
      >
        <Stack gap="4">
          <SampleTable />
          <EmptyTable />
        </Stack>
      </PreviewSection>
      <PreviewSection id="pagination" title="Pagination">
        <PaginationPreview />
      </PreviewSection>
      <PreviewSection id="badge" title="Badge va DescriptionList">
        <Stack gap="2">
          <Text variant="muted">Bo&apos;sh qiymat &quot;—&quot; bilan ko&apos;rsatiladi.</Text>
          <BadgeAndListPreview />
        </Stack>
      </PreviewSection>
    </>
  );
}
