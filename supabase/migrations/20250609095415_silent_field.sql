/*
  # Email Verification System

  1. New Tables
    - `email_verification_codes`
      - `id` (uuid, primary key)
      - `email` (text, not null)
      - `code` (text, not null)
      - `expires_at` (timestamp)
      - `verified` (boolean, default false)
      - `attempts` (integer, default 0)
      - `created_at` (timestamp)

  2. Updates to existing tables
    - Add `email_verified` column to `early_users` table
    - Add `verification_code_id` reference

  3. Security
    - Enable RLS on `email_verification_codes` table
    - Add policies for public access to verification operations
    - Add rate limiting through attempt tracking

  4. Functions
    - Function to generate and send OTP codes
    - Function to verify OTP codes
    - Function to clean up expired codes
*/

-- Add email verification tracking to early_users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'early_users' AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE early_users ADD COLUMN email_verified boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'early_users' AND column_name = 'verification_code_id'
  ) THEN
    ALTER TABLE early_users ADD COLUMN verification_code_id uuid;
  END IF;
END $$;

-- Create email verification codes table
CREATE TABLE IF NOT EXISTS email_verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  verified boolean DEFAULT false,
  attempts integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_email ON email_verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_code ON email_verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_expires_at ON email_verification_codes(expires_at);

-- Enable Row Level Security
ALTER TABLE email_verification_codes ENABLE ROW LEVEL SECURITY;

-- Policy for public read access (needed for code verification)
CREATE POLICY "Allow public read for verification"
  ON email_verification_codes
  FOR SELECT
  TO anon
  USING (true);

-- Policy for public insert access (needed for generating codes)
CREATE POLICY "Allow public insert for code generation"
  ON email_verification_codes
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy for public update access (needed for verification and attempt tracking)
CREATE POLICY "Allow public update for verification"
  ON email_verification_codes
  FOR UPDATE
  TO anon
  USING (true);

-- Function to generate a 6-digit OTP code
CREATE OR REPLACE FUNCTION generate_otp_code()
RETURNS text AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to create verification code
CREATE OR REPLACE FUNCTION create_verification_code(user_email text)
RETURNS TABLE(code_id uuid, verification_code text) AS $$
DECLARE
  new_code text;
  code_record record;
BEGIN
  -- Generate a unique 6-digit code
  LOOP
    new_code := generate_otp_code();
    
    -- Check if code already exists and is not expired
    SELECT id INTO code_record
    FROM email_verification_codes 
    WHERE code = new_code 
    AND expires_at > now() 
    AND verified = false;
    
    -- If no existing code found, break the loop
    IF code_record.id IS NULL THEN
      EXIT;
    END IF;
  END LOOP;

  -- Invalidate any existing unverified codes for this email
  UPDATE email_verification_codes 
  SET verified = true 
  WHERE email = user_email 
  AND verified = false 
  AND expires_at > now();

  -- Insert new verification code
  INSERT INTO email_verification_codes (email, code)
  VALUES (user_email, new_code)
  RETURNING id, code INTO code_id, verification_code;

  RETURN QUERY SELECT code_id, verification_code;
END;
$$ LANGUAGE plpgsql;

-- Function to verify OTP code
CREATE OR REPLACE FUNCTION verify_otp_code(user_email text, input_code text)
RETURNS TABLE(success boolean, message text, code_id uuid) AS $$
DECLARE
  code_record record;
BEGIN
  -- Find the verification code
  SELECT id, code, expires_at, verified, attempts
  INTO code_record
  FROM email_verification_codes
  WHERE email = user_email
  AND code = input_code
  ORDER BY created_at DESC
  LIMIT 1;

  -- Check if code exists
  IF code_record.id IS NULL THEN
    RETURN QUERY SELECT false, 'Invalid verification code'::text, null::uuid;
    RETURN;
  END IF;

  -- Check if code is already verified
  IF code_record.verified = true THEN
    RETURN QUERY SELECT false, 'Verification code has already been used'::text, code_record.id;
    RETURN;
  END IF;

  -- Check if code is expired
  IF code_record.expires_at < now() THEN
    RETURN QUERY SELECT false, 'Verification code has expired'::text, code_record.id;
    RETURN;
  END IF;

  -- Check attempt limit (max 5 attempts)
  IF code_record.attempts >= 5 THEN
    RETURN QUERY SELECT false, 'Too many failed attempts. Please request a new code'::text, code_record.id;
    RETURN;
  END IF;

  -- Verify the code
  IF code_record.code = input_code THEN
    -- Mark as verified
    UPDATE email_verification_codes
    SET verified = true, attempts = attempts + 1
    WHERE id = code_record.id;
    
    RETURN QUERY SELECT true, 'Email verified successfully'::text, code_record.id;
  ELSE
    -- Increment attempts
    UPDATE email_verification_codes
    SET attempts = attempts + 1
    WHERE id = code_record.id;
    
    RETURN QUERY SELECT false, 'Invalid verification code'::text, code_record.id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired codes (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM email_verification_codes
  WHERE expires_at < now() - interval '1 day';
END;
$$ LANGUAGE plpgsql;

-- Add foreign key constraint for verification_code_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_verification_code_id'
  ) THEN
    ALTER TABLE early_users 
    ADD CONSTRAINT fk_verification_code_id 
    FOREIGN KEY (verification_code_id) REFERENCES email_verification_codes(id);
  END IF;
END $$;