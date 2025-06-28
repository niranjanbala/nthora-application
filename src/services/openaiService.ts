import { supabase } from '../lib/supabase';

export interface OpenAIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Client-side OpenAI service (for development/testing)
class OpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!this.apiKey) {
      console.warn('OpenAI API key not found. Some features may not work.');
    }
  }

  private async makeRequest(endpoint: string, data: any): Promise<OpenAIResponse> {
    if (!this.apiKey) {
      return { success: false, error: 'OpenAI API key not configured' };
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          error: errorData.error?.message || `HTTP ${response.status}` 
        };
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async parseExpertise(text: string): Promise<{
    primaryAreas: string[];
    secondaryAreas: string[];
    skillLevel: string;
    confidence: number;
  }> {
    const prompt = `
Analyze the following text describing someone's professional expertise and extract:

1. Primary expertise areas (3-5 most important skills/domains)
2. Secondary expertise areas (2-4 related or supporting skills)
3. Skill level (beginner, intermediate, advanced, expert)
4. Confidence score (0.0-1.0 based on specificity and depth)

Text: "${text}"

Respond in JSON format:
{
  "primaryAreas": ["area1", "area2", "area3"],
  "secondaryAreas": ["area1", "area2"],
  "skillLevel": "advanced",
  "confidence": 0.85
}`;

    const response = await this.makeRequest('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing professional expertise. Extract specific, actionable expertise areas from text descriptions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    if (!response.success) {
      throw new Error(response.error);
    }

    try {
      const content = response.data.choices[0].message.content;
      const parsed = JSON.parse(content);
      return {
        primaryAreas: parsed.primaryAreas || [],
        secondaryAreas: parsed.secondaryAreas || [],
        skillLevel: parsed.skillLevel || 'intermediate',
        confidence: parsed.confidence || 0.5,
      };
    } catch (error) {
      throw new Error('Failed to parse OpenAI response');
    }
  }

  async parseHelpTopics(text: string): Promise<{
    urgentTopics: string[];
    learningGoals: string[];
    currentChallenges: string[];
    confidence: number;
  }> {
    const prompt = `
Analyze the following text describing what someone needs help with and categorize into:

1. Urgent topics (immediate needs, time-sensitive)
2. Learning goals (skills they want to develop)
3. Current challenges (problems they're facing)
4. Confidence score (0.0-1.0 based on clarity and specificity)

Text: "${text}"

Respond in JSON format:
{
  "urgentTopics": ["topic1", "topic2"],
  "learningGoals": ["goal1", "goal2"],
  "currentChallenges": ["challenge1", "challenge2"],
  "confidence": 0.8
}`;

    const response = await this.makeRequest('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at understanding learning needs and professional challenges. Categorize help requests accurately.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    if (!response.success) {
      throw new Error(response.error);
    }

    try {
      const content = response.data.choices[0].message.content;
      const parsed = JSON.parse(content);
      return {
        urgentTopics: parsed.urgentTopics || [],
        learningGoals: parsed.learningGoals || [],
        currentChallenges: parsed.currentChallenges || [],
        confidence: parsed.confidence || 0.5,
      };
    } catch (error) {
      throw new Error('Failed to parse OpenAI response');
    }
  }

  async parseRole(text: string): Promise<{
    primaryRole: string;
    roleLevel: string;
    roleType: string;
    suggestedRoles: string[];
    industries: string[];
    confidence: number;
  }> {
    const prompt = `
Analyze the following role description and extract:

1. Primary role (most accurate job title)
2. Role level (junior, mid, senior, lead, executive)
3. Role type (individual_contributor, manager, director, founder, consultant)
4. Suggested similar roles (3-4 alternatives)
5. Industries mentioned or implied
6. Confidence score (0.0-1.0)

Text: "${text}"

Respond in JSON format:
{
  "primaryRole": "Product Manager",
  "roleLevel": "senior",
  "roleType": "individual_contributor",
  "suggestedRoles": ["Product Owner", "Product Lead"],
  "industries": ["SaaS", "Technology"],
  "confidence": 0.9
}`;

    const response = await this.makeRequest('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing professional roles and career levels. Extract accurate role information from descriptions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    if (!response.success) {
      throw new Error(response.error);
    }

    try {
      const content = response.data.choices[0].message.content;
      const parsed = JSON.parse(content);
      return {
        primaryRole: parsed.primaryRole || '',
        roleLevel: parsed.roleLevel || 'mid',
        roleType: parsed.roleType || 'individual_contributor',
        suggestedRoles: parsed.suggestedRoles || [],
        industries: parsed.industries || [],
        confidence: parsed.confidence || 0.5,
      };
    } catch (error) {
      throw new Error('Failed to parse OpenAI response');
    }
  }

  async parseIndustry(text: string): Promise<{
    primaryIndustries: string[];
    secondaryIndustries: string[];
    businessModel: string[];
    companyStage: string[];
    suggestedIndustries: string[];
    confidence: number;
  }> {
    const prompt = `
Analyze the following text describing an industry, company, or business context and extract:

1. Primary industries (1-3 main industry categories)
2. Secondary industries (1-3 related or supporting industries)
3. Business model (subscription, marketplace, b2b, b2c, enterprise, services, etc.)
4. Company stage (startup, growth stage, public company, enterprise, etc.)
5. Suggested related industries (3-5 industries that might be relevant)
6. Confidence score (0.0-1.0 based on clarity and specificity)

Text: "${text}"

Respond in JSON format:
{
  "primaryIndustries": ["SaaS", "Fintech"],
  "secondaryIndustries": ["Enterprise Software"],
  "businessModel": ["Subscription", "B2B"],
  "companyStage": ["Startup"],
  "suggestedIndustries": ["Cloud Computing", "Financial Services", "Banking"],
  "confidence": 0.85
}`;

    const response = await this.makeRequest('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing business contexts and industry classifications. Extract accurate industry information from descriptions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    if (!response.success) {
      throw new Error(response.error);
    }

    try {
      const content = response.data.choices[0].message.content;
      const parsed = JSON.parse(content);
      return {
        primaryIndustries: parsed.primaryIndustries || [],
        secondaryIndustries: parsed.secondaryIndustries || [],
        businessModel: parsed.businessModel || [],
        companyStage: parsed.companyStage || [],
        suggestedIndustries: parsed.suggestedIndustries || [],
        confidence: parsed.confidence || 0.5,
      };
    } catch (error) {
      throw new Error('Failed to parse OpenAI response');
    }
  }

  async analyzeQuestion(title: string, content: string): Promise<{
    primaryTags: string[];
    secondaryTags: string[];
    expectedAnswerType: string;
    urgencyLevel: string;
    summary: string;
    confidence: number;
  }> {
    const prompt = `
Analyze this question and extract:

1. Primary tags (3-5 main topics/domains)
2. Secondary tags (2-4 related topics)
3. Expected answer type (tactical, strategic, resource, introduction, brainstorming)
4. Urgency level (low, medium, high, urgent)
5. Brief summary (1-2 sentences)
6. Confidence score (0.0-1.0)

Title: "${title}"
Content: "${content}"

Respond in JSON format:
{
  "primaryTags": ["Product Management", "Strategy"],
  "secondaryTags": ["Startups", "SaaS"],
  "expectedAnswerType": "strategic",
  "urgencyLevel": "medium",
  "summary": "Question about product strategy for a SaaS startup",
  "confidence": 0.85
}`;

    const response = await this.makeRequest('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing questions and categorizing them for expert matching. Be precise and helpful.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    if (!response.success) {
      throw new Error(response.error);
    }

    try {
      const content = response.data.choices[0].message.content;
      const parsed = JSON.parse(content);
      return {
        primaryTags: parsed.primaryTags || [],
        secondaryTags: parsed.secondaryTags || [],
        expectedAnswerType: parsed.expectedAnswerType || 'tactical',
        urgencyLevel: parsed.urgencyLevel || 'medium',
        summary: parsed.summary || '',
        confidence: parsed.confidence || 0.5,
      };
    } catch (error) {
      throw new Error('Failed to parse OpenAI response');
    }
  }

  async generateText(prompt: string): Promise<{
    success: boolean;
    text?: string;
    error?: string;
  }> {
    const response = await this.makeRequest('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    try {
      const text = response.data.choices[0].message.content;
      return { success: true, text };
    } catch (error) {
      return { success: false, error: 'Failed to parse OpenAI response' };
    }
  }
}

// Secure server-side service using Supabase Edge Functions
export class SecureOpenAIService {
  // Call OpenAI through Supabase Edge Function (more secure)
  async parseExpertiseSecure(text: string) {
    const { data, error } = await supabase.functions.invoke('parse-expertise', {
      body: { text }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async parseHelpTopicsSecure(text: string) {
    const { data, error } = await supabase.functions.invoke('parse-help-topics', {
      body: { text }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async parseRoleSecure(text: string) {
    const { data, error } = await supabase.functions.invoke('parse-role', {
      body: { text }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async parseIndustrySecure(text: string) {
    const { data, error } = await supabase.functions.invoke('parse-industry', {
      body: { text }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async analyzeQuestionSecure(title: string, content: string) {
    const { data, error } = await supabase.functions.invoke('analyze-question', {
      body: { title, content }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async generateTextSecure(prompt: string) {
    const { data, error } = await supabase.functions.invoke('generate-text', {
      body: { prompt }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}

// Export singleton instances
export const openaiService = new OpenAIService();
export const secureOpenaiService = new SecureOpenAIService();