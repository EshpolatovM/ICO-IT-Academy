import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { errorResponse, jsonResponse, mockFetch, routeFetch } from '@/lib/testing/http';
import type { FetchMock } from '@/lib/testing/http';
import { renderWithQuery } from '@/lib/testing/render';

import { API, GROUP_FIXTURE, GROUP_STUDENT_FIXTURE, IDS } from '../lib/test-fixtures';

import { MentorGroupDetailPage } from './MentorGroupDetailPage';

describe('MentorGroupDetailPage', () => {
  let fetchMock: FetchMock;

  beforeEach(() => {
    fetchMock = mockFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sarlavha, yo'l, studentlar soni va studentlar jadvali (→ profil)", async () => {
    routeFetch(fetchMock, {
      [`GET ${API.group}`]: () => jsonResponse(200, GROUP_FIXTURE),
      [`GET ${API.groupStudents}`]: () => jsonResponse(200, { items: [GROUP_STUDENT_FIXTURE] }),
    });
    renderWithQuery(<MentorGroupDetailPage id={IDS.group} />);

    expect(await screen.findByRole('heading', { name: 'FE-12', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Frontend dasturchi')).toBeInTheDocument();
    expect(screen.getByText('Studentlar soni')).toBeInTheDocument();
    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Guruhlar/ })).toHaveAttribute(
      'href',
      '/mentor/groups',
    );
    expect(await screen.findByRole('link', { name: 'ST-10245' })).toHaveAttribute(
      'href',
      `/mentor/students/${IDS.student}`,
    );
    expect(screen.getByText('Ali Valiyev')).toBeInTheDocument();
    expect(screen.queryByText(/XP|Streak|Progress/)).not.toBeInTheDocument();
  });

  it("guruhda student yo'q — jadvalda bo'sh holat", async () => {
    routeFetch(fetchMock, {
      [`GET ${API.group}`]: () => jsonResponse(200, { ...GROUP_FIXTURE, studentsCount: 0 }),
      [`GET ${API.groupStudents}`]: () => jsonResponse(200, { items: [] }),
    });
    renderWithQuery(<MentorGroupDetailPage id={IDS.group} />);

    expect(await screen.findByText("Guruhda hali student yo'q")).toBeInTheDocument();
  });

  it('404 — "Guruh topilmadi" va guruhlarga qaytish havolasi', async () => {
    routeFetch(fetchMock, {
      [`GET ${API.group}`]: () => errorResponse(404, 'NOT_FOUND', 'Topilmadi'),
    });
    renderWithQuery(<MentorGroupDetailPage id={IDS.group} />);

    expect(await screen.findByText('Guruh topilmadi')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Guruhlar/ })).toHaveAttribute(
      'href',
      '/mentor/groups',
    );
  });
});
