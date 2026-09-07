import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { isAuthorizedCronRequest } from '../../../../lib/cron';
import { toAppointmentServiceView } from '../../../../lib/services';
import {
  confirmationTemplate,
  reminderTemplate,
  teamConfirmationTemplate,
  teamReminderTemplate,
  dailySummaryTemplate,
} from '../../../../lib/whatsapp/templates';
import { dateToISO, APPOINTMENT_STATUS } from '../../../../lib/studio';
import { addDays } from '../../../../lib/calendar';
import { SITE } from '../../../../lib/site-config';

// Local numbers are collected as DDD + number; WhatsApp needs full E.164
// with country code. Assumes Brazilian clients (studio is Tatuí — SP).
function toE164(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('55') ? digits : `55${digits}`;
}

// Each item goes to the client, plus a copy to whoever performs that
// service (Service.staffName/.staffPhone) if one is set — different text
// for each: the client gets the "talk to us at ..." notice, staff gets the
// client's phone number instead.
function buildRecipients({ appointment, serviceView, clientMessage, teamMessage }) {
  const recipients = [{ role: 'client', phone: toE164(appointment.clientPhone), text: clientMessage.text }];
  if (serviceView.staffPhone) {
    recipients.push({ role: 'team', label: serviceView.staffName || null, phone: toE164(serviceView.staffPhone), text: teamMessage.text });
  }
  return recipients;
}

// Polled by the external WhatsApp agent (Evolution API, running outside
// Vercel — this site can't reach it directly). Returns what's ready to send;
// the agent calls POST /api/agent/mark-sent once every recipient for an item
// has been sent successfully. Nothing here sends anything itself.
export async function GET(request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const today = dateToISO(new Date());
  const tomorrow = addDays(today, 1);

  const [toConfirm, toRemind, todaysAppointments] = await Promise.all([
    prisma.appointment.findMany({
      where: { status: APPOINTMENT_STATUS.CONFIRMED, confirmationSentAt: null },
      include: { service: true },
    }),
    prisma.appointment.findMany({
      where: {
        date: tomorrow,
        status: APPOINTMENT_STATUS.CONFIRMED,
        wantsReminder: true,
        reminderSentAt: null,
      },
      include: { service: true },
    }),
    prisma.appointment.findMany({
      where: { date: today, status: APPOINTMENT_STATUS.CONFIRMED },
      include: { service: true },
      orderBy: { startTime: 'asc' },
    }),
  ]);

  const confirmations = toConfirm.map((appointment) => {
    const serviceView = toAppointmentServiceView(appointment);
    return {
      appointmentId: appointment.id,
      clientName: appointment.clientName,
      date: appointment.date,
      startTime: appointment.startTime,
      recipients: buildRecipients({
        appointment,
        serviceView,
        clientMessage: confirmationTemplate({ appointment, serviceView }),
        teamMessage: teamConfirmationTemplate({ appointment, serviceView }),
      }),
    };
  });

  const reminders = toRemind.map((appointment) => {
    const serviceView = toAppointmentServiceView(appointment);
    return {
      appointmentId: appointment.id,
      clientName: appointment.clientName,
      date: appointment.date,
      startTime: appointment.startTime,
      recipients: buildRecipients({
        appointment,
        serviceView,
        clientMessage: reminderTemplate({ appointment, serviceView }),
        teamMessage: teamReminderTemplate({ appointment, serviceView }),
      }),
    };
  });

  const appointmentsWithServiceView = todaysAppointments.map((appointment) => ({
    ...appointment,
    serviceView: toAppointmentServiceView(appointment),
  }));
  const summaryMessage = dailySummaryTemplate({ dateISO: today, appointments: appointmentsWithServiceView });
  const dailySummary = {
    date: today,
    phone: toE164(SITE.whatsappNumber),
    count: todaysAppointments.length,
    text: summaryMessage.text,
  };

  return NextResponse.json({ confirmations, reminders, dailySummary });
}
