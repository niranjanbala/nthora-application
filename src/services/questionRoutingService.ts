import { supabase } from '../lib/supabase';
import { openaiService, secureOpenaiService } from './openaiService';

export interface Question {
  id: string;
  asker_id: string;
  title: string;
  content: string;
  primary_tags: string[];
  secondary_tags: string[];
  expected_answer_type: 'tactical' | 'strategic' | 'resource' | 'introduction' | 'brainstorming';
  urgency_level: 'low' | 'medium' | 'high' | 'urgent';
  ai_summary?: string;
  visibility_level: 'first_degree' | 'second_degree' | 'third_degree' | 'public';
  is_anonymous: boolean;
  is_sensitive: boolean;
  status: 'active' | 'answered' | 'closed' | 'forwarded';
  view_count: number;
  response_count: number;
  helpful_votes: number;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export interface QuestionMatch {
  id: string;
  question_id: string;
  expert_id: string;
  match_score: number;
  match_reasons: any;
  tag_relevance_score: number;
  expertise_confidence: number;
  response_history_score: number;
  activity_score: number;
  network_distance: number;
  is_notified: boolean;
  notified_at?: string;
  viewed_at?: string;
  responded_at?: string;
  created_at: string;
}

export interface QuestionResponse {
  id: string;
  question_id: string;
  responder_id: string;
  content: string;
  response_type: 'tactical' | 'strategic' | 'resource' | 'introduction' | 'brainstorming';
  helpful_votes: number;
  unhelpful_votes: number;
  is_marked_helpful: boolean;
  quality_score?: number;
  visible_to: string[];
  created_at: string;
  updated_at: string;
}

export interface UserExpertise {
  id: string;
  user_id: string;
  expertise_tag: string;
  confidence_score: number;
  questions_answered: number;
  helpful_responses: number;
  endorsement_count: number;
  response_rate: number;
  avg_response_time?: string;
  last_active: string;
  is_available: boolean;
  max_questions_per_week: number;
  current_week_count: number;
  created_at: string;
  updated_at: string;
}

export interface AIQuestionAnalysis {
  primary_tags: string[];
  secondary_tags: string[];
  expected_answer_type: 'tactical' | 'strategic' | 'resource' | 'introduction' | 'brainstorming';
  urgency_level: 'low' | 'medium' | 'high' | 'urgent';
  summary: string;
  confidence: number;
}

// Determine which service to use based on environment
const USE_SECURE_API = import.meta.env.PROD || import.meta.env.VITE_USE_SECURE_AI === 'true';

// AI Question Analysis using real OpenAI
export async function analyzeQuestionWithAI(title: string, content: string): Promise<AIQuestionAnalysis> {
  try {
    if (USE_SECURE_API) {
      return await secureOpenaiService.analyzeQuestionSecure(title, content);
    } else {
      const result = await openaiService.analyzeQuestion(title, content);
      return {
        primary_tags: result.primaryTags,
        secondary_tags: result.secondaryTags,
        expected_answer_type: result.expectedAnswerType as any,
        urgency_level: result.urgencyLevel as any,
        summary: result.summary,
        confidence: result.confidence
      };
    }
  } catch (error) {
    console.error('Error analyzing question with AI:', error);
    // Fallback to mock analysis
    return mockAnalyzeQuestion(title, content);
  }
}

// Mock analysis as fallback
function mockAnalyzeQuestion(title: string, content: string): AIQuestionAnalysis {
  const mockAnalysis: AIQuestionAnalysis = {
    primary_tags: extractPrimaryTags(title + ' ' + content),
    secondary_tags: extractSecondaryTags(title + ' ' + content),
    expected_answer_type: inferAnswerType(content),
    urgency_level: inferUrgency(content),
    summary: generateSummary(title, content),
    confidence: 0.85
  };

  return mockAnalysis;
}

// Helper functions for mock AI analysis
function extractPrimaryTags(text: string): string[] {
  const keywords = text.toLowerCase();
  const tags: string[] = [];
  
  // Business & Strategy
  if (keywords.includes('marketing') || keywords.includes('growth')) tags.push('Marketing');
  if (keywords.includes('product') || keywords.includes('pm')) tags.push('Product Management');
  if (keywords.includes('sales') || keywords.includes('revenue')) tags.push('Sales');
  if (keywords.includes('funding') || keywords.includes('investment')) tags.push('Fundraising');
  
  // Technical
  if (keywords.includes('ai') || keywords.includes('machine learning')) tags.push('AI/ML');
  if (keywords.includes('backend') || keywords.includes('api')) tags.push('Backend Development');
  if (keywords.includes('frontend') || keywords.includes('react')) tags.push('Frontend Development');
  if (keywords.includes('data') || keywords.includes('analytics')) tags.push('Data Science');
  
  // Operations
  if (keywords.includes('hiring') || keywords.includes('team')) tags.push('Hiring');
  if (keywords.includes('legal') || keywords.includes('compliance')) tags.push('Legal');
  if (keywords.includes('finance') || keywords.includes('accounting')) tags.push('Finance');
  
  return tags.slice(0, 3); // Limit to top 3 primary tags
}

function extractSecondaryTags(text: string): string[] {
  const keywords = text.toLowerCase();
  const tags: string[] = [];
  
  if (keywords.includes('startup')) tags.push('Startups');
  if (keywords.includes('saas')) tags.push('SaaS');
  if (keywords.includes('b2b')) tags.push('B2B');
  if (keywords.includes('b2c')) tags.push('B2C');
  if (keywords.includes('enterprise')) tags.push('Enterprise');
  if (keywords.includes('mobile')) tags.push('Mobile');
  if (keywords.includes('web')) tags.push('Web Development');
  if (keywords.includes('design')) tags.push('Design');
  if (keywords.includes('ux') || keywords.includes('ui')) tags.push('UX/UI');
  
  return tags.slice(0, 5); // Limit to top 5 secondary tags
}

function inferAnswerType(content: string): 'tactical' | 'strategic' | 'resource' | 'introduction' | 'brainstorming' {
  const text = content.toLowerCase();
  
  if (text.includes('how to') || text.includes('step by step')) return 'tactical';
  if (text.includes('strategy') || text.includes('approach')) return 'strategic';
  if (text.includes('recommend') || text.includes('tool') || text.includes('resource')) return 'resource';
  if (text.includes('connect') || text.includes('introduction') || text.includes('meet')) return 'introduction';
  if (text.includes('ideas') || text.includes('brainstorm') || text.includes('thoughts')) return 'brainstorming';
  
  return 'tactical'; // Default
}

function inferUrgency(content: string): 'low' | 'medium' | 'high' | 'urgent' {
  const text = content.toLowerCase();
  
  if (text.includes('urgent') || text.includes('asap') || text.includes('immediately')) return 'urgent';
  if (text.includes('soon') || text.includes('quickly') || text.includes('deadline')) return 'high';
  if (text.includes('when you can') || text.includes('no rush')) return 'low';
  
  return 'medium'; // Default
}

function generateSummary(title: string, content: string): string {
  // Simple summary generation - in production would use AI
  const words = content.split(' ').slice(0, 20).join(' ');
  return words + (content.split(' ').length > 20 ? '...' : '');
}

// Create question with AI analysis
export async function createQuestion(
  title: string,
  content: string,
  options: {
    visibility_level?: 'first_degree' | 'second_degree' | 'third_degree' | 'public';
    is_anonymous?: boolean;
    is_sensitive?: boolean;
  } = {}
): Promise<{ success: boolean; question_id?: string; error?: string }> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Analyze question with AI
    const analysis = await analyzeQuestionWithAI(title, content);

