import { ClientAppShell } from '../../../components/client/ClientAppShell';
import { EmptyState } from '../../../components/client/EmptyState';
import { SITE } from '../../../lib/site-config';

export const metadata = {
  title: 'Seus agendamentos — Bell Miranda',
};

export default function AgendamentosPage() {
  return (
    <ClientAppShell>
      <div style={{ padding: '20px 18px 0' }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontWeight: 400, fontSize: '1.25rem', color: 'var(--ink-900)' }}>Agendamentos</h1>
      </div>
      <EmptyState
        icon="calendar-days"
        title="Ainda não temos histórico por aqui"
        message="Cada horário marcado é confirmado direto no seu WhatsApp, com todos os detalhes — é lá que fica o registro por enquanto."
        actions={[
          { label: 'Falar no WhatsApp', href: SITE.whatsappHref, variant: 'whatsapp', icon: 'message-circle' },
          { label: 'Agendar novo horário', href: '/reservar', variant: 'secondary' },
        ]}
      />
    </ClientAppShell>
  );
}
