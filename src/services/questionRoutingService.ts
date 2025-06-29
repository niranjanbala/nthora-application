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
    // First try to get from regular questions table
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .maybeSingle(); // Changed from single() to maybeSingle()

    // If found in questions table, return it
    if (questionData) {
      // Increment view count
      await supabase
        .from('questions')
        .update({ view_count: (questionData.view_count || 0) + 1 })
        .eq('id', questionId);

      return questionData;
    }

    // If not found in questions table, try demo_questions
    const { data: demoData, error: demoError } = await supabase
      .from('demo_questions')
      .select('*')
      .eq('id', questionId)
      .maybeSingle(); // Changed from single() to maybeSingle()

    if (demoData) {
      // Increment view count for demo question
      await supabase
        .from('demo_questions')
        .update({ view_count: (demoData.view_count || 0) + 1 })
        .eq('id', questionId);

      return demoData as Question;
    }

    // If not found in either table, return null
    return null;
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

// Get demo questions
export async function getDemoQuestions(category?: string): Promise<Question[]> {
  try {
    let query = supabase
      .from('demo_questions')
      .select('*')
      .order('created_at', { ascending: false });
      
    // Filter by category if provided
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
      
    const { data, error } = await query.limit(20);

    if (error) {
      console.error('Error fetching demo questions:', error);
      return [];
    }

    return (data || []).map(item => ({
      ...item,
      asker_id: item.id, // Use demo question id as asker_id for consistency
    })) as Question[];
  } catch (error) {
    console.error('Error fetching demo questions:', error);
    return [];
  }
}

// Get questions for explore topics based on user interests
export async function getExploreTopicsQuestions(topics: string[] = []): Promise<Question[]> {
  try {
    // If no topics provided, get all demo questions
    if (topics.length === 0) {
      return await getDemoQuestions();
    }

    // Get demo questions that match the provided topics
    const { data, error } = await supabase
      .from('demo_questions')
      .select('*')
      .or(topics.map(topic => `primary_tags.cs.{${topic}}`).join(','))
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching explore topics questions:', error);
      return [];
    }

    return (data || []).map(item => ({
      ...item,
      asker_id: item.id, // Use demo question id as asker_id for consistency
    })) as Question[];
  } catch (error) {
    console.error('Error fetching explore topics questions:', error);
    return [];
  }
}

// Get count of real questions (non-demo)
export async function getRealQuestionCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching real question count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error fetching real question count:', error);
    return 0;
  }
}

// Demo user IDs for consistent responders
const DEMO_USERS = {
  EXPERT_1: '11111111-1111-1111-1111-111111111111', // Senior expert
  EXPERT_2: '22222222-2222-2222-2222-222222222222', // Mid-level expert
  EXPERT_3: '33333333-3333-3333-3333-333333333333', // Junior expert
  FIRST_DEGREE: '44444444-4444-4444-4444-444444444444', // 1st degree connection
  SECOND_DEGREE: '55555555-5555-5555-5555-555555555555', // 2nd degree connection
  THIRD_DEGREE: '66666666-6666-6666-6666-666666666666', // 3rd degree connection
};

// Demo response templates for different quality levels
const DEMO_RESPONSES = {
  HIGH_QUALITY: [
    {
      content: `# Comprehensive Analysis

## Key Considerations
1. **Strategic Alignment**: Ensure your approach aligns with your overall business strategy
2. **Resource Allocation**: Carefully balance resources between immediate needs and long-term goals
3. **Stakeholder Management**: Identify and engage all relevant stakeholders early

## Recommended Approach
- Start with a thorough assessment of your current state
- Develop a phased implementation plan with clear milestones
- Establish robust feedback mechanisms to enable continuous improvement

## Common Pitfalls to Avoid
- Underestimating the complexity of change management
- Failing to secure executive sponsorship
- Neglecting to communicate the "why" behind changes

I've implemented similar initiatives at three Fortune 500 companies and would be happy to discuss specific aspects in more detail.`,
      response_type: 'strategic',
      helpful_votes: 15,
      unhelpful_votes: 0,
      quality_score: 0.95,
      source_type: 'human',
      network_degree: 1
    },
    {
      content: `# Detailed Implementation Guide

## Step 1: Assessment (Week 1-2)
- Conduct stakeholder interviews to understand current pain points
- Analyze existing processes and identify bottlenecks
- Benchmark against industry standards to establish realistic targets

## Step 2: Planning (Week 3-4)
- Define clear success metrics aligned with business objectives
- Create a detailed implementation roadmap with dependencies mapped
- Develop a comprehensive risk management plan

## Step 3: Execution (Week 5-12)
- Begin with a pilot in a controlled environment
- Implement changes in phases to minimize disruption
- Collect continuous feedback and make iterative improvements

## Step 4: Evaluation (Week 13-16)
- Measure outcomes against predefined success metrics
- Document lessons learned for future initiatives
- Develop a sustainability plan for long-term success

Based on my experience implementing this at companies ranging from startups to enterprises, the key success factor is maintaining clear communication throughout the process. I'm happy to provide more specific guidance on any particular aspect.`,
      response_type: 'tactical',
      helpful_votes: 12,
      unhelpful_votes: 1,
      quality_score: 0.92,
      source_type: 'human',
      network_degree: 1
    }
  ],
  MEDIUM_QUALITY: [
    {
      content: `Here are some suggestions based on my experience:

1. Start by identifying your key challenges
2. Look for quick wins that can demonstrate value
3. Build a roadmap for longer-term improvements
4. Get buy-in from stakeholders

You should also consider:
- Available resources
- Timeline constraints
- Potential risks

I implemented something similar last year and found that starting small and building momentum worked well. Let me know if you have specific questions about any part of this approach.`,
      response_type: 'strategic',
      helpful_votes: 7,
      unhelpful_votes: 2,
      quality_score: 0.65,
      source_type: 'agentic_human',
      quality_level: 'medium',
      network_degree: 2
    },
    {
      content: `Based on my experience, here's what I recommend:

1. Analyze your current situation
2. Set clear goals for what you want to achieve
3. Develop an action plan with specific steps
4. Implement changes gradually
5. Measure results and adjust as needed

Some tools that might help:
- Project management software like Asana or Trello
- Regular team check-ins
- Feedback surveys

I've seen this approach work well in similar situations. The key is to be flexible and willing to adapt as you learn more.`,
      response_type: 'tactical',
      helpful_votes: 5,
      unhelpful_votes: 3,
      quality_score: 0.6,
      source_type: 'agentic_human',
      quality_level: 'medium',
      network_degree: 2
    }
  ],
  LOW_QUALITY: [
    {
      content: `You should probably just try harder. Maybe read some books or articles about it. There are probably some good resources online. Good luck!`,
      response_type: 'resource',
      helpful_votes: 1,
      unhelpful_votes: 8,
      quality_score: 0.2,
      source_type: 'agentic_human',
      quality_level: 'low',
      network_degree: 3
    },
    {
      content: `I think you need to make a plan and then follow it. Also talk to people who know about this stuff. Maybe hire a consultant if you have budget.`,
      response_type: 'strategic',
      helpful_votes: 2,
      unhelpful_votes: 6,
      quality_score: 0.3,
      source_type: 'agentic_human',
      quality_level: 'low',
      network_degree: 3
    }
  ]
};

