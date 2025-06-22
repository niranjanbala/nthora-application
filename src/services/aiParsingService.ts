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
    throw error;
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
    throw error;
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
    throw error;
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
    throw error;
  }
}

export async function parseStrugglesText(text: string): Promise<AIParsingResult> {
  if (text.length < 10) {
    return {
      tags: [],
      confidence: 0
    };
  }
  
  // TODO: Implement real AI parsing function for struggles
  // This should call either secureOpenaiService.parseStrugglesSecure(text) 
  // or openaiService.parseStruggles(text) when those methods are implemented
  return {
    tags: [],
    confidence: 0,
    context: 'current_struggles'
  };
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