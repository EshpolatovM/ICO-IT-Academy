import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './Button';
import { TreeList } from './TreeList';

import type { TreeListItem } from './TreeList.types';

const ITEMS: readonly TreeListItem[] = [
  {
    id: 's1',
    title: 'HTML asoslari',
    status: { label: 'PUBLISHED', variant: 'success' },
    actions: <Button size="sm">Tahrirlash</Button>,
    children: [
      { id: 't1', title: 'Teglar' },
      { id: 't2', title: 'Formalar' },
    ],
  },
  { id: 's2', title: 'CSS', status: { label: 'DRAFT' } },
];

describe('TreeList', () => {
  it('ichma-ich ro`yxat, Badge va amallar slot`i', () => {
    render(<TreeList items={ITEMS} label="Yo'l daraxti" />);
    expect(screen.getByRole('list', { name: "Yo'l daraxti" })).toBeInTheDocument();
    expect(screen.getByText('PUBLISHED')).toHaveClass('text-success');
    expect(screen.getByText('Teglar')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Tahrirlash' })).toBeInTheDocument();
  });

  it('yig`ish/yoyish aria-expanded bilan', async () => {
    render(<TreeList items={ITEMS} label="Daraxt" />);
    const toggle = screen.getByRole('button', { name: "Yig'ish: HTML asoslari" });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(toggle);
    const collapsed = screen.getByRole('button', { name: 'Yoyish: HTML asoslari' });
    expect(collapsed).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Teglar')).not.toBeVisible();
    expect(document.getElementById(collapsed.getAttribute('aria-controls') ?? '')).not.toBeNull();
  });

  it('defaultExpanded=false bo`lsa yopiq boshlanadi', () => {
    render(<TreeList items={ITEMS} label="Daraxt" defaultExpanded={false} />);
    expect(screen.getByText('Teglar')).not.toBeVisible();
  });

  it('Yuqoriga/Pastga: birinchi/oxirgida disabled, callback joylashuv bilan', async () => {
    const onMoveUp = vi.fn();
    const onMoveDown = vi.fn();
    render(<TreeList items={ITEMS} label="Daraxt" onMoveUp={onMoveUp} onMoveDown={onMoveDown} />);
    expect(screen.getByRole('button', { name: 'Yuqoriga: Teglar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Pastga: Formalar' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Yuqoriga: Formalar' }));
    expect(onMoveUp).toHaveBeenCalledWith(expect.objectContaining({ id: 't2' }), {
      parentId: 's1',
      index: 1,
    });
    await userEvent.click(screen.getByRole('button', { name: 'Pastga: HTML asoslari' }));
    expect(onMoveDown).toHaveBeenCalledWith(expect.objectContaining({ id: 's1' }), {
      parentId: null,
      index: 0,
    });
  });

  it('moveDisabled barcha tartiblash tugmalarini bloklaydi; handler yo`q bo`lsa tugma yo`q', () => {
    const { rerender } = render(
      <TreeList items={ITEMS} label="Daraxt" onMoveUp={vi.fn()} moveDisabled />,
    );
    expect(screen.getByRole('button', { name: 'Yuqoriga: CSS' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: /^Pastga/ })).not.toBeInTheDocument();
    rerender(<TreeList items={ITEMS} label="Daraxt" />);
    expect(screen.queryByRole('button', { name: /^Yuqoriga/ })).not.toBeInTheDocument();
  });
});
