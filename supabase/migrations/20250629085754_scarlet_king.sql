/*
  # Create Demo Questions Table

  1. New Tables
    - `demo_questions` - Stores demo/sample questions for the application
      - Similar structure to the main `questions` table but without foreign key constraints
      - Includes all necessary fields for displaying questions in the UI
      - Has a `category` field to organize demo questions by topic/view

  2. Security
    - Enable RLS on the table
    - Allow authenticated users to read demo questions
    - Allow admin users to manage demo questions

  3. Changes
    - Creates a new table specifically for demo content
    - Adds appropriate indexes for efficient querying
*/

-- Create demo_questions table
CREATE TABLE IF NOT EXISTS demo_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  primary_tags TEXT[] DEFAULT '{}'::TEXT[],
  secondary_tags TEXT[] DEFAULT '{}'::TEXT[],
  expected_answer_type TEXT DEFAULT 'tactical',
  urgency_level TEXT DEFAULT 'medium',
  ai_summary TEXT,
  visibility_level TEXT DEFAULT 'first_degree',
  is_anonymous BOOLEAN DEFAULT false,
  is_sensitive BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  view_count INTEGER DEFAULT 0,
  response_count INTEGER DEFAULT 0,
  helpful_votes INTEGER DEFAULT 0,
  category TEXT, -- For organizing demo questions (e.g., 'matched_questions', 'my_questions', 'explore_topics')
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + '30 days'::interval)
);

-- Create updated_at trigger
CREATE TRIGGER update_demo_questions_updated_at
BEFORE UPDATE ON demo_questions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_demo_questions_category ON demo_questions(category);
CREATE INDEX idx_demo_questions_tags ON demo_questions USING gin(primary_tags);
CREATE INDEX idx_demo_questions_created_at ON demo_questions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE demo_questions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read demo questions"
  ON demo_questions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage demo questions"
  ON demo_questions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add comment
COMMENT ON TABLE demo_questions IS 'Stores demo/sample questions for showcasing the application functionality';