DROP POLICY IF EXISTS "sms_opt_ins: allow public insert" ON sms_opt_ins;

REVOKE ALL ON FUNCTION public.check_sms_enrollment_rate_limit(TEXT, INTEGER, INTEGER) FROM anon, authenticated;
