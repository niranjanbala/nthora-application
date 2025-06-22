import React, { useState, useEffect } from 'react';
import { Send, Forward, Lock, Eye, Users, Clock, ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react';
import { 
  getQuestionResponses, 
  respondToQuestion, 
  forwardQuestion, 
  markResponseHelpful,
  type Question,
  type QuestionResponse 
} from '../../services/questionRoutingService';

interface PrivateQuestionThreadProps {
  question: Question;
  onClose?: () => void;
}

const PrivateQuestionThread: React.FC<PrivateQuestionThreadProps> = ({ question, onClose }) => {
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [newResponse, setNewResponse] = useState('');
  const [responseType, setResponseType] = useState<'tactical' | 'strategic' | 'resource' | 'introduction' | 'brainstorming'>('tactical');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardingChain, setForwardingChain] = useState<any[]>([]);
  const [visibilityInfo, setVisibilityInfo] = useState<any>(null);

  useEffect(() => {
    loadResponses();
    loadVisibilityInfo();
  }, [question.id]);

  const loadResponses = async () => {
    const data = await getQuestionResponses(question.id);
    setResponses(data);
  };

  const loadVisibilityInfo = async () => {
    // Mock visibility info - in production would fetch from forwarding chain
    setVisibilityInfo({
      totalViewers: 3,
      directMatches: 2,
      forwardedTo: 1,
      networkDegrees: ['1st degree', '2nd degree']
    });
  };

  const handleSubmitResponse = async () => {
    if (!newResponse.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await respondToQuestion(question.id, newResponse, responseType);
      if (result.success) {
        setNewResponse('');
        await loadResponses();
      }
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkHelpful = async (responseId: string, isHelpful: boolean) => {
    try {
      await markResponseHelpful(responseId, isHelpful);
      await loadResponses();
    } catch (error) {
      console.error('Error marking response:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVisibilityBadge = (level: string) => {
    const badges = {
      'first_degree': { icon: Lock, color: 'bg-blue-100 text-blue-700', text: '1st Degree' },
      'second_degree': { icon: Users, color: 'bg-purple-100 text-purple-700', text: '2nd Degree' },
      'third_degree': { icon: Users, color: 'bg-indigo-100 text-indigo-700', text: '3rd Degree' }
    };
    
    const badge = badges[level as keyof typeof badges] || badges.first_degree;
    const IconComponent = badge.icon;
    
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <IconComponent className="h-3 w-3" />
        <span>{badge.text}</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-w-4xl mx-auto">
      {/* Header with Privacy Info */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{question.title}</h2>
            <p className="text-gray-700 leading-relaxed">{question.content}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-300"
            >
              ×
            </button>
          )}
        </div>

        {/* Privacy & Visibility Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">Privacy & Visibility</span>
            </div>
            {getVisibilityBadge(question.visibility_level)}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{visibilityInfo?.totalViewers || 0} can view</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{visibilityInfo?.directMatches || 0} direct matches</span>
            </div>
            <div className="flex items-center space-x-2">
              <Forward className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{visibilityInfo?.forwardedTo || 0} forwarded</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{formatDate(question.created_at)}</span>
            </div>
          </div>

          {question.is_sensitive && (
            <div className="mt-3 flex items-center space-x-2 text-orange-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Sensitive Topic - Handle with discretion</span>
            </div>
          )}
        </div>

        {/* Question Tags */}
        {(question.primary_tags.length > 0 || question.secondary_tags.length > 0) && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
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
          </div>
        )}
      </div>

      {/* Responses Thread */}
      <div className="p-6">
        <div className="space-y-6">
          {responses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No responses yet</p>
              <p className="text-sm">Be the first to share your expertise</p>
            </div>
          ) : (
            responses.map((response) => (
              <div
                key={response.id}
                className="bg-gray-50 rounded-lg p-6 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {(response as any).responder?.full_name || 'Expert'}
                      </p>
                      <p className="text-sm text-gray-600">{formatDate(response.created_at)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {response.response_type && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium capitalize">
                        {response.response_type}
                      </span>
                    )}
                    {response.is_marked_helpful && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                        Helpful
                      </span>
                    )}
                  </div>
                </div>

                <div className="prose prose-gray max-w-none mb-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {response.content}
                  </p>
                </div>

                {/* Response Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleMarkHelpful(response.id, true)}
                      className="flex items-center space-x-1 text-green-600 hover:text-green-700 transition-colors duration-300"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-sm">{response.helpful_votes}</span>
                    </button>
                    <button
                      onClick={() => handleMarkHelpful(response.id, false)}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors duration-300"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span className="text-sm">{response.unhelpful_votes}</span>
                    </button>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Quality Score: {response.quality_score ? Math.round(response.quality_score * 100) : 'N/A'}%
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Response Composer */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Share Your Expertise</h4>
          
          <div className="space-y-4">
            {/* Response Type Selector */}
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
                <option value="resource">Resource - Tools & recommendations</option>
                <option value="introduction">Introduction - Connect with someone</option>
                <option value="brainstorming">Brainstorming - Ideas & thoughts</option>
              </select>
            </div>

            {/* Response Content */}
            <div>
              <textarea
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
                placeholder="Share your expertise, insights, or recommendations..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                maxLength={2000}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {newResponse.length}/2000
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowForwardModal(true)}
                className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors duration-300"
              >
                <Forward className="h-4 w-4" />
                <span>Forward to Network</span>
              </button>
              
              <button
                onClick={handleSubmitResponse}
                disabled={isSubmitting || !newResponse.trim()}
                className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors duration-300"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>{isSubmitting ? 'Sending...' : 'Send Response'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateQuestionThread;