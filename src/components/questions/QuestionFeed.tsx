import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, Users, ArrowRight, Tag, AlertTriangle, Lock } from 'lucide-react';
import { getUserQuestions, getMatchedQuestions, type Question } from '../../services/questionRoutingService';

interface QuestionFeedProps {
  view: 'my_questions' | 'matched_questions' | 'all';
}

const QuestionFeed: React.FC<QuestionFeedProps> = ({ view }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  useEffect(() => {
    loadQuestions();
  }, [view]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      let data: Question[] = [];
      
      if (view === 'matched_questions') {
        const matchedQuestions = await getMatchedQuestions();
        data = matchedQuestions;
      } else {
        data = await getUserQuestions();
      }
      
      setQuestions(data);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
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
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {view === 'matched_questions' ? 'No questions matched to you yet' : 'No questions yet'}
        </h3>
        <p className="text-gray-600">
          {view === 'matched_questions' 
            ? 'Questions that match your expertise will appear here'
            : 'Start by asking your first question to get expert answers'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <div
          key={question.id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {question.title}
                </h3>
                {question.is_sensitive && (
                  <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                )}
              </div>
              
              <p className="text-gray-700 line-clamp-3 mb-3">
                {question.content}
              </p>
              
              {/* Tags */}
              {(question.primary_tags.length > 0 || question.secondary_tags.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {question.primary_tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  {question.secondary_tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-end space-y-2 ml-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(question.status)}`}>
                {question.status}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(question.urgency_level)}`}>
                {question.urgency_level}
              </span>
            </div>
          </div>

          {/* Question Metadata */}
          <div className="flex items-center justify-between text-sm text-gray-600">
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
            
            <button
              onClick={() => setSelectedQuestion(question.id)}
              className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 font-medium"
            >
              <span>View Details</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Match Info for matched questions */}
          {view === 'matched_questions' && (question as any).match_info && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-900">
                      Match Score: {Math.round((question as any).match_info.match_score * 100)}%
                    </p>
                    <p className="text-xs text-purple-700">
                      You're matched based on your expertise in {question.primary_tags.join(', ')}
                    </p>
                  </div>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-300">
                    Respond
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default QuestionFeed;