/*
  # Exclusive Membership System

  1. New Tables
    - `pending_users` - Users awaiting approval
    - `member_approvals` - Tracks who approved whom
    - `invite_codes` - Manages invitation codes and usage
    - `user_roles` - Role management system

  2. Updates to existing tables
    - Add role and membership status to users
    - Add invitation tracking

  3. Security
    - RLS policies for role-based access
    - Approval workflow triggers
    - Invite code validation

  4. Functions
    - Auto-promotion on 3 approvals
    - Fast-track invite code logic
    - Membership validation
*/

-- Create user roles enum
CREATE TYPE user_role AS ENUM ('pending', 'member', 'admin');
CREATE TYPE membership_status AS ENUM ('pending_approval', 'active', 'suspended');

-- Pending users table (before they become full members)
CREATE TABLE IF NOT EXISTS pending_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  bio text,
  expertise_areas text[],
  invited_by uuid REFERENCES auth.users(id),
  invite_code text,
  approval_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Member approvals tracking
CREATE TABLE IF NOT EXISTS member_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pending_user_id uuid REFERENCES pending_users(id) ON DELETE CASCADE,
  approver_id uuid REFERENCES auth.users(id),
  approved_at timestamptz DEFAULT now(),
  approval_reason text,
  UNIQUE(pending_user_id, approver_id)
);

-- Invite codes management
CREATE TABLE IF NOT EXISTS invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  max_uses integer DEFAULT 1,
  current_uses integer DEFAULT 0,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  fast_track_threshold integer DEFAULT 3,
  created_at timestamptz DEFAULT now()
);

-- User profiles with membership info
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  bio text,
  avatar_url text,
  role user_role DEFAULT 'pending',
  membership_status membership_status DEFAULT 'pending_approval',
  expertise_areas text[],
  invited_by uuid REFERENCES auth.users(id),
  invite_code_used text,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_pending_users_email ON pending_users(email);
CREATE INDEX idx_pending_users_invite_code ON pending_users(invite_code);
CREATE INDEX idx_member_approvals_pending_user ON member_approvals(pending_user_id);
CREATE INDEX idx_member_approvals_approver ON member_approvals(approver_id);
CREATE INDEX idx_invite_codes_code ON invite_codes(code);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_status ON user_profiles(membership_status);

-- Enable RLS
ALTER TABLE pending_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pending_users
CREATE POLICY "Members can view pending users"
  ON pending_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('member', 'admin')
    )
  );

CREATE POLICY "Anyone can insert pending users"
  ON pending_users FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- RLS Policies for member_approvals
CREATE POLICY "Members can view approvals"
  ON member_approvals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('member', 'admin')
    )
  );

CREATE POLICY "Members can approve pending users"
  ON member_approvals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('member', 'admin')
    )
  );

