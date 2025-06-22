/*
  # Add referral source tracking to early users

  1. Changes
    - Add `referral_source` column to `early_users` table to track how users heard about N-th`ora

  2. Security
    - No changes to RLS policies needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'early_users' AND column_name = 'referral_source'
  ) THEN
    ALTER TABLE early_users ADD COLUMN referral_source text;
  END IF;
END $$;