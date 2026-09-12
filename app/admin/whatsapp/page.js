'use client';

import { AdminAppShell } from '../../../components/admin/AdminAppShell';
import { WhatsAppConnect } from '../../../components/admin/WhatsAppConnect';

export default function AdminWhatsAppPage() {
  return (
    <AdminAppShell>
      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '24px var(--gutter) 80px',
        display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-eyebrow)', letterSpacing: 'var(--tracking-eyebrow)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Integração</span>
          <h1 style={{ margin: '10px 0 0', fontFamily: 'var(--font-serif-display)', fontWeight: 300, fontSize: '1.75rem', color: 'var(--text-heading)' }}>WhatsApp Business</h1>
          <p style={{ margin: '10px 0 0', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--ink-500)' }}>
            Conecta o número que já está ativo no WhatsApp Business App, sem tirá-lo do ar — o Meta mantém os dois lados funcionando (coexistência).
          </p>
        </div>
        <WhatsAppConnect />
      </main>
    </AdminAppShell>
  );
}
