import { formatLong } from '../calendar';
import { SITE } from '../site-config';

// Plain WhatsApp text, sent as-is by the external agent (Evolution API) —
// no template approval, no variables to match. Client-facing messages carry
// a short notice pointing back to the studio's real contact number, since
// this number is the automation's own and isn't monitored for replies.

export function confirmationTemplate({ appointment, serviceView }) {
  const text = [
    `Olá, ${appointment.clientName}!`,
    '',
    'Seu horário está confirmado:',
    '',
    `Serviço: ${serviceView.name}`,
    `Data: ${formatLong(appointment.date)}`,
    `Horário: ${appointment.startTime}`,
    '',
    'Este número é usado só para avisos automáticos.',
    `Para falar com a gente, chama no ${SITE.whatsappDisplay}.`,
  ].join('\n');
  return { text };
}

export function reminderTemplate({ appointment, serviceView }) {
  const text = [
    `Olá, ${appointment.clientName}!`,
    '',
    'Lembrete do seu horário amanhã:',
    '',
    `Serviço: ${serviceView.name}`,
    `Horário: ${appointment.startTime}`,
    '',
    'Este número é usado só para avisos automáticos.',
    `Para falar com a gente, chama no ${SITE.whatsappDisplay}.`,
  ].join('\n');
  return { text };
}

// Internal copy sent to whoever performs the service (Service.staffName /
// .staffPhone) — carries the client's phone instead of the "talk to us"
// notice, since it's meant to actually be actioned by staff.
export function teamConfirmationTemplate({ appointment, serviceView }) {
  const text = [
    'Novo agendamento confirmado:',
    '',
    `Cliente: ${appointment.clientName}`,
    `Serviço: ${serviceView.name}`,
    `Data: ${formatLong(appointment.date)}`,
    `Horário: ${appointment.startTime}`,
    `Telefone: ${appointment.clientPhone}`,
  ].join('\n');
  return { text };
}

export function teamReminderTemplate({ appointment, serviceView }) {
  const text = [
    'Lembrete de amanhã:',
    '',
    `Cliente: ${appointment.clientName}`,
    `Serviço: ${serviceView.name}`,
    `Horário: ${appointment.startTime}`,
    `Telefone: ${appointment.clientPhone}`,
  ].join('\n');
  return { text };
}

// The appointment list travels as a single multi-line block — fine for a
// single-studio day's volume.
export function dailySummaryTemplate({ dateISO, appointments }) {
  const when = formatLong(dateISO);
  const list = appointments.length
    ? appointments.map((a) => `${a.startTime} — ${a.clientName} (${a.serviceView.name})`).join('\n')
    : 'Nenhum horário marcado hoje.';
  const text = `Bom dia! Agenda de hoje (${when}):\n${list}`;
  return { text };
}
