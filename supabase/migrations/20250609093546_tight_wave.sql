/*
  # Create Early Users Table

  1. New Tables
    - `early_users`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `referral_code` (text, unique, not null)
      - `referred_by` (text, optional foreign key to referral_code)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `early_users` table
    - Add policy for public read access to validate referral codes
    - Add policy for public insert access for new registrations

  3. Indexes
    - Index on email for fast lookups
    - Index on referral_code for validation
    - Index on referred_by for analytics
*/

CREATE TABLE IF NOT EXISTS early_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  referral_code text UNIQUE NOT NULL,
  referred_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraint for referred_by
ALTER TABLE early_users 
ADD CONSTRAINT fk_referred_by 
FOREIGN KEY (referred_by) REFERENCES early_users(referral_code);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_early_users_email ON early_users(email);
CREATE INDEX IF NOT EXISTS idx_early_users_referral_code ON early_users(referral_code);
CREATE INDEX IF NOT EXISTS idx_early_users_referred_by ON early_users(referred_by);

-- Enable Row Level Security
ALTER TABLE early_users ENABLE ROW LEVEL SECURITY;

-- Policy for public read access (needed for referral code validation)
CREATE POLICY "Allow public read for referral validation"
  ON early_users
  FOR SELECT
  TO anon
  USING (true);

-- Policy for public insert access (needed for new registrations)
CREATE POLICY "Allow public insert for new registrations"
  ON early_users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_early_users_updated_at
  BEFORE UPDATE ON early_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();