/*
  # Fix Demo Questions Seeding RLS Policy

  1. Security Updates
    - Add RLS policy to allow seeding demo questions from authenticated users
    - Ensure demo questions can be inserted when needed for demo mode
    
  2. Changes
    - Add policy for authenticated users to insert demo questions
    - This allows the frontend seeding function to work properly
*/

-- Drop existing restrictive insert policy if it exists
DROP POLICY IF EXISTS "Service role can insert demo questions" ON demo_questions;
DROP POLICY IF EXISTS "Allow demo question seeding" ON demo_questions;

-- Create a more permissive policy for seeding demo questions
CREATE POLICY "Allow authenticated users to seed demo questions"
  ON demo_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Also ensure the existing policies work correctly
-- Update the admin insert policy to be more explicit
DROP POLICY IF EXISTS "Admins can insert demo questions" ON demo_questions;
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