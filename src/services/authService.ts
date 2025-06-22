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
      console.error('Error getting current user:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Sign in with email and password
export async function signInWithPassword(email: string, password: string): Promise<{
  success: boolean;
  user?: AuthUser;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Sign up with email and password
export async function signUpWithPassword(email: string, password: string): Promise<{
  success: boolean;
  user?: AuthUser;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' };
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
    const { data, error } = await supabase.rpc('create_verification_code', {
      user_email: email
    });

    if (error) {
      console.error('Error sending verification code:', error);
      return { success: false, error: error.message };
    }

    return { success: true, codeId: data.code_id };
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
    const { data, error } = await supabase.rpc('verify_otp_code', {
      user_email: email,
      input_code: code
    });

    if (error) {
      console.error('Error verifying code:', error);
      return { success: false, message: error.message };
    }

    if (!data || data.length === 0) {
      return { success: false, message: 'Invalid verification code' };
    }

    const result = data[0];
    return {
      success: result.success,
      message: result.message,
      codeId: result.code_id
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