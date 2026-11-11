import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { errorResponse, jsonResponse, mockFetch, routeFetch } from '@/lib/testing/http';
import type { FetchMock } from '@/lib/testing/http';
import { renderWithQuery } from '@/lib/testing/render';

import { API, GROUP_FIXTURE, IDS } from '../lib/test-fixtures';

import { MentorGroupsPage } from './MentorGroupsPage';

describe('MentorGroupsPage', () => {
  let fetchMock: FetchMock;

  beforeEach(() => {
    fetchMock = mockFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("guruhlar jadvali: nom (→ tafsilot), yo'l, studentlar soni, boshlanish", async () => {
    routeFetch(fetchMock, {
      [`GET ${API.groups}`]: () => jsonResponse(200, { items: [GROUP_FIXTURE] }),
    });
    renderWithQuery(<MentorGroupsPage />);

    expect(await screen.findByRole('link', { name: 'FE-12' })).toHaveAttribute(
      'href',
      `/mentor/groups/${IDS.group}`,
    );
    expect(screen.getByText('Frontend dasturchi')).toBeInTheDocument();
    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByText('01.12.2026')).toBeInTheDocument();
  });

  it("bo'sh holat: guruh biriktirilmagan", async () => {
    routeFetch(fetchMock, { [`GET ${API.groups}`]: () => jsonResponse(200, { items: [] }) });
    renderWithQuery(<MentorGroupsPage />);

    expect(await screen.findByText('Sizga hali guruh biriktirilmagan')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it("xato — xabar va 'Qayta urinish' qayta so'raydi", async () => {
    const user = userEvent.setup();
    routeFetch(fetchMock, {
      [`GET ${API.groups}`]: () => errorResponse(403, 'FORBIDDEN', "Ruxsat yo'q"),
    });
    renderWithQuery(<MentorGroupsPage />);

    await user.click(await screen.findByRole('button', { name: 'Qayta urinish' }));
    await vi.waitFor(() => {
      expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });
});
