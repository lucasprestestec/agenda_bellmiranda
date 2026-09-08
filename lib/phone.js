// Local numbers are collected/typed in all sorts of formats — with or
// without country code, parentheses, dashes, spaces. Normalize to bare
// digits with the Brazilian country code before ever comparing or sending,
// so "(15) 99827-0282" and "5515998270282" are recognized as the same
// number.
export function toE164(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.startsWith('55') ? digits : `55${digits}`;
}

export function samePhone(a, b) {
  if (!a || !b) return false;
  return toE164(a) === toE164(b);
}

// "(15) 98154-5597" — for showing a staff/contact number back to a client,
// regardless of how it was originally typed into the admin panel.
export function formatPhoneDisplay(phone) {
  const digits = toE164(phone);
  const local = digits.startsWith('55') ? digits.slice(2) : digits;
  if (local.length !== 10 && local.length !== 11) return String(phone || '');
  const ddd = local.slice(0, 2);
  const rest = local.slice(2);
  return `(${ddd}) ${rest.slice(0, -4)}-${rest.slice(-4)}`;
}
