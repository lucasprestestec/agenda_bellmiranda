// Detects a violation of the `appointment_no_overlap` exclusion constraint
// (see prisma/ensure-constraints.mjs) — the last line of defense against two
// concurrent requests double-booking the same professional/time, underneath
// the existing application-level availability check.
//
// The constraint isn't declared in schema.prisma (Postgres EXCLUDE
// constraints have no Prisma DSL representation), so Prisma can't map the
// violation to a typed error code the way it does for `@@unique` — it
// surfaces as an untyped PrismaClientUnknownRequestError whose message
// carries the raw Postgres error (SQLSTATE 23P01, constraint name included).
// Matching on the constraint name (not just 23P01) avoids ever mistaking an
// unrelated exclusion/index violation for this specific one.
const OVERLAP_CONSTRAINT_NAME = 'appointment_no_overlap';

export function isOverlapConstraintError(err) {
  const message = String(err?.message || '');
  return message.includes('23P01') && message.includes(OVERLAP_CONSTRAINT_NAME);
}
