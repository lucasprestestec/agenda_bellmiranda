import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { isAuthorizedCronRequest } from '../../../../lib/cron';
import { toAppointmentServiceView } from '../../../../lib/services';
import { dateToISO, APPOINTMENT_STATUS } from '../../../../lib/studio';
import { addDays, startOfMonth, startOfWeek, formatLong, formatMonthYear, formatDayShort } from '../../../../lib/calendar';
import { samePhone } from '../../../../lib/phone';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const RANGES = new Set(['day', 'week', 'month']);

function endOfMonth(monthStartISO) {
  // First day of next month, minus a day — addMonths isn't imported to
  // avoid pulling in month-arithmetic edge cases we don't need here.
  const [y, m] = monthStartISO.split('-').map(Number);
  const nextMonthFirst = new Date(y, m, 1);
  nextMonthFirst.setDate(nextMonthFirst.getDate() - 1);
  return dateToISO(nextMonthFirst);
}

function formatLine(appointment) {
  const serviceView = toAppointmentServiceView(appointment);
  return `${appointment.startTime} — ${appointment.clientName} (${serviceView.name})`;
}

function buildDayText(dateISO, appointments) {
  const header = `Agenda de ${formatLong(dateISO)}:`;
  const body = appointments.length
    ? appointments.map(formatLine).join('\n')
    : 'Nenhum horário marcado.';
  return `${header}\n${body}`;
}

function buildWeekText(startISO, appointmentsByDate) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(startISO, i));
  const sections = days.map((d) => {
    const dayAppointments = appointmentsByDate.get(d) || [];
    const body = dayAppointments.length
      ? dayAppointments.map(formatLine).join('\n')
      : 'Sem agendamentos.';
    return `${formatLong(d)}:\n${body}`;
  });
  return `Agenda da semana:\n\n${sections.join('\n\n')}`;
}

function buildMonthText(monthStartISO, appointmentsByDate) {
  const days = [...appointmentsByDate.keys()].sort();
  if (!days.length) return `Agenda de ${formatMonthYear(monthStartISO)}:\nNenhum horário marcado no mês.`;
  const lines = days.map((d) => `${formatDayShort(d)} — ${appointmentsByDate.get(d).length} agendamento(s)`);
  return `Agenda de ${formatMonthYear(monthStartISO)}:\n${lines.join('\n')}`;
}

// Polled on demand by the external WhatsApp agent when Bell or Jessica text
// a command ("agendadia", "agendasemana", "agendamês") from their own
// number — the agent is responsible for checking the sender is one of
// theirs before ever calling this. `staffPhone` scopes results to one
// person's own services (ad-hoc appointments, which have no service/staff
// attached, are excluded from a scoped view — they only show up when
// staffPhone is omitted).
export async function GET(request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || 'day';
  if (!RANGES.has(range)) {
    return NextResponse.json({ error: 'range precisa ser "day", "week" ou "month".' }, { status: 400 });
  }
  const dateParam = searchParams.get('date');
  if (dateParam && !DATE_RE.test(dateParam)) {
    return NextResponse.json({ error: 'date inválida, use YYYY-MM-DD.' }, { status: 400 });
  }
  const anchor = dateParam || dateToISO(new Date());
  const staffPhone = searchParams.get('staffPhone') || null;

  let rangeStart;
  let rangeEnd;
  if (range === 'day') {
    rangeStart = anchor;
    rangeEnd = anchor;
  } else if (range === 'week') {
    rangeStart = startOfWeek(anchor);
    rangeEnd = addDays(rangeStart, 6);
  } else {
    rangeStart = startOfMonth(anchor);
    rangeEnd = endOfMonth(rangeStart);
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      date: { gte: rangeStart, lte: rangeEnd },
      status: APPOINTMENT_STATUS.CONFIRMED,
    },
    include: { service: true },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });

  const scoped = staffPhone
    ? appointments.filter((a) => a.service && samePhone(a.service.staffPhone, staffPhone))
    : appointments;

  let text;
  if (range === 'day') {
    text = buildDayText(anchor, scoped);
  } else {
    const byDate = new Map();
    for (const a of scoped) {
      if (!byDate.has(a.date)) byDate.set(a.date, []);
      byDate.get(a.date).push(a);
    }
    text = range === 'week' ? buildWeekText(rangeStart, byDate) : buildMonthText(rangeStart, byDate);
  }

  // Structured form alongside `text` — the AI needs real appointmentIds to
  // act on when a chat command is "cancela a Ana de segunda" rather than
  // just a read.
  const appointmentsOut = scoped.map((a) => ({
    appointmentId: a.id,
    clientName: a.clientName,
    clientPhone: a.clientPhone || null,
    date: a.date,
    startTime: a.startTime,
    endTime: a.endTime,
    service: toAppointmentServiceView(a).name,
  }));

  return NextResponse.json({ range, date: anchor, rangeStart, rangeEnd, count: scoped.length, text, appointments: appointmentsOut });
}
