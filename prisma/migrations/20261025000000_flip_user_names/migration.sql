-- Convert stored user names from "Last, First" to "First Last".
-- Moves the part after the first comma in front of the part before it
-- (same rule as normalizeName in src/lib/utils.ts). Names without a comma
-- are left untouched.
UPDATE "User"
SET "name" = trim(
  trim(substr("name", instr("name", ',') + 1)) || ' ' ||
  trim(substr("name", 1, instr("name", ',') - 1))
)
WHERE "name" LIKE '%,%';
