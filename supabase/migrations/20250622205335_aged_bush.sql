/*
  # Add onboarding_details column to user_profiles

  1. Changes
    - Add `onboarding_details` column of type `jsonb` to `user_profiles` table
    - This will store additional structured data from the onboarding process
    - Includes industries, help topics, current struggles, motivation, time commitment, selected quest, network strength, etc.

  2. Security
    - No changes to RLS policies needed as this is just adding a column to existing table
*/

-- Add onboarding_details column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS onboarding_details jsonb DEFAULT '{}'::jsonb;

-- Add a comment to document the column
COMMENT ON COLUMN user_profiles.onboarding_details IS 'Additional structured data collected during onboarding process including industries, help topics, motivation, etc.';