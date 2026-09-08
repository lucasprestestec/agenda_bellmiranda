import { formatLong } from '../calendar';
import { SITE } from '../site-config';
import { formatPhoneDisplay } from '../phone';

// Plain WhatsApp text, sent as-is by the external agent (Evolution API) —
// no template approval, no variables to match. Client-facing messages carry
// a short notice pointing back to the real contact number for whoever
// performs that service, since this number is the automation's own and
// isn't monitored for replies — falls back to the studio's own number for
// ad-hoc services with no staffPhone set.
function contactNotice(serviceView) {
  const phone = serviceView.staffPhone ? formatPhoneDisplay(serviceView.staffPhone) : SITE.whatsappDisplay;
  const who = serviceView.staffName || 'a gente';
  return [
    'Este número é usado só para avisos automáticos.',
    `Para falar com ${who}, chama no ${phone}.`,
  ];
}

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
    ...contactNotice(serviceView),
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
    ...contactNotice(serviceView),
  ].join('\n');
  return { text };
}

// Internal copy sent to whoever performs the service (Service.staffName /
// .staffPhone) — carries the client's phone instead of the "talk to us"
// notice, since it's meant to actually be actioned by staff.
export function teamConfirmationTemplate({ appointment, serviceView }) {
  const lines = [
    'Novo agendamento confirmado:',
    '',
    `Cliente: ${appointment.clientName}`,
    `Serviço: ${serviceView.name}`,
    `Data: ${formatLong(appointment.date)}`,
    `Horário: ${appointment.startTime}`,
  ];
  if (appointment.clientPhone) lines.push(`Telefone: ${appointment.clientPhone}`);
  return { text: lines.join('\n') };
}

export function teamReminderTemplate({ appointment, serviceView }) {
  const lines = [
    'Lembrete de amanhã:',
    '',
    `Cliente: ${appointment.clientName}`,
    `Serviço: ${serviceView.name}`,
    `Horário: ${appointment.startTime}`,
  ];
  if (appointment.clientPhone) lines.push(`Telefone: ${appointment.clientPhone}`);
  return { text: lines.join('\n') };
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
