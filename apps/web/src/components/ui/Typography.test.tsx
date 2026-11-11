import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './Card';
import { Heading } from './Heading';
import { Text } from './Text';

describe('Heading', () => {
  it('as bo`yicha daraja va o`lcham', () => {
    render(<Heading as="h1">Sarlavha</Heading>);
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('text-3xl');
  });

  it('standart daraja h2', () => {
    render(<Heading>Bo'lim</Heading>);
    expect(screen.getByRole('heading', { level: 2 })).toHaveClass('text-2xl');
  });
});

describe('Text', () => {
  it('variant klassi va element', () => {
    render(
      <Text as="span" variant="muted">
        Izoh
      </Text>,
    );
    const text = screen.getByText('Izoh');
    expect(text.tagName).toBe('SPAN');
    expect(text).toHaveClass('text-text-muted', 'text-sm');
  });
});

describe('Card', () => {
  it('barcha qismlarini chiqaradi', () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Karta</CardTitle>
        </CardHeader>
        <CardContent>Mazmun</CardContent>
        <CardFooter>Pastki</CardFooter>
      </Card>,
    );
    expect(screen.getByTestId('card')).toHaveClass('border-border', 'shadow-sm');
    expect(screen.getByRole('heading', { name: 'Karta' })).toBeInTheDocument();
    expect(screen.getByText('Mazmun')).toBeInTheDocument();
    expect(screen.getByText('Pastki')).toHaveClass('border-t');
  });
});
