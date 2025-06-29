/*
  # Fix Demo Questions RLS Policies
  
  1. Changes
     - Safely drop and recreate policies for demo_questions table
     - Ensure policies exist only once by checking before creation
     - Maintain permissive access for demo question operations
  
  2. Security
     - Allow authenticated users to manage demo questions
     - Ensure public read access for demo content
*/

-- First check if policies exist before dropping them
DO $$ 
BEGIN
  -- Drop policies only if they exist
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'demo_questions' AND policyname = 'Service role can insert demo questions') THEN
    DROP POLICY "Service role can insert demo questions" ON demo_questions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'demo_questions' AND policyname = 'Allow demo question seeding') THEN
    DROP POLICY "Allow demo question seeding" ON demo_questions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'demo_questions' AND policyname = 'Anyone can read demo questions') THEN
    DROP POLICY "Anyone can read demo questions" ON demo_questions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'demo_questions' AND policyname = 'Allow authenticated users to seed demo questions') THEN
    DROP POLICY "Allow authenticated users to seed demo questions" ON demo_questions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'demo_questions' AND policyname = 'Authenticated users can update demo questions') THEN
    DROP POLICY "Authenticated users can update demo questions" ON demo_questions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'demo_questions' AND policyname = 'Authenticated users can delete demo questions') THEN
    DROP POLICY "Authenticated users can delete demo questions" ON demo_questions;
  END IF;
END $$;

-- Create policies with new names to avoid conflicts
CREATE POLICY "demo_questions_insert_policy"
  ON demo_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "demo_questions_select_policy"
  ON demo_questions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "demo_questions_update_policy"
  ON demo_questions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "demo_questions_delete_policy"
  ON demo_questions
  FOR DELETE
  TO authenticated
  USING (true);