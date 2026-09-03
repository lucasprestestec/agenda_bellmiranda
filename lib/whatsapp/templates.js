import { formatLong } from '../calendar';

// Each of these mirrors a WhatsApp message template that must be created and
// approved in the Meta Business Manager before the "meta" provider can send
// it — `name`/`language` must match the approved template exactly, and the
// order of `params` must match its body variables ({{1}}, {{2}}, ...).
// `text` is the human-readable rendering the "mock" provider logs.

export function confirmationTemplate({ appointment, serviceView }) {
  const when = `${formatLong(appointment.date)} às ${appointment.startTime}`;
  return {
    name: 'confirmacao_agendamento',
    language: 'pt_BR',
    params: [appointment.clientName, serviceView.name, when],
    text: `Oi, ${appointment.clientName}! Seu horário de ${serviceView.name} ficou confirmado para ${when}. Qualquer mudança, me chama por aqui. Até lá!`,
  };
}

export function reminderTemplate({ appointment, serviceView }) {
  const when = `amanhã às ${appointment.startTime}`;
  return {
    name: 'lembrete_agendamento',
    language: 'pt_BR',
    params: [appointment.clientName, serviceView.name, when],
    text: `Oi, ${appointment.clientName}! Passando pra lembrar do seu horário de ${serviceView.name} ${when}. Te espero no estúdio!`,
  };
}

// The appointment list travels as a single multi-line template variable —
// fine for a single-studio day's volume, but Meta caps template params at 4
// consecutive line breaks, so this won't scale past ~a dozen appointments.
export function dailySummaryTemplate({ dateISO, appointments }) {
  const when = formatLong(dateISO);
  const list = appointments.length
    ? appointments.map((a) => `${a.startTime} — ${a.clientName} (${a.serviceView.name})`).join('\n')
    : 'Nenhum horário marcado hoje.';
  return {
    name: 'resumo_diario',
    language: 'pt_BR',
    params: [when, list],
    text: `Bom dia! Agenda de hoje (${when}):\n${list}`,
  };
}
