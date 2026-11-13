import { describe, expect, it } from 'vitest';

import { ADMIN_NAV, MENTOR_NAV, STUDENT_NAV } from '../config/nav.config';

import { findSectionEntry, isNavEntryActive, sectionEntries } from './nav-sections';

describe('nav-sections', () => {
  it("student bo'limlari: bosh sahifasiz, 'Mentor' — /my-mentor (S-69)", () => {
    const sections = sectionEntries(STUDENT_NAV, '/', '/path').map(({ segments }) =>
      segments.join('/'),
    );
    expect(sections).toEqual([
      'today',
      'review',
      'league',
      'battle',
      'playground',
      'portfolio',
      'blog',
      'my-mentor',
      'shop',
    ]);
    expect(findSectionEntry(STUDENT_NAV, '/', ['my-mentor'])?.label).toBe('Mentor');
    expect(findSectionEntry(STUDENT_NAV, '/', ['mentor'])).toBeUndefined();
  });

  it("admin bo'limlari — ko'p segmentli yo'l bilan", () => {
    const sections = sectionEntries(ADMIN_NAV, '/admin', '/admin').map(({ segments }) => segments);
    expect(sections).toContainEqual(['settings', 'rewards']);
    expect(sections).not.toContainEqual([]);
  });

  it("segmentlar bo'yicha bandni topadi, noma'lum — undefined", () => {
    expect(findSectionEntry(ADMIN_NAV, '/admin', ['settings', 'rewards'])?.label).toBe(
      'Gamifikatsiya',
    );
    expect(findSectionEntry(MENTOR_NAV, '/mentor', ['chat'])?.label).toBe('Chat');
    expect(findSectionEntry(STUDENT_NAV, '/', ['today'])?.label).toBe('Bugungi missiya');
    expect(findSectionEntry(STUDENT_NAV, '/', ['nope'])).toBeUndefined();
  });

  it("faol band: bosh sahifa faqat aniq mos kelganda, bo'limlar — ichki yo'llar bilan", () => {
    const home = { label: 'Dashboard', href: '/mentor' };
    const groups = { label: 'Guruhlar', href: '/mentor/groups' };
    expect(isNavEntryActive(home, '/mentor', '/mentor')).toBe(true);
    expect(isNavEntryActive(home, '/mentor/groups', '/mentor')).toBe(false);
    expect(isNavEntryActive(groups, '/mentor/groups/1', '/mentor')).toBe(true);
    expect(isNavEntryActive({ label: 'X' }, '/mentor', '/mentor')).toBe(false);
  });

  it("faol band: activePrefixes dagi yo'llar va ichki sahifalari ham faol", () => {
    const users = { label: 'U', href: '/admin/students', activePrefixes: ['/admin/mentors'] };
    expect(isNavEntryActive(users, '/admin/students', '/admin')).toBe(true);
    expect(isNavEntryActive(users, '/admin/mentors', '/admin')).toBe(true);
    expect(isNavEntryActive(users, '/admin/mentors/5', '/admin')).toBe(true);
    expect(isNavEntryActive(users, '/admin/mentorship', '/admin')).toBe(false);
    expect(isNavEntryActive(users, '/admin/groups', '/admin')).toBe(false);
  });

  it("admin 'Foydalanuvchilar' — students, mentors da faol; admins da alohida band faol", () => {
    const byLabel = (label: string) => ADMIN_NAV.find((entry) => entry.label === label);
    const users = byLabel('Foydalanuvchilar');
    expect(users).toBeDefined();
    if (users === undefined) {
      return;
    }
    for (const path of ['/admin/students', '/admin/students/7', '/admin/mentors']) {
      expect(isNavEntryActive(users, path, '/admin')).toBe(true);
    }
    expect(isNavEntryActive(users, '/admin/admins', '/admin')).toBe(false);
    const admins = byLabel('Adminlar');
    expect(admins !== undefined && isNavEntryActive(admins, '/admin/admins', '/admin')).toBe(true);
    expect(isNavEntryActive(users, '/admin', '/admin')).toBe(false);
    expect(isNavEntryActive(users, '/admin/groups', '/admin')).toBe(false);
    const groups = byLabel('Guruhlar');
    expect(groups !== undefined && isNavEntryActive(groups, '/admin/mentors', '/admin')).toBe(
      false,
    );
    const dashboard = byLabel('Dashboard');
    expect(dashboard !== undefined && isNavEntryActive(dashboard, '/admin/admins', '/admin')).toBe(
      false,
    );
  });

  it("student 'Ilm yo'li' — xarita, mavzu va dars sahifalarida faol (Q-11)", () => {
    const path = STUDENT_NAV.find((entry) => entry.href === '/path');
    expect(path).toBeDefined();
    if (path === undefined) {
      return;
    }
    for (const pathname of ['/path', '/path/topics/t1', '/path/lessons/l1']) {
      expect(isNavEntryActive(path, pathname, '/path')).toBe(true);
    }
    expect(isNavEntryActive(path, '/path/other', '/path')).toBe(false);
    expect(isNavEntryActive(path, '/today', '/path')).toBe(false);
  });
});
