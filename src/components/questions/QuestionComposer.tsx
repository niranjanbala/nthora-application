import React, { useState } from 'react';
import { Send, Tag, Lock, Globe, AlertTriangle, Sparkles } from 'lucide-react';
import { createQuestion, analyzeQuestionWithAI } from '../../services/questionRoutingService';

interface QuestionComposerProps {
  onQuestionCreated?: (questionId: string) => void;
}

const QuestionComposer: React.FC<QuestionComposerProps> = ({ onQuestionCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [visibilityLevel, setVisibilityLevel] = useState<'first_degree' | 'second_degree' | 'third_degree'>('first_degree');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSensitive, setIsSensitive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!title.trim() || !content.trim()) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeQuestionWithAI(title, content);
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Please provide both a title and description for your question');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createQuestion(title, content, {
        visibility_level: visibilityLevel,
        is_anonymous: isAnonymous,
        is_sensitive: isSensitive
      });

      if (result.success && result.question_id) {
        onQuestionCreated?.(result.question_id);
        // Reset form
        setTitle('');
        setContent('');
        setAnalysis(null);
        setVisibilityLevel('first_degree');
        setIsAnonymous(false);
        setIsSensitive(false);
      } else {
        setError(result.error || 'Failed to create question');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVisibilityIcon = (level: string) => {
    switch (level) {
      case 'first_degree': return <Lock className="h-4 w-4" />;
      case 'second_degree': return <Globe className="h-4 w-4" />;
      case 'third_degree': return <Globe className="h-4 w-4" />;
      default: return <Lock className="h-4 w-4" />;
    }
  };

  const getVisibilityDescription = (level: string) => {
    switch (level) {
      case 'first_degree': return 'Only your direct connections can see this';
      case 'second_degree': return 'Your connections and their connections can see this';
      case 'third_degree': return 'Extended network (up to 3 degrees) can see this';
      default: return 'Private to your network';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Ask a Question</h3>
          <p className="text-gray-600">Get expert answers from your trusted network</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's your question about?"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
            maxLength={200}
          />
          <div className="text-right text-xs text-gray-500 mt-1">
            {title.length}/200
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Details
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Provide context, background, and specific details about what you're looking for..."
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            maxLength={2000}
          />
          <div className="text-right text-xs text-gray-500 mt-1">
            {content.length}/2000
          </div>
        </div>

        {/* AI Analysis Preview */}
        {(title.trim() || content.trim()) && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-purple-900">AI Analysis Preview</h4>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || (!title.trim() && !content.trim())}
                className="text-sm text-purple-600 hover:text-purple-700 disabled:opacity-50"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
            
            {analysis && (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-purple-700 mb-1">Detected Topics:</p>
                  <div className="flex flex-wrap gap-1">
                    {analysis.primary_tags.map((tag: string, index: number) => (
                      <span key={index} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                    {analysis.secondary_tags.map((tag: string, index: number) => (
                      <span key={index} className="bg-purple-50 text-purple-600 px-2 py-1 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-medium text-purple-700">Answer Type:</span>
                    <span className="ml-1 text-purple-600 capitalize">{analysis.expected_answer_type}</span>
                  </div>
                  <div>
                    <span className="font-medium text-purple-700">Urgency:</span>
                    <span className="ml-1 text-purple-600 capitalize">{analysis.urgency_level}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Privacy Settings */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Privacy & Visibility</h4>
          
          <div className="space-y-3">
            {/* Visibility Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Who can see this question?
              </label>
              <div className="space-y-2">
                {[
                  { value: 'first_degree', label: '1st Degree Only', desc: 'Direct connections only' },
                  { value: 'second_degree', label: 'Extended Network', desc: 'Friends of friends' },
                  { value: 'third_degree', label: 'Broader Network', desc: 'Up to 3 degrees away' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value={option.value}
                      checked={visibilityLevel === option.value}
                      onChange={(e) => setVisibilityLevel(e.target.value as any)}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex items-center space-x-2">
                      {getVisibilityIcon(option.value)}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{option.label}</div>
                        <div className="text-xs text-gray-600">{option.desc}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Options */}
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Ask anonymously</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSensitive}
                  onChange={(e) => setIsSensitive(e.target.checked)}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <div className="flex items-center space-x-1">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-gray-700">Sensitive topic</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors duration-300"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send className="h-5 w-5" />
            )}
            <span>{isSubmitting ? 'Posting...' : 'Ask Question'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionComposer;