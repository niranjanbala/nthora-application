import React, { useState, useEffect, useRef } from 'react';
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
  timestamp?: number; // For tracking timing
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
  const [audioStep, setAudioStep] = useState(0); // Track progressive audio steps
  const [isProgressiveAudio, setIsProgressiveAudio] = useState(false);
  const [waitingForInput, setWaitingForInput] = useState(false); // Track if waiting for user input
  const [previousData, setPreviousData] = useState<OnboardingData | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
      // Clear any pending progress timer
      if (progressTimerRef.current) {
        clearTimeout(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };
  }, [currentAudio]);

  // Auto-play audio when entering step 2 (currentStep = 1) or step 3 (currentStep = 2)
  useEffect(() => {
    if (currentStep === 1) {
      // Small delay to ensure UI is rendered
      const timer = setTimeout(() => {
        // Set a baseline of the current data before starting
        setPreviousData({ 
          ...data,
          fullName: '', // Reset to ensure we can detect any input
          primaryRole: '',
          additionalRoles: [],
          industries: []
        });
        startProgressiveAudio();
      }, 500);
      return () => clearTimeout(timer);
    } else if (currentStep === 2) {
      // Step 3 - Expertise step
      const timer = setTimeout(() => {
        setPreviousData({ 
          ...data,
          expertiseAreas: [] // Reset to ensure we can detect any input
        });
        startProgressiveAudioStep3();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Debug state changes
  useEffect(() => {
    console.log('🔄 State changed:', { isProgressiveAudio, waitingForInput, audioStep });
  }, [isProgressiveAudio, waitingForInput, audioStep]);

  // Debounced monitor for data changes to continue progressive audio
  useEffect(() => {
    console.log('📊 Data monitor effect triggered:', {
      isProgressiveAudio,
      waitingForInput,
      audioStep,
      fullName: data.fullName,
      hasData: !!data,
      hasPreviousData: !!previousData
    });
    
    if (!isProgressiveAudio || !waitingForInput || !previousData) {
      console.log('❌ Early return:', { isProgressiveAudio, waitingForInput, hasPreviousData: !!previousData });
      return;
    }

    let shouldContinue = false;

    // Check if relevant field has been filled based on current onboarding step and audio step
    if (currentStep === 1) {
      // Step 2 progressive audio logic
      switch (audioStep) {
        case 1: // Full Name
          const hasContent = data.fullName.trim() !== '';
          const isDifferent = data.fullName.trim() !== previousData.fullName.trim();
          shouldContinue = hasContent && isDifferent;
          console.log('🔤 Checking fullName:', { 
            current: `"${data.fullName}"`, 
            previous: `"${previousData.fullName}"`, 
            hasContent,
            isDifferent,
            shouldContinue 
          });
          break;
        case 2: // Role
          shouldContinue = data.primaryRole.trim() !== '' && data.primaryRole !== previousData.primaryRole;
          console.log('💼 Checking role:', { current: data.primaryRole, previous: previousData.primaryRole, shouldContinue });
          break;
        case 3: // Additional roles - continue after any interaction or timeout (not mandatory)
          // Continue if user added a role or after 5 seconds timeout
          const timeSinceWaiting = Date.now() - (previousData.timestamp || 0);
          shouldContinue = data.additionalRoles.length !== previousData.additionalRoles.length || timeSinceWaiting > 5000;
          console.log('➕ Checking additional roles:', { currentLength: data.additionalRoles.length, previousLength: previousData.additionalRoles.length, timeSinceWaiting, shouldContinue });
          break;
        case 4: // Industry
          shouldContinue = data.industries.length > 0 && data.industries.length !== previousData.industries.length;
          console.log('🏢 Checking industries:', { currentLength: data.industries.length, previousLength: previousData.industries.length, shouldContinue });
          break;
      }
    } else if (currentStep === 2) {
      // Step 3 progressive audio logic
      switch (audioStep) {
        case 1: // Expertise Areas
          shouldContinue = data.expertiseAreas.length > 0 && data.expertiseAreas.length !== previousData.expertiseAreas.length;
          console.log('🎯 Checking expertiseAreas:', { currentLength: data.expertiseAreas.length, previousLength: previousData.expertiseAreas.length, shouldContinue });
          break;
      }
    }

    if (shouldContinue) {
      console.log('✅ Continuing to next step after 2 seconds');
      setWaitingForInput(false);
      setPreviousData({ ...data });
      
      // Clear any existing timer
      if (progressTimerRef.current) {
        clearTimeout(progressTimerRef.current);
      }
      
      // Debounce: Wait 2 seconds before continuing to next step
      progressTimerRef.current = setTimeout(() => {
        console.log('⏰ Timer triggered, continuing to next audio step:', audioStep + 1);
        const maxSteps = currentStep === 1 ? 4 : currentStep === 2 ? 1 : 0; // Step 2 has 5 steps (0-4), Step 3 has 2 steps (0-1)
        if (audioStep < maxSteps) {
          setAudioStep(audioStep + 1);
          playProgressiveAudio(audioStep + 1);
        } else {
          console.log('✅ Progressive audio completed for step', currentStep + 1);
          setIsProgressiveAudio(false);
        }
        progressTimerRef.current = null;
      }, 2000);
      
      return;
    }

    // No cleanup needed since we're managing the timer manually
  }, [data.fullName, data.primaryRole, data.additionalRoles.length, data.industries.length, data.expertiseAreas.length, isProgressiveAudio, waitingForInput, audioStep, previousData]);

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

  const stopCurrentAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setIsPlayingAudio(false);
      setCurrentPlayingText(null);
      setIsProgressiveAudio(false);
      setWaitingForInput(false);
    }
    
    // Clear any pending progress timer
    if (progressTimerRef.current) {
      clearTimeout(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      stopCurrentAudio();
      setCurrentStep(currentStep + 1);
      setAudioStep(0);
      setIsProgressiveAudio(false);
      setWaitingForInput(false);
      setPreviousData(null);
    } else {
      onComplete(data);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      stopCurrentAudio();
      setCurrentStep(currentStep - 1);
      setAudioStep(0);
      setIsProgressiveAudio(false);
      setWaitingForInput(false);
      setPreviousData(null);
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

  // Focus input field by id
  const focusInput = (inputId: string) => {
    console.log('🎯 Attempting to focus input:', inputId);
    
    // Try multiple times with increasing delays to ensure element is rendered
    const attemptFocus = (attempt: number) => {
      const timeout = attempt * 200; // 200ms, 400ms, 600ms, 800ms
      
      setTimeout(() => {
        console.log(`🔄 Focus attempt ${attempt + 1} for:`, inputId);
        
        // Try getElementById first
        let input = document.getElementById(inputId);
        
        // If not found, try different selectors
        if (!input) {
          console.log('❌ getElementById failed, trying alternatives...');
          input = document.querySelector(`#${inputId}`) as HTMLElement;
          
          if (!input) {
            input = document.querySelector(`textarea#${inputId}`) as HTMLElement;
          }
          
          if (!input) {
            input = document.querySelector(`input#${inputId}`) as HTMLElement;
          }
          
          if (!input) {
            // Try finding any focusable element in the expertise input area
            input = document.querySelector('textarea[placeholder*="expertise"]') as HTMLElement;
          }
        }
        
        console.log(`🔍 Attempt ${attempt + 1} - Element found:`, input ? 'Yes' : 'No', input);
        
        if (input) {
          try {
            // Ensure element is visible and not disabled
            const isVisible = input.offsetParent !== null;
            const isDisabled = input.hasAttribute('disabled');
            
            console.log('📊 Element state:', { visible: isVisible, disabled: isDisabled });
            
            if (isVisible && !isDisabled) {
              input.focus();
              input.scrollIntoView({ behavior: 'smooth', block: 'center' });
              
              // Verify focus was successful
              const isFocused = document.activeElement === input;
              console.log(`✅ Focus attempt ${attempt + 1} result:`, isFocused ? 'SUCCESS' : 'FAILED');
              
              if (isFocused) {
                return; // Success, stop trying
              }
            }
          } catch (error) {
            console.error(`❌ Error in focus attempt ${attempt + 1}:`, error);
          }
        }
        
        // If this wasn't the last attempt, don't try again
        if (attempt < 3) {
          console.log(`🔄 Will retry focus in ${(attempt + 1) * 200}ms...`);
        } else {
          console.error('💥 All focus attempts failed for:', inputId);
        }
      }, timeout);
    };
    
    // Try 4 times with increasing delays
    for (let i = 0; i < 4; i++) {
      attemptFocus(i);
    }
  };

  // Get progressive audio content for step 2
  const getProgressiveAudioContent = (step: number) => {
    if (currentStep === 1) {
      // Step 2 content
      switch (step) {
        case 0:
          return "Tell us about yourself. This helps us personalize your experience and suggest relevant connections.";
        case 1:
          return "Please input First Name.";
        case 2:
          return "Now, please describe your current role. What do you do professionally?";
        case 3:
          return "You can also add any additional roles you've held to showcase your diverse experience.";
        case 4:
          return "Finally, please describe your industry or field of work.";
        default:
          return "";
      }
    } else if (currentStep === 2) {
      // Step 3 content - Expertise
      switch (step) {
        case 0:
          return "Now let's talk about your expertise. This helps us understand what you can help others with and builds your credibility on the platform.";
        case 1:
          return "Please describe your expertise areas. Be specific about your skills, experience, and knowledge areas.";
        default:
          return "";
      }
    }
    return "";
  };

  // Start progressive audio playback for step 2
  const startProgressiveAudio = async () => {
    console.log('Starting progressive audio for step:', currentStep);
    if (currentStep !== 1) return;
    
    setIsProgressiveAudio(true);
    setAudioStep(0);
    console.log('Playing audio step 0');
    await playProgressiveAudio(0);
  };

  // Start progressive audio playback for step 3
  const startProgressiveAudioStep3 = async () => {
    console.log('Starting progressive audio for step 3:', currentStep);
    if (currentStep !== 2) return;
    
    setIsProgressiveAudio(true);
    setAudioStep(0);
    console.log('Playing audio step 0 for expertise');
    await playProgressiveAudio(0);
  };

  // Play progressive audio with field focusing
  const playProgressiveAudio = async (step: number) => {
    console.log('Playing progressive audio step:', step);
    const content = getProgressiveAudioContent(step);
    console.log('Audio content:', content);
    
    if (!content) {
      console.log('No content for step:', step);
      setIsProgressiveAudio(false);
      return;
    }

    try {
      setCurrentPlayingText(content);
      setIsPlayingAudio(true);
      setWaitingForInput(false);
      
      const result = await elevenLabsService.textToSpeech(content);
      
      if (!result.success || !result.audioUrl) {
        console.error('Failed to get audio:', result.error);
        setIsPlayingAudio(false);
        setCurrentPlayingText(null);
        return;
      }
      
      const audio = new Audio(result.audioUrl);
      let hasEnded = false; // Prevent error handler from interfering after successful completion
      
      audio.onended = () => {
        hasEnded = true;
        console.log('🎵 Audio ended for step:', step);
        setIsPlayingAudio(false);
        
        // Focus appropriate input after audio ends and wait for user input
        if (currentStep === 1) {
          // Step 2 progressive audio focus logic
          if (step === 1) {
            console.log('🎯 Step 1 ended - Focusing fullName input and waiting for input');
            focusInput('fullName');
            setWaitingForInput(true);
            console.log('🔧 State should now be: waitingForInput=true, isProgressiveAudio=true');
          } else if (step === 2) {
            console.log('🎯 Step 2 ended - Focusing roleInput');
            focusInput('roleInput');
            setWaitingForInput(true);
          } else if (step === 3) {
            console.log('🎯 Step 3 ended - Focusing additionalRole input');
            focusInput('additionalRole');
            setWaitingForInput(true);
            // Set timestamp for step 3 timeout
            setPreviousData(prev => prev ? { ...prev, timestamp: Date.now() } : null);
          } else if (step === 4) {
            console.log('🎯 Step 4 ended - Focusing industryInput');
            focusInput('industryInput');
            setWaitingForInput(true);
          }
        } else if (currentStep === 2) {
          // Step 3 progressive audio focus logic
          if (step === 1) {
            console.log('🎯 Expertise step 1 ended - Focusing expertiseInput and waiting for input');
            focusInput('expertiseInput');
            setWaitingForInput(true);
          }
        }
        
        // Handle step 0 (intro) continuation for any step
        if (step === 0) {
          console.log('🎯 Step 0 ended, continuing to step 1 in 1 second');
          setTimeout(() => {
            console.log('⏰ Timeout triggered, continuing to step 1');
            setAudioStep(1);
            playProgressiveAudio(1);
          }, 1000);
        }

        // Clean up audio object after successful completion
        setTimeout(() => {
          if (hasEnded) {
            setCurrentAudio(null);
            setCurrentPlayingText(null);
            console.log('🧹 Audio cleanup completed');
          }
        }, 100);
      };
      
      audio.onerror = () => {
        if (hasEnded) {
          console.log('⚠️ Audio error after successful completion - ignoring');
          return;
        }
        console.error('💥 Audio playback error during playback');
        setIsPlayingAudio(false);
        setCurrentAudio(null);
        setCurrentPlayingText(null);
        setIsProgressiveAudio(false);
        setWaitingForInput(false);
      };
      
      setCurrentAudio(audio);
      await audio.play();
      console.log('Started playing audio for step:', step);
    } catch (error) {
      console.error('Error in progressive audio:', error);
      setIsPlayingAudio(false);
      setCurrentPlayingText(null);
      setIsProgressiveAudio(false);
      setWaitingForInput(false);
    }
  };

  // Handle text-to-speech playback
  const handlePlayText = async (text: string) => {
    // If this is step 2 and we're clicking the audio button, start progressive audio
    if (currentStep === 1 && text === getStepAudioContent()) {
      if (isProgressiveAudio) {
        // Stop progressive audio
        stopCurrentAudio();
        return;
      } else {
        // Start progressive audio
        await startProgressiveAudio();
        return;
      }
    }

    // If this is step 3 and we're clicking the audio button, start progressive audio
    if (currentStep === 2 && text === getStepAudioContent()) {
      if (isProgressiveAudio) {
        // Stop progressive audio
        stopCurrentAudio();
        return;
      } else {
        // Start progressive audio for step 3
        await startProgressiveAudioStep3();
        return;
      }
    }

    // If the same text is already loaded and playing/paused, toggle pause/play
    if (currentAudio && currentPlayingText === text) {
      if (isPlayingAudio) {
        currentAudio.pause();
        setIsPlayingAudio(false);
      } else {
        try {
          await currentAudio.play();
          setIsPlayingAudio(true);
        } catch (error) {
          console.error('Error resuming audio:', error);
          setIsPlayingAudio(false);
        }
      }
      return;
    }
    
    // If different audio is playing, stop it
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setIsPlayingAudio(false);
      setCurrentPlayingText(null);
    }
    
    try {
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
      
      audio.onpause = () => {
        setIsPlayingAudio(false);
      };
      
      audio.onplay = () => {
        setIsPlayingAudio(true);
      };
      
      setCurrentAudio(audio);
      
      try {
        await audio.play();
        setIsPlayingAudio(true);
      } catch (error) {
        console.error('Error starting audio playback:', error);
        setIsPlayingAudio(false);
        setCurrentAudio(null);
        setCurrentPlayingText(null);
      }
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                {initialOnboardingData 
                  ? `Welcome back to N-th\`ora, ${initialOnboardingData.first_name || 'Founder'}!` 
                  : "Welcome to N-th`ora!"}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed text-center">
                {initialOnboardingData
                  ? "We're excited to have you back! Let's complete your profile to get the most out of your network."
                  : "You're about to join an exclusive network where expertise flows freely and trust is built through meaningful connections."}
              </p>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about yourself</h2>
              <p className="text-gray-600">This helps us personalize your experience and suggest relevant connections.</p>
            </div>

            {/* Full Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                id="fullName"
                type="text"
                value={data.fullName}
                onChange={(e) => updateData({ fullName: e.target.value })}
                placeholder="Your full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <AIRoleInput
              id="roleInput"
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
                  id="additionalRole"
                  type="text"
                  value={newAdditionalRole}
                  onChange={(e) => setNewAdditionalRole(e.target.value)}
                  placeholder="e.g., Product Manager, Software Engineer"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAdditionalRole()}
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
              id="industryInput"
              value={data.industries}
              onChange={(industries) => updateData({ industries })}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Share your expertise</h2>
              <p className="text-gray-600">Our AI will help extract specific expertise areas from your description.</p>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What do you need help with?</h2>
              <p className="text-gray-600">Our AI will categorize your needs and help match you with the right experts.</p>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Unlock Specialized Categories</h2>
              <p className="text-gray-600">Expand your network to access experts in specialized fields.</p>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Trust & Network</h2>
              <p className="text-gray-600">Building meaningful connections starts with trust.</p>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What brings you here?</h2>
              <p className="text-gray-600">This helps us personalize your dashboard and notifications.</p>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose your first quest</h2>
              <p className="text-gray-600">Pick a goal to accomplish in your first week and start earning XP!</p>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h2>
              <p className="text-gray-600">Here's how your profile will appear to others in the network.</p>
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

  // Function to get audio content for current step
  const getStepAudioContent = () => {
    switch (currentStep) {
      case 0:
        return initialOnboardingData 
          ? `Welcome back to N-th\`ora, ${initialOnboardingData.first_name || 'Founder'}! We're excited to have you back! Let's complete your profile to get the most out of your network.`
          : "Welcome to N-th`ora! You're about to join an exclusive network where expertise flows freely and trust is built through meaningful connections.";
      case 1:
        return "Tell us about yourself. This helps us personalize your experience and suggest relevant connections.";
      case 2:
        return "Share your expertise. Our AI will help extract specific expertise areas from your description.";
      case 3:
        return "What do you need help with? Our AI will categorize your needs and help match you with the right experts.";
      case 4:
        return "Unlock Specialized Categories. Expand your network to access experts in specialized fields.";
      case 5:
        return "Trust & Network. Building meaningful connections starts with trust.";
      case 6:
        return "What brings you here? This helps us personalize your dashboard and notifications.";
      case 7:
        return "Choose your first quest. Pick a goal to accomplish in your first week and start earning XP!";
      case 8:
        return "You're all set! Here's how your profile will appear to others in the network.";
      default:
        return "";
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
              {isProgressiveAudio && (
                <div className="mt-1 flex items-center space-x-2 text-xs text-purple-600">
                  <div className="flex items-center space-x-1">
                    <span className="inline-block h-2 w-2 bg-purple-500 rounded-full animate-pulse"></span>
                    <span className="inline-block h-1.5 w-1.5 bg-purple-400 rounded-full animate-pulse delay-75"></span>
                    <span className="inline-block h-1 w-1 bg-purple-300 rounded-full animate-pulse delay-150"></span>
                  </div>
                  <span>
                    {currentStep === 1 ? (
                      `Audio guide active - Step ${audioStep} of 5`
                    ) : currentStep === 2 ? (
                      audioStep === 0 ? 'Audio guide active - Introduction' : 'Audio guide active - Step 1 of 1'
                    ) : (
                      'Audio guide active'
                    )}
                    {waitingForInput && (
                      <span className="ml-2 text-blue-600 font-medium">
                        {audioStep === 3 ? '(Optional - will continue in 5s)' : '(Waiting for input...)'}
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6 relative">
          {/* Single Audio Button - Top Right Corner */}
          <button 
            onClick={() => handlePlayText(getStepAudioContent())}
            className="absolute top-4 right-4 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-colors duration-300"
            aria-label="Listen to step content"
          >
            {(isPlayingAudio && (currentPlayingText === getStepAudioContent() || isProgressiveAudio)) ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
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