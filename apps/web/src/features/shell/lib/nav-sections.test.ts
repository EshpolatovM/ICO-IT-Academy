import { describe, expect, it } from 'vitest';

import { ADMIN_NAV, MENTOR_NAV, STUDENT_NAV } from '../config/nav.config';

import { findSectionEntry, isNavEntryActive, sectionEntries } from './nav-sections';

describe('nav-sections', () => {
  it("student bo'limlari: bosh sahifa va disabled 'Mentor' bandisiz", () => {
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
      'shop',
    ]);
    expect(STUDENT_NAV.find((entry) => entry.label === 'Mentor')?.href).toBeUndefined();
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
});
