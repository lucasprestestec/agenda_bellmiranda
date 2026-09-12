'use client';

import { useState } from 'react';
import { Button } from '../../../components/core/Button';
import { Field } from '../../../components/forms/Field';
import { Input } from '../../../components/forms/Input';
import { Textarea } from '../../../components/forms/Textarea';

// TEMPORARY — exclusively to record the two demonstration videos Meta App
// Review requires (whatsapp_business_messaging and
// whatsapp_business_management). Deliberately not linked from anywhere in
// the admin nav — reachable only by typing the URL. Delete this page (and
// lib/meta-review.js + its two API routes) once Meta approves the app.
// Auth is the same session cookie gate as every other /admin/* page
// (see proxy.js) — nothing new here.
export default function MetaReviewPage() {
  const [to, setTo] = useState('');
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);

  const [templateName, setTemplateName] = useState('');
  const [templateBody, setTemplateBody] = useState('');
  const [creating, setCreating] = useState(false);
  const [templateStatus, setTemplateStatus] = useState(null);

  async function sendMessage(e) {
    e.preventDefault();
    setSending(true);
    setSendStatus(null);
    const res = await fetch('/api/admin/meta-review/send-message', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to }),
    });
    const data = await res.json().catch(() => ({}));
    setSending(false);
    setSendStatus(res.ok
      ? { ok: true, message: `Mensagem enviada. ID: ${data.data?.messages?.[0]?.id || '—'}` }
      : { ok: false, message: data.error || 'Falha ao enviar mensagem.' });
  }

  async function createTemplate(e) {
    e.preventDefault();
    setCreating(true);
    setTemplateStatus(null);
    const res = await fetch('/api/admin/meta-review/create-template', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: templateName, language: 'pt_BR', body: templateBody }),
    });
    const data = await res.json().catch(() => ({}));
    setCreating(false);
    setTemplateStatus(res.ok
      ? { ok: true, message: `Modelo criado. Status: ${data.data?.status || 'enviado para análise'} (id: ${data.data?.id || '—'})` }
      : { ok: false, message: data.error || 'Falha ao criar modelo.' });
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-page)', padding: '32px 20px 60px' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontWeight: 400, fontSize: '1.5rem', color: 'var(--ink-900)' }}>
            Meta App Review — ambiente de teste
          </h1>
          <p style={{ margin: '10px 0 0', fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', lineHeight: 1.65, color: 'var(--danger-500)' }}>
            Página temporária, só para gravar as evidências do App Review. Usa exclusivamente o número e a WABA de <strong>teste</strong> da Meta — nunca o WhatsApp real da Bell Miranda. Remover depois da aprovação.
          </p>
        </div>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--champagne-600)' }}>
              whatsapp_business_messaging
            </span>
            <h2 style={{ margin: '6px 0 0', fontFamily: 'var(--font-serif-display)', fontWeight: 400, fontSize: '1.1rem', color: 'var(--ink-900)' }}>Enviar mensagem de teste</h2>
          </div>
          <form onSubmit={sendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Field label="Número destinatário autorizado" htmlFor="mr-to" hint="Formato internacional, ex.: 5515999999999 — precisa estar na lista de destinatários de teste do número">
              <Input id="mr-to" value={to} onChange={(e) => setTo(e.target.value)} required />
            </Field>
            <Button type="submit" disabled={sending}>{sending ? 'Enviando…' : 'Enviar mensagem de teste'}</Button>
          </form>
          {sendStatus && (
            <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', color: sendStatus.ok ? 'var(--success-500)' : 'var(--danger-500)' }}>
              {sendStatus.message}
            </p>
          )}
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--champagne-600)' }}>
              whatsapp_business_management
            </span>
            <h2 style={{ margin: '6px 0 0', fontFamily: 'var(--font-serif-display)', fontWeight: 400, fontSize: '1.1rem', color: 'var(--ink-900)' }}>Criar modelo de mensagem</h2>
          </div>
          <form onSubmit={createTemplate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Field label="Nome do modelo" htmlFor="mr-tpl-name" hint="minúsculas e underscore, ex.: teste_app_review">
              <Input id="mr-tpl-name" value={templateName} onChange={(e) => setTemplateName(e.target.value)} required />
            </Field>
            <Field label="Idioma" htmlFor="mr-tpl-lang">
              <Input id="mr-tpl-lang" value="pt_BR" disabled />
            </Field>
            <Field label="Texto da mensagem" htmlFor="mr-tpl-body">
              <Textarea id="mr-tpl-body" rows={3} value={templateBody} onChange={(e) => setTemplateBody(e.target.value)} required />
            </Field>
            <Button type="submit" disabled={creating}>{creating ? 'Criando…' : 'Criar modelo'}</Button>
          </form>
          {templateStatus && (
            <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', color: templateStatus.ok ? 'var(--success-500)' : 'var(--danger-500)' }}>
              {templateStatus.message}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
