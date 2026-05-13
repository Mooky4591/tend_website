-- Returns one summary row per plan for the calling user's tenant.
-- Runs as SECURITY INVOKER (PostgreSQL default for functions) so RLS on
-- warranty_documents is applied using auth.uid() from the request JWT.
CREATE OR REPLACE FUNCTION warranty_doc_summaries()
RETURNS TABLE (plan_name text, chunk_count int, uploaded_at timestamptz)
LANGUAGE sql
STABLE
AS $$
  SELECT
    plan_name,
    count(*)::int   AS chunk_count,
    max(created_at) AS uploaded_at
  FROM warranty_documents
  GROUP BY plan_name
$$;

GRANT EXECUTE ON FUNCTION warranty_doc_summaries() TO authenticated;
