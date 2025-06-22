import { supabase } from '../lib/supabase';

export interface EarlyUserSubmission {
  email: string;
  firstName?: string;
  lastName?: string;
  referredBy?: string;
  referralSource?: string;
  moreDetails?: Record<string, any>;
}

export interface EarlyUserResponse {
  success: boolean;
  data?: {
    email: string;
    referralCode: string;
    isNewUser: boolean;
    emailVerified: boolean;
  };
  error?: string;
}

export interface EarlyUserData {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  referral_code: string;
  referred_by?: string;
  referral_source?: string;
  email_verified: boolean;
  verification_code_id?: string;
  more_details?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Generate a random 6-character alphanumeric code
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Check if referral code already exists
async function isReferralCodeUnique(code: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('early_users')
    .select('referral_code')
    .eq('referral_code', code)
    .single();

  if (error && error.code === 'PGRST116') {
    // No rows found, code is unique
    return true;
  }

  return !data;
}

// Generate a unique referral code
async function generateUniqueReferralCode(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const code = generateReferralCode();
    const isUnique = await isReferralCodeUnique(code);
    
    if (isUnique) {
      return code;
    }
    
    attempts++;
  }

  throw new Error('Failed to generate unique referral code after multiple attempts');
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Get early user by email
export async function getEarlyUserByEmail(email: string): Promise<EarlyUserData | null> {
  try {
    if (!isValidEmail(email)) {
      return null;
    }

    const { data, error } = await supabase
      .from('early_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null;
      }
      console.error('Error fetching early user:', error);
      throw error;
    }

    return data as EarlyUserData;
  } catch (error) {
    console.error('Error in getEarlyUserByEmail:', error);
    return null;
  }
}

// Submit early user email (simplified without email verification)
export async function submitEarlyUser(submission: EarlyUserSubmission): Promise<EarlyUserResponse> {
  try {
    // Validate email format
    if (!isValidEmail(submission.email)) {
      return {
        success: false,
        error: 'Please enter a valid email address'
      };
    }

    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('early_users')
      .select('email, referral_code, email_verified')
      .eq('email', submission.email.toLowerCase())
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Database check error:', checkError);
      return {
        success: false,
        error: 'Database connection issue. Please try again.'
      };
    }

    // If user already exists, return their data
    if (existingUser) {
      return {
        success: true,
        data: {
          email: existingUser.email,
          referralCode: existingUser.referral_code,
          isNewUser: false,
          emailVerified: true // Simplified - no email verification required
        }
      };
    }

    // Generate unique referral code for new user
    const referralCode = await generateUniqueReferralCode();

    // Insert new user without email verification requirement
    const { data: newUser, error: insertError } = await supabase
      .from('early_users')
      .insert({
        email: submission.email.toLowerCase(),
        first_name: submission.firstName,
        last_name: submission.lastName,
        referral_code: referralCode,
        referred_by: submission.referredBy || null,
        referral_source: submission.referralSource || null,
        more_details: submission.moreDetails || {},
        email_verified: true // Simplified - automatically verified
      })
      .select('email, referral_code, email_verified')
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return {
        success: false,
        error: 'Failed to save your information. Please try again.'
      };
    }

    return {
      success: true,
      data: {
        email: newUser.email,
        referralCode: newUser.referral_code,
        isNewUser: true,
        emailVerified: true
      }
    };

  } catch (error) {
    console.error('Service error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
}

// Validate referral code exists
export async function validateReferralCode(code: string): Promise<boolean> {
  if (!code || code.length !== 6) {
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('early_users')
      .select('referral_code')
      .eq('referral_code', code.toUpperCase())
      .single();

    return !error && !!data;
  } catch {
    return false;
  }
}