    // Create question with analysis
    const { data, error } = await supabase.rpc('create_question_with_analysis', {
      asker_id_param: user.user.id,
      title_param: title,
      content_param: content,
      primary_tags_param: analysis.primary_tags,
      secondary_tags_param: analysis.secondary_tags,
      expected_answer_type_param: analysis.expected_answer_type,
      urgency_param: analysis.urgency_level,
      visibility_param: options.visibility_level || 'first_degree',
      is_anonymous_param: options.is_anonymous || false,
      is_sensitive_param: options.is_sensitive || false
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, question_id: data };
  } catch (error) {
    return { success: false, error: 'Failed to create question' };
  }
}

// Get questions for user (asked by them or matched to them)
export async function getUserQuestions(): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching questions:', error);
    return [];
  }

  return data || [];
}

// Get expert matches for a question
export async function getQuestionMatches(questionId: string): Promise<QuestionMatch[]> {
  const { data, error } = await supabase
    .from('question_matches')
    .select(`
      *,
      expert:user_profiles!expert_id(full_name, avatar_url, expertise_areas)
    `)
    .eq('question_id', questionId)
    .order('match_score', { ascending: false });

  if (error) {
    console.error('Error fetching question matches:', error);
    return [];
  }

  return data || [];
}

// Get questions matched to current user
export async function getMatchedQuestions(): Promise<(Question & { match_info: QuestionMatch })[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  const { data, error } = await supabase
    .from('question_matches')
    .select(`
      *,
      question:questions(*)
    `)
    .eq('expert_id', user.user.id)
    .eq('questions.status', 'active')
    .order('match_score', { ascending: false });

  if (error) {
    console.error('Error fetching matched questions:', error);
    return [];
  }

  return data?.map(match => ({
    ...match.question,
    match_info: match
  })) || [];
}

