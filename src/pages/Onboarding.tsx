import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';

const Onboarding: React.FC = () => {
  const { inviteCode } = useParams<{ inviteCode?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get early user data from location state if available
  const { earlyUserData, verifiedEmail } = location.state || {};

  const handleOnboardingComplete = (data: any) => {
    console.log('Onboarding completed with data:', data);
    // Here you would typically:
    // 1. Save the onboarding data to your backend
    // 2. Create the user profile
    // 3. Set up their expertise areas
    // 4. Initialize their quest/gamification state
    
    // For now, redirect to dashboard
    navigate('/dashboard');
  };

  return (
    <OnboardingFlow
      onComplete={handleOnboardingComplete}
      inviteCode={inviteCode}
      initialOnboardingData={earlyUserData}
      verifiedEmail={verifiedEmail}
      inviterName={earlyUserData?.referred_by ? "Referring User" : undefined} // In a real app, you'd fetch the inviter's name
    />
  );
};

export default Onboarding;