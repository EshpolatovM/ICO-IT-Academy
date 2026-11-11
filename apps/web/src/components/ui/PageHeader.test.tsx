import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Badge } from './Badge';
import { Button } from './Button';
import { PageHeader } from './PageHeader';
import { StatCard } from './StatCard';

describe('PageHeader', () => {
  it('h1, tavsif, amallar, addon va orqaga havola', () => {
    render(
      <PageHeader
        title="Guruhlar"
        description="Barcha guruhlar ro'yxati"
        titleAddon={<Badge>Faol</Badge>}
        actions={<Button>Guruh yaratish</Button>}
        back={{ href: '/admin', label: 'Bosh sahifa' }}
      />,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Guruhlar' })).toBeInTheDocument();
    expect(screen.getByText("Barcha guruhlar ro'yxati")).toBeInTheDocument();
    expect(screen.getByText('Faol')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guruh yaratish' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Bosh sahifa' })).toHaveAttribute('href', '/admin');
  });

  it('faqat sarlavha — qo`shimcha elementlarsiz', () => {
    render(<PageHeader title="Mentorlar" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Mentorlar' })).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('StatCard', () => {
  it('nom, qiymat va izoh termin–ta`rif sifatida', () => {
    render(<StatCard label="Studentlar" value={24} hint="3 tasi nofaol" />);
    expect(screen.getByRole('term')).toHaveTextContent('Studentlar');
    const definitions = screen.getAllByRole('definition');
    expect(definitions[0]).toHaveTextContent('24');
    expect(definitions[1]).toHaveTextContent('3 tasi nofaol');
  });

  it('yuklanish holatida qiymat o`rnida spinner', () => {
    render(<StatCard label="XP" value={1200} loading />);
    expect(screen.getByRole('status')).toHaveTextContent('XP: yuklanmoqda');
    expect(screen.queryByText('1200')).not.toBeInTheDocument();
  });
});
