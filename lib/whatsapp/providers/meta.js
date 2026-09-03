const GRAPH_VERSION = 'v21.0';

// Sends an approved WhatsApp message template via the Meta Cloud API.
// Requires WHATSAPP_PHONE_NUMBER_ID + WHATSAPP_ACCESS_TOKEN, and the
// template (message.name/message.language, from lib/whatsapp/templates.js)
// must already be approved in the connected WhatsApp Business Account.
export async function send({ to, message }) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) {
    throw new Error('WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN não configurados.');
  }

  const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: message.name,
        language: { code: message.language },
        components: [
          {
            type: 'body',
            parameters: message.params.map((text) => ({ type: 'text', text: String(text) })),
          },
        ],
      },
    }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`Meta API ${res.status}: ${data?.error?.message || 'erro desconhecido'}`);
  }
  return { ok: true, provider: 'meta', messageId: data?.messages?.[0]?.id };
}
