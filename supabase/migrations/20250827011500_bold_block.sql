/*
  # Fix infinite recursion in users RLS policy

  1. Security Changes
    - Drop the problematic admin policy that causes recursion
    - Replace with a simple policy that allows users to read their own data
    - Keep the existing policy for users to read all users (for the app functionality)

  The issue was that the admin policy was doing a subquery on the users table
  while already querying the users table, causing infinite recursion.
*/

-- Drop the problematic admin policy
DROP POLICY IF EXISTS "Admins can manage users" ON users;

-- Create a simple policy for users to manage their own data
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create a policy for admins to manage users (without recursion)
-- This uses a direct role check instead of a subquery
CREATE POLICY "Admins can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );