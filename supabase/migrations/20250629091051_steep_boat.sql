/*
  # Fix Demo Questions RLS Policy

  1. Security Updates
    - Update RLS policies for demo_questions table to allow proper seeding
    - Ensure authenticated users can insert demo questions for seeding purposes
    - Maintain security while allowing demo functionality

  2. Changes
    - Drop conflicting policies
    - Create a single, clear policy for demo question insertion
    - Allow both authenticated users and admins to insert demo questions
*/

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Allow authenticated users to seed demo questions" ON demo_questions;
DROP POLICY IF EXISTS "Admins can insert demo questions" ON demo_questions;

-- Create a unified policy that allows authenticated users to insert demo questions
CREATE POLICY "Allow demo question seeding"
  ON demo_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Keep the existing admin policies for other operations
CREATE POLICY "Admins can manage demo questions"
  ON demo_questions
  FOR ALL
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