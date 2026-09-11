'use client';

import { useEffect, useMemo, useState } from 'react';
import { ConfirmationPanel } from '../booking/ConfirmationPanel';
import { DateStrip } from '../booking/DateStrip';
import { Field } from '../forms/Field';
import { Input } from '../forms/Input';
import { Textarea } from '../forms/Textarea';
import { Checkbox } from '../forms/Checkbox';
import { Icon } from '../core/Icon';
import { Button } from '../core/Button';
import { Ornament } from '../core/Ornament';
import { useMobile } from '../../lib/useMobile';
import { SITE } from '../../lib/site-config';
import { MONTH_LABELS } from '../../lib/studio';

const BENEFITS = [
  ['heart-handshake', 'Cuidado que acolhe', 'Experiência personalizada do início ao fim.'],
  ['leaf', 'Produtos premium', 'Marcas de alta performance e segurança.'],
  ['clock', 'Pontualidade', 'Respeitamos o seu tempo com compromisso total.'],
  ['heart', 'Ambiente exclusivo', 'Espaço pensado para o seu bem-estar.'],
];

const STEPS = [
  { key: 'servico', label: 'Serviço' },
  { key: 'horario', label: 'Horário' },
  { key: 'detalhes', label: 'Detalhes' },
];

const capsLabel = { fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-500)' };
const ghostAction = { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'none', border: 0, padding: 0, cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--champagne-600)' };

function dayLabelFor(days, value) {
  const d = days.find((x) => x.value === value);
  if (!d) return '—';
  const [y, m] = d.value.split('-');
  return `${d.day} de ${MONTH_LABELS[Number(m) - 1]} de ${y}`;
}
function dayShortFor(days, value) {
  const d = days.find((x) => x.value === value);
  return d ? `${d.day} · ${d.weekday}` : '—';
}

