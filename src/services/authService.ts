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
  onboarding_details?: Record<string, any>;
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

    console.log('getCurrentUser - Retrieved user:', user?.id);
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
      console.error('getUserProfile - No target user ID available');
      return null;
    }

    console.log('getUserProfile - Fetching profile for user ID:', targetUserId);

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', targetUserId)
      .single();

    if (error) {
      // Handle the specific case where no profile exists (PGRST116 error)
      if (error.code === 'PGRST116') {
        console.log('getUserProfile - No profile found for user (this is expected for new users)');
        return null;
      }
      console.error('Error getting user profile:', error);
      return null;
    }

    console.log('getUserProfile - Retrieved profile data:', data);
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
export async function createUserProfile(
  userId: string,
  email: string,
  profileData: {
    full_name: string;
    bio?: string;
    expertise_areas: string[];
    invited_by?: string;
    invite_code_used?: string;
    onboarding_details?: Record<string, any>;
  }
): Promise<{
  success: boolean;
  profile?: UserProfile;
  error?: string;
}> {
  try {
    if (!userId || !email) {
      console.error('createUserProfile - Missing required fields:', { userId, email });
      return { success: false, error: 'User ID and email are required' };
    }

    console.log('createUserProfile - Creating profile with data:', {
      userId,
      email,
      ...profileData
    });

    // Changed from insert to upsert to handle cases where the profile already exists
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        email: email,
        ...profileData,
        role: 'pending',
        membership_status: 'pending_approval',
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('createUserProfile - Upsert error:', error);
      return { success: false, error: error.message };
    }

    console.log('createUserProfile - Profile created/updated successfully:', data);
    return { success: true, profile: data };
  } catch (error) {
    console.error('createUserProfile - Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Send OTP code to user's email (for login - existing users only)
export async function sendOtpCode(email: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Use Supabase's built-in OTP functionality
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: true, // Only allow existing users to sign in
      }
    });

    if (error) {
      console.error('Error sending OTP code:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending OTP code:', error);
    return { success: false, error: 'Failed to send verification code' };
  }
}

// Send OTP code for signup (new users)
export async function sendSignupOtpCode(email: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Use Supabase's built-in OTP functionality with shouldCreateUser: true
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: true, // Create new user if they don't exist
      }
    });

    if (error) {
      console.error('Error sending signup OTP code:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending signup OTP code:', error);
    return { success: false, error: 'Failed to send verification code' };
  }
}

// Verify OTP and sign in
export async function verifyOtpAndSignIn(email: string, token: string): Promise<{
  success: boolean;
  user?: AuthUser;
  error?: string;
}> {
  try {
    console.log('verifyOtpAndSignIn - Verifying OTP for email:', email);
    
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });

    if (error) {
      console.error('verifyOtpAndSignIn - Verification error:', error);
      return { success: false, error: error.message };
    }

    if (!data.user) {
      console.error('verifyOtpAndSignIn - No user returned after verification');
      return { success: false, error: 'Authentication failed' };
    }

    console.log('verifyOtpAndSignIn - User authenticated successfully:', data.user.id);
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { success: false, error: 'Failed to verify code' };
  }
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session?.user?.id);
    callback(session?.user || null);
  });
}