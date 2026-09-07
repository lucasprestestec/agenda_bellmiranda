import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { isAuthorizedCronRequest } from '../../../../lib/cron';
import { toAppointmentServiceView } from '../../../../lib/services';
import { dateToISO, APPOINTMENT_STATUS, WEEKDAY_LABELS } from '../../../../lib/studio';
import { addDays, startOfMonth, startOfWeek, parseISO, formatLong, formatMonthYear } from '../../../../lib/calendar';
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

// "Seg 14/09" — compact enough to use as a repeated section header in a
// week/month listing without it turning into a wall of text.
function shortDayHeader(iso) {
  const date = parseISO(iso);
  const weekday = WEEKDAY_LABELS[date.getDay()];
  const cap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${cap} ${dd}/${mm}`;
}

function buildDayText(dateISO, appointments) {
  const header = `Agenda de ${formatLong(dateISO)}:`;
  const body = appointments.length
    ? appointments.map(formatLine).join('\n')
    : 'Nenhum horário marcado.';
  return `${header}\n${body}`;
}

// Both week and month use the same shape — one short header per day that
// actually has something, followed by its lines. Empty days are skipped
// entirely rather than padded with "sem agendamentos", so a light week/month
// stays short instead of listing every blank day.
function buildGroupedText(title, appointmentsByDate) {
  const days = [...appointmentsByDate.keys()].sort();
  if (!days.length) return `${title}:\nNenhum horário marcado.`;
  const sections = days.map((d) => `${shortDayHeader(d)}\n${appointmentsByDate.get(d).map(formatLine).join('\n')}`);
  return `${title}:\n\n${sections.join('\n\n')}`;
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
    const title = range === 'week' ? 'Agenda da semana' : `Agenda de ${formatMonthYear(rangeStart)}`;
    text = buildGroupedText(title, byDate);
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
