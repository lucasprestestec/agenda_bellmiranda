// TEMPORARY — exists only to produce the two demonstration videos Meta App
// Review asks for (whatsapp_business_messaging and
// whatsapp_business_management). Talks to Meta's own WhatsApp TEST phone
// number and TEST WABA — never the real Bell Miranda number/business
// account, which stays on the separate Evolution API integration (see
// lib/whatsapp/) untouched by this file. Delete this file, its two API
// routes, and app/admin/meta-review/ once Meta approves the app.
//
// META_REVIEW_ACCESS_TOKEN never leaves the server — every call here runs
// in a route handler, never in a client component.

const GRAPH_VERSION = 'v21.0';
const GRAPH_BASE = 'https://graph.facebook.com';

function missingConfig(...keys) {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length === 0) return null;
  return `Variável(is) de ambiente não configurada(s): ${missing.join(', ')}.`;
}

async function graphPost(path, body) {
  const token = process.env.META_REVIEW_ACCESS_TOKEN;
  const res = await fetch(`${GRAPH_BASE}/${GRAPH_VERSION}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, status: res.status, error: data?.error?.message || 'A Graph API recusou a requisição.', raw: data };
  }
  return { ok: true, data };
}

// whatsapp_business_messaging demo: sends one free-form text message from
// Meta's test phone number to a recipient the reviewer has authorized on
// the test number's recipient list.
export async function sendTestMessage(to) {
  const missing = missingConfig('META_REVIEW_ACCESS_TOKEN', 'META_REVIEW_PHONE_NUMBER_ID');
  if (missing) return { ok: false, error: missing };

  return graphPost(`${process.env.META_REVIEW_PHONE_NUMBER_ID}/messages`, {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: 'Mensagem de teste — Bell Miranda (Meta App Review). Número de teste da Meta, não o WhatsApp real do estúdio.' },
  });
}

// whatsapp_business_management demo: creates one message template on
// Meta's test WABA via the Graph API.
export async function createTestTemplate({ name, language, body }) {
  const missing = missingConfig('META_REVIEW_ACCESS_TOKEN', 'META_REVIEW_WABA_ID');
  if (missing) return { ok: false, error: missing };

  return graphPost(`${process.env.META_REVIEW_WABA_ID}/message_templates`, {
    name,
    language,
    // UTILITY is the safest default for a review/demo template — swap if
    // Meta's reviewer asks for a specific category.
    category: 'UTILITY',
    components: [{ type: 'BODY', text: body }],
  });
}
