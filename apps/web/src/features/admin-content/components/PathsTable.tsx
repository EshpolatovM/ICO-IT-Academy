'use client';

import { HeadedTable } from '@/components/shared';
import { Spinner, Stack, TableCell, TableEmpty, TableRow, TextLink } from '@/components/ui';

import { useDeletePath } from '../hooks/usePathMutations';
import { pathTreePath } from '../lib/admin-content-paths';

import { ContentStatusBadge } from './ContentStatusBadge';
import { DeleteAction } from './DeleteAction';
import { EditPathDialog } from './PathDialogs';
import { PathStatusToggle } from './PathStatusToggle';

import type { AdminPathItem } from '../types/admin-content.types';

const HEADERS = ['Nom', 'Slug', 'Holat', "Bo'limlar", 'Mavzular', ''] as const;

const PATH_DELETE_DESCRIPTION =
  "Yo'l butun daraxti (bo'limlar, mavzular, darslar, sandiqlar) bilan o'chadi. Guruh ishlatayotgan yo'lni o'chirib bo'lmaydi.";

function PathRowActions({ path }: { path: AdminPathItem }) {
  const remove = useDeletePath(path.id);
  return (
    <Stack direction="horizontal" gap="2" wrap>
      <PathStatusToggle path={path} />
      <EditPathDialog path={path} />
      <DeleteAction name={path.title} mutation={remove} description={PATH_DELETE_DESCRIPTION} />
    </Stack>
  );
}

function PathRow({ path }: { path: AdminPathItem }) {
  return (
    <TableRow>
      <TableCell>
        <TextLink href={pathTreePath(path.id)}>{path.title}</TextLink>
      </TableCell>
      <TableCell>{path.slug}</TableCell>
      <TableCell>
        <ContentStatusBadge status={path.status} />
      </TableCell>
      <TableCell>{path.sectionsCount}</TableCell>
      <TableCell>{path.topicsCount}</TableCell>
      <TableCell>
        <PathRowActions path={path} />
      </TableCell>
    </TableRow>
  );
}

export interface PathsTableProps {
  items: readonly AdminPathItem[] | undefined;
  isLoading: boolean;
}

function Rows({ items, isLoading }: PathsTableProps) {
  if (items === undefined) {
    return (
      <TableRow>
        <TableCell colSpan={HEADERS.length}>{isLoading ? <Spinner /> : null}</TableCell>
      </TableRow>
    );
  }
  if (items.length === 0) {
    return (
      <TableEmpty
        colSpan={HEADERS.length}
        title="Hali yo'l yo'q"
        description={`"Yangi yo'l" tugmasi bilan birinchi yo'lni yarating.`}
      />
    );
  }
  return items.map((path) => <PathRow key={path.id} path={path} />);
}

/** Ilm yo'llari jadvali: nom, slug, holat, bo'limlar va mavzular soni, amallar. */
export function PathsTable(props: PathsTableProps) {
  return (
    <HeadedTable label="Ilm yo'llari" headers={HEADERS}>
      <Rows {...props} />
    </HeadedTable>
  );
}
