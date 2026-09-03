// Default provider until a real WhatsApp Business number is connected —
// logs what would have been sent instead of calling any API.
export async function send({ to, message }) {
  console.log(`[whatsapp:mock] -> ${to} (${message.name})\n${message.text}`);
  return { ok: true, provider: 'mock' };
}
