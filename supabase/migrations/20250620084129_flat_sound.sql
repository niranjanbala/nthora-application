/*
  # Waitlist System for Non-Founders

  1. New Tables
    - `waitlists`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `email` (text, not null)
      - `job_title` (text, not null)
      - `interests` (text array)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `waitlists` table
    - Add policy for public insert access for waitlist submissions
    - Add policy for authenticated read access for analytics

  3. Indexes
    - Index on email for fast lookups and uniqueness checks
    - Index on created_at for analytics
*/

CREATE TABLE IF NOT EXISTS waitlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  job_title text NOT NULL,
  interests text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_waitlists_email ON waitlists(email);
CREATE INDEX IF NOT EXISTS idx_waitlists_created_at ON waitlists(created_at);

-- Enable Row Level Security
ALTER TABLE waitlists ENABLE ROW LEVEL SECURITY;

-- Policy for public insert access (needed for waitlist submissions)
CREATE POLICY "Allow public insert for waitlist submissions"
  ON waitlists
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy for authenticated read access (for analytics)
CREATE POLICY "Allow authenticated read for waitlist analytics"
  ON waitlists
  FOR SELECT
  TO authenticated
  USING (true);