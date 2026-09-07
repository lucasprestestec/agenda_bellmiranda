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
