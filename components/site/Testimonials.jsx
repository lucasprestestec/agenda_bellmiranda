import { SectionHeading } from '../core/SectionHeading';
import { TestimonialQuote } from '../editorial/TestimonialQuote';
import { Ornament } from '../core/Ornament';

export function Testimonials() {
  return (
    <section style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: 'var(--section-y) var(--gutter)' }}>
      <SectionHeading align="center" eyebrow="Clientes" title="Elas voltam — e trazem amigas" maxWidth={520} style={{ margin: '0 auto 56px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '44px', alignItems: 'start' }}>
        <TestimonialQuote quote="Saio de lá com as unhas perfeitas e a cabeça leve." author="Marina R." meta="cliente desde 2023" />
        <TestimonialQuote quote="Nunca tive alongamento tão natural. Ninguém percebe que é gel." author="Júlia P." meta="alongamento em gel" />
        <TestimonialQuote quote="A Bell explica cada passo. Confio de olhos fechados." author="Camila S." meta="cliente desde 2021" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '56px' }}><Ornament width={220} motif="heart" color="var(--rose-500)" /></div>
    </section>
  );
}
