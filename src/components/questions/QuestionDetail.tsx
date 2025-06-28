import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  MessageSquare, 
  Tag, 
  AlertTriangle, 
  Lock, 
  Send,
  ThumbsUp,
  ThumbsDown,
  Star,
  User
} from 'lucide-react';
import { 
  Question, 
  QuestionResponse,
  getQuestionById,
  getQuestionResponses,
  respondToQuestion,
  markResponseHelpful
} from '../../services/questionRoutingService';
import { getCurrentUser } from '../../services/authService';

const QuestionDetail: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [responseLoading, setResponseLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseContent, setResponseContent] = useState('');
  const [responseType, setResponseType] = useState<'tactical' | 'strategic' | 'resource' | 'introduction' | 'brainstorming'>('tactical');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (questionId) {
      loadQuestionData();
    }
    loadCurrentUser();
  }, [questionId]);

  const loadCurrentUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
  };

  const loadQuestionData = async () => {
    if (!questionId) return;

    setLoading(true);
    try {
      const [questionData, responsesData] = await Promise.all([
        getQuestionById(questionId),
        getQuestionResponses(questionId)
      ]);

      setQuestion(questionData);
      setResponses(responsesData);
    } catch (error) {
      console.error('Error loading question data:', error);
      setError('Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!questionId || !responseContent.trim()) return;

    setResponseLoading(true);
    setError(null);

    try {
      const result = await respondToQuestion(questionId, responseContent, responseType);
      
      if (result.success) {
        setResponseContent('');
        setShowResponseForm(false);
        await loadQuestionData(); // Reload to show new response
      } else {
        setError(result.error || 'Failed to submit response');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setResponseLoading(false);
    }
  };

  const handleVoteResponse = async (responseId: string, isHelpful: boolean) => {
    try {
      await markResponseHelpful(responseId, isHelpful);
      await loadQuestionData(); // Reload to show updated votes
    } catch (error) {
      console.error('Error voting on response:', error);
    }
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

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-soft border border-surface-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-surface-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-surface-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-surface-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="bg-white rounded-xl shadow-soft border border-surface-200 p-12 text-center">
        <MessageSquare className="h-12 w-12 text-surface-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-ink-dark mb-2">Question not found</h3>
        <p className="text-ink-light mb-4">The question you're looking for doesn't exist or you don't have access to it.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-primary"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-ink-light hover:text-ink-dark transition-colors duration-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-medium text-ink-dark">Question Details</h1>
          <p className="text-ink-light">View and respond to this question</p>
        </div>
      </div>

      {/* Question Card */}
      <motion.div 
        className="bg-white rounded-xl shadow-soft border border-surface-200 p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-xl font-medium text-ink-dark">{question.title}</h2>
              {question.is_sensitive && (
                <AlertTriangle className="h-5 w-5 text-clay-500 flex-shrink-0" />
              )}
            </div>
            
            <div className="prose max-w-none text-ink-base mb-4">
              <p className="whitespace-pre-wrap">{question.content}</p>
            </div>
            
            {/* Tags */}
            {(question.primary_tags.length > 0 || question.secondary_tags.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {question.primary_tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-accent-50 text-accent-700 px-3 py-1 rounded-full text-sm font-medium border border-accent-200"
                  >
                    {tag}
                  </span>
                ))}
                {question.secondary_tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-surface-50 text-ink-light px-3 py-1 rounded-full text-sm border border-surface-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end space-y-2 ml-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(question.status)}`}>
              {question.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(question.urgency_level)}`}>
              {question.urgency_level}
            </span>
          </div>
        </div>

        {/* Question Metadata */}
        <div className="flex items-center justify-between text-sm text-ink-light pt-4 border-t border-surface-200">
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
          
          <div className="flex items-center space-x-1">
            <Tag className="h-4 w-4" />
            <span className="capitalize">{question.expected_answer_type}</span>
          </div>
        </div>
      </motion.div>

      {/* Response Form */}
      {currentUser && question.status === 'active' && (
        <motion.div 
          className="bg-white rounded-xl shadow-soft border border-surface-200 p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {!showResponseForm ? (
            <button
              onClick={() => setShowResponseForm(true)}
              className="w-full btn-primary py-3"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              <span>Write a Response</span>
            </button>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-ink-dark">Your Response</h3>
              
              <div>
                <label className="block text-sm font-medium text-ink-light mb-2">
                  Response Type
                </label>
                <select
                  value={responseType}
                  onChange={(e) => setResponseType(e.target.value as any)}
                  className="input"
                >
                  <option value="tactical">Tactical - How-to guidance</option>
                  <option value="strategic">Strategic - High-level approach</option>
                  <option value="resource">Resource - Tools and recommendations</option>
                  <option value="introduction">Introduction - Connect with someone</option>
                  <option value="brainstorming">Brainstorming - Ideas and thoughts</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-ink-light mb-2">
                  Your Answer
                </label>
                <textarea
                  value={responseContent}
                  onChange={(e) => setResponseContent(e.target.value)}
                  placeholder="Share your expertise and help answer this question..."
                  rows={6}
                  className="input resize-none"
                  maxLength={2000}
                />
                <div className="text-right text-xs text-ink-light mt-1">
                  {responseContent.length}/2000
                </div>
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-blush-700 bg-blush-50 p-3 rounded-lg border border-blush-200">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={handleSubmitResponse}
                  disabled={responseLoading || !responseContent.trim()}
                  className="btn-primary"
                >
                  {responseLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      <span>Submit Response</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowResponseForm(false);
                    setResponseContent('');
                    setError(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Responses */}
      <motion.div 
        className="bg-white rounded-xl shadow-soft border border-surface-200 p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <h3 className="text-lg font-medium text-ink-dark mb-4">
          Responses ({responses.length})
        </h3>
        
        {responses.length === 0 ? (
          <div className="text-center py-8 text-ink-light">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-surface-300" />
            <p>No responses yet</p>
            <p className="text-sm">Be the first to help answer this question!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {responses.map((response, index) => (
              <motion.div 
                key={response.id} 
                className="border border-surface-200 rounded-lg p-4 bg-surface-50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-surface-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-ink-base" />
                    </div>
                    <div>
                      <p className="font-medium text-ink-dark">
                        {(response as any).responder?.full_name || 'Anonymous'}
                      </p>
                      <p className="text-sm text-ink-light">{formatDate(response.created_at)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="bg-surface-100 text-ink-base px-2 py-1 rounded-full text-xs font-medium border border-surface-200 capitalize">
                      {response.response_type}
                    </span>
                    {response.is_marked_helpful && (
                      <Star className="h-4 w-4 text-clay-500 fill-current" />
                    )}
                  </div>
                </div>
                
                <div className="prose max-w-none text-ink-base mb-3">
                  <p className="whitespace-pre-wrap">{response.content}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleVoteResponse(response.id, true)}
                      className="flex items-center space-x-1 text-ink-light hover:text-sage-600 transition-colors duration-300"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-sm">{response.helpful_votes}</span>
                    </button>
                    <button
                      onClick={() => handleVoteResponse(response.id, false)}
                      className="flex items-center space-x-1 text-ink-light hover:text-blush-600 transition-colors duration-300"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span className="text-sm">{response.unhelpful_votes}</span>
                    </button>
                  </div>
                  
                  {response.quality_score && (
                    <div className="text-sm text-ink-light">
                      Quality: {Math.round(response.quality_score)}%
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default QuestionDetail;