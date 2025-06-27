import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Users, ArrowRight, Mail, Key, User } from 'lucide-react';
import { validateInviteCode } from '../../services/membershipService';
import { getEarlyUserByEmail } from '../../services/earlyUserService';
import { 
  sendOtpCode, 
  verifyOtpAndSignIn, 
  sendSignupOtpCode, 
  createUserProfile 
} from '../../services/authService';

const InviteRegistration: React.FC = () => {
  const { inviteCode: urlInviteCode } = useParams<{ inviteCode?: string }>();
  const navigate = useNavigate();
  
  // Multi-stage flow
  const [currentStage, setCurrentStage] = useState<
    'email_input' | 'early_user_otp' | 'invite_code_input' | 'new_user_form' | 'signup_otp' | 'success'
  >('email_input');
  
  // Email input stage
  const [email, setEmail] = useState('');
  
  // Early user OTP verification stage
  const [earlyUserData, setEarlyUserData] = useState<any>(null);
  const [otpCode, setOtpCode] = useState('');
  
  // Invite code input stage
  const [inviteCode, setInviteCode] = useState(urlInviteCode || '');
  const [inviteCodeData, setInviteCodeData] = useState<any>(null);
  const [inviteValid, setInviteValid] = useState<boolean | null>(null);
  
  // New user form stage
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    expertiseAreas: [] as string[]
  });
  const [newExpertise, setNewExpertise] = useState('');
  
  // General state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (urlInviteCode) {
      setInviteCode(urlInviteCode);
      handleValidateInviteCode(urlInviteCode);
    }
  }, [urlInviteCode]);

  const handleEmailSubmit = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if user exists in early_users table
      const earlyUser = await getEarlyUserByEmail(email);
      
      if (earlyUser) {
        // User found in early_users, proceed to OTP verification
        setEarlyUserData(earlyUser);
        
        // Send verification code
        const result = await sendOtpCode(email);
        if (result.success) {
          setCurrentStage('early_user_otp');
        } else {
          setError(result.error || 'Failed to send verification code');
        }
      } else {
        // User not found in early_users, proceed to invite code input
        setCurrentStage('invite_code_input');
      }
    } catch (error) {
      console.error('Error checking email:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async () => {
    if (!otpCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await verifyOtpAndSignIn(email, otpCode);
      
      if (result.success) {
        // OTP verified successfully, proceed to onboarding with early user data
        navigate('/onboarding', { 
          state: { 
            earlyUserData,
            verifiedEmail: email
          }
        });
      } else {
        setError(result.error || 'Invalid verification code');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError('Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateInviteCode = async (code: string = inviteCode) => {
    if (!code.trim()) {
      setInviteValid(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await validateInviteCode(code);
      setInviteValid(result.isValid);
      
      if (result.isValid) {
        setInviteCodeData(result);
        if (currentStage === 'invite_code_input') {
          setCurrentStage('new_user_form');
        }
      } else {
        setError('Invalid or expired invite code');
      }
    } catch (error) {
      console.error('Error validating invite code:', error);
      setError('Failed to validate invite code');
      setInviteValid(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpertise = () => {
    if (newExpertise.trim() && !formData.expertiseAreas.includes(newExpertise.trim())) {
      setFormData(prev => ({
        ...prev,
        expertiseAreas: [...prev.expertiseAreas, newExpertise.trim()]
      }));
      setNewExpertise('');
    }
  };

  const handleRemoveExpertise = (expertise: string) => {
    setFormData(prev => ({
      ...prev,
      expertiseAreas: prev.expertiseAreas.filter(area => area !== expertise)
    }));
  };

  const handleRegister = async () => {
    if (!formData.fullName) {
      setError('Please enter your full name');
      return;
    }

    if (!inviteValid) {
      setError('Please enter a valid invite code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Send signup OTP code for new user
      const otpResult = await sendSignupOtpCode(email);
      
      if (otpResult.success) {
        // Move to signup OTP verification stage
        setCurrentStage('signup_otp');
      } else {
        setError(otpResult.error || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Error initiating signup:', error);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupOtpVerification = async () => {
    if (!otpCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Verify OTP and sign in the new user
      const result = await verifyOtpAndSignIn(email, otpCode);
      
      if (result.success && result.user) {
        // OTP verification successful, create user profile
        const profileResult = await createUserProfile(
          result.user.id,
          email,
          {
            full_name: formData.fullName,
            bio: formData.bio,
            expertise_areas: formData.expertiseAreas,
            invite_code_used: inviteCode,
            invited_by: inviteCodeData?.createdBy,
            onboarding_details: {
              registrationMethod: 'invite',
              inviteCode: inviteCode,
              registrationDate: new Date().toISOString()
            }
          }
        );

        if (profileResult.success) {
          setCurrentStage('success');
        } else {
          setError(profileResult.error || 'Failed to create user profile');
        }
      } else {
        setError(result.error || 'Invalid verification code');
      }
    } catch (error) {
      console.error('Error verifying signup OTP:', error);
      setError('Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderEmailInputStage = () => (
    <>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Join N-th`ora</h2>
        <p className="text-gray-600">Enter your email to get started</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <button
          onClick={handleEmailSubmit}
          disabled={loading || !email.trim()}
          className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors duration-300 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </>
  );

  const renderEarlyUserOtpStage = () => (
    <>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
        <p className="text-gray-600">We've sent a verification code to {email}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification Code
          </label>
          <input
            type="text"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            placeholder="Enter 6-digit code"
            maxLength={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-center text-lg tracking-wider"
            required
          />
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <button
          onClick={handleOtpVerification}
          disabled={loading || otpCode.length !== 6}
          className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors duration-300 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <span>Verify & Continue</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <div className="text-center">
          <button
            onClick={() => setCurrentStage('email_input')}
            className="text-purple-600 hover:text-purple-700 text-sm"
          >
            Back to email input
          </button>
        </div>
      </div>
    </>
  );

  const renderInviteCodeStage = () => (
    <>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Key className="h-8 w-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Invite Code</h2>
        <p className="text-gray-600">You need an invite code to join N-th`ora</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Invite Code
          </label>
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            placeholder="Enter 8-character code"
            maxLength={8}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent font-mono text-center text-lg tracking-wider ${
              inviteValid === null 
                ? 'border-gray-300 focus:ring-purple-500' 
                : inviteValid 
                  ? 'border-green-500 focus:ring-green-500' 
                  : 'border-red-500 focus:ring-red-500'
            }`}
            required
          />
          
          {inviteValid !== null && (
            <div className={`mt-2 text-sm ${inviteValid ? 'text-green-600' : 'text-red-600'}`}>
              {inviteValid 
                ? '✓ Valid invite code' 
                : '✗ Invalid invite code'}
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <button
          onClick={() => handleValidateInviteCode()}
          disabled={loading || !inviteCode.trim()}
          className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors duration-300 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <span>Validate & Continue</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <div className="text-center">
          <button
            onClick={() => setCurrentStage('email_input')}
            className="text-purple-600 hover:text-purple-700 text-sm"
          >
            Back to email input
          </button>
        </div>
      </div>
    </>
  );

  const renderNewUserFormStage = () => (
    <>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
        <p className="text-gray-600">Tell us about yourself to join the community</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell us about your background and interests..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Areas of Expertise
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={newExpertise}
              onChange={(e) => setNewExpertise(e.target.value)}
              placeholder="e.g., AI/ML, Product Management"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleAddExpertise()}
            />
            <button
              type="button"
              onClick={handleAddExpertise}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-300"
            >
              Add
            </button>
          </div>
          
          {formData.expertiseAreas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.expertiseAreas.map((area) => (
                <span
                  key={area}
                  className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                >
                  <span>{area}</span>
                  <button
                    onClick={() => handleRemoveExpertise(area)}
                    className="text-purple-500 hover:text-purple-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <button
          onClick={handleRegister}
          disabled={loading || !formData.fullName}
          className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors duration-300 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <span>Continue to Verification</span>
          )}
        </button>
      </div>
    </>
  );

  const renderSignupOtpStage = () => (
    <>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
        <p className="text-gray-600">We've sent a 6-digit code to {email}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification Code
          </label>
          <input
            type="text"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            placeholder="Enter 6-digit code"
            maxLength={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-center text-lg tracking-wider"
            required
          />
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <button
          onClick={handleSignupOtpVerification}
          disabled={loading || otpCode.length !== 6}
          className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors duration-300 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <span>Complete Registration</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <div className="text-center">
          <button
            onClick={() => {
              setOtpCode('');
              setError(null);
              // Send the OTP code again
              sendSignupOtpCode(email);
            }}
            className="text-purple-600 hover:text-purple-700 text-sm"
          >
            Resend verification code
          </button>
        </div>
      </div>
    </>
  );

  const renderSuccessStage = () => (
    <div className="text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to N-th`ora!</h2>
      <p className="text-gray-600 mb-6">
        Your registration has been submitted. You'll receive an email when your membership is approved.
      </p>
      <button
        onClick={() => navigate('/dashboard')}
        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-300"
      >
        Go to Dashboard
      </button>
    </div>
  );

  const renderCurrentStage = () => {
    switch (currentStage) {
      case 'email_input':
        return renderEmailInputStage();
      case 'early_user_otp':
        return renderEarlyUserOtpStage();
      case 'invite_code_input':
        return renderInviteCodeStage();
      case 'new_user_form':
        return renderNewUserFormStage();
      case 'signup_otp':
        return renderSignupOtpStage();
      case 'success':
        return renderSuccessStage();
      default:
        return renderEmailInputStage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
        {renderCurrentStage()}
      </div>
    </div>
  );
};

export default InviteRegistration;