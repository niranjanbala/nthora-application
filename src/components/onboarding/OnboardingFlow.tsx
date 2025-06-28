import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle, Sparkles, Users, Target, Star, Zap, Network, Award, Clock, TrendingUp, Volume2, Pause } from 'lucide-react';
import AIRoleInput from './AIRoleInput';
import AIIndustryInput from './AIIndustryInput';
import AIExpertiseInput from './AIExpertiseInput';
import AIHelpTopicsInput from './AIHelpTopicsInput';
import CategoryUnlockFlow from './CategoryUnlockFlow';
import { elevenLabsService } from '../../services/elevenLabsService';

interface OnboardingData {
  fullName: string;
  primaryRole: string;
  additionalRoles: string[];
  industries: string[];
  expertiseAreas: string[];
  helpTopics: string[];
  currentStruggles: string;
  inviterName?: string;
  inviteCode?: string;
  endorseInviter?: boolean;
  inviterExpertise?: string;
  motivation: string[];
  timeCommitment: number;
  selectedQuest?: string;
  networkStrength: number;
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  inviteCode?: string;
  inviterName?: string;
  initialOnboardingData?: any;
  verifiedEmail?: string;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ 
  onComplete, 
  inviteCode, 
  inviterName,
  initialOnboardingData,
  verifiedEmail
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    fullName: '',
    primaryRole: '',
    additionalRoles: [],
    industries: [],
    expertiseAreas: [],
    helpTopics: [],
    currentStruggles: '',
    inviterName,
    inviteCode,
    motivation: [],
    timeCommitment: 30,
    networkStrength: 8 // Starting network strength
  });
  const [newAdditionalRole, setNewAdditionalRole] = useState('');
  
  // Audio playback state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [currentPlayingText, setCurrentPlayingText] = useState<string | null>(null);

  // Initialize data from early user information if available
  useEffect(() => {
    if (initialOnboardingData) {
      const moreDetails = initialOnboardingData.more_details || {};
      
      setData(prev => ({
        ...prev,
        // Use first_name and last_name from early_users
        fullName: [
          initialOnboardingData.first_name || '',
          initialOnboardingData.last_name || ''
        ].filter(Boolean).join(' '),
        
        // Use email if verified
        email: verifiedEmail || '',
        
        // Extract data from more_details
        primaryRole: moreDetails.role || prev.primaryRole,
        additionalRoles: moreDetails.additionalRoles || [],
        industries: moreDetails.industries || moreDetails.industry ? 
          [moreDetails.industries || moreDetails.industry] : 
          prev.industries,
        
        // Keep track of referral information
        inviteCode: initialOnboardingData.referral_code || inviteCode,
        referredBy: initialOnboardingData.referred_by,
        
        // Pre-fill other fields if available
        currentStruggles: moreDetails.current_struggles || prev.currentStruggles,
        
        // Increment network strength for early users
        networkStrength: 10 // Early users get a higher starting network strength
      }));
      
      // Skip to appropriate step if we have enough data
      if (moreDetails.role && (moreDetails.industries || moreDetails.industry)) {
        setCurrentStep(2); // Skip to expertise step
      }
    }
  }, [initialOnboardingData, inviteCode, verifiedEmail]);

  const motivations = [
    { id: 'give_help', label: 'Give Help', icon: '🤝', description: 'Share my expertise with others' },
    { id: 'get_help', label: 'Get Help', icon: '🙋', description: 'Find answers to my questions' },
    { id: 'build_credibility', label: 'Build Credibility', icon: '⭐', description: 'Establish myself as an expert' },
    { id: 'grow_network', label: 'Grow Network', icon: '🌐', description: 'Connect with like-minded people' }
  ];

  const quests = [
    { id: 'first_answer', label: 'Answer Your First Question', icon: '💬', xp: 100, description: 'Help someone in your first week' },
    { id: 'ask_question', label: 'Ask a Great Question', icon: '❓', xp: 50, description: 'Get expert insights on something important' },
    { id: 'get_endorsed', label: 'Earn Your First Endorsement', icon: '🏆', xp: 150, description: 'Get recognized for your expertise' },
    { id: 'build_profile', label: 'Complete Your Profile', icon: '👤', xp: 75, description: 'Add expertise areas and bio' }
  ];

  const steps = [
    { title: 'Welcome', subtitle: 'Let\'s get you started' },
    { title: 'About You', subtitle: 'Tell us your role and domain' },
    { title: 'Your Expertise', subtitle: 'What can you help others with?' },
    { title: 'Your Interests', subtitle: 'What do you want help with?' },
    { title: 'Network Unlock', subtitle: 'Expand your reach' },
    { title: 'Trust & Network', subtitle: 'Building connections' },
    { title: 'Your Goals', subtitle: 'What brings you here?' },
    { title: 'Your Quest', subtitle: 'Choose your first mission' },
    { title: 'Profile Preview', subtitle: 'Ready to launch!' }
  ];

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const handleRoleChange = (role: string, detectedIndustries: string[]) => {
    updateData({ 
      primaryRole: role,
      industries: [...new Set([...data.industries, ...detectedIndustries])]
    });
  };

  const handleAddAdditionalRole = () => {
    if (newAdditionalRole.trim() && !data.additionalRoles.includes(newAdditionalRole.trim())) {
      updateData({
        additionalRoles: [...data.additionalRoles, newAdditionalRole.trim()]
      });
      setNewAdditionalRole('');
    }
  };

  const handleRemoveAdditionalRole = (role: string) => {
    updateData({
      additionalRoles: data.additionalRoles.filter(r => r !== role)
    });
  };

  const toggleMotivation = (motivation: string) => {
    const motivations = data.motivation.includes(motivation)
      ? data.motivation.filter(m => m !== motivation)
      : [...data.motivation, motivation];
    updateData({ motivation: motivations });
  };

  const handleNetworkStrengthIncrease = () => {
    updateData({ networkStrength: data.networkStrength + 2 });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      // Stop any playing audio when moving to next step
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
        setIsPlayingAudio(false);
        setCurrentPlayingText(null);
      }
    } else {
      onComplete(data);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Stop any playing audio when moving to previous step
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
        setIsPlayingAudio(false);
        setCurrentPlayingText(null);
      }
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return data.fullName && data.primaryRole && data.industries.length > 0;
      case 2: return data.expertiseAreas.length > 0;
      case 3: return data.helpTopics.length > 0;
      case 4: return true; // Network unlock step is optional
      case 5: return true; // Trust step is optional
      case 6: return data.motivation.length > 0;
      case 7: return data.selectedQuest;
      default: return true;
    }
  };

  // Handle text-to-speech playback
  const handlePlayText = async (text: string) => {
    // If the same text is already playing, toggle pause/play
    if (currentAudio && currentPlayingText === text) {
      if (isPlayingAudio) {
        currentAudio.pause();
        setIsPlayingAudio(false);
      } else {
        currentAudio.play();
        setIsPlayingAudio(true);
      }
      return;
    }
    
    // If different audio is playing, stop it
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
    
    try {
      setIsPlayingAudio(true);
      setCurrentPlayingText(text);
      
      const result = await elevenLabsService.textToSpeech(text);
      
      if (!result.success || !result.audioUrl) {
        console.error('Failed to get audio:', result.error);
        setIsPlayingAudio(false);
        setCurrentPlayingText(null);
        return;
      }
      
      const audio = new Audio(result.audioUrl);
      
      audio.onended = () => {
        setIsPlayingAudio(false);
        setCurrentAudio(null);
        setCurrentPlayingText(null);
      };
      
      audio.onerror = () => {
        console.error('Audio playback error');
        setIsPlayingAudio(false);
        setCurrentAudio(null);
        setCurrentPlayingText(null);
      };
      
      setCurrentAudio(audio);
      audio.play();
    } catch (error) {
      console.error('Error playing text:', error);
      setIsPlayingAudio(false);
      setCurrentPlayingText(null);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Network className="h-10 w-10 text-white" />
            </div>
            <div>
              <div className="flex items-center justify-center space-x-2">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {initialOnboardingData 
                    ? `Welcome back to N-th\`ora, ${initialOnboardingData.first_name || 'Founder'}!` 
                    : "Welcome to N-th`ora!"}
                </h2>
                <button 
                  onClick={() => handlePlayText(initialOnboardingData 
                    ? `Welcome back to N-th\`ora, ${initialOnboardingData.first_name || 'Founder'}!` 
                    : "Welcome to N-th`ora!")}
                  className="p-2 text-purple-600 hover:text-purple-800 transition-colors"
                  aria-label="Listen to welcome message"
                >
                  {isPlayingAudio && currentPlayingText === (initialOnboardingData 
                    ? `Welcome back to N-th\`ora, ${initialOnboardingData.first_name || 'Founder'}!` 
                    : "Welcome to N-th`ora!") ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <p className="text-lg text-gray-600 leading-relaxed">
                  {initialOnboardingData
                    ? "We're excited to have you back! Let's complete your profile to get the most out of your network."
                    : "You're about to join an exclusive network where expertise flows freely and trust is built through meaningful connections."}
                </p>
                <button 
                  onClick={() => handlePlayText(initialOnboardingData
                    ? "We're excited to have you back! Let's complete your profile to get the most out of your network."
                    : "You're about to join an exclusive network where expertise flows freely and trust is built through meaningful connections.")}
                  className="p-2 text-purple-600 hover:text-purple-800 transition-colors"
                  aria-label="Listen to welcome description"
                >
                  {isPlayingAudio && currentPlayingText === (initialOnboardingData
                    ? "We're excited to have you back! Let's complete your profile to get the most out of your network."
                    : "You're about to join an exclusive network where expertise flows freely and trust is built through meaningful connections.") ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="bg-purple-50 rounded-xl p-6">
              <h3 className="font-semibold text-purple-900 mb-2">How N-th`ora Works</h3>
              <div className="space-y-3 text-sm text-purple-700">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>Ask questions and get matched with verified experts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>Share your expertise and build credibility</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>Grow your network through trusted connections</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about yourself</h2>
                <button 
                  onClick={() => handlePlayText("Tell us about yourself")}
                  className="p-2 text-purple-600 hover:text-purple-800 transition-colors"
                  aria-label="Listen to heading"
                >
                  {isPlayingAudio && currentPlayingText === "Tell us about yourself" ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <p className="text-gray-600">This helps us personalize your experience and suggest relevant connections.</p>
                <button 
                  onClick={() => handlePlayText("This helps us personalize your experience and suggest relevant connections.")}
                  className="p-2 text-purple-600 hover:text-purple-800 transition-colors"
                  aria-label="Listen to description"
                >
                  {isPlayingAudio && currentPlayingText === "This helps us personalize your experience and suggest relevant connections." ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Full Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={data.fullName}
                onChange={(e) => updateData({ fullName: e.target.value })}
                placeholder="Your full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <AIRoleInput
              value={data.primaryRole}
              onChange={handleRoleChange}
            />

            {/* Additional Roles Section */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Additional Roles</h3>
              <p className="text-sm text-gray-600 mb-4">
                Have you held multiple roles? Add them here to showcase your diverse experience.
              </p>
              
              {data.additionalRoles.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {data.additionalRoles.map((role) => (
                      <span
                        key={role}
                        className="bg-blue-100 text-blue-700 px-3 py-2 rounded-full text-sm flex items-center space-x-2"
                      >
                        <span>{role}</span>
                        <button
                          onClick={() => handleRemoveAdditionalRole(role)}
                          className="text-blue-500 hover:text-blue-700 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newAdditionalRole}
                  onChange={(e) => setNewAdditionalRole(e.target.value)}
                  placeholder="e.g., Product Manager, Software Engineer"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddAdditionalRole()}
                />
                <button
                  onClick={handleAddAdditionalRole}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                >
                  Add Role
                </button>
              </div>
            </div>

            <AIIndustryInput
              value={data.industries}
              onChange={(industries) => updateData({ industries })}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Share your expertise</h2>
                <button 
                  onClick={() => handlePlayText("Share your expertise")}
                  className="p-2 text-purple-600 hover:text-purple-800 transition-colors"
                  aria-label="Listen to heading"
                >
                  {isPlayingAudio && currentPlayingText === "Share your expertise" ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <p className="text-gray-600">Our AI will help extract specific expertise areas from your description.</p>
                <button 
                  onClick={() => handlePlayText("Our AI will help extract specific expertise areas from your description.")}
                  className="p-2 text-purple-600 hover:text-purple-800 transition-colors"
                  aria-label="Listen to description"
                >
                  {isPlayingAudio && currentPlayingText === "Our AI will help extract specific expertise areas from your description." ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <AIExpertiseInput
              value={data.expertiseAreas}
              onChange={(expertiseAreas) => updateData({ expertiseAreas })}
              placeholder="I'm experienced in scaling engineering teams, implementing CI/CD pipelines, and mentoring junior developers. I've worked extensively with React, Node.js, and AWS infrastructure for the past 5 years..."
            />

            <div className="bg-green-50 rounded-xl p-4">
              <h3 className="font-medium text-green-900 mb-2">Where do you want to build credibility?</h3>
              <p className="text-green-700 text-sm mb-3">
                Choose areas where you'd like to be recognized as an expert and earn XP through helpful answers.
              </p>
              <div className="flex flex-wrap gap-2">
                {data.expertiseAreas.map((area) => (
                  <button
                    key={area}
                    className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm hover:bg-green-300 transition-colors duration-300"
                  >
                    🎯 {area}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">What do you need help with?</h2>
                <button 
                  onClick={() => handlePlayText("What do you need help with?")}
                  className="p-2 text-purple-600 hover:text-purple-800 transition-colors"
                  aria-label="Listen to heading"
                >
                  {isPlayingAudio && currentPlayingText === "What do you need help with?" ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <p className="text-gray-600">Our AI will categorize your needs and help match you with the right experts.</p>
                <button 
                  onClick={() => handlePlayText("Our AI will categorize your needs and help match you with the right experts.")}
                  className="p-2 text-purple-600 hover:text-purple-800 transition-colors"
                  aria-label="Listen to description"
                >
                  {isPlayingAudio && currentPlayingText === "Our AI will categorize your needs and help match you with the right experts." ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <AIHelpTopicsInput
              value={data.helpTopics}
              onChange={(helpTopics) => updateData({ helpTopics })}
              placeholder="I'm looking for advice on fundraising for our Series A, specifically around valuation and finding the right investors. I also need help with scaling our engineering team and implementing better development processes..."
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">What are you currently exploring or struggling with? (Optional)</label>
              <textarea
                value={data.currentStruggles}
                onChange={(e) => updateData({ currentStruggles: e.target.value })}
                placeholder="e.g., Scaling our engineering team, choosing the right pricing model, navigating Series A..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">This helps us show you a sample of how our AI matching works</p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Unlock Specialized Categories</h2>
                <button 
                  onClick={() => handlePlayText("Unlock Specialized Categories")}
                  className="p-2 text-purple-600 hover:text-purple-800 transition-colors"
                  aria-label="Listen to heading"
                >
                  {isPlayingAudio && currentPlayingText === "Unlock Specialized Categories" ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <p className="text-gray-600">Expand your network to access experts in specialized fields.</p>
                <button 
                  onClick={() => handlePlayText("Expand your network to access experts in specialized fields.")}
                  className="p-2 text-purple-600 hover:text-purple-800 transition-colors"
                  aria-label="Listen to description"
                >
                  {isPlayingAudio && currentPlayingText === "Expand your network to access experts in specialized fields." ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <CategoryUnlockFlow
              userNetworkStrength={data.networkStrength}
              selectedCategories={[...data.industries, ...data.helpTopics]}
              onInviteSent={handleNetworkStrengthIncrease}
              onCategoryUnlocked={(category) => {
                console.log(`Category unlocked: ${category}`);
              }}
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Trust & Network</h2>
                <button 
                  onClick={() => handlePlayText("Trust & Network")}
                  className="p-2 text-purple-600 hover:text-purple-800 transition-colors"
                  aria-label="Listen to heading"
                >
                  {isPlayingAudio && currentPlayingText === "Trust & Network" ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <p className="text-gray-600">Building meaningful connections starts with trust.</p>
                <button 
                  onClick={() => handlePlayText("Building meaningful connections starts with trust.")}
                  className="p-2 text-purple-600 hover:text-purple-800 transition-colors"
                  aria-label="Listen to description"
                >
                  {isPlayingAudio && currentPlayingText === "Building meaningful connections starts with trust." ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {(inviterName || data.inviterName) && (
              <div className="bg-purple-50 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-900">You were invited by {inviterName || data.inviterName}</h3>
                    <p className="text-purple-700 text-sm">They vouched for you to join our community</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.endorseInviter || false}
                        onChange={(e) => updateData({ endorseInviter: e.target.checked })}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-purple-900">I'd like to endorse {inviterName || data.inviterName} for their expertise</span>
                    </label>
                  </div>

                  {data.endorseInviter && (
                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-2">
                        What is {inviterName || data.inviterName} good at?
                      </label>
                      <input
                        type="text"
                        value={data.inviterExpertise || ''}
                        onChange={(e) => updateData({ inviterExpertise: e.target.value })}
                        placeholder="e.g., Product Strategy, Team Building"
                        className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Trust Loop</span>
              </div>
              <p className="text-blue-700 text-sm">
                Endorsements create a reciprocal trust network. When you endorse others, they're more likely to help you and endorse you back.
              </p>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">What brings you here?</h2>
                <button 
                  onClick={() => handlePlayText("What brings you here?")}
                  className="p-2 text-purple-600 hover:text-purple-800 transition-colors"
                  aria-label="Listen to heading"
                >
                  {isPlayingAudio && currentPlayingText === "What brings you here?" ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <p className="text-gray-600">This helps us personalize your dashboard and notifications.</p>
                <button 
                  onClick={() => handlePlayText("This helps us personalize your dashboard and notifications.")}
                  className="p-2 text-purple-600 hover:text-purple-800 transition-colors"
                  aria-label="Listen to description"
                >
                  {isPlayingAudio && currentPlayingText === "This helps us personalize your dashboard and notifications." ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {motivations.map((motivation) => (
                <button
                  key={motivation.id}
                  onClick={() => toggleMotivation(motivation.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                    data.motivation.includes(motivation.id)
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{motivation.icon}</span>
                    <div>
                      <div className="font-medium">{motivation.label}</div>
                      <div className="text-sm text-gray-500">{motivation.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How much time per week would you like to contribute?
              </label>
              <div className="space-y-3">
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="15"
                  value={data.timeCommitment}
                  onChange={(e) => updateData({ timeCommitment: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>0 min</span>
                  <span className="font-medium text-purple-600">{data.timeCommitment} minutes/week</span>
                  <span>2+ hours</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose your first quest</h2>
                <button 
                  onClick={() => handlePlayText("Choose your first quest")}
                  className="p-2 text-purple-600 hover:text-purple-800 transition-colors"
                  aria-label="Listen to heading"
                >
                  {isPlayingAudio && currentPlayingText === "Choose your first quest" ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <p className="text-gray-600">Pick a goal to accomplish in your first week and start earning XP!</p>
                <button 
                  onClick={() => handlePlayText("Pick a goal to accomplish in your first week and start earning XP!")}
                  className="p-2 text-purple-600 hover:text-purple-800 transition-colors"
                  aria-label="Listen to description"
                >
                  {isPlayingAudio && currentPlayingText === "Pick a goal to accomplish in your first week and start earning XP!" ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {quests.map((quest) => (
                <button
                  key={quest.id}
                  onClick={() => updateData({ selectedQuest: quest.id })}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                    data.selectedQuest === quest.id
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{quest.icon}</span>
                      <div>
                        <div className="font-medium">{quest.label}</div>
                        <div className="text-sm text-gray-500">{quest.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span className="font-bold text-yellow-600">{quest.xp} XP</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-yellow-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">XP System</span>
              </div>
              <p className="text-yellow-700 text-sm">
                Earn XP by helping others, asking great questions, and building your reputation. Higher XP gives you priority in expert matching!
              </p>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h2>
                <button 
                  onClick={() => handlePlayText("You're all set!")}
                  className="p-2 text-purple-600 hover:text-purple-800 transition-colors"
                  aria-label="Listen to heading"
                >
                  {isPlayingAudio && currentPlayingText === "You're all set!" ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <p className="text-gray-600">Here's how your profile will appear to others in the network.</p>
                <button 
                  onClick={() => handlePlayText("Here's how your profile will appear to others in the network.")}
                  className="p-2 text-purple-600 hover:text-purple-800 transition-colors"
                  aria-label="Listen to description"
                >
                  {isPlayingAudio && currentPlayingText === "Here's how your profile will appear to others in the network." ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white border-2 border-purple-200 rounded-xl p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">👤</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {initialOnboardingData?.first_name 
                      ? `${initialOnboardingData.first_name} ${initialOnboardingData.last_name || ''}`
                      : data.fullName || 'Your Name'}
                  </h3>
                  <p className="text-gray-600">{data.primaryRole}</p>
                  {data.additionalRoles.length > 0 && (
                    <p className="text-sm text-gray-500">
                      Also: {data.additionalRoles.join(', ')}
                    </p>
                  )}
                  <div className="flex items-center space-x-2 mt-1">
                    {data.industries.slice(0, 2).map((industry) => (
                      <span key={industry} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        {industry}
                      </span>
                    ))}
                    {data.industries.length > 2 && (
                      <span className="text-gray-500 text-xs">+{data.industries.length - 2} more</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Can help with:</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.expertiseAreas.slice(0, 3).map((area) => (
                      <span key={area} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                        {area}
                      </span>
                    ))}
                    {data.expertiseAreas.length > 3 && (
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                        +{data.expertiseAreas.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Looking for help with:</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.helpTopics.slice(0, 3).map((topic) => (
                      <span key={topic} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                        {topic}
                      </span>
                    ))}
                    {data.helpTopics.length > 3 && (
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                        +{data.helpTopics.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{data.timeCommitment} min/week</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-gray-600">Network: {data.networkStrength}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">Starting XP: 0</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white text-center">
              <Zap className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Ready to amplify your network?</h3>
              <p className="text-purple-100 text-sm">
                Your first quest: {quests.find(q => q.id === data.selectedQuest)?.label}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">{Math.round(((currentStep + 1) / steps.length) * 100)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{steps[currentStep].title}</h1>
              <p className="text-sm text-gray-600">{steps[currentStep].subtitle}</p>
            </div>
            <button 
              onClick={() => handlePlayText(`${steps[currentStep].title}. ${steps[currentStep].subtitle}`)}
              className="p-2 text-purple-600 hover:text-purple-800 transition-colors"
              aria-label="Listen to step information"
            >
              {isPlayingAudio && currentPlayingText === `${steps[currentStep].title}. ${steps[currentStep].subtitle}` ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <span>{currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;