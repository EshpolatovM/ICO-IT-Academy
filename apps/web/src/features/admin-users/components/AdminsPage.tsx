'use client';

import { adminsApi } from '../api/staff.api';

import { StaffListPage } from './StaffListPage';

/** `/admin/admins` (faqat SA) — docs/03 §4.1. Route darajasida `SuperAdminOnly` bilan o'ralgan. */
export function AdminsPage() {
  return <StaffListPage kind="admins" title="Adminlar" singular="admin" api={adminsApi} />;
}
