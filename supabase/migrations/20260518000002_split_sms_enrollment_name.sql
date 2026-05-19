-- The public SMS opt-in form now collects first_name and last_name as two
-- separate fields. Store both alongside the existing full_name column so that
-- any downstream consumer reading full_name continues to work.
--
-- full_name remains NOT NULL; the /api/sms-enrollment route handler computes
-- it as `${first_name} ${last_name}` before inserting.
ALTER TABLE sms_enrollments
  ADD COLUMN first_name TEXT,
  ADD COLUMN last_name  TEXT;

COMMENT ON COLUMN sms_enrollments.first_name IS
  'First name from the public SMS opt-in form. Nullable for legacy rows.';
COMMENT ON COLUMN sms_enrollments.last_name IS
  'Last name from the public SMS opt-in form. Nullable for legacy rows.';
