// Applies the `appointment_no_overlap` exclusion constraint — the DB-level
// guarantee that the same professional can't have two active, overlapping
// appointments, even under real concurrent requests. This is the equivalent
// of a migration, but this project has never used Prisma Migrate (no
// prisma/migrations/ history, build runs `prisma db push` directly), and a
// Postgres EXCLUDE constraint has no representation in schema.prisma's DSL
// anyway — so it's applied here as a small idempotent script, run as its own
// build step right after `prisma db push` (see package.json), the same
// pattern already used by prisma/seed.mjs.
//
// Safe to run on every deploy: the backfill only ever touches rows where
// Appointment.staffPhone has drifted from Service.staffPhone (cheap,
// idempotent), and the constraint itself is only created once — `db push`
// does not know about (and does not drop) constraints it didn't create.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const CONSTRAINT_NAME = 'appointment_no_overlap';

async function auditStaffPhone(label) {
  const total = await prisma.appointment.count();
  const nullCount = await prisma.appointment.count({ where: { staffPhone: null } });
  console.log(`[ensure-constraints] [audit:${label}] total appointments: ${total} — staffPhone NULL: ${nullCount}`);
  return { total, nullCount };
}

async function main() {
  console.log('[ensure-constraints] --- Appointment.staffPhone audit ---');
  const before = await auditStaffPhone('before-backfill');

  // Backfill Appointment.staffPhone strictly from the real Service relation
  // — never a guess. Only rows with serviceId set can be touched (the join
  // condition); a row's staffPhone is set to exactly what its service's
  // staffPhone is, including NULL if that service legitimately has none.
  // Ad-hoc appointments (serviceId null) are never matched by this UPDATE at
  // all, so they keep whatever staffPhone they already had (null by
  // default) — their "shared resource, conflicts with everyone" semantics
  // are unchanged.
  const backfillResult = await prisma.$executeRawUnsafe(`
    UPDATE "Appointment" a
    SET "staffPhone" = s."staffPhone"
    FROM "Service" s
    WHERE a."serviceId" = s.id AND a."staffPhone" IS DISTINCT FROM s."staffPhone"
  `);

  const after = await auditStaffPhone('after-backfill');
  const filledCount = before.nullCount - after.nullCount;
  console.log(`[ensure-constraints] [audit] rows touched by backfill UPDATE: ${backfillResult}`);
  console.log(`[ensure-constraints] [audit] staffPhone filled by this backfill: ${filledCount}`);

  if (after.nullCount > 0) {
    const [{ adhocNull, serviceWithoutStaff }] = await prisma.$queryRawUnsafe(`
      SELECT
        count(*) FILTER (WHERE a."serviceId" IS NULL) AS "adhocNull",
        count(*) FILTER (WHERE a."serviceId" IS NOT NULL) AS "serviceWithoutStaff"
      FROM "Appointment" a
      WHERE a."staffPhone" IS NULL
    `);
    console.log(`[ensure-constraints] [audit] ${after.nullCount} appointment(s) remain staffPhone NULL — legitimately, not by omission:`);
    console.log(`[ensure-constraints] [audit]   - ${adhocNull} ad-hoc (no serviceId at all — one-off appointments typed on the spot)`);
    console.log(`[ensure-constraints] [audit]   - ${serviceWithoutStaff} linked to a Service whose own staffPhone is NULL (no professional assigned to that service)`);
  } else {
    console.log('[ensure-constraints] [audit] 0 appointments remain staffPhone NULL.');
  }
  console.log('[ensure-constraints] --- end audit ---');

  const [{ exists: alreadyExists }] = await prisma.$queryRawUnsafe(
    `SELECT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = $1) AS exists`,
    CONSTRAINT_NAME,
  );
  if (alreadyExists) {
    console.log(`[ensure-constraints] "${CONSTRAINT_NAME}" already present — nothing further to do.`);
    return;
  }

  await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS btree_gist;');

  // Only after the audit above confirms every non-null-staffPhone case is a
  // real, backfilled value (never a guess) do we check for historical
  // overlaps and, only if clean, create the constraint. Never silently lock
  // in a constraint over data that already violates it — stop and report
  // instead of picking a "winner" to keep.
  const conflicts = await prisma.$queryRawUnsafe(`
    SELECT a1.id AS "idA", a2.id AS "idB", a1."staffPhone", a1.date,
           a1."startTime" AS "startA", a1."endTime" AS "endA",
           a2."startTime" AS "startB", a2."endTime" AS "endB"
    FROM "Appointment" a1
    JOIN "Appointment" a2
      ON a1."staffPhone" = a2."staffPhone"
     AND a1.date = a2.date
     AND a1.id < a2.id
     AND a1.status <> 'CANCELLED' AND a2.status <> 'CANCELLED'
     AND a1."staffPhone" IS NOT NULL
     AND (a1."startTime"::time, a1."endTime"::time) OVERLAPS (a2."startTime"::time, a2."endTime"::time)
  `);
  if (conflicts.length > 0) {
    console.error(`[ensure-constraints] Found ${conflicts.length} pre-existing overlapping appointment(s) for the same professional — refusing to add the constraint automatically. Resolve these manually first, then re-run:`);
    for (const c of conflicts) {
      console.error(`  - ${c.staffPhone} on ${c.date}: ${c.idA} (${c.startA}-${c.endA}) overlaps ${c.idB} (${c.startB}-${c.endB})`);
    }
    process.exitCode = 1;
    return;
  }
  console.log('[ensure-constraints] Historical conflict check: clean, 0 overlaps found. Proceeding.');

  // Exclusion constraints require an operator class per column; text
  // equality (=) needs btree_gist's support for GiST. The interval itself is
  // built from plain integer minutes-since-midnight rather than casting
  // date/startTime text to a timestamp, because Postgres's text->timestamp
  // cast is STABLE (locale/DateStyle-dependent), not IMMUTABLE, and GiST
  // index expressions require IMMUTABLE — split_part + integer arithmetic
  // avoids that entirely while being exactly equivalent for same-day ranges.
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Appointment"
    ADD CONSTRAINT ${CONSTRAINT_NAME}
    EXCLUDE USING gist (
      "staffPhone" WITH =,
      "date" WITH =,
      int4range(
        (split_part("startTime", ':', 1)::int * 60 + split_part("startTime", ':', 2)::int),
        (split_part("endTime", ':', 1)::int * 60 + split_part("endTime", ':', 2)::int)
      ) WITH &&
    )
    WHERE (status <> 'CANCELLED' AND "staffPhone" IS NOT NULL)
  `);
  console.log(`[ensure-constraints] "${CONSTRAINT_NAME}" created.`);
}

main()
  .catch((err) => {
    console.error('[ensure-constraints] failed:', err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
