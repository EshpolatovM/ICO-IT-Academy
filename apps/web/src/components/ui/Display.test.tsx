import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Badge } from './Badge';
import { DescriptionList } from './DescriptionList';

describe('Badge', () => {
  it('standart variant neutral', () => {
    render(<Badge>ARCHIVED</Badge>);
    expect(screen.getByText('ARCHIVED')).toHaveClass('bg-surface-muted', 'text-text-muted');
  });

  it('holat variantlari token klasslari bilan', () => {
    render(
      <>
        <Badge variant="success">Faol</Badge>
        <Badge variant="danger">Nofaol</Badge>
      </>,
    );
    expect(screen.getByText('Faol')).toHaveClass('bg-success-bg', 'text-success');
    expect(screen.getByText('Nofaol')).toHaveClass('border-danger');
  });
});

describe('DescriptionList', () => {
  it('nom — qiymat juftlari, bo`sh qiymat uchun belgi', () => {
    render(
      <DescriptionList
        items={[
          { term: 'Student ID', value: 'ST-10245' },
          { term: 'Guruh', value: null },
        ]}
      />,
    );
    const terms = screen.getAllByRole('term');
    const definitions = screen.getAllByRole('definition');
    expect(terms.map((term) => term.textContent)).toEqual(['Student ID', 'Guruh']);
    expect(definitions.map((definition) => definition.textContent)).toEqual(['ST-10245', '—']);
  });
});