// Seed demo questions if they don't exist
export async function seedDemoQuestions(): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if demo questions already exist
    const { count } = await supabase
      .from('demo_questions')
      .select('*', { count: 'exact', head: true });

    if (count && count > 0) {
      // Check if we need to seed demo responses
      const { count: responseCount } = await supabase
        .from('question_responses')
        .select('*', { count: 'exact', head: true })
        .eq('question_id', await getFirstDemoQuestionId());
        
      if (responseCount && responseCount > 0) {
        return { success: true }; // Already seeded with responses
      }
    }

    // First ensure demo user profiles exist
    await seedDemoUserProfiles();

    // Sample demo questions to seed
    const demoQuestions = [
      {
        title: "How to scale a SaaS product from 100 to 1000 customers?",
        content: "We've successfully grown our SaaS platform to 100 paying customers, but we're hitting some scaling challenges. What are the key operational, technical, and strategic considerations for growing to 1000 customers?",
        primary_tags: ["saas", "scaling", "growth"],
        secondary_tags: ["operations", "strategy", "customer-success"],
        expected_answer_type: "strategic",
        urgency_level: "medium",
        category: "business-growth"
      },
      {
        title: "Best practices for remote team management in 2024?",
        content: "Leading a distributed team of 15 people across different time zones. Looking for proven strategies to maintain productivity, culture, and team cohesion.",
        primary_tags: ["remote-work", "management", "leadership"],
        secondary_tags: ["productivity", "culture", "communication"],
        expected_answer_type: "tactical",
        urgency_level: "medium",
        category: "management"
      },
      {
        title: "Fundraising strategy for B2B marketplace?",
        content: "Building a B2B marketplace connecting manufacturers with suppliers. We have early traction but need to raise Series A. What should our fundraising strategy look like?",
        primary_tags: ["fundraising", "b2b", "marketplace"],
        secondary_tags: ["venture-capital", "strategy", "growth"],
        expected_answer_type: "strategic",
        urgency_level: "high",
        category: "fundraising"
      },
      {
        title: "How to implement effective CI/CD for a growing engineering team?",
        content: "Our team has grown from 3 to 15 engineers in the last year, and our deployment process is becoming a bottleneck. Looking for advice on implementing CI/CD that can scale with our team.",
        primary_tags: ["engineering", "ci-cd", "devops"],
        secondary_tags: ["automation", "productivity", "scaling"],
        expected_answer_type: "tactical",
        urgency_level: "medium",
        category: "engineering"
      },
      {
        title: "Strategies for reducing customer acquisition cost (CAC)?",
        content: "Our CAC has been steadily increasing over the past 6 months. What strategies have worked for others to bring this down while maintaining growth?",
        primary_tags: ["marketing", "cac", "growth"],
        secondary_tags: ["metrics", "acquisition", "roi"],
        expected_answer_type: "strategic",
        urgency_level: "high",
        category: "marketing"
      },
      {
        title: "How to structure equity compensation for early employees?",
        content: "We're a pre-seed startup about to make our first 5 hires. How should we think about equity allocation, vesting schedules, and communicating the value to candidates?",
        primary_tags: ["equity", "compensation", "startup"],
        secondary_tags: ["hiring", "retention", "vesting"],
        expected_answer_type: "strategic",
        urgency_level: "medium",
        category: "hr"
      },
      {
        title: "Best approach for migrating from monolith to microservices?",
        content: "We have a 5-year-old monolithic application that's becoming difficult to maintain and scale. What's the best approach to gradually migrate to a microservices architecture while keeping the business running?",
        primary_tags: ["microservices", "architecture", "migration"],
        secondary_tags: ["technical-debt", "scaling", "engineering"],
        expected_answer_type: "tactical",
        urgency_level: "medium",
        category: "engineering"
      },
      {
        title: "How to build a data-driven product culture?",
        content: "Our product decisions are often based on intuition rather than data. How can we build a more data-driven product culture without slowing down our pace of innovation?",
        primary_tags: ["product", "data", "culture"],
        secondary_tags: ["analytics", "decision-making", "metrics"],
        expected_answer_type: "strategic",
        urgency_level: "medium",
        category: "product"
      },
      {
        title: "Effective strategies for enterprise sales?",
        content: "We're transitioning from SMB to enterprise customers. What are effective strategies for navigating longer sales cycles, multiple stakeholders, and enterprise requirements?",
        primary_tags: ["sales", "enterprise", "b2b"],
        secondary_tags: ["negotiation", "stakeholders", "contracts"],
        expected_answer_type: "tactical",
        urgency_level: "high",
        category: "sales"
      },
      {
        title: "How to implement OKRs effectively in a startup?",
        content: "We're a 30-person startup and want to implement OKRs to better align our team. What are best practices for introducing OKRs without adding too much process overhead?",
        primary_tags: ["okrs", "management", "goals"],
        secondary_tags: ["alignment", "metrics", "performance"],
        expected_answer_type: "tactical",
        urgency_level: "medium",
        category: "management"
      }
    ];

    // Insert or update demo questions
    for (const question of demoQuestions) {
      const { data, error } = await supabase
        .from('demo_questions')
        .upsert(question)
        .select();

      if (error) {
        console.error('Error upserting demo question:', error);
        return { success: false, error: error.message };
      }
    }

    // Get all demo question IDs
    const { data: demoQuestionData, error: demoQuestionError } = await supabase
      .from('demo_questions')
      .select('id');

    if (demoQuestionError || !demoQuestionData) {
      console.error('Error fetching demo question IDs:', demoQuestionError);
      return { success: false, error: demoQuestionError?.message || 'Failed to fetch demo question IDs' };
    }

    // Seed responses for each demo question
    for (const question of demoQuestionData) {
      await seedDemoResponses(question.id);
    }

    return { success: true };
  } catch (error) {
    console.error('Error seeding demo questions:', error);
    return { success: false, error: 'Failed to seed demo questions' };
  }
}

