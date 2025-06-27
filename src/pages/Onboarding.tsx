import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';
import { createUserProfile, getCurrentUser } from '../services/authService';
import { updateUserExpertise } from '../services/questionRoutingService';

const Onboarding: React.FC = () => {
  const { inviteCode } = useParams<{ inviteCode?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get early user data from location state if available
  const { earlyUserData, verifiedEmail } = location.state || {};

  const handleOnboardingComplete = async (data: any) => {
    console.log('Onboarding completed with data:', data);
    
    try {
      // Get the current authenticated user
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        console.error('No authenticated user found');
        alert('Authentication error. Please log in again.');
        navigate('/login');
        return;
      }

      console.log('Current user:', currentUser);

      // Extract profile data
      const profileData = {
        full_name: data.fullName || 
          (earlyUserData ? `${earlyUserData.first_name || ''} ${earlyUserData.last_name || ''}`.trim() : ''),
        bio: data.bio || '',
        expertise_areas: data.expertiseAreas || [],
        invited_by: data.referredBy || earlyUserData?.referred_by || undefined,
        invite_code_used: data.inviteCode || earlyUserData?.referral_code || inviteCode || undefined,
        onboarding_details: {
          role: data.role,
          industries: data.industries || [],
          helpTopics: data.helpTopics || [],
          currentStruggles: data.currentStruggles || '',
          motivation: data.motivation || [],
          timeCommitment: data.timeCommitment || 30,
          selectedQuest: data.selectedQuest || '',
          networkStrength: data.networkStrength || 8,
          endorseInviter: data.endorseInviter || false,
          inviterExpertise: data.inviterExpertise || '',
          inviterName: data.inviterName || '',
          // Store early user data if available
          earlyUserData: earlyUserData || null,
          verifiedEmail: verifiedEmail || null,
          completedAt: new Date().toISOString()
        }
      };

      // Create user profile with user ID and email
      const profileResult = await createUserProfile(
        currentUser.id,
        currentUser.email || verifiedEmail || earlyUserData?.email || '',
        profileData
      );
      
      if (!profileResult.success) {
        console.error('Failed to create user profile:', profileResult.error);
        alert('Failed to save your profile. Please try again.');
        return;
      }

      console.log('User profile created successfully:', profileResult.profile);

      // Add individual expertise areas to user_expertise table
      if (data.expertiseAreas && data.expertiseAreas.length > 0) {
        console.log('Adding expertise areas:', data.expertiseAreas);
        
        for (const expertiseArea of data.expertiseAreas) {
          try {
            const expertiseResult = await updateUserExpertise(
              expertiseArea,
              true, // is_available
              Math.floor(data.timeCommitment / 10) || 3 // max_questions_per_week based on time commitment
            );
            
            if (!expertiseResult.success) {
              console.warn(`Failed to add expertise area "${expertiseArea}":`, expertiseResult.error);
            } else {
              console.log(`Successfully added expertise area: ${expertiseArea}`);
            }
          } catch (error) {
            console.warn(`Error adding expertise area "${expertiseArea}":`, error);
          }
        }
      }

      console.log('Onboarding completed successfully, redirecting to dashboard...');
      
      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('An error occurred while saving your information. Please try again.');
    }
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