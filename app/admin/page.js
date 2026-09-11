'use client';

import { AdminAppShell } from '../../components/admin/AdminAppShell';
import { TodayView } from '../../components/admin/TodayView';

export default function AdminHojePage() {
  return (
    <AdminAppShell>
      <TodayView />
    </AdminAppShell>
  );
}
