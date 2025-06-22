import { supabase } from '../lib/supabase';

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