import { supabase } from '../lib/supabase';

export interface OnboardingData {
  role: string;
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
}

export interface OnboardingResponse {
  success: boolean;
  userId?: string;
  error?: string;
}

// Complete onboarding process
export async function completeOnboarding(data: OnboardingData): Promise<OnboardingResponse> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Update user profile with onboarding data
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.user.id,
        role: data.role,
        expertise_areas: data.expertiseAreas,
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    // Create expertise entries with AI-enhanced confidence scores
    for (const expertise of data.expertiseAreas) {
      // Calculate initial confidence based on how specific the expertise is
      const confidence = calculateExpertiseConfidence(expertise, data.role);
      
      await supabase
        .from('user_expertise')
        .upsert({
          user_id: user.user.id,
          expertise_tag: expertise,
          confidence_score: confidence,
          is_available: true,
          max_questions_per_week: Math.floor(data.timeCommitment / 15) // Rough estimate
        });
    }

    // Create endorsement if requested
    if (data.endorseInviter && data.inviterExpertise && data.inviteCode) {
      // Find inviter by invite code
      const { data: inviteData } = await supabase
        .from('invite_codes')
        .select('created_by')
        .eq('code', data.inviteCode)
        .single();

      if (inviteData?.created_by) {
        await supabase
          .from('expertise_endorsements')
          .insert({
            endorser_id: user.user.id,
            endorsed_user_id: inviteData.created_by,
            expertise_tag: data.inviterExpertise,
            endorsement_reason: 'Endorsed during onboarding',
            strength: 4
          });
      }
    }

    // Store help topics and current struggles for future matching
    // This could be stored in a separate table for user preferences
    
    return { success: true, userId: user.user.id };
  } catch (error) {
    return { success: false, error: 'Failed to complete onboarding' };
  }
}

// Calculate initial confidence score based on expertise specificity and role
function calculateExpertiseConfidence(expertise: string, role: string): number {
  let confidence = 0.5; // Base confidence
  
  // More specific expertise gets higher confidence
  const words = expertise.split(' ');
  if (words.length >= 3) confidence += 0.1; // Multi-word expertise is more specific
  if (words.length >= 4) confidence += 0.1;
  
  // Role-expertise alignment
  const roleExpertiseMap: Record<string, string[]> = {
    'founder': ['strategy', 'fundraising', 'leadership', 'product'],
    'engineer': ['development', 'architecture', 'technical', 'programming'],
    'product': ['product', 'management', 'strategy', 'user'],
    'designer': ['design', 'ui', 'ux', 'visual'],
    'marketer': ['marketing', 'growth', 'content', 'analytics']
  };
  
  const roleKeywords = roleExpertiseMap[role] || [];
  const expertiseLower = expertise.toLowerCase();
  
  if (roleKeywords.some(keyword => expertiseLower.includes(keyword))) {
    confidence += 0.15; // Boost for role alignment
  }
  
  // Technical specificity bonus
  if (expertiseLower.includes('optimization') || 
      expertiseLower.includes('implementation') || 
      expertiseLower.includes('architecture')) {
    confidence += 0.1;
  }
  
  return Math.min(confidence, 0.9); // Cap at 0.9
}

