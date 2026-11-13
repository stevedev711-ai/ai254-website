-- One-time status change requested by AI254: mark all Draft terminology entries as Reviewed.
-- Runs once (tracked by Prisma). Terms added later still arrive as Draft.
UPDATE "Term" SET "status" = 'REVIEWED', "updatedAt" = NOW() WHERE "status" = 'DRAFT';
