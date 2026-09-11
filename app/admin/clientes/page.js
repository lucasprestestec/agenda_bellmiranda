'use client';

import { AdminAppShell } from '../../../components/admin/AdminAppShell';
import { Icon } from '../../../components/core/Icon';

// No Cliente entity exists in the database yet — building a real CRM view
// here means schema/backend work, which is out of scope for this round.
// Honest placeholder instead of a fake list.
export default function AdminClientesPage() {
  return (
    <AdminAppShell>
      <div style={{ padding: '56px 24px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '14px', maxWidth: '360px', margin: '0 auto' }}>
        <span style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--nude-300)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--champagne-600)' }}>
          <Icon name="users" size={24} />
        </span>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontWeight: 400, fontSize: '1.375rem', color: 'var(--ink-900)' }}>Clientes chega em breve</h1>
          <p style={{ margin: '10px 0 0', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--ink-500)' }}>
            Um histórico por cliente — atendimentos, preferências, contato — ainda não existe no sistema. Por enquanto, os detalhes de cada uma ficam junto do agendamento, em Agenda.
          </p>
        </div>
      </div>
    </AdminAppShell>
  );
}
