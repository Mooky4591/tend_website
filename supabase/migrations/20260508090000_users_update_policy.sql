-- Allow tenant admins to update homeowners in their tenant.
CREATE POLICY "users: tenant admins can update"
  ON users FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users
      WHERE auth_user_id = auth.uid()
        AND role = 'admin'
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users
      WHERE auth_user_id = auth.uid()
        AND role = 'admin'
    )
  );
