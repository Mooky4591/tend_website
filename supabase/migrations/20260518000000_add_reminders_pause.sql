-- Per-homeowner pause flag for reminder sending.
-- The UI toggles this column via PATCH /api/users/[id]/reminders-pause.
-- The (future) background reminder-sending worker reads this column and, when non-null:
--   (a) skips sending SMS for any of that user's reminders, and
--   (b) for any of that user's reminders whose due_date <= now() and skipped_at IS NULL,
--       sets reminders.skipped_at = now() and advances due_date to the next interval
--       for that reminder_type.
-- A reminder marked skipped_at is never sent retroactively, even after unpausing.
ALTER TABLE public.users
  ADD COLUMN reminders_paused_at timestamptz;

ALTER TABLE public.reminders
  ADD COLUMN skipped_at timestamptz;

COMMENT ON COLUMN public.users.reminders_paused_at IS
  'When non-null, the background reminder worker must skip sending SMS for this user''s reminders. Reminders whose due_date passes while this is non-null are marked skipped_at and rescheduled to the next interval, but never sent retroactively.';

COMMENT ON COLUMN public.reminders.skipped_at IS
  'Set by the background reminder worker when this reminder''s due_date passed while users.reminders_paused_at was non-null. The UI never writes this column; treat as display-read-only like `sent`.';
