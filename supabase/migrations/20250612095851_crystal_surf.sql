/*
  # Survey Response System

  1. New Tables
    - `survey_responses`
      - `id` (uuid, primary key)
      - `survey_id` (text, not null)
      - `responses` (jsonb, not null)
      - `submitted_at` (timestamp)
      - `user_agent` (text, optional)
      - `referrer` (text, optional)

  2. Security
    - Enable RLS on `survey_responses` table
    - Add policy for public insert access for survey submissions
    - Add policy for authenticated read access for analytics

  3. Indexes
    - Index on survey_id for fast lookups
    - Index on submitted_at for analytics
*/

CREATE TABLE IF NOT EXISTS survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id text NOT NULL,
  responses jsonb NOT NULL,
  submitted_at timestamptz DEFAULT now(),
  user_agent text,
  referrer text
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_submitted_at ON survey_responses(submitted_at);

-- Enable Row Level Security
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Policy for public insert access (needed for survey submissions)
CREATE POLICY "Allow public insert for survey submissions"
  ON survey_responses
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy for authenticated read access (for analytics)
CREATE POLICY "Allow authenticated read for analytics"
  ON survey_responses
  FOR SELECT
  TO authenticated
  USING (true);