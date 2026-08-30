import { ServicesIntro } from './ServicesIntro';
import { ServiceList } from './ServiceList';
import { listActiveServices } from '../../lib/services';

export async function Services() {
  const services = await listActiveServices();
  return (
    <section id="servicos" style={{ position: 'relative', background: 'var(--ivory-200)', padding: 'var(--section-y) 0', overflow: 'hidden' }}>
      <div className="ph-texture" style={{ position: 'absolute', left: '-30px', bottom: '-20px',
        width: 'clamp(180px,26vw,380px)', height: 'clamp(180px,26vw,380px)', opacity: .26, pointerEvents: 'none' }}></div>
      <div className="services-grid" style={{ position: 'relative', maxWidth: 'var(--container)', margin: '0 auto', padding: '0 var(--gutter)',
        display: 'grid', gap: 'clamp(32px,6vw,96px)', alignItems: 'start' }}>
        <ServicesIntro />
        <ServiceList services={services} />
      </div>
    </section>
  );
}
