import { screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthUser } from '@lms/shared';

import { mockFetch } from '@/lib/testing/http';
import { renderWithQuery } from '@/lib/testing/render';
import { resetAuthStore, useAuthStore } from '@/stores/auth.store';

import { MENTOR_NAV, STUDENT_NAV } from '../config/nav.config';
import { findSectionEntry } from '../lib/nav-sections';

import { MentorLayout, StudentLayout } from './RoleLayouts';
import { SectionPage } from './SectionPage';

const navigation = vi.hoisted(() => ({ replace: vi.fn(), pathname: '/my-mentor' }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: navigation.replace }),
  usePathname: () => navigation.pathname,
}));

const STUDENT: AuthUser = {
  id: 's1',
  role: 'STUDENT',
  firstName: 'Ali',
  lastName: 'Valiyev',
  studentCode: 'ST-10001',
  mustChangePassword: false,
};

const MENTOR: AuthUser = {
  id: 'm1',
  role: 'MENTOR',
  firstName: 'Dev',
  lastName: 'Mentor',
  phone: '+998900000001',
  mustChangePassword: false,
};

function renderMyMentorPage() {
  const entry = findSectionEntry(STUDENT_NAV, '/', ['my-mentor']);
  if (entry === undefined) {
    throw new Error("'/my-mentor' student menyusida yo'q");
  }
  return renderWithQuery(
    <StudentLayout>
      <SectionPage entry={entry} />
    </StudentLayout>,
  );
}

describe('rol layout-lari', () => {
  beforeEach(() => {
    resetAuthStore();
    navigation.replace.mockReset();
    navigation.pathname = '/my-mentor';
    mockFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("student '/my-mentor' — student zonasi: 'Tez orada' va menyuda faol 'Mentor'", () => {
    useAuthStore.getState().setSession('t', STUDENT);

    renderMyMentorPage();

    expect(screen.getByRole('heading', { level: 1, name: 'Mentor' })).toBeInTheDocument();
    expect(screen.getByText('Tez orada')).toBeInTheDocument();
    const menu = screen.getByRole('navigation', { name: 'Student: menyu' });
    expect(within(menu).getByRole('link', { name: 'Mentor' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it("mentor '/my-mentor' ga kirsa — o'z paneliga (/mentor)", async () => {
    useAuthStore.getState().setSession('t', MENTOR);

    renderMyMentorPage();

    await waitFor(() => {
      expect(navigation.replace).toHaveBeenCalledWith('/mentor');
    });
    expect(screen.queryByText('Tez orada')).not.toBeInTheDocument();
  });

  it("yo'li aniqlanmagan band — NavItem disabled ('Tez orada' izohi bilan, havola emas)", () => {
    navigation.pathname = '/mentor';
    useAuthStore.getState().setSession('t', MENTOR);

    renderWithQuery(
      <MentorLayout>
        <p>Dashboard</p>
      </MentorLayout>,
    );

    const disabled = MENTOR_NAV.find((entry) => entry.href === undefined);
    expect(disabled).toBeDefined();
    const menu = screen.getByRole('navigation', { name: 'Mentor paneli: menyu' });
    const label = within(menu).getByText(disabled?.label ?? '');
    expect(label.closest('[aria-disabled="true"]')).not.toBeNull();
    expect(label.closest('a')).toBeNull();
    expect(within(menu).getByText('Tez orada')).toBeInTheDocument();
  });
});
