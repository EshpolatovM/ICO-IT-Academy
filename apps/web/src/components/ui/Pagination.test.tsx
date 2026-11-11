import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { getPageCount, Pagination } from './Pagination';
import { getPaginationItems } from './paginationRange';

describe('getPaginationItems', () => {
  it('kam sahifada hammasi', () => {
    expect(getPaginationItems(1, 1)).toEqual([1]);
    expect(getPaginationItems(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('ko`p sahifada qisqartiriladi, elementlar soni doim 7', () => {
    expect(getPaginationItems(1, 10)).toEqual([1, 2, 3, 4, 5, 'ellipsis-end', 10]);
    expect(getPaginationItems(5, 10)).toEqual([1, 'ellipsis-start', 4, 5, 6, 'ellipsis-end', 10]);
    expect(getPaginationItems(10, 10)).toEqual([1, 'ellipsis-start', 6, 7, 8, 9, 10]);
    expect(getPaginationItems(4, 10)).toEqual([1, 2, 3, 4, 5, 'ellipsis-end', 10]);
  });

  it('sahifalar soni kamida 1', () => {
    expect(getPageCount(0, 20)).toBe(1);
    expect(getPageCount(41, 20)).toBe(3);
  });
});

describe('Pagination', () => {
  it('natijalar soni, aria-current va sahifa tanlash', async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} pageSize={20} total={95} onPageChange={onPageChange} />);
    expect(screen.getByRole('navigation', { name: 'Sahifalash' })).toBeInTheDocument();
    expect(screen.getByText('95 ta natija')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2-sahifa' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('button', { name: '1-sahifa' })).not.toHaveAttribute('aria-current');

    await userEvent.click(screen.getByRole('button', { name: '5-sahifa' }));
    expect(onPageChange).toHaveBeenLastCalledWith(5);
    await userEvent.click(screen.getByRole('button', { name: 'Keyingi' }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);
    await userEvent.click(screen.getByRole('button', { name: 'Oldingi' }));
    expect(onPageChange).toHaveBeenLastCalledWith(1);
  });

  it('chegaralarda oldingi/keyingi bloklanadi', () => {
    render(<Pagination page={1} pageSize={20} total={10} onPageChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Oldingi' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Keyingi' })).toBeDisabled();
  });
});
