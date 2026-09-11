import { ClientAppShell } from '../../../components/client/ClientAppShell';
import { EmptyState } from '../../../components/client/EmptyState';
import { SITE } from '../../../lib/site-config';

export const metadata = {
  title: 'Perfil — Bell Miranda',
};

export default function PerfilPage() {
  return (
    <ClientAppShell>
      <div style={{ padding: '20px 18px 0' }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontWeight: 400, fontSize: '1.25rem', color: 'var(--ink-900)' }}>Perfil</h1>
      </div>
      <EmptyState
        icon="user-round"
        title="Sem conta por aqui ainda"
        message="Hoje toda a conversa sobre o seu horário — dúvidas, trocas, cancelamento — acontece direto pelo WhatsApp do estúdio."
        actions={[{ label: 'Falar no WhatsApp', href: SITE.whatsappHref, variant: 'whatsapp', icon: 'message-circle' }]}
      />
    </ClientAppShell>
  );
}
