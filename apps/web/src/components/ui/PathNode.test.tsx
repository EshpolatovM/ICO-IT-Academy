import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NodeStatusBadge } from './NodeStatusBadge';
import { PathNode } from './PathNode';
import { PathSection } from './PathSection';

describe('NodeStatusBadge', () => {
  it('mavzu va sandiq holatlari matn bilan, belgi aria-hidden', () => {
    render(
      <>
        <NodeStatusBadge kind="TOPIC" status="IN_PROGRESS" />
        <NodeStatusBadge kind="CHEST" status="READY" />
      </>,
    );
    expect(screen.getByText('Jarayonda')).toHaveClass('bg-warning-bg');
    expect(screen.getByText('Ochishga tayyor')).toBeInTheDocument();
    expect(screen.getByText('◐')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('PathNode', () => {
  it('ochiq mavzu havola, darslar soni va joriy belgi', () => {
    render(
      <PathNode
        kind="TOPIC"
        title="Teglar"
        status="IN_PROGRESS"
        lessons={5}
        lessonsCompleted={2}
        href="/path/topics/t1"
        current
      />,
    );
    expect(screen.getByRole('link', { name: 'Teglar' })).toHaveAttribute('href', '/path/topics/t1');
    expect(screen.getByText('2/5 dars')).toBeInTheDocument();
    expect(screen.getByText('Siz shu yerdasiz')).toBeInTheDocument();
    expect(screen.getByText('Siz shu yerdasiz').closest('[aria-current]')).toHaveAttribute(
      'aria-current',
      'step',
    );
  });

  it('LOCKED mavzu havola emas, aria-disabled', () => {
    render(
      <PathNode
        kind="TOPIC"
        title="Formalar"
        status="LOCKED"
        lessons={3}
        lessonsCompleted={0}
        href="/path/topics/t2"
      />,
    );
    const title = screen.getByRole('link', { name: 'Formalar' });
    expect(title).not.toHaveAttribute('href');
    expect(title).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('Qulflangan')).toBeInTheDocument();
  });

  it('izoh (hint) ko`rsatiladi', () => {
    render(
      <PathNode
        kind="TOPIC"
        title="CSS"
        status="AVAILABLE"
        lessons={2}
        lessonsCompleted={0}
        hint="Avval takrorlang (2 ta)"
      />,
    );
    expect(screen.getByText('Avval takrorlang (2 ta)')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('sandiq: disabled tugma va "keyinroq" tavsifi', () => {
    render(<PathNode kind="CHEST" status="READY" />);
    const button = screen.getByRole('button', { name: 'Ochish' });
    expect(button).toBeDisabled();
    expect(button).toHaveAccessibleDescription("Sandiqni ochish keyinroq qo'shiladi");
    expect(screen.getByText('Sandiq')).toBeInTheDocument();
  });
});

describe('PathSection', () => {
  it('sarlavha, progress va tugunlar ol/li zanjirida', () => {
    render(
      <PathSection
        title="HTML asoslari"
        progress={0.5}
        nodes={[
          {
            id: 't1',
            kind: 'TOPIC',
            title: 'Teglar',
            status: 'COMPLETED',
            lessons: 2,
            lessonsCompleted: 2,
          },
          { id: 'c1', kind: 'CHEST', status: 'LOCKED' },
        ]}
      />,
    );
    const region = screen.getByRole('region', { name: 'HTML asoslari' });
    expect(within(region).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    const list = within(region).getByRole('list');
    expect(list.tagName).toBe('OL');
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
  });

  it('progress berilmasa chiziq chiqmaydi', () => {
    render(<PathSection title="CSS" nodes={[]} />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
