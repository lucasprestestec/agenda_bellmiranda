'use client';

import { useEffect, useState } from 'react';
import { AdminHeader } from '../../../components/admin/AdminHeader';
import { Button } from '../../../components/core/Button';
import { IconButton } from '../../../components/core/IconButton';
import { Icon } from '../../../components/core/Icon';
import { Surface } from '../../../components/core/Surface';
import { Field } from '../../../components/forms/Field';
import { Input } from '../../../components/forms/Input';
import { Textarea } from '../../../components/forms/Textarea';
import { useMobile } from '../../../lib/useMobile';

const emptyDraft = { name: '', description: '', priceReais: '', durationMin: '', priceNote: '', tags: '', order: '0' };

function toDraft(service) {
  return {
    name: service.name,
    description: service.description || '',
    priceReais: service.priceCents != null ? String(Math.round(service.priceCents / 100)) : '',
    durationMin: service.durationMin != null ? String(service.durationMin) : '',
    priceNote: service.priceNote || '',
    tags: (service.tags || []).join(', '),
    order: String(service.order ?? 0),
  };
}

function toPayload(draft) {
  return {
    name: draft.name.trim(),
    description: draft.description.trim(),
    priceCents: draft.priceReais === '' ? null : Math.round(Number(draft.priceReais) * 100),
    durationMin: draft.durationMin === '' ? null : Number(draft.durationMin),
    priceNote: draft.priceNote.trim() || null,
    tags: draft.tags.trim() || null,
    order: Number(draft.order) || 0,
  };
}

function isValidPayload(payload) {
  if (!payload.name) return false;
  if (payload.priceCents !== null && (!Number.isFinite(payload.priceCents) || payload.priceCents < 0)) return false;
  return true;
}