// Respond to a question
export async function respondToQuestion(
  questionId: string,
  content: string,
  responseType: 'tactical' | 'strategic' | 'resource' | 'introduction' | 'brainstorming'
): Promise<{ success: boolean; response_id?: string; error?: string }> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('question_responses')
      .insert({
        question_id: questionId,
        responder_id: user.user.id,
        content,
        response_type: responseType
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Update question response count
    await supabase
      .from('questions')
      .update({ response_count: supabase.sql`response_count + 1` })
      .eq('id', questionId);

    // Mark match as responded
    await supabase
      .from('question_matches')
      .update({ responded_at: new Date().toISOString() })
      .eq('question_id', questionId)
      .eq('expert_id', user.user.id);

    return { success: true, response_id: data.id };
  } catch (error) {
    return { success: false, error: 'Failed to submit response' };
  }
}

// Get responses for a question
export async function getQuestionResponses(questionId: string): Promise<QuestionResponse[]> {
  const { data, error } = await supabase
    .from('question_responses')
    .select(`
      *,
      responder:user_profiles!responder_id(full_name, avatar_url, expertise_areas)
    `)
    .eq('question_id', questionId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching question responses:', error);
    return [];
  }

  return data || [];
}

// Update user expertise
export async function updateUserExpertise(
  expertiseTag: string,
  isAvailable: boolean = true,
  maxQuestionsPerWeek: number = 10
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('user_expertise')
      .upsert({
        user_id: user.user.id,
        expertise_tag: expertiseTag,
        is_available: isAvailable,
        max_questions_per_week: maxQuestionsPerWeek,
        last_active: new Date().toISOString()
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update expertise' };
  }
}

// Get user's expertise profile
export async function getUserExpertise(userId?: string): Promise<UserExpertise[]> {
  const { data: user } = await supabase.auth.getUser();
  const targetUserId = userId || user.user?.id;
  
  if (!targetUserId) return [];

  const { data, error } = await supabase
    .from('user_expertise')
    .select('*')
    .eq('user_id', targetUserId)
    .order('confidence_score', { ascending: false });

  if (error) {
    console.error('Error fetching user expertise:', error);
    return [];
  }

  return data || [];
}

// Forward question to extended network
export async function forwardQuestion(
  questionId: string,
  forwardToUserId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Create forward record
    const { error: forwardError } = await supabase
      .from('question_forwards')
      .insert({
        question_id: questionId,
        forwarded_by: user.user.id,
        forwarded_to: forwardToUserId,
        forward_reason: reason,
        network_degree: 2 // Simplified - would calculate actual distance
      });

    if (forwardError) {
      return { success: false, error: forwardError.message };
    }

    // Create new match for forwarded user
    const { error: matchError } = await supabase
      .from('question_matches')
      .insert({
        question_id: questionId,
        expert_id: forwardToUserId,
        match_score: 0.7, // Lower score for forwarded matches
        match_reasons: { forwarded_by: user.user.id, reason },
        network_distance: 2
      });

    if (matchError) {
      return { success: false, error: matchError.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to forward question' };
  }
}

// Mark response as helpful
export async function markResponseHelpful(
  responseId: string,
  isHelpful: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('question_responses')
      .update({
        helpful_votes: supabase.sql`helpful_votes + ${isHelpful ? 1 : 0}`,
        unhelpful_votes: supabase.sql`unhelpful_votes + ${isHelpful ? 0 : 1}`,
        is_marked_helpful: isHelpful
      })
      .eq('id', responseId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update response rating' };
  }
}