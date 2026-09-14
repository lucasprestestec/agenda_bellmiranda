// Single source of truth for service photography.
//
// One image per service, in public/assets/services/. `file` is the real
// filename as delivered in the asset packs — it does not always match the
// service slug, so the mapping is explicit rather than derived.
//
// Nothing else in the app builds an image path by hand: always go through
// getServiceImage(). `position` feeds object-position and only needs an
// override when the subject sits off-centre and a tall crop would cut it.

const BASE = '/assets/services';

const SERVICE_IMAGES = {
  'alongamento-gel': {
    file: 'alongamento-em-gel.webp',
    alt: 'Mãos com alongamento em gel no formato amêndoa, acabamento nude leitoso',
  },
  'alongamento-fibra': {
    file: 'alongamento-com-fibra-de-vidro.webp',
    alt: 'Aplicação de fibra de vidro na unha com pincel, durante o alongamento',
  },
  'manutencao-gel': {
    file: 'manutencao-de-alongamento-em-gel.webp',
    alt: 'Manutenção de alongamento em gel sendo feita com lixa elétrica',
  },
  'manutencao-fibra': {
    file: 'manutencao-de-fibra-de-vidro.webp',
    alt: 'Manutenção de unhas em fibra de vidro com lixa elétrica',
  },
  'banho-gel': {
    file: 'banho-de-gel.webp',
    alt: 'Unhas naturais com banho de gel, brilho nude sobre as mãos em repouso',
  },
  'esmaltacao-gel-maos': {
    file: 'esmaltacao-em-gel-maos.webp',
    alt: 'Esmaltação em gel sendo aplicada nas unhas das mãos com pincel',
  },
  'esmaltacao-gel-pes': {
    file: 'esmaltacao-em-gel-pes.webp',
    alt: 'Pés com esmaltação em gel nude, apoiados sobre toalha',
  },
  'postica-realista': {
    file: 'postica-realista.webp',
    alt: 'Aplicação de unha postiça realista, com a caixa de moldes ao lado',
  },
  'so-mao': {
    file: 'manicure-tradicional.webp',
    alt: 'Manicure tradicional: unhas das mãos sendo lixadas',
  },
  'so-pe': {
    file: 'pedicure-tradicional.webp',
    alt: 'Pedicure tradicional: unhas dos pés sendo lixadas',
  },
  'pe-mao-tradicional': {
    file: 'maos-pes-tradicional.webp',
    alt: 'Mãos e pés com esmaltação nude, atendimento completo',
  },
  'spa-pes': {
    file: 'spa-dos-pes.webp',
    alt: 'Spa dos pés: massagem relaxante com bacia de hidratação e pétalas',
  },
  'reconstrucao-unha-pe': {
    file: 'reconstrucao-de-unha-do-pe.webp',
    alt: 'Reconstrução de unha do pé sendo aplicada com pincel',
  },
  'design-sobrancelha': {
    file: 'design-sobrancelha.webp',
    alt: 'Design de sobrancelha sendo feito com pinça e escovinha',
  },
  'depilacao-buco': {
    file: 'depilacao-de-buco.webp',
    alt: 'Depilação de buço com cera sendo aplicada com espátula',
  },
  'depilacao-axilas': {
    file: 'depilacao-de-axilas.webp',
    alt: 'Depilação de axilas com cera sendo aplicada com espátula',
  },
  'depilacao-facial': {
    file: 'depilacao-facial.webp',
    alt: 'Depilação facial com cera sendo aplicada no rosto',
  },
};

export function getServiceImage(service) {
  const slug = typeof service === 'string' ? service : service?.slug;
  const entry = slug ? SERVICE_IMAGES[slug] : null;
  if (!entry) return null;
  return {
    src: `${BASE}/${entry.file}`,
    alt: entry.alt,
    position: entry.position || 'center',
  };
}

export function serviceImageSlugs() {
  return Object.keys(SERVICE_IMAGES);
}
