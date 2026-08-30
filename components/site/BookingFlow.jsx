'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '../core/Button';
import { Surface } from '../core/Surface';
import { SectionHeading } from '../core/SectionHeading';
import { Ornament } from '../core/Ornament';
import { DateStrip } from '../booking/DateStrip';
import { TimeSlotGrid } from '../booking/TimeSlotGrid';
import { BookingSummary } from '../booking/BookingSummary';
import { ConfirmationPanel } from '../booking/ConfirmationPanel';
import { ServiceRow } from '../booking/ServiceRow';
import { Field } from '../forms/Field';
import { Input } from '../forms/Input';
import { Textarea } from '../forms/Textarea';
import { Checkbox } from '../forms/Checkbox';
import { Icon } from '../core/Icon';
import { SITE } from '../../lib/site-config';
import { MONTH_LABELS, formatPriceCents } from '../../lib/studio';

function StepRail({ step, labels }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
      {labels.map((l, i) => (
        <span key={l} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px',
            fontFamily: 'var(--font-sans)', fontSize: '10.5px', letterSpacing: '0.16em', textTransform: 'uppercase',
            color: i === step ? 'var(--cocoa-800)' : 'var(--text-muted)', opacity: i > step ? .55 : 1 }}>
            <span style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1rem',
              color: i <= step ? 'var(--rose-500)' : 'var(--text-muted)' }}>{'0' + (i + 1)}</span>{l}
          </span>
          {i < labels.length - 1 && <span style={{ width: '26px', height: '1px', background: 'var(--border-strong)' }}></span>}
        </span>
      ))}
    </div>
  );
}

function dayLabelFor(days, value) {
  const d = days.find((x) => x.value === value);
  return d ? `${d.day} · ${d.weekday}` : '—';
}

