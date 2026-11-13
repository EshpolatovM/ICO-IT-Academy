import type { NavEntry } from '../types/nav.types';

/**
 * Menyular — docs/03 §0 jadvali. Hali qilinmagan sahifalar "Tez orada" sahifasini ko'rsatadi
 * (404 emas). Yo'li hujjatda aniqlanmagan bandlar `href`siz — `disabled`.
 */
export const STUDENT_NAV: readonly NavEntry[] = [
  // Q-11: mavzu va dars sahifalarida ham "Ilm yo'li" faol.
  { label: "Ilm yo'li", href: '/path', activePrefixes: ['/path/topics', '/path/lessons'] },
  { label: 'Bugungi missiya', href: '/today' },
  { label: 'Takrorlash', href: '/review' },
  { label: 'Liga', href: '/league' },
  { label: 'Bellashuv', href: '/battle' },
  { label: 'Kod maydoni', href: '/playground' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Blog', href: '/blog' },
  // S-69: student mentor sahifasi — `/my-mentor` (mentor paneli `/mentor/*` da), docs/03 §2.11.
  { label: 'Mentor', href: '/my-mentor' },
  { label: 'Shop', href: '/shop' },
];

export const MENTOR_NAV: readonly NavEntry[] = [
  { label: 'Dashboard', href: '/mentor' },
  { label: 'Guruhlar', href: '/mentor/groups' },
  { label: 'Studentlar', href: '/mentor/students' },
  { label: 'Chat', href: '/mentor/chat' },
  { label: 'Meetinglar', href: '/mentor/meetings' },
  { label: 'Materiallar', href: '/mentor/materials' },
  { label: 'Portfolio baholash', href: '/mentor/reviews' },
  // docs/03 §3 da mentor bildirishnomalari sahifasining yo'li yo'q.
  { label: 'Bildirishnomalar' },
];

export const ADMIN_NAV: readonly NavEntry[] = [
  { label: 'Dashboard', href: '/admin' },
  {
    label: 'Foydalanuvchilar',
    href: '/admin/students',
    activePrefixes: ['/admin/mentors'],
  },
  { label: 'Guruhlar', href: '/admin/groups' },
  // docs/03 §0: menyu nomi "Kontent" — ilm yo'llari, daraxt va dars muharriri (3.5).
  { label: 'Kontent', href: '/admin/paths', activePrefixes: ['/admin/lessons'] },
  { label: 'Savollar', href: '/admin/questions' },
  { label: 'Gamifikatsiya', href: '/admin/settings/rewards' },
  { label: 'Shop', href: '/admin/shop/products' },
  { label: 'Blog moderatsiyasi', href: '/admin/blog' },
  { label: 'Hisobotlar', href: '/admin/reports' },
  { label: 'Adminlar', href: '/admin/admins', superAdminOnly: true },
  { label: 'Tizim sozlamalari', href: '/admin/system', superAdminOnly: true },
  { label: 'Audit', href: '/admin/audit', superAdminOnly: true },
];
