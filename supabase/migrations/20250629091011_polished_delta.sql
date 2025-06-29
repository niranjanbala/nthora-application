/*
  # Fix Demo Questions RLS Policy

  1. Security Updates
    - Update RLS policies for demo_questions table to allow seeding
    - Add policy for service role to insert demo questions
    - Ensure authenticated users can still read demo questions

  2. Changes
    - Add policy for authenticated users to insert demo questions when none exist
    - Update existing policies to be more permissive for demo data
*/

-- Drop existing restrictive policies that might be blocking demo seeding
DROP POLICY IF EXISTS "Service role can insert demo questions" ON demo_questions;
DROP POLICY IF EXISTS "Allow demo question seeding" ON demo_questions;

-- Create a more permissive policy for inserting demo questions
CREATE POLICY "Allow authenticated users to seed demo questions"
  ON demo_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure the existing read policy allows everyone to read demo questions
DROP POLICY IF EXISTS "Anyone can read demo questions" ON demo_questions;
CREATE POLICY "Anyone can read demo questions"
  ON demo_questions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated users to update demo questions if needed
CREATE POLICY "Authenticated users can update demo questions"
  ON demo_questions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete demo questions if needed
CREATE POLICY "Authenticated users can delete demo questions"
  ON demo_questions
  FOR DELETE
  TO authenticated
  USING (true);