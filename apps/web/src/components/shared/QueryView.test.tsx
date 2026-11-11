import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ErrorCode } from '@lms/shared';

import { ApiError } from '@/lib/api';
import { renderWithQuery } from '@/lib/testing/render';

import { QueryView } from './QueryView';

import type { UseQueryResult } from '@tanstack/react-query';

const NOT_FOUND = new ApiError({ status: 404, code: ErrorCode.NOT_FOUND, message: 'Topilmadi' });

function queryState(state: Partial<UseQueryResult<string>>): UseQueryResult<string> {
  return { refetch: () => Promise.resolve(), ...state } as UseQueryResult<string>;
}

describe('QueryView', () => {
  it('yuklanmoqda — spinner', () => {
    renderWithQuery(
      <QueryView query={queryState({ isPending: true })}>{(data) => data}</QueryView>,
    );
    expect(screen.getByText('Yuklanmoqda')).toBeInTheDocument();
  });

  it("ma'lumot — children(data)", () => {
    renderWithQuery(
      <QueryView query={queryState({ isPending: false, isError: false, data: 'FE-12' })}>
        {(data) => <p>{data}</p>}
      </QueryView>,
    );
    expect(screen.getByText('FE-12')).toBeInTheDocument();
  });

  it("404 + notFoundTitle — bo'sh holat va orqaga havola", () => {
    renderWithQuery(
      <QueryView
        query={queryState({ isPending: false, isError: true, error: NOT_FOUND })}
        notFoundTitle="Guruh topilmadi"
        back={{ href: '/mentor/groups', label: 'Guruhlar' }}
      >
        {(data) => data}
      </QueryView>,
    );
    expect(screen.getByText('Guruh topilmadi')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Guruhlar/ })).toHaveAttribute(
      'href',
      '/mentor/groups',
    );
  });

  it("404, lekin notFoundTitle yo'q — oddiy xato xabari va 'Qayta urinish'", () => {
    renderWithQuery(
      <QueryView query={queryState({ isPending: false, isError: true, error: NOT_FOUND })}>
        {(data) => data}
      </QueryView>,
    );
    expect(screen.getByText('Topilmadi')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Qayta urinish' })).toBeInTheDocument();
  });
});
