import { prisma } from '../prisma';
import { SITE } from '../site-config';
import * as mockProvider from './providers/mock';
import * as metaProvider from './providers/meta';
import { confirmationTemplate, reminderTemplate, dailySummaryTemplate } from './templates';

function provider() {
  return process.env.WHATSAPP_PROVIDER === 'meta' ? metaProvider : mockProvider;
}

// Local numbers are collected as DDD + number; the Graph API needs full
// E.164 with country code. Assumes Brazilian clients (studio is Tatuí — SP).
function toE164(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('55') ? digits : `55${digits}`;
}

export async function sendAppointmentConfirmation(appointment, serviceView) {
  const message = confirmationTemplate({ appointment, serviceView });
  await provider().send({ to: toE164(appointment.clientPhone), message });
  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { confirmationSentAt: new Date() },
  });
}

export async function sendAppointmentReminder(appointment, serviceView) {
  const message = reminderTemplate({ appointment, serviceView });
  await provider().send({ to: toE164(appointment.clientPhone), message });
  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { reminderSentAt: new Date() },
  });
}

export async function sendDailySummary(dateISO, appointmentsWithServiceView) {
  const message = dailySummaryTemplate({ dateISO, appointments: appointmentsWithServiceView });
  await provider().send({ to: toE164(SITE.whatsappNumber), message });
}