// Two presentations share the same data/booking logic:
// - "embedded" (homepage): a single flowing card matching the surrounding
//   editorial page — Header/Hero/Services all read the same way, so the
//   booking section shouldn't suddenly feel like a different app.
// - "stepped" (dedicated /agendar, /reservar pages): those pages exist only
//   to book, so the flow can be optimized on its own terms — one step at a
//   time, more compact, less scrolling — without clashing with anything.
export function BookingFlow({ services: allServices, initialServiceSlug, layout = 'desktop', variant = 'stepped' }) {
  const services = useMemo(() => allServices.filter((s) => s.bookable), [allServices]);
  const forcedMobile = layout === 'mobile';
  const viewportMobile = useMobile();
  const narrow = useMobile(430);
  const mobile = forcedMobile || viewportMobile;

  // Group by who performs the service — with 3 professionals across ~17
  // services, a flat list means a lot of scrolling to find the right one.
  const staffGroups = useMemo(() => {
    const map = new Map();
    for (const s of services) {
      const key = s.staffPhone || '__sem_staff';
      if (!map.has(key)) map.set(key, { key, staffName: s.staffName, items: [] });
      map.get(key).items.push(s);
    }
    return Array.from(map.values());
  }, [services]);
  const multiStaff = staffGroups.length > 1;

  const initialGroupKey = useMemo(() => {
    const withInitial = staffGroups.find((g) => g.items.some((s) => s.slug === initialServiceSlug));
    return (withInitial || staffGroups[0])?.key;
  }, [staffGroups, initialServiceSlug]);
  const [staffCat, setStaffCat] = useState(initialGroupKey);
  const activeGroup = staffGroups.find((g) => g.key === staffCat) || staffGroups[0];
  const visibleServices = multiStaff ? (activeGroup?.items || services) : services;

  const initialBookable = services.find((s) => s.slug === initialServiceSlug) ? initialServiceSlug : services[0]?.slug;
  const [svcSlug, setSvcSlug] = useState(initialBookable);
  const service = useMemo(() => services.find((s) => s.slug === svcSlug) || services[0], [services, svcSlug]);

  const [step, setStep] = useState('servico');
  const [dateOpen, setDateOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [days, setDays] = useState([]);
  const [day, setDay] = useState(null);
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState(null);
  const [loadingDays, setLoadingDays] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [done, setDone] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [remind, setRemind] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  function selectStaffCat(key) {
    setStaffCat(key);
    const group = staffGroups.find((g) => g.key === key);
    if (group?.items[0]) { setSvcSlug(group.items[0].slug); setDetails(false); }
  }

  function selectService(slug) {
    setSvcSlug(slug);
    setDetails(false);
  }

  function goStep(key) {
    setStep(key);
  }
  function nextStep() {
    if (step === 'servico') setStep('horario');
    else if (step === 'horario') setStep('detalhes');
    else submit();
  }
  function backStep() {
    if (step === 'detalhes') setStep('horario');
    else if (step === 'horario') setStep('servico');
  }

  useEffect(() => {
    if (!service) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- immediate loading flag on service change
    setLoadingDays(true);
    setDay(null);
    setTime(null);
    fetch(`/api/days?servico=${service.slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setDays(data.days || []);
        const firstFree = (data.days || []).find((d) => !d.disabled);
        if (firstFree) setDay(firstFree.value);
      })
      .finally(() => { if (!cancelled) setLoadingDays(false); });
    return () => { cancelled = true; };
  }, [service]);

  useEffect(() => {
    if (!service || !day) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear stale slots when selection is incomplete
      setSlots([]);
      return;
    }
    let cancelled = false;
    setLoadingSlots(true);
    setTime(null);
    fetch(`/api/availability?servico=${service.slug}&date=${day}`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setSlots(data.slots || []); })
      .finally(() => { if (!cancelled) setLoadingSlots(false); });
    return () => { cancelled = true; };
  }, [service, day]);

  if (!service) {
    return (
      <section id="agendar" style={{ padding: 'var(--section-y) var(--gutter)', textAlign: 'center' }}>
        <p style={{ margin: '0 auto 20px', maxWidth: '46ch', color: 'var(--ink-500)', fontFamily: 'var(--font-sans)' }}>
          O agendamento online ainda está sendo configurado. Fale com a gente pelo WhatsApp para marcar seu horário.
        </p>
        <Button variant="whatsapp" href={SITE.whatsappHref} iconLeft={<Icon name="message-circle" size={15} />}>Falar no WhatsApp</Button>
      </section>
    );
  }

  const dayLabel = dayLabelFor(days, day);
  const dayShort = dayShortFor(days, day);

  async function submit() {
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceSlug: service.slug, date: day, startTime: time, clientName: name, clientPhone: phone, note, wantsReminder: remind }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Não foi possível confirmar. Tente novamente.');
        if (res.status === 409) {
          const r = await fetch(`/api/availability?servico=${service.slug}&date=${day}`);
          setSlots((await r.json()).slots || []);
          setTime(null);
          setStep('horario');
        }
        return;
      }
      setConfirmation(data.appointment);
      setDone(true);
    } catch {
      setFormError('Não foi possível confirmar. Verifique sua conexão e tente de novo.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <section id="agendar" style={{ background: 'var(--surface-page)', padding: mobile ? '26px var(--gutter) 44px' : 'clamp(140px,14vw,200px) var(--gutter) var(--section-y)' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <ConfirmationPanel
            message={'Obrigada, ' + (name || 'linda') + '! Já reservei esse horário no meu caderno. Te espero no estúdio — qualquer mudança, me chama no WhatsApp.'}
            details={[
              { label: 'Serviço', value: service.name },
              { label: 'Data', value: dayShort },
              { label: 'Horário', value: confirmation?.startTime || time },
            ]}
            actions={
              <>
                <Button variant="whatsapp" href={SITE.whatsappHref} iconLeft={<Icon name="message-circle" size={15} />}>Falar no WhatsApp</Button>
                <Button variant="secondary" onClick={() => { setDone(false); setStep('servico'); setDetails(false); setConfirmation(null); setName(''); setPhone(''); setNote(''); }}>Agendar outro horário</Button>
              </>
            }
          />
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '34px' }}><Ornament width={200} /></div>
        </div>
      </section>
    );
  }

  if (variant === 'embedded') {
    return (
      <section id="agendar" style={{ position: 'relative', background: 'var(--surface-page)', overflow: 'hidden',
        padding: mobile ? '26px var(--gutter) 44px' : 'clamp(110px,12vw,170px) 0 var(--section-y)' }}>
        <div style={{ position: 'relative', maxWidth: 'var(--container)', margin: '0 auto', padding: mobile ? 0 : '0 var(--gutter)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'minmax(0,1fr)' : 'minmax(0,1.16fr) minmax(0,.84fr)',
            gap: mobile ? '28px' : 'clamp(28px,4vw,60px)', alignItems: 'start' }}>

            <div>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.26em',
                textTransform: 'uppercase', color: 'var(--champagne-600)' }}>Agendamento</span>
              <h2 style={{ margin: '22px 0 0', fontFamily: 'var(--font-serif-display)', fontWeight: 300,
                fontSize: mobile ? '2.2rem' : 'clamp(2.3rem,3.9vw,3.5rem)', lineHeight: 1.08,
                letterSpacing: '-0.01em', color: 'var(--ink-900)' }}>
                Vamos marcar<br />o seu momento
              </h2>
              <p style={{ margin: '24px 0 0', fontFamily: 'var(--font-sans)', fontSize: '1rem', lineHeight: 1.75,
                color: 'var(--ink-500)', maxWidth: '46ch' }}>
                Escolha o serviço ideal para você e reserve um horário. Cuidado, precisão e beleza em cada detalhe.
              </p>

              <div style={Object.assign({}, capsLabel, { display: 'block', margin: 'clamp(34px,4vw,52px) 0 18px' })}>Escolha seu serviço</div>

              {multiStaff && (
                <div className="bm-scroller" style={{ display: 'flex', gap: '8px', marginBottom: mobile ? '12px' : '16px', paddingBottom: '2px' }}>
                  {staffGroups.map((g) => {
                    const on = g.key === activeGroup?.key;
                    return (
                      <button key={g.key} onClick={() => selectStaffCat(g.key)}
                        style={{ flex: '0 0 auto', cursor: 'pointer', whiteSpace: 'nowrap', padding: '8px 15px',
                          fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 700,
                          borderRadius: '999px', border: '1px solid ' + (on ? 'var(--espresso-900)' : 'var(--border-hairline)'),
                          background: on ? 'var(--espresso-900)' : 'var(--surface-page)',
                          color: on ? 'var(--ivory-100)' : 'var(--ink-500)' }}>
                        {g.staffName || 'Outros serviços'}
                      </button>
                    );
                  })}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: mobile ? '8px' : '12px' }}>
                {visibleServices.map((s) => {
                  const on = svcSlug === s.slug;
                  return (
                    <button key={s.slug} onClick={() => selectService(s.slug)}
                      style={{ cursor: 'pointer', textAlign: 'left', display: 'grid',
                        gridTemplateColumns: mobile ? '18px 1fr auto' : '26px 1fr auto auto',
                        alignItems: 'center', gap: mobile ? '0 12px' : '0 clamp(14px,2vw,30px)',
                        padding: mobile ? '14px 16px' : 'clamp(20px,2vw,26px) clamp(18px,2vw,26px)',
                        background: on ? 'rgba(184,149,109,.06)' : 'transparent',
                        border: '1px solid ' + (on ? 'var(--champagne-500)' : 'var(--border-hairline)') }}>
                      <span style={{ width: mobile ? '18px' : '20px', height: mobile ? '18px' : '20px', borderRadius: '50%', flexShrink: 0,
                        border: '1px solid ' + (on ? 'var(--espresso-900)' : 'var(--border-strong)'),
                        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {on && <span style={{ width: mobile ? '8px' : '10px', height: mobile ? '8px' : '10px', borderRadius: '50%', background: 'var(--espresso-900)' }}></span>}
                      </span>
                      {mobile ? (
                        <span style={{ fontFamily: 'var(--font-serif-display)', fontWeight: 400,
                          fontSize: '1rem', lineHeight: 1.3, color: 'var(--ink-900)' }}>{s.name}</span>
                      ) : (
                        <span>
                          <span style={{ display: 'block', fontFamily: 'var(--font-serif-display)', fontWeight: 400,
                            fontSize: '1.3125rem', color: 'var(--ink-900)' }}>{s.name}</span>
                          <span style={{ display: 'block', marginTop: '6px', fontFamily: 'var(--font-sans)',
                            fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--ink-500)', maxWidth: '40ch' }}>{s.description}</span>
                        </span>
                      )}
                      {mobile ? (
                        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--ink-500)',
                            fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', whiteSpace: 'nowrap' }}>
                            <Icon name="clock" size={11} /> {s.duration}
                          </span>
                          <span style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.0625rem',
                            color: 'var(--ink-900)', whiteSpace: 'nowrap' }}>{s.price}</span>
                        </span>
                      ) : (
                        <>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink-500)',
                            fontFamily: 'var(--font-sans)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                            <Icon name="clock" size={14} /> {s.duration}
                          </span>
                          <span style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.375rem',
                            color: 'var(--ink-900)', whiteSpace: 'nowrap', minWidth: '84px', textAlign: 'right' }}>{s.price}</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
                marginTop: 'clamp(22px,2.4vw,30px)', padding: 'clamp(20px,2vw,26px)',
                background: 'var(--ivory-200)', border: '1px solid var(--border-hairline)' }}>
                <span style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'var(--nude-300)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--champagne-600)', flexShrink: 0 }}>
                  <Icon name="crown" size={19} />
                </span>
                <span style={{ flex: 1, minWidth: '200px' }}>
                  <span style={{ display: 'block', fontFamily: 'var(--font-serif-display)', fontSize: '1.1875rem', color: 'var(--ink-900)' }}>
                    Atendimento exclusivo com hora marcada
                  </span>
                  <span style={{ display: 'block', marginTop: '6px', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--ink-500)' }}>
                    Ambiente reservado para sua experiência de beleza e bem-estar.
                  </span>
                </span>
                <a href="#sobre" style={Object.assign({}, ghostAction, { border: 0 })}>Saiba mais <Icon name="arrow-right" size={13} /></a>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px',
              position: mobile ? 'static' : 'sticky', top: '120px' }}>
              <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-hairline)',
                padding: 'clamp(22px,2.2vw,30px)', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                  <span style={capsLabel}>Seu agendamento</span>
                  <button onClick={() => { setTime(null); setDetails(false); }} style={Object.assign({}, ghostAction, { color: 'var(--ink-500)' })}>
                    Limpar <Icon name="trash-2" size={13} />
                  </button>
                </div>

                <div>
                  <span style={{ display: 'block', fontFamily: 'var(--font-serif-display)', fontSize: '1.1875rem', color: 'var(--ink-900)' }}>{service.name}</span>
                  <span style={{ display: 'block', marginTop: '5px', fontFamily: 'var(--font-sans)', fontSize: '0.8125rem',
                    lineHeight: 1.6, color: 'var(--ink-500)' }}>{service.description}</span>
                </div>

                <span style={{ height: '1px', background: 'var(--border-hairline)' }}></span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={capsLabel}>Data</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--ink-900)' }}>
                      <span style={{ color: 'var(--champagne-600)', lineHeight: 0 }}><Icon name="calendar" size={15} /></span>
                      <span style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.125rem' }}>{loadingDays ? 'Carregando…' : dayLabel}</span>
                    </span>
                    {!mobile && (
                      <button onClick={() => setDateOpen(!dateOpen)} style={ghostAction}>Alterar <Icon name="pencil" size={12} /></button>
                    )}
                  </div>
                  {(mobile || dateOpen) && (
                    <div style={{ paddingTop: '6px', minWidth: 0 }}>
                      {days.length > 0 && (() => {
                        const [y, mo] = days[0].value.split('-');
                        const monthLabel = `${MONTH_LABELS[Number(mo) - 1]} ${y}`;
                        return <DateStrip monthLabel={monthLabel} days={days} value={day} onChange={(v) => { setDay(v); setTime(null); }} />;
                      })()}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
                  <span style={capsLabel}>Horário</span>
                  {loadingSlots ? (
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--ink-500)' }}>Carregando horários…</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: narrow ? 'repeat(3,minmax(0,1fr))' : 'repeat(4,minmax(0,1fr))', gap: '10px' }}>
                      {slots.map((s) => {
                        const on = time === s.value;
                        return (
                          <button key={s.value} disabled={s.disabled} onClick={() => setTime(s.value)}
                            style={{ cursor: s.disabled ? 'not-allowed' : 'pointer', padding: '13px 0',
                              fontFamily: 'var(--font-sans)', fontSize: '0.8125rem',
                              background: on ? 'var(--espresso-900)' : 'transparent',
                              color: on ? 'var(--ivory-100)' : (s.disabled ? 'var(--taupe-500)' : 'var(--ink-900)'),
                              textDecoration: s.disabled ? 'line-through' : 'none',
                              opacity: s.disabled ? .55 : 1,
                              border: '1px solid ' + (on ? 'var(--espresso-900)' : 'var(--border-hairline)') }}>{s.value}</button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <span style={{ height: '1px', background: 'var(--border-hairline)' }}></span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <span style={capsLabel}>Duração</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-sans)',
                      fontSize: '0.875rem', color: 'var(--ink-900)' }}><Icon name="clock" size={13} /> {service.duration}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <span style={capsLabel}>Valor</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--ink-900)' }}>{service.price}</span>
                  </div>
                </div>

                {details && (
                  <>
                    <span style={{ height: '1px', background: 'var(--border-hairline)' }}></span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <Field label="Nome" htmlFor="bf-n" required>
                        <Input id="bf-n" value={name} onChange={(e) => setName(e.target.value)} placeholder="Como te chamo?" />
                      </Field>
                      <Field label="WhatsApp" htmlFor="bf-p" required>
                        <Input id="bf-p" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(15) 99999-0000" />
                      </Field>
                      <Field label="Observação" hint="Formato, comprimento, inspiração.">
                        <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Quero algo natural, curtinho…" />
                      </Field>
                      <Checkbox checked={remind} onChange={() => setRemind(!remind)} label="Quero lembrete no WhatsApp um dia antes" />
                      {formError && <span style={{ color: 'var(--danger-500)', fontSize: '0.8125rem' }}>{formError}</span>}
                    </div>
                  </>
                )}

                <span style={{ height: '1px', background: 'var(--border-hairline)' }}></span>

                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' }}>
                  <span style={capsLabel}>Total</span>
                  <span style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.75rem', color: 'var(--ink-900)' }}>{service.price}</span>
                </div>

                <button
                  disabled={!time || submitting || (details && (!name || !phone))}
                  onClick={() => { details ? submit() : setDetails(true); }}
                  style={{ cursor: time ? 'pointer' : 'not-allowed', width: '100%', padding: '22px 20px',
                    background: 'var(--espresso-900)', color: 'var(--ivory-100)', border: '1px solid var(--espresso-900)',
                    opacity: time ? 1 : .45, fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 600,
                    letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  {submitting ? 'Confirmando…' : (details ? 'Confirmar agendamento' : 'Confirmar horário')}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px',
                fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--taupe-500)' }}>
                <Icon name="lock" size={12} /> Seus dados estão protegidos e seguros.
              </div>
              <Button variant="whatsapp" fullWidth href={SITE.whatsappHref} iconLeft={<Icon name="message-circle" size={15} />}>
                Preferir falar comigo
              </Button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(4,1fr)',
            marginTop: 'clamp(40px,5vw,72px)', border: '1px solid var(--border-hairline)' }}>
            {BENEFITS.map(([ic, t, d], i) => (
              <div key={t} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start',
                padding: 'clamp(22px,2.2vw,30px)',
                borderRight: (!mobile && i < 3) ? '1px solid var(--border-hairline)' : 'none',
                borderBottom: (mobile && i < 3) ? '1px solid var(--border-hairline)' : 'none' }}>
                <span style={{ color: 'var(--champagne-600)', lineHeight: 0, flexShrink: 0, paddingTop: '3px' }}><Icon name={ic} size={22} /></span>
                <span>
                  <span style={{ display: 'block', fontFamily: 'var(--font-serif-display)', fontSize: '1.0625rem', color: 'var(--ink-900)' }}>{t}</span>
                  <span style={{ display: 'block', marginTop: '6px', fontFamily: 'var(--font-sans)', fontSize: '0.8125rem',
                    lineHeight: 1.6, color: 'var(--ink-500)' }}>{d}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const canGoHorario = Boolean(time);
  const canSubmit = Boolean(name && phone);
  const nextDisabled = (step === 'horario' && !canGoHorario) || (step === 'detalhes' && (!canSubmit || submitting));
  const nextLabel = step === 'servico' ? 'Escolher horário' : step === 'horario' ? 'Continuar' : (submitting ? 'Confirmando…' : 'Confirmar agendamento');

  return (
    <section id="agendar" style={{ position: 'relative', background: 'var(--surface-page)', overflow: 'hidden',
      padding: mobile ? '26px var(--gutter) 44px' : 'clamp(110px,12vw,170px) 0 var(--section-y)' }}>
      <div style={{ position: 'relative', maxWidth: 'var(--container)', margin: '0 auto', padding: mobile ? 0 : '0 var(--gutter)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'minmax(0,1fr)' : 'minmax(0,1fr) minmax(0,440px)',
          gap: mobile ? '24px' : 'clamp(28px,4vw,60px)', alignItems: 'start' }}>

          <div>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.26em',
              textTransform: 'uppercase', color: 'var(--champagne-600)' }}>Agendamento</span>
            <h2 style={{ margin: '22px 0 0', fontFamily: 'var(--font-serif-display)', fontWeight: 300,
              fontSize: mobile ? '2.2rem' : 'clamp(2.3rem,3.9vw,3.5rem)', lineHeight: 1.08,
              letterSpacing: '-0.01em', color: 'var(--ink-900)' }}>
              Vamos marcar<br />o seu momento
            </h2>
            <p style={{ margin: '24px 0 0', fontFamily: 'var(--font-sans)', fontSize: '1rem', lineHeight: 1.75,
              color: 'var(--ink-500)', maxWidth: '46ch' }}>
              Escolha o serviço ideal para você e reserve um horário. Três passos rápidos — cuidado, precisão e beleza em cada detalhe.
            </p>

            {!mobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
                marginTop: 'clamp(30px,3vw,44px)', padding: 'clamp(20px,2vw,26px)',
                background: 'var(--ivory-200)', border: '1px solid var(--border-hairline)' }}>
                <span style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'var(--nude-300)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--champagne-600)', flexShrink: 0 }}>
                  <Icon name="crown" size={19} />
                </span>
                <span style={{ flex: 1, minWidth: '200px' }}>
                  <span style={{ display: 'block', fontFamily: 'var(--font-serif-display)', fontSize: '1.1875rem', color: 'var(--ink-900)' }}>
                    Atendimento exclusivo com hora marcada
                  </span>
                  <span style={{ display: 'block', marginTop: '6px', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--ink-500)' }}>
                    Ambiente reservado para sua experiência de beleza e bem-estar.
                  </span>
                </span>
              </div>
            )}
          </div>

          <div style={{ position: mobile ? 'static' : 'sticky', top: '120px' }}>
            <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div style={{ display: 'flex' }}>
                {STEPS.map((s, i) => {
                  const on = step === s.key;
                  const reachable = i === 0 || (i === 1 && service) || (i === 2 && time);
                  return (
                    <button key={s.key} disabled={!reachable} onClick={() => goStep(s.key)}
                      style={{ flex: 1, cursor: reachable ? 'pointer' : 'not-allowed', textAlign: 'center', padding: '14px 6px',
                        fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em',
                        background: 'none', border: 'none', borderBottom: '2px solid ' + (on ? 'var(--rose-500)' : 'transparent'),
                        color: on ? 'var(--cocoa-800)' : (reachable ? 'var(--ink-500)' : 'var(--taupe-500)') }}>
                      {i + 1}. {s.label}
                    </button>
                  );
                })}
              </div>

              <div style={{ padding: mobile ? '18px' : '24px', display: 'flex', flexDirection: 'column', gap: '18px', minHeight: '360px' }}>

                {step === 'servico' && (
                  <>
                    {multiStaff && (
                      <div className="bm-scroller" style={{ display: 'flex', gap: '8px' }}>
                        {staffGroups.map((g) => {
                          const on = g.key === activeGroup?.key;
                          return (
                            <button key={g.key} onClick={() => selectStaffCat(g.key)}
                              style={{ flex: '0 0 auto', cursor: 'pointer', whiteSpace: 'nowrap', padding: '7px 14px',
                                fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 700,
                                borderRadius: '999px', border: '1px solid ' + (on ? 'var(--espresso-900)' : 'var(--border-hairline)'),
                                background: on ? 'var(--espresso-900)' : 'var(--surface-page)',
                                color: on ? 'var(--ivory-100)' : 'var(--ink-500)' }}>
                              {g.staffName || 'Outros'}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {visibleServices.map((s) => {
                        const on = svcSlug === s.slug;
                        return (
                          <button key={s.slug} onClick={() => selectService(s.slug)}
                            style={{ cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px',
                              padding: '13px 14px', borderRadius: 'var(--radius-sm)',
                              background: on ? 'var(--blush-400)' : 'var(--surface-page)',
                              border: '1px solid ' + (on ? 'var(--rose-500)' : 'var(--border-hairline)') }}>
                            <span style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink-900)' }}>{s.name}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ink-500)', fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', whiteSpace: 'nowrap', flex: '0 0 auto' }}>
                              <Icon name="clock" size={11} /> {s.duration}
                            </span>
                            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--cocoa-800)', whiteSpace: 'nowrap', flex: '0 0 auto' }}>{s.price}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {step === 'horario' && (
                  <>
                    <ServiceRecap service={service} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <span style={capsLabel}>Data</span>
                      {loadingDays ? (
                        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--ink-500)' }}>Carregando…</p>
                      ) : days.length > 0 && (() => {
                        const [y, mo] = days[0].value.split('-');
                        const monthLabel = `${MONTH_LABELS[Number(mo) - 1]} ${y}`;
                        return <DateStrip monthLabel={monthLabel} days={days} value={day} onChange={(v) => setDay(v)} />;
                      })()}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <span style={capsLabel}>Horário</span>
                      {loadingSlots ? (
                        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--ink-500)' }}>Carregando horários…</p>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: '8px' }}>
                          {slots.map((s) => {
                            const on = time === s.value;
                            return (
                              <button key={s.value} disabled={s.disabled} onClick={() => setTime(s.value)}
                                style={{ cursor: s.disabled ? 'not-allowed' : 'pointer', padding: '11px 0',
                                  fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)',
                                  background: on ? 'var(--espresso-900)' : 'transparent',
                                  color: on ? 'var(--ivory-100)' : (s.disabled ? 'var(--taupe-500)' : 'var(--ink-900)'),
                                  textDecoration: s.disabled ? 'line-through' : 'none',
                                  opacity: s.disabled ? .55 : 1,
                                  border: '1px solid ' + (on ? 'var(--espresso-900)' : 'var(--border-hairline)') }}>{s.value}</button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {step === 'detalhes' && (
                  <>
                    <ServiceRecap service={service} extra={`${dayShort} · ${time}`} />
                    <Field label="Nome" htmlFor="bf-n" required>
                      <Input id="bf-n" value={name} onChange={(e) => setName(e.target.value)} placeholder="Como te chamo?" />
                    </Field>
                    <Field label="WhatsApp" htmlFor="bf-p" required>
                      <Input id="bf-p" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(15) 99999-0000" />
                    </Field>
                    <Field label="Observação" hint="Formato, comprimento, inspiração.">
                      <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Quero algo natural, curtinho…" />
                    </Field>
                    <Checkbox checked={remind} onChange={() => setRemind(!remind)} label="Quero lembrete no WhatsApp um dia antes" />
                    {formError && <span style={{ color: 'var(--danger-500)', fontSize: '0.8125rem' }}>{formError}</span>}
                  </>
                )}
              </div>

              <div style={{ padding: mobile ? '14px 18px' : '16px 24px', borderTop: '1px solid var(--border-hairline)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                {step !== 'servico' ? (
                  <button onClick={backStep} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 0,
                    cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-500)' }}>
                    <Icon name="arrow-left" size={13} /> Voltar
                  </button>
                ) : (
                  <span style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.25rem', color: 'var(--ink-900)' }}>{service.price}</span>
                )}
                <Button disabled={nextDisabled} onClick={nextStep}
                  iconRight={step !== 'detalhes' ? <Icon name="arrow-right" size={14} /> : undefined}>
                  {nextLabel}
                </Button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px', marginTop: '14px',
              fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--taupe-500)' }}>
              <Icon name="lock" size={12} /> Seus dados estão protegidos e seguros.
            </div>
            <div style={{ marginTop: '10px' }}>
              <Button variant="whatsapp" fullWidth href={SITE.whatsappHref} iconLeft={<Icon name="message-circle" size={15} />}>
                Preferir falar comigo
              </Button>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(4,1fr)',
          marginTop: 'clamp(40px,5vw,72px)', border: '1px solid var(--border-hairline)' }}>
          {BENEFITS.map(([ic, t, d], i) => (
            <div key={t} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start',
              padding: 'clamp(22px,2.2vw,30px)',
              borderRight: (!mobile && i < 3) ? '1px solid var(--border-hairline)' : 'none',
              borderBottom: (mobile && i < 3) ? '1px solid var(--border-hairline)' : 'none' }}>
              <span style={{ color: 'var(--champagne-600)', lineHeight: 0, flexShrink: 0, paddingTop: '3px' }}><Icon name={ic} size={22} /></span>
              <span>
                <span style={{ display: 'block', fontFamily: 'var(--font-serif-display)', fontSize: '1.0625rem', color: 'var(--ink-900)' }}>{t}</span>
                <span style={{ display: 'block', marginTop: '6px', fontFamily: 'var(--font-sans)', fontSize: '0.8125rem',
                  lineHeight: 1.6, color: 'var(--ink-500)' }}>{d}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Small reminder of what's already chosen, shown at the top of the later
// steps so picking a date/time or filling the form never feels disconnected
// from the service selected a step ago.
function ServiceRecap({ service, extra }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
      padding: '10px 14px', background: 'var(--ivory-200)', borderRadius: 'var(--radius-sm)' }}>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink-900)' }}>
        {service.name}{extra ? ` · ${extra}` : ''}
      </span>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--cocoa-800)' }}>{service.price}</span>
    </div>
  );
}