// Seed demo user profiles for responses
async function seedDemoUserProfiles(): Promise<void> {
  try {
    // Define demo user profiles
    const demoProfiles = [
      {
        id: DEMO_USERS.EXPERT_1,
        email: 'expert1@example.com',
        full_name: 'Dr. Sarah Chen',
        bio: 'Senior Product Leader with 15+ years experience in SaaS and enterprise software. Previously VP Product at Salesforce and Director at Microsoft.',
        expertise_areas: ['Product Strategy', 'SaaS', 'Enterprise Software', 'Leadership'],
        role: 'member',
        membership_status: 'active'
      },
      {
        id: DEMO_USERS.EXPERT_2,
        email: 'expert2@example.com',
        full_name: 'Marcus Rodriguez',
        bio: 'Engineering Manager specializing in scalable architecture and DevOps. 10 years experience building high-performance systems.',
        expertise_areas: ['Engineering', 'DevOps', 'Architecture', 'Scaling'],
        role: 'member',
        membership_status: 'active'
      },
      {
        id: DEMO_USERS.EXPERT_3,
        email: 'expert3@example.com',
        full_name: 'Jamie Taylor',
        bio: 'Growth Marketing Specialist with experience at early-stage startups. Focus on customer acquisition and retention strategies.',
        expertise_areas: ['Marketing', 'Growth', 'Customer Acquisition', 'Analytics'],
        role: 'member',
        membership_status: 'active'
      },
      {
        id: DEMO_USERS.FIRST_DEGREE,
        email: 'connection1@example.com',
        full_name: 'Alex Morgan',
        bio: 'First-degree connection with expertise in finance and operations.',
        expertise_areas: ['Finance', 'Operations', 'Strategy'],
        role: 'member',
        membership_status: 'active'
      },
      {
        id: DEMO_USERS.SECOND_DEGREE,
        email: 'connection2@example.com',
        full_name: 'Jordan Lee',
        bio: 'Second-degree connection specializing in product design and UX research.',
        expertise_areas: ['Design', 'UX Research', 'Product'],
        role: 'member',
        membership_status: 'active'
      },
      {
        id: DEMO_USERS.THIRD_DEGREE,
        email: 'connection3@example.com',
        full_name: 'Taylor Smith',
        bio: 'Third-degree connection with background in data science and AI.',
        expertise_areas: ['Data Science', 'AI', 'Machine Learning'],
        role: 'member',
        membership_status: 'active'
      }
    ];

    // Upsert each demo profile
    for (const profile of demoProfiles) {
      const { error } = await supabase
        .from('user_profiles')
        .upsert(profile, { onConflict: 'id' });

      if (error) {
        console.error(`Error upserting demo profile ${profile.full_name}:`, error);
      }
    }
  } catch (error) {
    console.error('Error seeding demo user profiles:', error);
  }
}

