/*
  # Add New Fields to Early Users Table

  1. Changes
    - Add `first_name` column to `early_users` table
    - Add `last_name` column to `early_users` table
    - Add `more_details` column (JSONB) to `early_users` table to store:
      - startup_name
      - startup_stage
      - annual_revenue
      - product_category
      - industry
      - business_model
      - country

  2. Security
    - No changes to RLS policies needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'early_users' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE early_users ADD COLUMN first_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'early_users' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE early_users ADD COLUMN last_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'early_users' AND column_name = 'more_details'
  ) THEN
    ALTER TABLE early_users ADD COLUMN more_details jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;