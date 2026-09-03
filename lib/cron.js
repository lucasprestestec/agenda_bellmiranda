import crypto from 'node:crypto';

// Vercel Cron sends `Authorization: Bearer $CRON_SECRET` on every invocation
// (https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs) —
// this rejects anything else so the send endpoints can't be triggered by
// just guessing the URL.
export function isAuthorizedCronRequest(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get('authorization') || '';
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
