/*
  # Fix demo questions seeding RLS policy

  1. Security Updates
    - Add policy to allow seeding of demo questions
    - Ensure proper access control for demo question management
    
  2. Changes
    - Add policy for service role to insert demo questions during seeding
    - Maintain existing security for regular operations
*/

-- Drop existing restrictive policy for INSERT operations
DROP POLICY IF EXISTS "Admins can manage demo questions" ON demo_questions;

-- Create separate policies for different operations
CREATE POLICY "Admins can insert demo questions"
  ON demo_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'::user_role
    )
  );

CREATE POLICY "Admins can update demo questions"
  ON demo_questions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'::user_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'::user_role
    )
  );

CREATE POLICY "Admins can delete demo questions"
  ON demo_questions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'::user_role
    )
  );

-- Allow service role to insert demo questions for seeding
CREATE POLICY "Service role can insert demo questions"
  ON demo_questions
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow authenticated users to insert demo questions if they have the right context
-- This is needed for the seeding function when called from the application
CREATE POLICY "Allow demo question seeding"
  ON demo_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow if user is admin OR if this is a seeding operation (no auth.uid() means service context)
    (
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'::user_role
      )
    ) OR (
      auth.uid() IS NULL
    )
  );