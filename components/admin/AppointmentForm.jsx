'use client';

import { useEffect, useState } from 'react';
import { Button } from '../core/Button';
import { IconButton } from '../core/IconButton';
import { Icon } from '../core/Icon';
import { Field } from '../forms/Field';
import { Input } from '../forms/Input';
import { Select } from '../forms/Select';
import { Textarea } from '../forms/Textarea';
import { useMobile } from '../../lib/useMobile';

const STATUS_OPTIONS = [
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'COMPLETED', label: 'Concluído' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

// Create OR edit an appointment: catalog service or a typed-on-the-spot
// ad-hoc one, reschedule, client info, status — all in one overlay form.
export function AppointmentForm({ open, onClose, appointmentId, defaults, onSaved }) {
  const m = useMobile();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [conflict, setConflict] = useState(false);

  const [mode, setMode] = useState('catalog');
  const [serviceId, setServiceId] = useState('');
  const [customServiceName, setCustomServiceName] = useState('');
  const [customDurationMin, setCustomDurationMin] = useState('');
  const [customPriceReais, setCustomPriceReais] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('CONFIRMED');

  const editing = !!appointmentId;

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset form status on open
    setError(null);
    setConflict(false);
    fetch('/api/admin/services').then((r) => r.json()).then((data) => {
      if (cancelled) return;
      setServices((data.services || []).filter((s) => s.active));
    });

    if (appointmentId) {
      setLoading(true);
      fetch(`/api/admin/appointments/${appointmentId}`).then((r) => r.json()).then((data) => {
        if (cancelled) return;
        const a = data.appointment;
        if (!a) { setError('Agendamento não encontrado.'); return; }
        setMode(a.serviceId ? 'catalog' : 'adhoc');
        setServiceId(a.serviceId || '');
        setCustomServiceName(a.customServiceName || '');
        setCustomDurationMin(a.customDurationMin != null ? String(a.customDurationMin) : '');
        setCustomPriceReais(a.customPriceCents != null ? String(Math.round(a.customPriceCents / 100)) : '');
        setDate(a.date);
        setStartTime(a.startTime);
        setClientName(a.clientName);
        setClientPhone(a.clientPhone);
        setNote(a.note || '');
        setStatus(a.status);
      }).finally(() => { if (!cancelled) setLoading(false); });
    } else {
      setMode('catalog');
      setServiceId('');
      setCustomServiceName('');
      setCustomDurationMin('');
      setCustomPriceReais('');
      setDate(defaults?.date || '');
      setStartTime(defaults?.startTime || '');
      setClientName('');
      setClientPhone('');
      setNote('');
      setStatus('CONFIRMED');
    }
    return () => { cancelled = true; };
  }, [open, appointmentId, defaults]);

  if (!open) return null;

  async function submit(e, force = false) {
    if (e) e.preventDefault();
    setError(null);
    setSaving(true);

    const body = {
      date, startTime, clientName, clientPhone,
      note: note || null,
      force,
    };
    if (editing) body.status = status;

    if (mode === 'catalog') {
      if (!serviceId) { setError('Escolha um serviço.'); setSaving(false); return; }
      body.serviceId = serviceId;
      const selected = services.find((s) => s.id === serviceId);
      if (selected && selected.durationMin == null) {
        const duration = Number(customDurationMin);
        if (!Number.isFinite(duration) || duration < 5) {
          setError('Esse serviço ainda não tem duração cadastrada — informe a duração deste atendimento.');
          setSaving(false);
          return;
        }
        body.customDurationMin = Math.round(duration);
      }
    } else {
      const price = Number(customPriceReais);
      const duration = Number(customDurationMin);
      if (!customServiceName.trim() || !Number.isFinite(price) || price < 0 || !Number.isFinite(duration) || duration < 5) {
        setError('Preencha nome, preço e duração do serviço avulso.');
        setSaving(false);
        return;
      }
      if (editing) body.serviceId = null;
      body.customServiceName = customServiceName.trim();
      body.customPriceCents = Math.round(price * 100);
      body.customDurationMin = Math.round(duration);
    }

    const url = editing ? `/api/admin/appointments/${appointmentId}` : '/api/admin/appointments';
    const method = editing ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (res.status === 409 && data.conflict) { setConflict(true); return; }
    if (!res.ok) { setError(data.error || 'Não foi possível salvar.'); return; }

    onSaved();
  }

  async function remove() {
    if (!window.confirm('Excluir este agendamento? Essa ação não pode ser desfeita.')) return;
    setDeleting(true);
    await fetch(`/api/admin/appointments/${appointmentId}`, { method: 'DELETE' });
    setDeleting(false);
    onSaved();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(30,22,20,.4)', zIndex: 100,
      display: 'flex', alignItems: m ? 'stretch' : 'flex-start', justifyContent: 'center',
      padding: m ? 0 : '5vh 16px', overflowY: 'auto' }}
      onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--surface-card)',
        borderRadius: m ? 0 : 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', width: '100%',
        maxWidth: m ? 'none' : '560px', minHeight: m ? '100vh' : 'auto', padding: m ? '22px 18px' : '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontWeight: 300, fontSize: m ? '1.3rem' : '1.5rem', color: 'var(--text-heading)' }}>
            {editing ? 'Editar agendamento' : 'Novo agendamento'}
          </h2>
          <IconButton label="Fechar" variant="bare" size={m ? 40 : 36} onClick={onClose}><Icon name="x" size={18} /></IconButton>
        </div>

        {loading ? <p style={{ color: 'var(--text-muted)' }}>Carregando…</p> : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Button type="button" size="sm" variant={mode === 'catalog' ? 'primary' : 'secondary'} onClick={() => setMode('catalog')}>Serviço do catálogo</Button>
              <Button type="button" size="sm" variant={mode === 'adhoc' ? 'primary' : 'secondary'} onClick={() => setMode('adhoc')}>Serviço avulso</Button>
            </div>

            {mode === 'catalog' ? (
              <>
                <Field label="Serviço" htmlFor="af-service" required>
                  <Select id="af-service" value={serviceId} required placeholder="Selecione…"
                    onChange={(e) => { setServiceId(e.target.value); setCustomDurationMin(''); }}
                    options={services.map((s) => ({ value: s.id, label: `${s.name} · ${s.duration || 'sem duração cadastrada'} · ${s.price || 'sem preço cadastrado'}` }))} />
                </Field>
                {(() => {
                  const selected = services.find((s) => s.id === serviceId);
                  if (!selected || selected.durationMin != null) return null;
                  return (
                    <Field label="Duração deste atendimento (min)" htmlFor="af-catalog-dur" hint="Esse serviço ainda não tem duração cadastrada no catálogo" required>
                      <Input id="af-catalog-dur" type="number" min="5" step="5" value={customDurationMin} onChange={(e) => setCustomDurationMin(e.target.value)} required />
                    </Field>
                  );
                })()}
              </>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : '1fr 1fr 1fr', gap: '14px' }}>
                <Field label="Nome do serviço" htmlFor="af-cname" required style={m ? undefined : { gridColumn: '1 / -1' }}>
                  <Input id="af-cname" value={customServiceName} onChange={(e) => setCustomServiceName(e.target.value)} required />
                </Field>
                <Field label="Duração (min)" htmlFor="af-cdur" required>
                  <Input id="af-cdur" type="number" min="5" step="5" value={customDurationMin} onChange={(e) => setCustomDurationMin(e.target.value)} required />
                </Field>
                <Field label="Preço (R$)" htmlFor="af-cprice" required>
                  <Input id="af-cprice" type="number" min="0" step="1" value={customPriceReais} onChange={(e) => setCustomPriceReais(e.target.value)} required />
                </Field>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : '1fr 1fr', gap: '14px' }}>
              <Field label="Data" htmlFor="af-date" required>
                <Input id="af-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </Field>
              <Field label="Horário" htmlFor="af-time" required>
                <Input id="af-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : '1fr 1fr', gap: '14px' }}>
              <Field label="Cliente" htmlFor="af-name" hint="Opcional">
                <Input id="af-name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
              </Field>
              <Field label="WhatsApp" htmlFor="af-phone" hint="Opcional">
                <Input id="af-phone" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
              </Field>
            </div>

            <Field label="Observações" htmlFor="af-note" hint="Opcional">
              <Textarea id="af-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>

            {editing && (
              <Field label="Status" htmlFor="af-status">
                <Select id="af-status" value={status} onChange={(e) => setStatus(e.target.value)} options={STATUS_OPTIONS} />
              </Field>
            )}

            {conflict && (
              <div style={{ padding: '12px 16px', background: 'var(--nude-300)', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: 'var(--text-small)', color: 'var(--danger-500)' }}>Esse horário conflita com outro agendamento ou bloqueio.</span>
                <Button type="button" size="sm" variant="secondary" fullWidth={m} onClick={() => submit(null, true)} disabled={saving}>Confirmar mesmo assim</Button>
              </div>
            )}
            {error && <p style={{ margin: 0, color: 'var(--danger-500)', fontSize: 'var(--text-small)' }}>{error}</p>}

            <div style={{ display: 'flex', flexDirection: m ? 'column' : 'row', justifyContent: 'space-between', alignItems: m ? 'stretch' : 'center', gap: m ? '20px' : '14px', marginTop: '6px' }}>
              {m ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Button type="submit" fullWidth disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</Button>
                    <Button type="button" variant="secondary" fullWidth onClick={onClose}>Cancelar</Button>
                  </div>
                  {editing && (
                    <Button type="button" variant="ghost" fullWidth onClick={remove} disabled={deleting} iconLeft={<Icon name="trash" size={15} />}>
                      {deleting ? 'Excluindo…' : 'Excluir agendamento'}
                    </Button>
                  )}
                </>
              ) : (
                <>
                  {editing ? (
                    <Button type="button" variant="ghost" onClick={remove} disabled={deleting} iconLeft={<Icon name="trash" size={15} />}>
                      {deleting ? 'Excluindo…' : 'Excluir'}
                    </Button>
                  ) : <span />}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</Button>
                  </div>
                </>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
