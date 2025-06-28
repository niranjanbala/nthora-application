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
  source_type: 'human' | 'agentic_human';
  quality_level?: 'low' | 'medium' | 'high';
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
    throw error;
  }
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
    const { data, error } = await supabase
      .from('questions')
      .insert({
        asker_id: user.user.id,
        title,
        content,
        primary_tags: analysis.primary_tags,
        secondary_tags: analysis.secondary_tags,
        expected_answer_type: analysis.expected_answer_type,
        urgency_level: analysis.urgency_level,
        ai_summary: analysis.summary,
        visibility_level: options.visibility_level || 'first_degree',
        is_anonymous: options.is_anonymous || false,
        is_sensitive: options.is_sensitive || false
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, question_id: data.id };
  } catch (error) {
    return { success: false, error: 'Failed to create question' };
  }
}

// Get question by ID
export async function getQuestionById(questionId: string): Promise<Question | null> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single();

    if (error) {
      console.error('Error fetching question:', error);
      return null;
    }

    // Increment view count
    await supabase
      .from('questions')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', questionId);

    return data;
  } catch (error) {
    console.error('Error fetching question:', error);
    return null;
  }
}

// Get questions for user (asked by them or matched to them)
export async function getUserQuestions(): Promise<Question[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];

    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('asker_id', user.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user questions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching user questions:', error);
    return [];
  }
}

// Get all questions (for feed)
export async function getAllQuestions(): Promise<Question[]> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching questions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
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

  // For now, return mock matched questions based on user expertise
  // In production, this would use the question_matches table
  try {
    // Get user's expertise areas
    const { data: expertise } = await supabase
      .from('user_expertise')
      .select('expertise_tag')
      .eq('user_id', user.user.id);

    if (!expertise || expertise.length === 0) {
      return [];
    }

    const expertiseTags = expertise.map(e => e.expertise_tag);

    // Find questions that match user's expertise
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .neq('asker_id', user.user.id) // Don't match user's own questions
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching matched questions:', error);
      return [];
    }

    // Filter questions that have overlapping tags with user expertise
    const matchedQuestions = (questions || [])
      .filter(question => {
        const allTags = [...question.primary_tags, ...question.secondary_tags];
        return allTags.some(tag => 
          expertiseTags.some(expertiseTag => 
            tag.toLowerCase().includes(expertiseTag.toLowerCase()) ||
            expertiseTag.toLowerCase().includes(tag.toLowerCase())
          )
        );
      })
      .map(question => ({
        ...question,
        match_info: {
          id: `match-${question.id}`,
          question_id: question.id,
          expert_id: user.user.id,
          match_score: 0.8,
          match_reasons: { expertise_overlap: true },
          tag_relevance_score: 0.8,
          expertise_confidence: 0.7,
          response_history_score: 0.6,
          activity_score: 0.9,
          network_distance: 1,
          is_notified: false,
          created_at: new Date().toISOString()
        }
      }));

    return matchedQuestions;
  } catch (error) {
    console.error('Error fetching matched questions:', error);
    return [];
  }
}

// Respond to a question
export async function respondToQuestion(
  questionId: string,
  content: string,
  responseType: 'tactical' | 'strategic' | 'resource' | 'introduction' | 'brainstorming',
  sourceType: 'human' | 'agentic_human' = 'human',
  qualityLevel?: 'low' | 'medium' | 'high'
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
        response_type: responseType,
        source_type: sourceType,
        quality_level: qualityLevel
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Update question response count
    await supabase
      .from('questions')
      .update({ 
        response_count: supabase.sql`response_count + 1`,
        updated_at: new Date().toISOString()
      })
      .eq('id', questionId);

    return { success: true, response_id: data.id };
  } catch (error) {
    return { success: false, error: 'Failed to submit response' };
  }
}

// Generate agentic response to a question
export async function generateAgenticResponse(
  questionId: string,
  qualityLevel: 'low' | 'medium' | 'high'
): Promise<{ success: boolean; response_id?: string; error?: string }> {
  try {
    // Get question details
    const question = await getQuestionById(questionId);
    if (!question) {
      return { success: false, error: 'Question not found' };
    }

    // Generate response content based on quality level
    const prompt = `
You are an expert in ${question.primary_tags.join(', ')}. 
Please provide a ${qualityLevel} quality response to the following question:

Title: ${question.title}
Question: ${question.content}

${qualityLevel === 'low' ? 
  'Keep your answer brief, somewhat vague, and provide only basic information. Include some minor inaccuracies.' : 
  qualityLevel === 'medium' ? 
  'Provide a balanced answer with good information but not too detailed. Include some helpful points but leave room for improvement.' : 
  'Provide an exceptional, detailed, and highly accurate response. Include specific examples, actionable advice, and demonstrate deep expertise.'}

Response type: ${question.expected_answer_type}
`;

    // Call OpenAI to generate the response
    const response = await openaiService.generateText(prompt);
    
    if (!response.success || !response.text) {
      return { success: false, error: response.error || 'Failed to generate response' };
    }

    // Calculate quality score based on quality level
    const qualityScore = qualityLevel === 'low' ? 0.3 : 
                         qualityLevel === 'medium' ? 0.6 : 0.9;

    // Insert the agentic response
    const result = await respondToQuestion(
      questionId,
      response.text,
      question.expected_answer_type,
      'agentic_human',
      qualityLevel
    );

    // If successful, update the quality score
    if (result.success && result.response_id) {
      await supabase
        .from('question_responses')
        .update({ quality_score: qualityScore })
        .eq('id', result.response_id);
    }

    return result;
  } catch (error) {
    console.error('Error generating agentic response:', error);
    return { success: false, error: 'Failed to generate response' };
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