export function BookingFlow({ services, initialServiceSlug, layout = 'desktop' }) {
  const mobile = layout === 'mobile';
  const [step, setStep] = useState(0);
  const [svcSlug, setSvcSlug] = useState(initialServiceSlug || services[0]?.slug);
  const service = useMemo(() => services.find((s) => s.slug === svcSlug) || services[0], [services, svcSlug]);

  const [days, setDays] = useState([]);
  const [day, setDay] = useState(null);
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState(null);
  const [loadingDays, setLoadingDays] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [remind, setRemind] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    if (!service) return;
    let cancelled = false;
    // Loading/reset flags are set synchronously so the UI reacts to the
    // service change immediately, not only once the fetch settles.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      <section id="agendar" style={{ padding: 'var(--section-y) var(--gutter)', textAlign: 'center', color: 'var(--text-muted)' }}>
        Nenhum serviço disponível no momento.
      </section>
    );
  }

  const monthLabel = days.length
    ? (() => { const [y, m] = days[0].value.split('-'); return `${MONTH_LABELS[Number(m) - 1]} ${y}`; })()
    : '';
  const dayLabel = dayLabelFor(days, day);

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
        }
        return;
      }
      setConfirmation(data.appointment);
      setStep(3);
    } catch {
      setFormError('Não foi possível confirmar. Verifique sua conexão e tente de novo.');
    } finally {
      setSubmitting(false);
    }
  }

  const summary = (
    <BookingSummary
      items={[
        { label: 'Serviço', value: service.name },
        { label: 'Duração', value: service.duration },
        { label: 'Data', value: dayLabel },
        { label: 'Horário', value: time || '—' },
      ]}
      total={service.price}
      note="Sinal de 20% no PIX confirma o horário. Remarcações até 24h antes."
      footer={step < 2 ? (
        <Button fullWidth disabled={!time} onClick={() => setStep(2)}>Continuar</Button>
      ) : (
        <Button fullWidth variant="accent" disabled={!name || !phone || submitting} onClick={submit}>
          {submitting ? 'Confirmando…' : 'Confirmar horário'}
        </Button>
      )}
    />
  );

  return (
    <section id="agendar" style={{ padding: mobile ? '22px 18px 40px' : 'var(--section-y-tight) 0 var(--section-y)' }}>
      <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: mobile ? 0 : '0 var(--gutter)' }}>
        {step < 3 ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', marginBottom: mobile ? '26px' : '46px' }}>
              <SectionHeading eyebrow="Agendamento" title={mobile ? 'Escolha seu horário' : <>Vamos marcar<br />o seu momento</>} maxWidth={520}
                lead={mobile ? null : 'Selecione o serviço, o dia e o horário. Você recebe a confirmação no WhatsApp.'} />
              <StepRail step={step} labels={['Serviço', 'Data e hora', 'Seus dados']} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1.25fr .75fr', gap: mobile ? '28px' : 'clamp(28px,4vw,64px)', alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '34px' }}>
                {step === 0 && (
                  <div style={{ borderBottom: '1px solid var(--border-hairline)' }}>
                    {services.map((s) => (
                      <ServiceRow key={s.slug} name={s.name} description={s.description} duration={s.duration}
                        price={s.price} priceNote={s.priceNote} tags={s.tags}
                        selected={svcSlug === s.slug} action="Selecionar"
                        onSelect={() => { setSvcSlug(s.slug); setStep(1); }} />
                    ))}
                  </div>
                )}
                {step === 1 && (
                  <>
                    <Surface padding={mobile ? 20 : 26} elevation="none">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
                        {loadingDays
                          ? <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--text-small)' }}>Carregando dias…</p>
                          : <DateStrip monthLabel={monthLabel} days={days} value={day} onChange={setDay} />}
                        <span style={{ height: '1px', background: 'var(--border-hairline)' }}></span>
                        {loadingSlots
                          ? <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--text-small)' }}>Carregando horários…</p>
                          : <TimeSlotGrid label={'Horários em ' + dayLabel} slots={slots} value={time} onChange={setTime} />}
                        <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-caption)', color: 'var(--text-muted)' }}>
                          Horários riscados já estão reservados.
                        </p>
                      </div>
                    </Surface>
                    <button onClick={() => setStep(0)} style={{ alignSelf: 'flex-start', background: 'none', border: 0, padding: 0, cursor: 'pointer',
                      fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      ← Trocar serviço
                    </button>
                  </>
                )}
                {step === 2 && (
                  <>
                    <Surface padding={mobile ? 20 : 26} elevation="none">
                      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: '20px 22px' }}>
                        <Field label="Nome" htmlFor="bf-n" required>
                          <Input id="bf-n" value={name} onChange={(e) => setName(e.target.value)} placeholder="Como te chamo?" />
                        </Field>
                        <Field label="WhatsApp" htmlFor="bf-p" required>
                          <Input id="bf-p" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(15) 99999-0000" />
                        </Field>
                        <div style={{ gridColumn: mobile ? 'auto' : '1 / -1' }}>
                          <Field label="Observação" hint="Formato, comprimento, inspiração — o que você quiser contar.">
                            <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Quero algo natural, curtinho…" />
                          </Field>
                        </div>
                        <div style={{ gridColumn: mobile ? 'auto' : '1 / -1' }}>
                          <Checkbox checked={remind} onChange={() => setRemind(!remind)} label="Quero lembrete no WhatsApp um dia antes" />
                        </div>
                        {formError && (
                          <div style={{ gridColumn: mobile ? 'auto' : '1 / -1', color: 'var(--danger-500)', fontSize: 'var(--text-small)' }}>{formError}</div>
                        )}
                      </div>
                    </Surface>
                    <button onClick={() => setStep(1)} style={{ alignSelf: 'flex-start', background: 'none', border: 0, padding: 0, cursor: 'pointer',
                      fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      ← Trocar data
                    </button>
                  </>
                )}
              </div>
              <div style={{ position: mobile ? 'static' : 'sticky', top: '118px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {summary}
                <Button variant="whatsapp" fullWidth href={SITE.whatsappHref} iconLeft={<Icon name="message-circle" size={15} />}>
                  Preferir falar comigo
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <ConfirmationPanel
              message={'Obrigada, ' + (name || 'linda') + '! Já reservei esse horário no meu caderno. Te espero no estúdio — qualquer mudança, me chama no WhatsApp.'}
              details={[
                { label: 'Serviço', value: service.name },
                { label: 'Data', value: dayLabel },
                { label: 'Horário', value: confirmation?.startTime || time },
                { label: 'Sinal', value: formatPriceCents(confirmation?.depositCents ?? Math.round(service.priceCents * 0.2)) },
              ]}
              actions={
                <>
                  <Button variant="whatsapp" href={SITE.whatsappHref} iconLeft={<Icon name="message-circle" size={15} />}>Falar no WhatsApp</Button>
                  <Button variant="secondary" onClick={() => { setStep(0); setTime(null); setConfirmation(null); setName(''); setPhone(''); setNote(''); }}>Agendar outro horário</Button>
                </>
              }
            />
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '34px' }}><Ornament width={200} /></div>
          </div>
        )}
      </div>
    </section>
  );
}