export default function AdminServicesPage() {
  const m = useMobile();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [creating, setCreating] = useState(false);
  const [newDraft, setNewDraft] = useState(emptyDraft);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    fetch('/api/admin/services').then((r) => r.json()).then((data) => setServices(data.services || [])).finally(() => setLoading(false));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- immediate loading flag on mount
    load();
  }, []);

  function startEdit(service) {
    setEditingId(service.id);
    setDrafts((d) => ({ ...d, [service.id]: toDraft(service) }));
    setError(null);
  }

  function updateDraft(id, patch) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }));
  }

  async function saveEdit(id) {
    const payload = toPayload(drafts[id]);
    if (!isValidPayload(payload)) {
      setError('Nome é obrigatório, e o preço (se informado) precisa ser válido.');
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/admin/services/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) { const data = await res.json().catch(() => ({})); setError(data.error || 'Não foi possível salvar.'); return; }
    setEditingId(null);
    load();
  }

  async function toggleActive(service) {
    await fetch(`/api/admin/services/${service.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !service.active }),
    });
    load();
  }

  async function remove(service) {
    if (!window.confirm(`Excluir "${service.name}"? Se já tiver agendamentos, o serviço será apenas desativado.`)) return;
    await fetch(`/api/admin/services/${service.id}`, { method: 'DELETE' });
    load();
  }

  async function createService(e) {
    e.preventDefault();
    setError(null);
    const payload = toPayload(newDraft);
    if (!isValidPayload(payload)) {
      setError('Nome é obrigatório, e o preço (se informado) precisa ser válido.');
      return;
    }
    setSaving(true);
    const res = await fetch('/api/admin/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) { const data = await res.json().catch(() => ({})); setError(data.error || 'Não foi possível criar.'); return; }
    setNewDraft(emptyDraft);
    setCreating(false);
    load();
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-page)' }}>
      <AdminHeader />

      <main style={{ maxWidth: '880px', margin: '0 auto', padding: m ? '24px var(--gutter) 60px' : '40px var(--gutter) 80px',
        display: 'flex', flexDirection: 'column', gap: m ? '22px' : '32px' }}>
        <div style={{ display: 'flex', flexDirection: m ? 'column' : 'row', alignItems: m ? 'stretch' : 'center',
          justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-eyebrow)', letterSpacing: 'var(--tracking-eyebrow)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Catálogo</span>
            <h1 style={{ margin: '10px 0 0', fontFamily: 'var(--font-serif-display)', fontWeight: 300, fontSize: m ? '1.5rem' : '1.75rem', color: 'var(--text-heading)' }}>Serviços e preços</h1>
          </div>
          <Button fullWidth={m} iconLeft={<Icon name="plus" size={15} />} onClick={() => { setCreating((c) => !c); setError(null); }}>
            {creating ? 'Fechar' : 'Novo serviço'}
          </Button>
        </div>

        {creating && (
          <Surface padding={m ? 16 : 24} elevation="sm">
            <form onSubmit={createService} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <ServiceFields draft={newDraft} onChange={(patch) => setNewDraft((d) => ({ ...d, ...patch }))} idPrefix="new" mobile={m} />
              <div style={{ display: 'flex', justifyContent: m ? 'stretch' : 'flex-end', gap: '10px' }}>
                <Button type="submit" fullWidth={m} disabled={saving}>{saving ? 'Salvando…' : 'Criar serviço'}</Button>
              </div>
            </form>
          </Surface>
        )}

        {error && <p style={{ margin: 0, color: 'var(--danger-500)', fontSize: 'var(--text-small)' }}>{error}</p>}

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Carregando…</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {services.map((service) => (
              <Surface key={service.id} padding={m ? 16 : 20} elevation="xs" style={{ opacity: service.active ? 1 : 0.55 }}>
                {editingId === service.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <ServiceFields draft={drafts[service.id]} onChange={(patch) => updateDraft(service.id, patch)} idPrefix={service.id} mobile={m} />
                    <div style={{ display: 'flex', flexDirection: m ? 'column-reverse' : 'row', justifyContent: 'flex-end', gap: '10px' }}>
                      <Button variant="secondary" fullWidth={m} onClick={() => setEditingId(null)}>Cancelar</Button>
                      <Button fullWidth={m} onClick={() => saveEdit(service.id)} disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</Button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: m ? 'column' : 'row', justifyContent: 'space-between', gap: m ? '12px' : '20px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.25rem', color: 'var(--text-heading)' }}>{service.name}</span>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-small)', color: 'var(--text-muted)' }}>
                        {service.price || 'preço a definir'}{service.priceNote ? ` · ${service.priceNote}` : ''} · {service.duration || 'duração não definida'}
                        {!service.active ? ' · Inativo' : ''}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IconButton label="Editar" variant="bare" size={m ? 40 : 36} onClick={() => startEdit(service)}><Icon name="pencil" size={16} /></IconButton>
                      <IconButton label={service.active ? 'Desativar' : 'Ativar'} variant="bare" size={m ? 40 : 36} onClick={() => toggleActive(service)}>
                        <Icon name={service.active ? 'x' : 'check'} size={16} />
                      </IconButton>
                      <IconButton label="Excluir" variant="bare" size={m ? 40 : 36} onClick={() => remove(service)}><Icon name="trash" size={16} /></IconButton>
                    </div>
                  </div>
                )}
              </Surface>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ServiceFields({ draft, onChange, idPrefix, mobile }) {
  if (!draft) return null;
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '2fr 1fr', gap: '14px' }}>
        <Field label="Nome" htmlFor={`${idPrefix}-name`} required>
          <Input id={`${idPrefix}-name`} value={draft.name} onChange={(e) => onChange({ name: e.target.value })} required />
        </Field>
        <Field label="Ordem de exibição" htmlFor={`${idPrefix}-order`} hint="Menor aparece primeiro">
          <Input id={`${idPrefix}-order`} type="number" value={draft.order} onChange={(e) => onChange({ order: e.target.value })} />
        </Field>
      </div>
      <Field label="Descrição" htmlFor={`${idPrefix}-desc`}>
        <Textarea id={`${idPrefix}-desc`} rows={2} value={draft.description} onChange={(e) => onChange({ description: e.target.value })} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr 1.4fr', gap: '14px' }}>
        <Field label="Preço (R$)" htmlFor={`${idPrefix}-price`} hint="Deixe vazio se ainda não definido">
          <Input id={`${idPrefix}-price`} type="number" min="0" step="1" value={draft.priceReais} onChange={(e) => onChange({ priceReais: e.target.value })} />
        </Field>
        <Field label="Duração (min)" htmlFor={`${idPrefix}-dur`} hint="Deixe vazio se ainda não definida">
          <Input id={`${idPrefix}-dur`} type="number" min="5" step="5" value={draft.durationMin} onChange={(e) => onChange({ durationMin: e.target.value })} />
        </Field>
        <Field label="Nota de preço" htmlFor={`${idPrefix}-note`} hint='Ex.: "cada unha"'>
          <Input id={`${idPrefix}-note`} value={draft.priceNote} onChange={(e) => onChange({ priceNote: e.target.value })} />
        </Field>
      </div>
      <Field label="Tags" htmlFor={`${idPrefix}-tags`} hint="Separadas por vírgula, ex.: Especialidade">
        <Input id={`${idPrefix}-tags`} value={draft.tags} onChange={(e) => onChange({ tags: e.target.value })} />
      </Field>
    </>
  );
}
