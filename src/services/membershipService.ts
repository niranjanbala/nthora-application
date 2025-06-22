import { supabase } from '../lib/supabase';

export interface PendingUser {
  id: string;
  email: string;
  full_name: string;
  bio?: string;
  expertise_areas: string[];
  invited_by?: string;
  invite_code?: string;
  approval_count: number;
  created_at: string;
}

export interface MemberApproval {
  id: string;
  pending_user_id: string;
  approver_id: string;
  approved_at: string;
  approval_reason?: string;
}

export interface InviteCode {
  id: string;
  code: string;
  created_by: string;
  max_uses: number;
  current_uses: number;
  expires_at?: string;
  is_active: boolean;
  fast_track_threshold: number;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  bio?: string;
  avatar_url?: string;
  role: 'pending' | 'member' | 'admin';
  membership_status: 'pending_approval' | 'active' | 'suspended';
  expertise_areas: string[];
  invited_by?: string;
  invite_code_used?: string;
  approved_at?: string;
  created_at: string;
}

// Membership validation
export async function checkMembershipStatus(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error checking membership status:', error);
    return null;
  }

  return data;
}

// Create invite code
export async function createInviteCode(
  maxUses: number = 1,
  expiresInDays: number = 30
): Promise<{ success: boolean; code?: string; error?: string }> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase.rpc('create_invite_code', {
      creator_id: user.user.id,
      max_uses_param: maxUses,
      expires_in_days: expiresInDays
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, code: data };
  } catch (error) {
    return { success: false, error: 'Failed to create invite code' };
  }
}

// Validate invite code
export async function validateInviteCode(code: string): Promise<{
  isValid: boolean;
  inviteId?: string;
  createdBy?: string;
  remainingUses?: number;
  fastTrackThreshold?: number;
}> {
  try {
    const { data, error } = await supabase.rpc('validate_invite_code', {
      code_to_check: code
    });

    if (error || !data || data.length === 0) {
      return { isValid: false };
    }

    const result = data[0];
    return {
      isValid: result.is_valid,
      inviteId: result.invite_id,
      createdBy: result.created_by,
      remainingUses: result.remaining_uses,
      fastTrackThreshold: result.fast_track_threshold
    };
  } catch (error) {
    console.error('Error validating invite code:', error);
    return { isValid: false };
  }
}

// Register with invite code
export async function registerWithInvite(
  email: string,
  fullName: string,
  bio: string,
  expertiseAreas: string[],
  inviteCode: string
): Promise<{
  success: boolean;
  message: string;
  requiresApproval: boolean;
}> {
  try {
    const { data, error } = await supabase.rpc('register_with_invite', {
      user_email: email,
      user_name: fullName,
      user_bio: bio,
      expertise_areas: expertiseAreas,
      invite_code: inviteCode
    });

    if (error) {
      return {
        success: false,
        message: error.message,
        requiresApproval: true
      };
    }

    const result = data[0];
    return {
      success: result.success,
      message: result.message,
      requiresApproval: result.requires_approval
    };
  } catch (error) {
    return {
      success: false,
      message: 'Registration failed',
      requiresApproval: true
    };
  }
}

// Get pending users (for members to approve)
export async function getPendingUsers(): Promise<PendingUser[]> {
  const { data, error } = await supabase
    .from('pending_users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending users:', error);
    return [];
  }

  return data || [];
}

// Approve pending user
export async function approvePendingUser(
  pendingUserId: string,
  reason?: string
): Promise<{
  success: boolean;
  message: string;
  autoPromoted: boolean;
}> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return {
        success: false,
        message: 'Not authenticated',
        autoPromoted: false
      };
    }

    const { data, error } = await supabase.rpc('approve_pending_user', {
      pending_user_id: pendingUserId,
      approver_id: user.user.id,
      reason: reason
    });

    if (error) {
      return {
        success: false,
        message: error.message,
        autoPromoted: false
      };
    }

    const result = data[0];
    return {
      success: result.success,
      message: result.message,
      autoPromoted: result.auto_promoted
    };
  } catch (error) {
    return {
      success: false,
      message: 'Approval failed',
      autoPromoted: false
    };
  }
}

// Get user's invite codes
export async function getUserInviteCodes(): Promise<InviteCode[]> {
  const { data, error } = await supabase
    .from('invite_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching invite codes:', error);
    return [];
  }

  return data || [];
}

// Get member approvals for a pending user
export async function getMemberApprovals(pendingUserId: string): Promise<MemberApproval[]> {
  const { data, error } = await supabase
    .from('member_approvals')
    .select(`
      *,
      approver:user_profiles!approver_id(full_name, avatar_url)
    `)
    .eq('pending_user_id', pendingUserId)
    .order('approved_at', { ascending: false });

  if (error) {
    console.error('Error fetching member approvals:', error);
    return [];
  }

  return data || [];
}

// Check if user can approve (is a member)
export async function canUserApprove(): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    const profile = await checkMembershipStatus(user.user.id);
    return profile?.role === 'member' || profile?.role === 'admin';
  } catch (error) {
    return false;
  }
}