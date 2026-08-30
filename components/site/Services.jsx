import { SectionHeading } from '../core/SectionHeading';
import { Button } from '../core/Button';
import { ServiceList } from './ServiceList';
import { listActiveServices } from '../../lib/services';

export async function Services() {
  const services = await listActiveServices();
  return (
    <section id="servicos" style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: 'var(--section-y) var(--gutter)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '.8fr 1.2fr', gap: 'clamp(28px,5vw,72px)', alignItems: 'start' }}>
        <div style={{ position: 'sticky', top: '120px', display: 'flex', flexDirection: 'column', gap: '26px', alignItems: 'flex-start' }}>
          <SectionHeading eyebrow="Serviços" title={<>Cada detalhe<br />tem seu tempo</>} lead="Valores válidos para atendimento no estúdio, com hora marcada." maxWidth={360} />
          <Button href="/agendar">Agendar horário</Button>
        </div>
        <ServiceList services={services} />
      </div>
    </section>
  );
}
