CREATE TABLE IF NOT EXISTS sms_enrollment_rate_limits (
  key TEXT PRIMARY KEY,
  window_start TIMESTAMPTZ NOT NULL,
  attempt_count INTEGER NOT NULL
);

ALTER TABLE sms_enrollment_rate_limits ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON sms_enrollment_rate_limits FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.check_sms_enrollment_rate_limit(
  rate_key TEXT,
  max_attempts INTEGER,
  window_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  now_ts TIMESTAMPTZ := now();
  current_window_start TIMESTAMPTZ := now_ts - make_interval(secs => window_seconds);
  current_attempts INTEGER;
BEGIN
  INSERT INTO sms_enrollment_rate_limits (key, window_start, attempt_count)
  VALUES (rate_key, now_ts, 1)
  ON CONFLICT (key) DO UPDATE
  SET
    window_start = CASE
      WHEN sms_enrollment_rate_limits.window_start < current_window_start THEN now_ts
      ELSE sms_enrollment_rate_limits.window_start
    END,
    attempt_count = CASE
      WHEN sms_enrollment_rate_limits.window_start < current_window_start THEN 1
      ELSE sms_enrollment_rate_limits.attempt_count + 1
    END;

  SELECT attempt_count INTO current_attempts
  FROM sms_enrollment_rate_limits
  WHERE key = rate_key;

  RETURN current_attempts <= max_attempts;
END;
$$;

REVOKE ALL ON FUNCTION public.check_sms_enrollment_rate_limit(TEXT, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_sms_enrollment_rate_limit(TEXT, INTEGER, INTEGER) TO anon, authenticated;