// Get first demo question ID for checking if responses exist
async function getFirstDemoQuestionId(): Promise<string> {
  const { data } = await supabase
    .from('demo_questions')
    .select('id')
    .limit(1)
    .single();
    
  return data?.id || '';
}

// Seed demo responses for a question
async function seedDemoResponses(questionId: string): Promise<void> {
  try {
    // Check if responses already exist for this question
    const { count } = await supabase
      .from('question_responses')
      .select('*', { count: 'exact', head: true })
      .eq('question_id', questionId);
      
    if (count && count > 0) {
      return; // Responses already exist
    }
    
    // Create a mix of responses for this question
    const responses = [
      // High quality human response from 1st degree connection
      {
        question_id: questionId,
        responder_id: DEMO_USERS.EXPERT_1,
        content: DEMO_RESPONSES.HIGH_QUALITY[0].content,
        response_type: DEMO_RESPONSES.HIGH_QUALITY[0].response_type,
        helpful_votes: DEMO_RESPONSES.HIGH_QUALITY[0].helpful_votes,
        unhelpful_votes: DEMO_RESPONSES.HIGH_QUALITY[0].unhelpful_votes,
        quality_score: DEMO_RESPONSES.HIGH_QUALITY[0].quality_score,
        source_type: DEMO_RESPONSES.HIGH_QUALITY[0].source_type,
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
        updated_at: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      
      // Another high quality human response from 1st degree connection
      {
        question_id: questionId,
        responder_id: DEMO_USERS.FIRST_DEGREE,
        content: DEMO_RESPONSES.HIGH_QUALITY[1].content,
        response_type: DEMO_RESPONSES.HIGH_QUALITY[1].response_type,
        helpful_votes: DEMO_RESPONSES.HIGH_QUALITY[1].helpful_votes,
        unhelpful_votes: DEMO_RESPONSES.HIGH_QUALITY[1].unhelpful_votes,
        quality_score: DEMO_RESPONSES.HIGH_QUALITY[1].quality_score,
        source_type: DEMO_RESPONSES.HIGH_QUALITY[1].source_type,
        created_at: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
        updated_at: new Date(Date.now() - 3600000 * 12).toISOString()
      },
      
      // Medium quality AI response from 2nd degree connection
      {
        question_id: questionId,
        responder_id: DEMO_USERS.SECOND_DEGREE,
        content: DEMO_RESPONSES.MEDIUM_QUALITY[0].content,
        response_type: DEMO_RESPONSES.MEDIUM_QUALITY[0].response_type,
        helpful_votes: DEMO_RESPONSES.MEDIUM_QUALITY[0].helpful_votes,
        unhelpful_votes: DEMO_RESPONSES.MEDIUM_QUALITY[0].unhelpful_votes,
        quality_score: DEMO_RESPONSES.MEDIUM_QUALITY[0].quality_score,
        source_type: DEMO_RESPONSES.MEDIUM_QUALITY[0].source_type,
        quality_level: DEMO_RESPONSES.MEDIUM_QUALITY[0].quality_level,
        created_at: new Date(Date.now() - 3600000 * 6).toISOString(), // 6 hours ago
        updated_at: new Date(Date.now() - 3600000 * 6).toISOString()
      },
      
      // Low quality AI response from 3rd degree connection
      {
        question_id: questionId,
        responder_id: DEMO_USERS.THIRD_DEGREE,
        content: DEMO_RESPONSES.LOW_QUALITY[0].content,
        response_type: DEMO_RESPONSES.LOW_QUALITY[0].response_type,
        helpful_votes: DEMO_RESPONSES.LOW_QUALITY[0].helpful_votes,
        unhelpful_votes: DEMO_RESPONSES.LOW_QUALITY[0].unhelpful_votes,
        quality_score: DEMO_RESPONSES.LOW_QUALITY[0].quality_score,
        source_type: DEMO_RESPONSES.LOW_QUALITY[0].source_type,
        quality_level: DEMO_RESPONSES.LOW_QUALITY[0].quality_level,
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
        updated_at: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ];
    
    // Insert all responses
    const { error } = await supabase
      .from('question_responses')
      .insert(responses);
      
    if (error) {
      console.error('Error inserting demo responses:', error);
    }
    
    // Update response count on the demo question
    await supabase
      .from('demo_questions')
      .update({ response_count: responses.length })
      .eq('id', questionId);
      
  } catch (error) {
    console.error('Error seeding demo responses:', error);
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

    // Check if this is a demo question
    const { data: demoQuestion } = await supabase
      .from('demo_questions')
      .select('id')
      .eq('id', questionId)
      .maybeSingle();
      
    if (demoQuestion) {
      // Update response count for demo question
      await supabase
        .from('demo_questions')
        .update({ 
          response_count: supabase.sql`response_count + 1`,
          updated_at: new Date().toISOString()
        })
        .eq('id', questionId);
    } else {
      // Update response count for regular question
      await supabase
        .from('questions')
        .update({ 
          response_count: supabase.sql`response_count + 1`,
          updated_at: new Date().toISOString()
        })
        .eq('id', questionId);
    }

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
  try {
    // First check if this is a regular question
    const { data: questionData } = await supabase
      .from('questions')
      .select('id')
      .eq('id', questionId)
      .maybeSingle();
      
    // If it's a regular question, get responses with user profile join
    if (questionData) {
      const { data, error } = await supabase
        .from('question_responses')
        .select(`
          *,
          responder:user_profiles!responder_id(id)
        `)
        .eq('question_id', questionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching question responses:', error);
        return [];
      }

      // For each response, get the responder's profile separately
      const responsesWithProfiles = await Promise.all(
        (data || []).map(async (response) => {
          if (response.responder && response.responder.id) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('full_name, avatar_url, expertise_areas')
              .eq('id', response.responder.id)
              .maybeSingle();
              
            return {
              ...response,
              responder: profile || { full_name: 'Anonymous', avatar_url: null, expertise_areas: [] }
            };
          }
          return response;
        })
      );

      return responsesWithProfiles || [];
    }
    
    // If not found in questions table, check if it's a demo question
    const { data: demoData } = await supabase
      .from('demo_questions')
      .select('id')
      .eq('id', questionId)
      .maybeSingle();
      
    // If it's a demo question, get responses with user profile join
    if (demoData) {
      const { data, error } = await supabase
        .from('question_responses')
        .select(`
          *,
          responder:user_profiles!responder_id(id)
        `)
        .eq('question_id', questionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching demo question responses:', error);
        return [];
      }

      // For each response, get the responder's profile separately
      const responsesWithProfiles = await Promise.all(
        (data || []).map(async (response) => {
          if (response.responder && response.responder.id) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('full_name, avatar_url, expertise_areas')
              .eq('id', response.responder.id)
              .maybeSingle();
              
            return {
              ...response,
              responder: profile || { full_name: 'Anonymous', avatar_url: null, expertise_areas: [] }
            };
          }
          return response;
        })
      );

      return responsesWithProfiles || [];
    }
    
    // If question not found in either table, return empty array
    return [];
  } catch (error) {
    console.error('Error fetching question responses:', error);
    return [];
  }
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
      }, {
        onConflict: 'user_id,expertise_tag'
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