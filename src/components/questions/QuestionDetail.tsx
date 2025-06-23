import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'answered': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      case 'forwarded': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Question not found</h3>
        <p className="text-gray-600 mb-4">The question you're looking for doesn't exist or you don't have access to it.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-300"
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
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Question Details</h1>
          <p className="text-gray-600">View and respond to this question</p>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-xl font-semibold text-gray-900">{question.title}</h2>
              {question.is_sensitive && (
                <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0" />
              )}
            </div>
            
            <div className="prose max-w-none text-gray-700 mb-4">
              <p className="whitespace-pre-wrap">{question.content}</p>
            </div>
            
            {/* Tags */}
            {(question.primary_tags.length > 0 || question.secondary_tags.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {question.primary_tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
                {question.secondary_tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end space-y-2 ml-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(question.status)}`}>
              {question.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(question.urgency_level)}`}>
              {question.urgency_level}
            </span>
          </div>
        </div>

        {/* Question Metadata */}
        <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-200">
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
      </div>

      {/* Response Form */}
      {currentUser && question.status === 'active' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {!showResponseForm ? (
            <button
              onClick={() => setShowResponseForm(true)}
              className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors duration-300"
            >
              <MessageSquare className="h-5 w-5" />
              <span>Write a Response</span>
            </button>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Response</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Type
                </label>
                <select
                  value={responseType}
                  onChange={(e) => setResponseType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="tactical">Tactical - How-to guidance</option>
                  <option value="strategic">Strategic - High-level approach</option>
                  <option value="resource">Resource - Tools and recommendations</option>
                  <option value="introduction">Introduction - Connect with someone</option>
                  <option value="brainstorming">Brainstorming - Ideas and thoughts</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer
                </label>
                <textarea
                  value={responseContent}
                  onChange={(e) => setResponseContent(e.target.value)}
                  placeholder="Share your expertise and help answer this question..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  maxLength={2000}
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {responseContent.length}/2000
                </div>
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={handleSubmitResponse}
                  disabled={responseLoading || !responseContent.trim()}
                  className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors duration-300"
                >
                  {responseLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                  <span>{responseLoading ? 'Submitting...' : 'Submit Response'}</span>
                </button>
                <button
                  onClick={() => {
                    setShowResponseForm(false);
                    setResponseContent('');
                    setError(null);
                  }}
                  className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Responses */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Responses ({responses.length})
        </h3>
        
        {responses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No responses yet</p>
            <p className="text-sm">Be the first to help answer this question!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {responses.map((response) => (
              <div key={response.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {(response as any).responder?.full_name || 'Anonymous'}
                      </p>
                      <p className="text-sm text-gray-600">{formatDate(response.created_at)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium capitalize">
                      {response.response_type}
                    </span>
                    {response.is_marked_helpful && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                </div>
                
                <div className="prose max-w-none text-gray-700 mb-3">
                  <p className="whitespace-pre-wrap">{response.content}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleVoteResponse(response.id, true)}
                      className="flex items-center space-x-1 text-gray-600 hover:text-green-600 transition-colors duration-300"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-sm">{response.helpful_votes}</span>
                    </button>
                    <button
                      onClick={() => handleVoteResponse(response.id, false)}
                      className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors duration-300"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span className="text-sm">{response.unhelpful_votes}</span>
                    </button>
                  </div>
                  
                  {response.quality_score && (
                    <div className="text-sm text-gray-600">
                      Quality: {Math.round(response.quality_score)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDetail;