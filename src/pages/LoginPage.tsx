import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, AlertCircle, Sparkle, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { sendOtpCode, verifyOtpAndSignIn } from '../services/authService';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loginStage, setLoginStage] = useState<'email_input' | 'otp_input'>('email_input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate('/dashboard');
      }
    };
    checkUser();
  }, [navigate]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await sendOtpCode(email);
      
      if (result.success) {
        setLoginStage('otp_input');
      } else {
        setError(result.error || 'Failed to send verification code');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await verifyOtpAndSignIn(email, otpCode);
      
      if (result.success && result.user) {
        // Check if user has a profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', result.user.id)
          .single();

        if (profile) {
          navigate('/dashboard');
        } else {
          // User exists but no profile - redirect to onboarding
          navigate('/onboarding');
        }
      } else {
        setError(result.error || 'Invalid verification code');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await sendOtpCode(email);
      
      if (!result.success) {
        setError(result.error || 'Failed to resend verification code');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderEmailInput = () => (
    <>
      <motion.div 
        className="text-center mb-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkle className="h-8 w-8 text-accent-600" />
        </div>
        <h1 className="text-3xl font-medium text-ink-dark mb-3">Welcome to N-th`ora</h1>
        <p className="text-ink-light max-w-md mx-auto">Enter your email to receive a secure login code</p>
      </motion.div>

      <motion.div 
        className="bg-white rounded-2xl shadow-soft border border-surface-200 p-8 max-w-md w-full mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-ink-light mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-surface-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input pl-10"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-blush-600 bg-blush-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="btn-primary w-full py-3"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <span>Send Login Code</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/join"
            className="text-accent-600 hover:text-accent-700 text-sm font-medium"
          >
            Need access? Request an invite →
          </Link>
        </div>
      </motion.div>
    </>
  );

  const renderOtpInput = () => (
    <>
      <motion.div 
        className="text-center mb-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-sage-600" />
        </div>
        <h1 className="text-3xl font-medium text-ink-dark mb-3">Check Your Email</h1>
        <p className="text-ink-light max-w-md mx-auto">We've sent a 6-digit code to {email}</p>
      </motion.div>

      <motion.div 
        className="bg-white rounded-2xl shadow-soft border border-surface-200 p-8 max-w-md w-full mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <form onSubmit={handleOtpSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-ink-light mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="input font-mono text-center text-lg tracking-wider"
              required
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-blush-600 bg-blush-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otpCode.length !== 6}
            className="btn-primary w-full py-3"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <span>Verify & Sign In</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <button
            onClick={() => {
              setLoginStage('email_input');
              setOtpCode('');
              setError(null);
            }}
            className="text-accent-600 hover:text-accent-700 text-sm font-medium"
          >
            ← Back to email input
          </button>
          
          <div>
            <button
              onClick={handleResendCode}
              disabled={loading}
              className="text-ink-light hover:text-ink-base text-sm"
            >
              Didn't receive the code? Resend
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        {loginStage === 'email_input' ? renderEmailInput() : renderOtpInput()}

        {/* Closed Beta Notice */}
        <motion.div 
          className="mt-10 bg-white rounded-xl p-6 border border-surface-200 shadow-soft text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="font-medium text-ink-dark mb-2">✨ Closed Beta</h3>
          <p className="text-ink-light text-sm mb-4">
            N-th`ora is currently in closed beta. Access is by invitation only to ensure quality and trust within our network.
          </p>
          <Link
            to="/join"
            className="inline-flex items-center space-x-2 btn-ghost text-accent-600 px-4 py-2"
          >
            <span>Request Invite</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {/* Features */}
        <motion.div 
          className="mt-6 bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-surface-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="font-medium text-ink-dark mb-3">Why N-th`ora?</h3>
          <div className="space-y-3 text-sm text-ink-light">
            <div className="flex items-center space-x-3">
              <span className="w-1.5 h-1.5 bg-accent-500 rounded-full"></span>
              <span>AI-powered expert matching from your network</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="w-1.5 h-1.5 bg-sage-500 rounded-full"></span>
              <span>Trust-based connections and verified expertise</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="w-1.5 h-1.5 bg-clay-500 rounded-full"></span>
              <span>Secure OTP-based authentication</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;