// Get suggested expertise based on role and industry
export async function getSuggestedExpertise(role: string, industries: string[]): Promise<string[]> {
  // Enhanced suggestions with AI-like specificity
  const suggestions: Record<string, string[]> = {
    founder: [
      'Product Strategy & Roadmapping',
      'Fundraising & Investor Relations', 
      'Team Building & Leadership',
      'Go-to-Market Strategy',
      'Product-Market Fit Validation',
      'Strategic Partnerships'
    ],
    product: [
      'Product Management & Strategy',
      'User Research & Validation',
      'Roadmap Planning & Prioritization',
      'Feature Specification & PRDs',
      'A/B Testing & Experimentation',
      'Cross-functional Team Leadership'
    ],
    engineer: [
      'Software Architecture & Design',
      'Code Review & Best Practices',
      'Technical Leadership & Mentoring',
      'System Design & Scalability',
      'DevOps & Infrastructure',
      'Performance Optimization'
    ],
    designer: [
      'UI/UX Design & Research',
      'Design Systems & Components',
      'User Research & Testing',
      'Prototyping & Wireframing',
      'Visual Design & Branding',
      'Design Process & Methodology'
    ],
    marketer: [
      'Growth Marketing & Strategy',
      'Content Strategy & Creation',
      'SEO/SEM & Digital Marketing',
      'Analytics & Performance Tracking',
      'Brand Strategy & Positioning',
      'Customer Acquisition & Retention'
    ],
    sales: [
      'Sales Strategy & Process',
      'Lead Generation & Qualification',
      'Customer Success & Retention',
      'Pipeline Management & Forecasting',
      'Sales Team Training & Development',
      'CRM Implementation & Optimization'
    ]
  };

  const baseSuggestions = suggestions[role] || [];
  
  // Add industry-specific suggestions
  const industrySuggestions: Record<string, string[]> = {
    'SaaS': [
      'Subscription Business Models',
      'Customer Onboarding & Activation',
      'Churn Reduction & Retention',
      'SaaS Metrics & Analytics'
    ],
    'AI/ML': [
      'Machine Learning Implementation',
      'Data Science & Analytics',
      'Model Deployment & MLOps',
      'AI Product Strategy'
    ],
    'Healthcare': [
      'Healthcare Compliance & Regulations',
      'Clinical Trial Management',
      'Medical Device Development',
      'Healthcare Data Privacy'
    ],
    'Fintech': [
      'Financial Regulations & Compliance',
      'Payment Systems & Processing',
      'Risk Management & Assessment',
      'Blockchain & Cryptocurrency'
    ]
  };

  const industrySpecific = industries.flatMap(industry => industrySuggestions[industry] || []);
  
  return [...baseSuggestions, ...industrySpecific].slice(0, 12);
}

// Calculate initial XP potential based on onboarding data
export function calculateXPPotential(data: OnboardingData): number {
  let score = 0;
  
  // Base score from expertise areas (quality over quantity)
  score += Math.min(data.expertiseAreas.length * 12, 60); // Cap expertise bonus
  
  // Bonus for specific, detailed expertise
  const specificExpertise = data.expertiseAreas.filter(area => area.split(' ').length >= 3);
  score += specificExpertise.length * 5;
  
  // Time commitment bonus (more realistic scaling)
  score += Math.floor(data.timeCommitment / 10) * 3;
  
  // Motivation diversity bonus
  score += data.motivation.length * 8;
  
  // Bonus for endorsing inviter (shows engagement)
  if (data.endorseInviter) score += 20;
  
  // Bonus for having help topics (shows they'll ask questions)
  score += Math.min(data.helpTopics.length * 5, 25);
  
  return Math.min(score, 150); // Cap at 150 for initial potential
}

// Generate personalized quest recommendations
export function getPersonalizedQuests(data: OnboardingData): Array<{
  id: string;
  label: string;
  description: string;
  xp: number;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
}> {
  const baseQuests = [
    {
      id: 'first_answer',
      label: 'Answer Your First Question',
      description: 'Help someone in your first week',
      xp: 100,
      difficulty: 'medium' as const,
      estimatedTime: '30-60 min'
    },
    {
      id: 'ask_question',
      label: 'Ask a Great Question',
      description: 'Get expert insights on something important',
      xp: 50,
      difficulty: 'easy' as const,
      estimatedTime: '15-30 min'
    },
    {
      id: 'get_endorsed',
      label: 'Earn Your First Endorsement',
      description: 'Get recognized for your expertise',
      xp: 150,
      difficulty: 'hard' as const,
      estimatedTime: '1-2 weeks'
    },
    {
      id: 'build_profile',
      label: 'Complete Your Profile',
      description: 'Add expertise areas and bio',
      xp: 75,
      difficulty: 'easy' as const,
      estimatedTime: '10-15 min'
    }
  ];

  // Personalize based on motivation
  if (data.motivation.includes('give_help')) {
    baseQuests.unshift({
      id: 'expertise_showcase',
      label: 'Showcase Your Expertise',
      description: 'Answer 3 questions in your expertise area',
      xp: 200,
      difficulty: 'medium' as const,
      estimatedTime: '2-3 hours'
    });
  }

  if (data.motivation.includes('get_help')) {
    baseQuests.push({
      id: 'problem_solver',
      label: 'Get Your Problem Solved',
      description: 'Ask a question and get a helpful answer',
      xp: 125,
      difficulty: 'medium' as const,
      estimatedTime: '1-3 days'
    });
  }

  return baseQuests.slice(0, 4); // Return top 4 personalized quests
}