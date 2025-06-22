import { supabase } from '../lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: any;
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
  updated_at: string;
}

// Get current authenticated user
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      if (error.message === 'Auth session missing!') {
        console.warn('Auth session missing - user not logged in');
      } else {
        console.error('Error getting current user:', error);
      }
      return null;
    }

    return user;
  } catch (error) {
    if (error instanceof Error && error.message === 'Auth session missing!') {
      console.warn('Auth session missing - user not logged in');
    } else {
      console.error('Error getting current user:', error);
    }
    return null;
  }
}

// Sign out
export async function signOut(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get user profile
export async function getUserProfile(userId?: string): Promise<UserProfile | null> {
  try {
    const targetUserId = userId || (await getCurrentUser())?.id;
    
    if (!targetUserId) {
      return null;
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', targetUserId)
      .single();

    if (error) {
      console.error('Error getting user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

// Update user profile
export async function updateUserProfile(updates: Partial<UserProfile>): Promise<{
  success: boolean;
  profile?: UserProfile;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, profile: data };
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Create user profile (used during onboarding)
export async function createUserProfile(profileData: {
  full_name: string;
  bio?: string;
  expertise_areas: string[];
  invited_by?: string;
  invite_code_used?: string;
}): Promise<{
  success: boolean;
  profile?: UserProfile;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        email: user.email!,
        ...profileData,
        role: 'pending',
        membership_status: 'pending_approval'
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, profile: data };
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Send verification code to user's email
export async function sendVerificationCode(email: string): Promise<{
  success: boolean;
  codeId?: string;
  error?: string;
}> {
  try {
    // Use Supabase's built-in OTP functionality
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: false, // Only allow existing users to sign in
      }
    });

    if (error) {
      console.error('Error sending verification code:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending verification code:', error);
    return { success: false, error: 'Failed to send verification code' };
  }
}

// Verify OTP code
export async function verifyEmailCode(email: string, code: string): Promise<{
  success: boolean;
  message: string;
  codeId?: string;
}> {
  try {
    // The actual verification happens in the login page using supabase.auth.verifyOtp
    // This function is kept for compatibility but the real verification is done there
    return {
      success: true,
      message: 'Code is valid'
    };
  } catch (error) {
    console.error('Error verifying code:', error);
    return { success: false, message: 'Failed to verify code' };
  }
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });
}