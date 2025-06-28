/*
  # Add INSERT Policy for User Profiles

  1. Changes
    - Add a new RLS policy to allow authenticated users to create their own profile
    - This fixes the issue where users couldn't save their profile data during onboarding

  2. Security
    - The policy ensures users can only create a profile with their own auth.uid()
*/

-- Add INSERT policy for user_profiles
CREATE POLICY "Users can create their own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Function to get user role (helper function for RLS policies)
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
DECLARE
  user_role_val user_role;
BEGIN
  SELECT role INTO user_role_val
  FROM user_profiles
  WHERE id = auth.uid();
  
  RETURN user_role_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;