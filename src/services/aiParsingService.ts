export interface AIParsingResult {
  tags: string[];
  confidence: number;
  suggestions?: string[];
  context?: string;
}

export interface ParsedExpertise extends AIParsingResult {
  primaryAreas: string[];
  secondaryAreas: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface ParsedHelpTopics extends AIParsingResult {
  urgentTopics: string[];
  learningGoals: string[];
  currentChallenges: string[];
}

export interface ParsedRole extends AIParsingResult {
  primaryRole: string;
  roleLevel: 'junior' | 'mid' | 'senior' | 'lead' | 'executive';
  roleType: 'individual_contributor' | 'manager' | 'director' | 'founder' | 'consultant';
  suggestedRoles: string[];
  industries: string[];
}

export interface ParsedIndustry extends AIParsingResult {
  primaryIndustries: string[];
  secondaryIndustries: string[];
  businessModel: string[];
  companyStage: string[];
  suggestedIndustries: string[];
}

// Import the OpenAI services
import { openaiService, secureOpenaiService } from './openaiService';

// Determine which service to use based on environment
const USE_SECURE_API = import.meta.env.PROD || import.meta.env.VITE_USE_SECURE_AI === 'true';

// Main parsing functions that use real AI
export async function parseRoleText(text: string): Promise<ParsedRole> {
  if (text.length < 5) {
    return {
      tags: [],
      primaryRole: '',
      roleLevel: 'mid',
      roleType: 'individual_contributor',
      suggestedRoles: [],
      industries: [],
      confidence: 0
    };
  }
  
  try {
    if (USE_SECURE_API) {
      return await secureOpenaiService.parseRoleSecure(text);
    } else {
      return await openaiService.parseRole(text);
    }
  } catch (error) {
    console.error('Error parsing role:', error);
    // Fallback to mock implementation
    return mockRoleResponse(text);
  }
}

export async function parseIndustryText(text: string): Promise<ParsedIndustry> {
  if (text.length < 5) {
    return {
      tags: [],
      primaryIndustries: [],
      secondaryIndustries: [],
      businessModel: [],
      companyStage: [],
      suggestedIndustries: [],
      confidence: 0
    };
  }
  
  try {
    if (USE_SECURE_API) {
      return await secureOpenaiService.parseIndustrySecure(text);
    } else {
      return await openaiService.parseIndustry(text);
    }
  } catch (error) {
    console.error('Error parsing industry:', error);
    // Fallback to mock implementation
    return mockIndustryResponse(text);
  }
}

export async function parseExpertiseText(text: string): Promise<ParsedExpertise> {
  if (text.length < 10) {
    return {
      tags: [],
      primaryAreas: [],
      secondaryAreas: [],
      confidence: 0,
      skillLevel: 'intermediate'
    };
  }
  
  try {
    if (USE_SECURE_API) {
      return await secureOpenaiService.parseExpertiseSecure(text);
    } else {
      const result = await openaiService.parseExpertise(text);
      return {
        ...result,
        tags: [...result.primaryAreas, ...result.secondaryAreas]
      };
    }
  } catch (error) {
    console.error('Error parsing expertise:', error);
    // Fallback to mock implementation
    return mockExpertiseResponse(text);
  }
}

export async function parseHelpTopicsText(text: string): Promise<ParsedHelpTopics> {
  if (text.length < 10) {
    return {
      tags: [],
      urgentTopics: [],
      learningGoals: [],
      currentChallenges: [],
      confidence: 0
    };
  }
  
  try {
    if (USE_SECURE_API) {
      return await secureOpenaiService.parseHelpTopicsSecure(text);
    } else {
      const result = await openaiService.parseHelpTopics(text);
      return {
        ...result,
        tags: [...result.urgentTopics, ...result.learningGoals, ...result.currentChallenges]
      };
    }
  } catch (error) {
    console.error('Error parsing help topics:', error);
    // Fallback to mock implementation
    return mockHelpTopicsResponse(text);
  }
}

export async function parseStrugglesText(text: string): Promise<AIParsingResult> {
  if (text.length < 10) {
    return {
      tags: [],
      confidence: 0
    };
  }
  
  try {
    // For now, use mock implementation for struggles parsing
    return mockStrugglesResponse(text);
  } catch (error) {
    console.error('Error parsing struggles:', error);
    return mockStrugglesResponse(text);
  }
}

// Mock implementations as fallbacks (keeping existing logic)
function mockRoleResponse(text: string): ParsedRole {
  const lowerText = text.toLowerCase();
  const tags: string[] = [];
  let primaryRole = '';
  let roleLevel: 'junior' | 'mid' | 'senior' | 'lead' | 'executive' = 'mid';
  let roleType: 'individual_contributor' | 'manager' | 'director' | 'founder' | 'consultant' = 'individual_contributor';
  const suggestedRoles: string[] = [];
  const industries: string[] = [];

  // Detect primary role
  if (lowerText.includes('founder') || lowerText.includes('co-founder') || lowerText.includes('ceo')) {
    primaryRole = 'Founder/CEO';
    roleType = 'founder';
    roleLevel = 'executive';
    tags.push('Founder/CEO');
    suggestedRoles.push('Entrepreneur', 'Startup Founder', 'Co-founder');
  } else if (lowerText.includes('product manager') || lowerText.includes('pm ') || lowerText.includes('product lead')) {
    primaryRole = 'Product Manager';
    roleType = lowerText.includes('lead') || lowerText.includes('head') ? 'manager' : 'individual_contributor';
    tags.push('Product Manager');
    suggestedRoles.push('Product Owner', 'Product Lead', 'Head of Product');
  } else if (lowerText.includes('engineer') || lowerText.includes('developer') || lowerText.includes('software')) {
    if (lowerText.includes('senior') || lowerText.includes('sr.')) {
      primaryRole = 'Senior Software Engineer';
      roleLevel = 'senior';
    } else if (lowerText.includes('lead') || lowerText.includes('principal') || lowerText.includes('staff')) {
      primaryRole = 'Lead Software Engineer';
      roleLevel = 'lead';
      roleType = 'manager';
    } else {
      primaryRole = 'Software Engineer';
    }
    tags.push('Software Engineer');
    suggestedRoles.push('Full Stack Developer', 'Backend Engineer', 'Frontend Engineer');
  }

  // Extract industry hints from role description
  if (lowerText.includes('fintech') || lowerText.includes('finance') || lowerText.includes('banking')) {
    industries.push('Fintech');
  }
  if (lowerText.includes('healthcare') || lowerText.includes('medical') || lowerText.includes('biotech')) {
    industries.push('Healthcare');
  }
  if (lowerText.includes('saas') || lowerText.includes('software')) {
    industries.push('SaaS');
  }

  return {
    tags: tags.slice(0, 3),
    primaryRole: primaryRole || 'Professional',
    roleLevel,
    roleType,
    suggestedRoles: suggestedRoles.slice(0, 4),
    industries: industries.slice(0, 3),
    confidence: primaryRole ? 0.9 : 0.4
  };
}

function mockIndustryResponse(text: string): ParsedIndustry {
  const lowerText = text.toLowerCase();
  const tags: string[] = [];
  const primaryIndustries: string[] = [];
  const secondaryIndustries: string[] = [];
  const businessModel: string[] = [];
  const companyStage: string[] = [];
  const suggestedIndustries: string[] = [];

  // Primary industries
  if (lowerText.includes('saas') || lowerText.includes('software as a service')) {
    primaryIndustries.push('SaaS');
    tags.push('SaaS');
    businessModel.push('Subscription');
    suggestedIndustries.push('Enterprise Software', 'Cloud Computing', 'B2B Software');
  }
  if (lowerText.includes('fintech') || lowerText.includes('financial technology') || lowerText.includes('payments')) {
    primaryIndustries.push('Fintech');
    tags.push('Fintech');
    suggestedIndustries.push('Banking', 'Insurance', 'Investment');
  }

  return {
    tags: tags.slice(0, 5),
    primaryIndustries: primaryIndustries.slice(0, 3),
    secondaryIndustries: secondaryIndustries.slice(0, 3),
    businessModel: businessModel.slice(0, 3),
    companyStage: companyStage.slice(0, 2),
    suggestedIndustries: suggestedIndustries.slice(0, 5),
    confidence: primaryIndustries.length > 0 ? 0.85 : 0.3
  };
}

function mockExpertiseResponse(text: string): ParsedExpertise {
  const lowerText = text.toLowerCase();
  const tags: string[] = [];
  const primaryAreas: string[] = [];
  const secondaryAreas: string[] = [];
  
  // Business & Strategy
  if (lowerText.includes('product') || lowerText.includes('pm')) {
    tags.push('Product Management');
    primaryAreas.push('Product Management');
  }
  if (lowerText.includes('strategy') || lowerText.includes('strategic')) {
    tags.push('Strategic Planning');
    primaryAreas.push('Strategic Planning');
  }
  
  // Technical
  if (lowerText.includes('react') || lowerText.includes('frontend')) {
    tags.push('React Development');
    primaryAreas.push('React Development');
  }
  if (lowerText.includes('node') || lowerText.includes('backend') || lowerText.includes('api')) {
    tags.push('Backend Development');
    primaryAreas.push('Backend Development');
  }
  
  // Determine skill level based on language used
  let skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert' = 'intermediate';
  if (lowerText.includes('expert') || lowerText.includes('senior') || lowerText.includes('lead')) {
    skillLevel = 'expert';
  } else if (lowerText.includes('experienced') || lowerText.includes('years')) {
    skillLevel = 'advanced';
  } else if (lowerText.includes('learning') || lowerText.includes('new to')) {
    skillLevel = 'beginner';
  }
  
  return {
    tags: tags.slice(0, 6),
    primaryAreas: primaryAreas.slice(0, 3),
    secondaryAreas: secondaryAreas.slice(0, 3),
    confidence: tags.length > 0 ? 0.85 : 0.3,
    skillLevel,
    suggestions: generateExpertiseSuggestions(tags)
  };
}

function mockHelpTopicsResponse(text: string): ParsedHelpTopics {
  const lowerText = text.toLowerCase();
  const tags: string[] = [];
  const urgentTopics: string[] = [];
  const learningGoals: string[] = [];
  const currentChallenges: string[] = [];
  
  // Business topics
  if (lowerText.includes('fundraising') || lowerText.includes('series a') || lowerText.includes('investment')) {
    tags.push('Fundraising Strategy');
    urgentTopics.push('Fundraising Strategy');
  }
  if (lowerText.includes('pricing') || lowerText.includes('monetization')) {
    tags.push('Pricing Strategy');
    currentChallenges.push('Pricing Strategy');
  }
  
  return {
    tags: tags.slice(0, 6),
    urgentTopics,
    learningGoals,
    currentChallenges,
    confidence: tags.length > 0 ? 0.8 : 0.3
  };
}

function mockStrugglesResponse(text: string): AIParsingResult {
  const lowerText = text.toLowerCase();
  const tags: string[] = [];
  
  // Extract key challenges
  if (lowerText.includes('scaling') || lowerText.includes('growth')) {
    tags.push('Scaling Challenges');
  }
  if (lowerText.includes('funding') || lowerText.includes('money') || lowerText.includes('cash')) {
    tags.push('Funding Challenges');
  }
  
  return {
    tags: tags.slice(0, 4),
    confidence: tags.length > 0 ? 0.75 : 0.4,
    context: 'current_struggles'
  };
}

function generateExpertiseSuggestions(existingTags: string[]): string[] {
  const suggestions: Record<string, string[]> = {
    'Product Management': ['Product Strategy', 'Roadmap Planning', 'User Stories', 'A/B Testing'],
    'React Development': ['React Hooks', 'State Management', 'Component Architecture', 'Testing'],
    'Backend Development': ['API Design', 'Database Design', 'Microservices', 'DevOps'],
  };
  
  const allSuggestions = existingTags.flatMap(tag => suggestions[tag] || []);
  return [...new Set(allSuggestions)].slice(0, 4);
}

// Utility function to debounce API calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}