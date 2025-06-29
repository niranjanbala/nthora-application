import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Users, MessageSquare, Tag, AlertTriangle, Lock, Plus, ArrowRight, ToggleLeft, ToggleRight } from 'lucide-react';
import { 
  getUserQuestions, 
  getMatchedQuestions, 
  getAllQuestions,
  getExploreTopicsQuestions,
  type Question 
} from '../../services/questionRoutingService';

interface QuestionFeedProps {
  view: 'my_questions' | 'matched_questions' | 'all' | 'explore_topics';
  isDemoMode?: boolean;
}

const QuestionFeed: React.FC<QuestionFeedProps> = ({ 
  view,
  isDemoMode = false
}) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [localDemoMode, setLocalDemoMode] = useState(isDemoMode);

  useEffect(() => {
    setLocalDemoMode(isDemoMode);
  }, [isDemoMode]);

  useEffect(() => {
    loadQuestions();
  }, [view, localDemoMode]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      if (localDemoMode) {
        // Load demo questions
        const demoQuestions = generateMockQuestions(view);
        setQuestions(demoQuestions);
      } else {
        // Load real questions
        let data: Question[] = [];
        
        if (view === 'matched_questions') {
          const matchedQuestions = await getMatchedQuestions();
          data = matchedQuestions;
        } else if (view === 'my_questions') {
          data = await getUserQuestions();
        } else if (view === 'explore_topics') {
          data = await getExploreTopicsQuestions();
        } else {
          data = await getAllQuestions();
        }
        
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockQuestions = (viewType: string): Question[] => {
    // Base set of mock questions
    const baseQuestions: Partial<Question>[] = [
      {
        title: "How to implement a scalable microservice architecture?",
        content: "I'm working on a project that's growing rapidly and we need to move from our monolith to microservices. What's the best approach to ensure scalability while minimizing disruption?",
        primary_tags: ["Microservices", "Architecture", "Scalability"],
        secondary_tags: ["DevOps", "Cloud"],
        expected_answer_type: "strategic",
        urgency_level: "medium",
        status: "active",
        view_count: 42,
        response_count: 3,
        helpful_votes: 5,
        is_anonymous: false,
        is_sensitive: false,
        visibility_level: "first_degree"
      },
      {
        title: "Best practices for React performance optimization?",
        content: "Our React application is getting slower as we add more features. What are the current best practices for optimizing React performance in 2025? Specifically looking at state management, rendering optimization, and code splitting strategies.",
        primary_tags: ["React", "Performance", "Frontend"],
        secondary_tags: ["JavaScript", "Optimization"],
        expected_answer_type: "tactical",
        urgency_level: "medium",
        status: "active",
        view_count: 38,
        response_count: 5,
        helpful_votes: 12,
        is_anonymous: false,
        is_sensitive: false,
        visibility_level: "second_degree"
      },
      {
        title: "Fundraising strategies for AI startups in the current market",
        content: "We're an early-stage AI startup focused on healthcare applications. Given the current market conditions, what fundraising strategies would you recommend? Looking for advice on valuation expectations, investor targeting, and pitch deck focus areas.",
        primary_tags: ["Fundraising", "AI", "Startups"],
        secondary_tags: ["Healthcare", "Venture Capital"],
        expected_answer_type: "strategic",
        urgency_level: "high",
        status: "active",
        view_count: 65,
        response_count: 7,
        helpful_votes: 18,
        is_anonymous: false,
        is_sensitive: false,
        visibility_level: "first_degree"
      },
      {
        title: "How to build an effective data science team?",
        content: "I'm tasked with building out our data science capabilities from scratch. What roles should I prioritize hiring for? How should I structure the team? Any advice on interview processes for data scientists?",
        primary_tags: ["Data Science", "Team Building", "Hiring"],
        secondary_tags: ["Leadership", "ML"],
        expected_answer_type: "strategic",
        urgency_level: "medium",
        status: "active",
        view_count: 29,
        response_count: 4,
        helpful_votes: 8,
        is_anonymous: false,
        is_sensitive: false,
        visibility_level: "second_degree"
      },
      {
        title: "Implementing zero-trust security in a hybrid cloud environment",
        content: "We're moving to a hybrid cloud setup and want to implement zero-trust security principles. What are the key components we should focus on? Any specific tools or frameworks you'd recommend?",
        primary_tags: ["Security", "Zero Trust", "Cloud"],
        secondary_tags: ["DevSecOps", "Compliance"],
        expected_answer_type: "tactical",
        urgency_level: "high",
        status: "active",
        view_count: 47,
        response_count: 6,
        helpful_votes: 15,
        is_anonymous: false,
        is_sensitive: true,
        visibility_level: "first_degree"
      },
      {
        title: "Product-led growth strategies for B2B SaaS",
        content: "We're pivoting our B2B SaaS from a traditional sales-led approach to product-led growth. What are the key metrics we should track? How should we adjust our onboarding and pricing? Any success stories or cautionary tales would be appreciated.",
        primary_tags: ["Product-Led Growth", "SaaS", "B2B"],
        secondary_tags: ["Marketing", "Onboarding"],
        expected_answer_type: "strategic",
        urgency_level: "medium",
        status: "active",
        view_count: 53,
        response_count: 8,
        helpful_votes: 21,
        is_anonymous: false,
        is_sensitive: false,
        visibility_level: "second_degree"
      },
      {
        title: "Implementing CI/CD for machine learning models",
        content: "We're struggling with our ML model deployment pipeline. How can we implement CI/CD practices specifically for ML models? Looking for tools, frameworks, and best practices.",
        primary_tags: ["MLOps", "CI/CD", "Machine Learning"],
        secondary_tags: ["DevOps", "Automation"],
        expected_answer_type: "tactical",
        urgency_level: "medium",
        status: "active",
        view_count: 31,
        response_count: 4,
        helpful_votes: 9,
        is_anonymous: false,
        is_sensitive: false,
        visibility_level: "first_degree"
      },
      {
        title: "Strategies for reducing AWS costs without sacrificing performance",
        content: "Our AWS bill has been steadily increasing. What strategies have worked for you to optimize costs while maintaining performance? Particularly interested in EC2, RDS, and data transfer optimizations.",
        primary_tags: ["AWS", "Cost Optimization", "Cloud"],
        secondary_tags: ["Infrastructure", "FinOps"],
        expected_answer_type: "tactical",
        urgency_level: "high",
        status: "active",
        view_count: 72,
        response_count: 9,
        helpful_votes: 24,
        is_anonymous: false,
        is_sensitive: false,
        visibility_level: "first_degree"
      },
      {
        title: "Building an effective remote engineering culture",
        content: "Our engineering team has gone fully remote, and we're struggling with collaboration and maintaining culture. What practices have worked well for building strong remote engineering cultures? How do you handle onboarding, knowledge sharing, and team bonding?",
        primary_tags: ["Remote Work", "Engineering Culture", "Team Management"],
        secondary_tags: ["Collaboration", "Onboarding"],
        expected_answer_type: "strategic",
        urgency_level: "medium",
        status: "active",
        view_count: 58,
        response_count: 7,
        helpful_votes: 19,
        is_anonymous: false,
        is_sensitive: false,
        visibility_level: "second_degree"
      },
      {
        title: "Implementing ethical AI guidelines in product development",
        content: "We're developing AI-powered features and want to ensure we're following ethical guidelines. What frameworks or processes have you used to implement ethical AI practices in product development?",
        primary_tags: ["AI Ethics", "Product Development", "Guidelines"],
        secondary_tags: ["Compliance", "Responsible AI"],
        expected_answer_type: "strategic",
        urgency_level: "medium",
        status: "active",
        view_count: 41,
        response_count: 5,
        helpful_votes: 13,
        is_anonymous: false,
        is_sensitive: false,
        visibility_level: "first_degree"
      }
    ];
    
    // Add more view-specific questions
    if (viewType === 'matched_questions') {
      baseQuestions.push(
        {
          title: "Optimizing PostgreSQL for high-write applications",
          content: "We're building an IoT platform that needs to handle thousands of writes per second to PostgreSQL. What optimizations should we consider for this high-write scenario?",
          primary_tags: ["PostgreSQL", "Database", "Performance"],
          secondary_tags: ["IoT", "Scaling"],
          expected_answer_type: "tactical",
          urgency_level: "high",
          status: "active",
          view_count: 37,
          response_count: 3,
          helpful_votes: 8,
          is_anonymous: false,
          is_sensitive: false,
          visibility_level: "first_degree"
        },
        {
          title: "Implementing a design system at scale",
          content: "We're a growing company with multiple product teams and need to implement a cohesive design system. What's the best approach to create, document, and ensure adoption of a design system across teams?",
          primary_tags: ["Design Systems", "UX/UI", "Frontend"],
          secondary_tags: ["Collaboration", "Documentation"],
          expected_answer_type: "strategic",
          urgency_level: "medium",
          status: "active",
          view_count: 45,
          response_count: 6,
          helpful_votes: 17,
          is_anonymous: false,
          is_sensitive: false,
          visibility_level: "second_degree"
        }
      );
    } else if (viewType === 'my_questions') {
      baseQuestions.push(
        {
          title: "Best approach for transitioning from monolith to microservices?",
          content: "Our team is considering breaking up our monolithic application into microservices. What strategies have worked well for making this transition while keeping the application running?",
          primary_tags: ["Microservices", "Architecture", "Migration"],
          secondary_tags: ["DevOps", "Refactoring"],
          expected_answer_type: "strategic",
          urgency_level: "medium",
          status: "active",
          view_count: 52,
          response_count: 7,
          helpful_votes: 15,
          is_anonymous: false,
          is_sensitive: false,
          visibility_level: "first_degree"
        },
        {
          title: "Effective strategies for technical debt management",
          content: "Our codebase has accumulated significant technical debt over the years. What approaches have worked for you to systematically address tech debt while still delivering new features?",
          primary_tags: ["Technical Debt", "Code Quality", "Engineering"],
          secondary_tags: ["Refactoring", "Process"],
          expected_answer_type: "strategic",
          urgency_level: "medium",
          status: "answered",
          view_count: 63,
          response_count: 8,
          helpful_votes: 22,
          is_anonymous: false,
          is_sensitive: false,
          visibility_level: "first_degree"
        }
      );
    } else if (viewType === 'explore_topics') {
      baseQuestions.push(
        {
          title: "Implementing a zero-knowledge proof system for identity verification",
          content: "We're building a privacy-focused identity verification system and want to implement zero-knowledge proofs. What libraries or approaches would you recommend for a production system?",
          primary_tags: ["Zero-Knowledge Proofs", "Cryptography", "Identity"],
          secondary_tags: ["Privacy", "Security"],
          expected_answer_type: "tactical",
          urgency_level: "medium",
          status: "active",
          view_count: 39,
          response_count: 4,
          helpful_votes: 11,
          is_anonymous: false,
          is_sensitive: false,
          visibility_level: "second_degree"
        },
        {
          title: "Strategies for reducing ML model latency in production",
          content: "Our ML models are taking too long to generate predictions in production. What techniques have you used to reduce inference latency while maintaining accuracy?",
          primary_tags: ["Machine Learning", "Performance", "MLOps"],
          secondary_tags: ["Optimization", "Production"],
          expected_answer_type: "tactical",
          urgency_level: "high",
          status: "active",
          view_count: 47,
          response_count: 6,
          helpful_votes: 14,
          is_anonymous: false,
          is_sensitive: false,
          visibility_level: "first_degree"
        }
      );
    }

    // Convert partial questions to full questions with IDs and timestamps
    return baseQuestions.map((q, index) => {
      const now = new Date();
      const createdAt = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Random time in the last week
      const updatedAt = new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000); // Random time after creation
      const expiresAt = new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days after creation
      
      return {
        id: `demo-${view}-${index}`,
        asker_id: 'demo-user',
        title: q.title || 'Demo Question',
        content: q.content || 'This is a demo question content.',
        primary_tags: q.primary_tags || [],
        secondary_tags: q.secondary_tags || [],
        expected_answer_type: q.expected_answer_type || 'tactical',
        urgency_level: q.urgency_level || 'medium',
        ai_summary: `This is a question about ${q.primary_tags?.[0] || 'a topic'}.`,
        visibility_level: q.visibility_level || 'first_degree',
        is_anonymous: q.is_anonymous || false,
        is_sensitive: q.is_sensitive || false,
        status: q.status || 'active',
        view_count: q.view_count || Math.floor(Math.random() * 100),
        response_count: q.response_count || Math.floor(Math.random() * 10),
        helpful_votes: q.helpful_votes || Math.floor(Math.random() * 20),
        created_at: createdAt.toISOString(),
        updated_at: updatedAt.toISOString(),
        expires_at: expiresAt.toISOString()
      } as Question;
    });
  };

  const handleQuestionClick = (questionId: string) => {
    navigate(`/questions/${questionId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'text-blush-700 bg-blush-50 border-blush-200';
      case 'high': return 'text-clay-700 bg-clay-50 border-clay-200';
      case 'medium': return 'text-accent-700 bg-accent-50 border-accent-200';
      case 'low': return 'text-sage-700 bg-sage-50 border-sage-200';
      default: return 'text-ink-light bg-surface-100 border-surface-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-accent-700 bg-accent-50 border-accent-200';
      case 'answered': return 'text-sage-700 bg-sage-50 border-sage-200';
      case 'closed': return 'text-ink-light bg-surface-100 border-surface-200';
      case 'forwarded': return 'text-clay-700 bg-clay-50 border-clay-200';
      default: return 'text-ink-light bg-surface-100 border-surface-200';
    }
  };

  const getVisibilityIcon = (level: string) => {
    switch (level) {
      case 'first_degree': return <Lock className="h-3 w-3" />;
      case 'second_degree': return <Users className="h-3 w-3" />;
      case 'third_degree': return <Users className="h-3 w-3" />;
      default: return <Lock className="h-3 w-3" />;
    }
  };

  const getViewTitle = () => {
    switch (view) {
      case 'my_questions': return 'My Questions';
      case 'matched_questions': return 'Questions for You';
      case 'explore_topics': return 'Explore Topics';
      case 'all': return 'All Questions';
      default: return 'Questions';
    }
  };

  const getViewDescription = () => {
    switch (view) {
      case 'my_questions': return 'Questions you\'ve asked';
      case 'matched_questions': return 'Questions matched to your expertise';
      case 'explore_topics': return 'Questions in your areas of interest and expertise';
      case 'all': return 'Recent questions from the community';
      default: return 'Browse questions';
    }
  };

  const getEmptyStateMessage = () => {
    switch (view) {
      case 'my_questions': 
        return {
          title: 'No questions yet',
          description: 'Start by asking your first question to get expert answers',
          action: 'Ask Question',
          actionHandler: () => navigate('/dashboard?view=ask_question')
        };
      case 'matched_questions':
        return {
          title: 'No questions matched to you yet',
          description: 'Questions that match your expertise will appear here',
          action: null,
          actionHandler: null
        };
      case 'explore_topics':
        return {
          title: 'No relevant questions found',
          description: 'Add more expertise areas or help topics in your profile to see relevant questions',
          action: 'Update Profile',
          actionHandler: () => navigate('/dashboard?view=profile')
        };
      case 'all':
        return {
          title: 'No questions available',
          description: 'Be the first to ask a question in the community',
          action: 'Ask Question',
          actionHandler: () => navigate('/dashboard?view=ask_question')
        };
      default:
        return {
          title: 'No questions found',
          description: 'Try adjusting your filters or check back later',
          action: null,
          actionHandler: null
        };
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-soft border border-surface-200 p-6 animate-pulse">
            <div className="h-6 bg-surface-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-surface-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-surface-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (questions.length === 0) {
    const emptyState = getEmptyStateMessage();
    return (
      <motion.div 
        className="bg-white rounded-xl shadow-soft border border-surface-200 p-12 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <MessageSquare className="h-12 w-12 text-surface-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-ink-dark mb-2">{emptyState.title}</h3>
        <p className="text-ink-light mb-6">{emptyState.description}</p>
        {emptyState.action && emptyState.actionHandler && (
          <button
            onClick={emptyState.actionHandler}
            className="btn-primary inline-flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            <span>{emptyState.action}</span>
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-medium text-ink-dark">{getViewTitle()}</h2>
          <p className="text-ink-light">{getViewDescription()}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-ink-light">
            {questions.length} question{questions.length !== 1 ? 's' : ''}
          </div>
          
          {/* Demo Mode Toggle */}
          <button
            onClick={() => setLocalDemoMode(!localDemoMode)}
            className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors duration-300 ${
              localDemoMode 
                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {localDemoMode ? (
              <>
                <ToggleRight className="h-4 w-4" />
                <span className="text-sm font-medium">Demo Mode</span>
              </>
            ) : (
              <>
                <ToggleLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Demo Mode</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Demo Mode Banner */}
      {localDemoMode && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <ToggleRight className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-purple-900">Demo Mode Active</h3>
              <p className="text-sm text-purple-700">
                You're viewing simulated questions. Toggle demo mode off to see real content.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <motion.div 
        className="space-y-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {questions.map((question) => (
          <motion.div
            key={question.id}
            variants={item}
            onClick={() => handleQuestionClick(question.id)}
            className="bg-white rounded-xl shadow-soft border border-surface-200 p-6 hover:shadow-medium hover:border-accent-200 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-medium text-ink-dark line-clamp-2 hover:text-accent-600 transition-colors duration-300">
                    {question.title}
                  </h3>
                  {question.is_sensitive && (
                    <AlertTriangle className="h-4 w-4 text-clay-500 flex-shrink-0" />
                  )}
                </div>
                
                <p className="text-ink-base line-clamp-3 mb-3">
                  {question.content}
                </p>
                
                {/* Tags */}
                {(question.primary_tags.length > 0 || question.secondary_tags.length > 0) && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {question.primary_tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="bg-accent-50 text-accent-700 px-2 py-1 rounded-full text-xs font-medium border border-accent-200"
                      >
                        {tag}
                      </span>
                    ))}
                    {question.secondary_tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="bg-surface-50 text-ink-light px-2 py-1 rounded-full text-xs border border-surface-200"
                      >
                        {tag}
                      </span>
                    ))}
                    {(question.primary_tags.length + question.secondary_tags.length) > 5 && (
                      <span className="bg-surface-50 text-ink-light px-2 py-1 rounded-full text-xs border border-surface-200">
                        +{(question.primary_tags.length + question.secondary_tags.length) - 5} more
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-end space-y-2 ml-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(question.status)}`}>
                  {question.status}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(question.urgency_level)}`}>
                  {question.urgency_level}
                </span>
              </div>
            </div>

            {/* Question Metadata */}
            <div className="flex items-center justify-between text-sm text-ink-light">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(question.created_at)}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{question.response_count} responses</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{question.view_count} views</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  {getVisibilityIcon(question.visibility_level)}
                  <span className="capitalize">{question.visibility_level.replace('_', ' ')}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Tag className="h-4 w-4" />
                  <span className="capitalize">{question.expected_answer_type}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-accent-600" />
              </div>
            </div>

            {/* Match Info for matched questions */}
            {view === 'matched_questions' && (question as any).match_info && (
              <div className="mt-4 pt-4 border-t border-surface-200">
                <div className="bg-accent-50 rounded-lg p-3 border border-accent-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-ink-dark">
                        Match Score: {Math.round((question as any).match_info.match_score * 100)}%
                      </p>
                      <p className="text-xs text-ink-light">
                        Matched based on your expertise in {question.primary_tags.slice(0, 2).join(', ')}
                      </p>
                    </div>
                    <div className="bg-accent-600 text-white px-3 py-1 rounded-lg text-sm font-medium">
                      Answer
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default QuestionFeed;