import { dateToISO } from './studio';

export function parseISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso, n) {
  const date = parseISO(iso);
  date.setDate(date.getDate() + n);
  return dateToISO(date);
}

export function addMonths(iso, n) {
  const date = parseISO(iso);
  date.setMonth(date.getMonth() + n, 1);
  return dateToISO(date);
}

export function startOfWeek(iso) {
  const date = parseISO(iso);
  date.setDate(date.getDate() - date.getDay());
  return dateToISO(date);
}

export function startOfMonth(iso) {
  const date = parseISO(iso);
  date.setDate(1);
  return dateToISO(date);
}

// Full 6-row Sunday-start grid covering the month, including lead/trail padding days.
export function buildMonthGrid(iso) {
  const first = startOfMonth(iso);
  const gridStart = startOfWeek(first);
  const month = parseISO(first).getMonth();
  const days = [];
  let cursor = gridStart;
  for (let i = 0; i < 42; i++) {
    const date = parseISO(cursor);
    days.push({ date: cursor, inMonth: date.getMonth() === month, day: date.getDate(), weekday: date.getDay() });
    cursor = addDays(cursor, 1);
  }
  return days;
}

export function formatLong(iso) {
  const date = parseISO(iso);
  const label = date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatMonthYear(iso) {
  const date = parseISO(iso);
  const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatWeekRange(iso) {
  const start = parseISO(iso);
  const end = parseISO(addDays(iso, 6));
  const startLabel = start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  const endLabel = end.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  return `${startLabel} – ${endLabel}`;
}

export function formatDayShort(iso) {
  const date = parseISO(iso);
  const label = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  return label;
}
