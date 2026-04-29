-- RLS for tables accessed by the portal dashboard.
-- tenant_users, tenants, and monthly_billing_snapshots are covered
-- by 20260428000000_tenant_users.sql.

-- users (homeowners): portal members can read their tenant's homeowners
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users: tenant members can select"
  ON users FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE auth_user_id = auth.uid()
    )
  );

-- conversations: portal members can read and insert for their tenant
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations: tenant members can select"
  ON conversations FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "conversations: tenant members can insert"
  ON conversations FOR INSERT
  WITH CHECK (
    role = 'staff'
    AND tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE auth_user_id = auth.uid()
    )
  );

-- reminders: no tenant_id column — chain through users
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reminders: tenant members can select"
  ON reminders FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users WHERE tenant_id IN (
        SELECT tenant_id FROM tenant_users WHERE auth_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "reminders: tenant members can insert"
  ON reminders FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE tenant_id IN (
        SELECT tenant_id FROM tenant_users WHERE auth_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "reminders: tenant members can update"
  ON reminders FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM users WHERE tenant_id IN (
        SELECT tenant_id FROM tenant_users WHERE auth_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "reminders: tenant members can delete"
  ON reminders FOR DELETE
  USING (
    user_id IN (
      SELECT id FROM users WHERE tenant_id IN (
        SELECT tenant_id FROM tenant_users WHERE auth_user_id = auth.uid()
      )
    )
  );

-- warranty_documents: portal members can read, insert, and delete for their tenant
ALTER TABLE warranty_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "warranty_documents: tenant members can select"
  ON warranty_documents FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "warranty_documents: tenant members can insert"
  ON warranty_documents FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "warranty_documents: tenant members can delete"
  ON warranty_documents FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE auth_user_id = auth.uid()
    )
  );