-- RLS Policies for invite_codes
CREATE POLICY "Members can view their invite codes"
  ON invite_codes FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Members can create invite codes"
  ON invite_codes FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('member', 'admin')
    )
  );

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Members can view other member profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles viewer
      WHERE viewer.id = auth.uid() 
      AND viewer.role IN ('member', 'admin')
    )
  );

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Function to generate unique invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to create invite code
CREATE OR REPLACE FUNCTION create_invite_code(
  creator_id uuid,
  max_uses_param integer DEFAULT 1,
  expires_in_days integer DEFAULT 30
)
RETURNS text AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  -- Verify creator is a member
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = creator_id 
    AND role IN ('member', 'admin')
  ) THEN
    RAISE EXCEPTION 'Only members can create invite codes';
  END IF;

  -- Generate unique code
  LOOP
    new_code := generate_invite_code();
    SELECT EXISTS(SELECT 1 FROM invite_codes WHERE code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;

  -- Insert new invite code
  INSERT INTO invite_codes (
    code, 
    created_by, 
    max_uses, 
    expires_at
  ) VALUES (
    new_code,
    creator_id,
    max_uses_param,
    now() + (expires_in_days || ' days')::interval
  );

  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Function to validate invite code
CREATE OR REPLACE FUNCTION validate_invite_code(code_to_check text)
RETURNS TABLE(
  is_valid boolean,
  invite_id uuid,
  created_by uuid,
  remaining_uses integer,
  fast_track_threshold integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (ic.is_active AND ic.current_uses < ic.max_uses AND (ic.expires_at IS NULL OR ic.expires_at > now())) as is_valid,
    ic.id as invite_id,
    ic.created_by,
    (ic.max_uses - ic.current_uses) as remaining_uses,
    ic.fast_track_threshold
  FROM invite_codes ic
  WHERE ic.code = code_to_check;
END;
$$ LANGUAGE plpgsql;

-- Function to handle user approval
CREATE OR REPLACE FUNCTION approve_pending_user(
  pending_user_id uuid,
  approver_id uuid,
  reason text DEFAULT NULL
)
RETURNS TABLE(
  success boolean,
  message text,
  auto_promoted boolean
) AS $$
DECLARE
  pending_user_record record;
  approval_count integer;
  fast_track_threshold integer := 3;
  invite_code_record record;
BEGIN
  -- Verify approver is a member
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = approver_id 
    AND role IN ('member', 'admin')
  ) THEN
    RETURN QUERY SELECT false, 'Only members can approve users'::text, false;
    RETURN;
  END IF;

  -- Get pending user info
  SELECT * INTO pending_user_record
  FROM pending_users 
  WHERE id = pending_user_id;

  IF pending_user_record.id IS NULL THEN
    RETURN QUERY SELECT false, 'Pending user not found'::text, false;
    RETURN;
  END IF;

  -- Check if already approved by this user
  IF EXISTS (
    SELECT 1 FROM member_approvals 
    WHERE pending_user_id = pending_user_id 
    AND approver_id = approver_id
  ) THEN
    RETURN QUERY SELECT false, 'You have already approved this user'::text, false;
    RETURN;
  END IF;

  -- Add approval
  INSERT INTO member_approvals (pending_user_id, approver_id, approval_reason)
  VALUES (pending_user_id, approver_id, reason);

  -- Update approval count
  UPDATE pending_users 
  SET approval_count = approval_count + 1
  WHERE id = pending_user_id;

  -- Get updated approval count
  SELECT approval_count INTO approval_count
  FROM pending_users 
  WHERE id = pending_user_id;

  -- Check for fast-track via invite code
  IF pending_user_record.invite_code IS NOT NULL THEN
    SELECT * INTO invite_code_record
    FROM invite_codes 
    WHERE code = pending_user_record.invite_code;
    
    IF invite_code_record.fast_track_threshold IS NOT NULL THEN
      fast_track_threshold := invite_code_record.fast_track_threshold;
    END IF;
  END IF;

  -- Auto-promote if threshold reached
  IF approval_count >= fast_track_threshold THEN
    -- Create user profile
    INSERT INTO user_profiles (
      id, email, full_name, bio, role, membership_status,
      expertise_areas, invited_by, invite_code_used, approved_at
    ) VALUES (
      gen_random_uuid(), -- This would be the actual auth user ID in practice
      pending_user_record.email,
      pending_user_record.full_name,
      pending_user_record.bio,
      'member',
      'active',
      pending_user_record.expertise_areas,
      pending_user_record.invited_by,
      pending_user_record.invite_code,
      now()
    );

    -- Update invite code usage
    IF pending_user_record.invite_code IS NOT NULL THEN
      UPDATE invite_codes 
      SET current_uses = current_uses + 1
      WHERE code = pending_user_record.invite_code;
    END IF;

    -- Remove from pending
    DELETE FROM pending_users WHERE id = pending_user_id;

    RETURN QUERY SELECT true, 'User approved and promoted to member'::text, true;
  ELSE
    RETURN QUERY SELECT true, format('Approval added. %s more needed for membership', fast_track_threshold - approval_count), false;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to handle fast-track invite registration
CREATE OR REPLACE FUNCTION register_with_invite(
  user_email text,
  user_name text,
  user_bio text,
  expertise_areas text[],
  invite_code text
)
RETURNS TABLE(
  success boolean,
  message text,
  requires_approval boolean
) AS $$
DECLARE
  invite_record record;
  users_with_code integer;
BEGIN
  -- Validate invite code
  SELECT * INTO invite_record
  FROM validate_invite_code(invite_code);

  IF NOT invite_record.is_valid THEN
    RETURN QUERY SELECT false, 'Invalid or expired invite code'::text, true;
    RETURN;
  END IF;

  -- Check how many users have used this code
  SELECT COUNT(*) INTO users_with_code
  FROM pending_users 
  WHERE invite_code = invite_code;

  -- If 3+ users already used this code, auto-approve
  IF users_with_code >= (invite_record.fast_track_threshold - 1) THEN
    -- Create user profile directly
    INSERT INTO user_profiles (
      id, email, full_name, bio, role, membership_status,
      expertise_areas, invited_by, invite_code_used, approved_at
    ) VALUES (
      gen_random_uuid(), -- This would be the actual auth user ID
      user_email,
      user_name,
      user_bio,
      'member',
      'active',
      expertise_areas,
      invite_record.created_by,
      invite_code,
      now()
    );

    -- Update invite code usage
    UPDATE invite_codes 
    SET current_uses = current_uses + 1
    WHERE code = invite_code;

    RETURN QUERY SELECT true, 'Welcome! You have been fast-tracked to membership'::text, false;
  ELSE
    -- Add to pending users
    INSERT INTO pending_users (
      email, full_name, bio, expertise_areas, 
      invited_by, invite_code
    ) VALUES (
      user_email, user_name, user_bio, expertise_areas,
      invite_record.created_by, invite_code
    );

    RETURN QUERY SELECT true, format('Registration submitted. You need %s approvals from existing members', invite_record.fast_track_threshold), true;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pending_users_updated_at
  BEFORE UPDATE ON pending_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();