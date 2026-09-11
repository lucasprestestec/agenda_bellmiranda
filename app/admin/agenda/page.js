'use client';

import { AdminAppShell } from '../../../components/admin/AdminAppShell';
import { FullAgenda } from '../../../components/admin/FullAgenda';

export default function AdminAgendaPage() {
  return (
    <AdminAppShell>
      <FullAgenda />
    </AdminAppShell>
  );
}
