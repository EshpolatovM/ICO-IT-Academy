import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Table, TableBody, TableCell, TableEmpty, TableHeader, TableRow } from './Table';
import { TableHead } from './TableHead';

import type { SortDirection } from './TableHead';

function renderTable(sortDirection: SortDirection | null, onSort = vi.fn()) {
  render(
    <Table scrollLabel="Studentlar">
      <TableHeader>
        <TableRow>
          <TableHead sortDirection={sortDirection} onSort={onSort}>
            Ism
          </TableHead>
          <TableHead>Guruh</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Ali</TableCell>
          <TableCell>G-1</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );
  return onSort;
}

describe('Table', () => {
  it('scroll konteyneri region sifatida fokuslanadi', () => {
    renderTable(null);
    const region = screen.getByRole('region', { name: 'Studentlar' });
    expect(region).toHaveAttribute('tabindex', '0');
    expect(region).toHaveClass('overflow-x-auto');
    expect(screen.getByRole('cell', { name: 'Ali' })).toBeInTheDocument();
  });

  it('saralanadigan sarlavha: aria-sort va onSort', async () => {
    const onSort = renderTable(null);
    const header = screen.getByRole('columnheader', { name: /Ism/ });
    expect(header).toHaveAttribute('aria-sort', 'none');
    await userEvent.click(screen.getByRole('button', { name: /Ism/ }));
    expect(onSort).toHaveBeenCalledOnce();
  });

  it('yo`nalishga mos aria-sort, oddiy sarlavhada aria-sort yo`q', () => {
    renderTable('desc');
    expect(screen.getByRole('columnheader', { name: /Ism/ })).toHaveAttribute(
      'aria-sort',
      'descending',
    );
    const plain = screen.getByRole('columnheader', { name: 'Guruh' });
    expect(plain).not.toHaveAttribute('aria-sort');
    expect(plain).toHaveAttribute('scope', 'col');
  });

  it('scrollLabel bo`lmasa region emas', () => {
    render(
      <Table>
        <TableBody>
          <TableEmpty
            colSpan={3}
            title="Studentlar yo'q"
            description="Birinchi studentni qo'shing"
          />
        </TableBody>
      </Table>,
    );
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    const cell = screen.getByRole('cell');
    expect(cell).toHaveAttribute('colspan', '3');
    expect(cell).toHaveTextContent("Studentlar yo'q");
  });
});
