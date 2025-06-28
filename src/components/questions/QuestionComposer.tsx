import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Tag, Lock, Globe, AlertTriangle, Sparkle, CheckCircle } from 'lucide-react';
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
  const [success, setSuccess] = useState(false);

  const handleAnalyze = async () => {
    if (!title.trim() || !content.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeQuestionWithAI(title, content);
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      setError('Failed to analyze question. You can still submit it.');
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
        setSuccess(true);
        // Reset form after a delay
        setTimeout(() => {
          setTitle('');
          setContent('');
          setAnalysis(null);
          setVisibilityLevel('first_degree');
          setIsAnonymous(false);
          setIsSensitive(false);
          setSuccess(false);
          onQuestionCreated?.(result.question_id!);
        }, 2000);
      } else {
        setError(result.error || 'Failed to create question');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-analyze when user stops typing
  useEffect(() => {
    if (title.trim() && content.trim() && !isAnalyzing && !analysis) {
      const timer = setTimeout(() => {
        handleAnalyze();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [title, content, isAnalyzing, analysis]);

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

  if (success) {
    return (
      <motion.div 
        className="bg-white rounded-2xl shadow-soft border border-surface-200 p-8 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-sage-600" />
        </div>
        <h3 className="text-xl font-medium text-ink-dark mb-2">Question Posted Successfully!</h3>
        <p className="text-ink-light mb-4">
          Your question has been posted and is being matched with relevant experts in your network.
        </p>
        <div className="bg-sage-50 rounded-lg p-4 border border-sage-200">
          <p className="text-sage-700 text-sm">
            You'll receive notifications when experts respond to your question.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-soft border border-surface-200 p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-surface-100 rounded-full flex items-center justify-center">
          <Sparkle className="h-5 w-5 text-accent-600" />
        </div>
        <div>
          <h3 className="text-xl font-medium text-ink-dark">Ask a Question</h3>
          <p className="text-ink-light">Get expert answers from your trusted network</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-ink-light mb-2">
            Question Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's your question about?"
            className="input text-lg"
            maxLength={200}
          />
          <div className="text-right text-xs text-ink-light mt-1">
            {title.length}/200
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-ink-light mb-2">
            Question Details
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Provide context, background, and specific details about what you're looking for..."
            rows={6}
            className="input resize-none"
            maxLength={2000}
          />
          <div className="text-right text-xs text-ink-light mt-1">
            {content.length}/2000
          </div>
        </div>

        {/* AI Analysis Preview */}
        {(title.trim() || content.trim()) && (
          <div className="bg-surface-50 border border-surface-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-ink-dark flex items-center">
                <Sparkle className="h-4 w-4 mr-2 text-accent-600" />
                AI Analysis Preview
              </h4>
              {isAnalyzing && (
                <div className="flex items-center space-x-2 text-accent-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-600"></div>
                  <span className="text-sm">Analyzing...</span>
                </div>
              )}
            </div>
            
            {analysis && (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-ink-light mb-1">Detected Topics:</p>
                  <div className="flex flex-wrap gap-1">
                    {analysis.primary_tags.map((tag: string, index: number) => (
                      <span key={index} className="bg-accent-100 text-accent-700 px-2 py-1 rounded-full text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                    {analysis.secondary_tags.map((tag: string, index: number) => (
                      <span key={index} className="bg-surface-100 text-ink-light px-2 py-1 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-medium text-ink-light">Answer Type:</span>
                    <span className="ml-1 text-ink-base capitalize">{analysis.expected_answer_type}</span>
                  </div>
                  <div>
                    <span className="font-medium text-ink-light">Urgency:</span>
                    <span className="ml-1 text-ink-base capitalize">{analysis.urgency_level}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-ink-light">Confidence:</span>
                    <span className="ml-1 text-ink-base">{Math.round(analysis.confidence * 100)}%</span>
                  </div>
                </div>

                {analysis.summary && (
                  <div className="bg-white rounded-lg p-3 border border-surface-200">
                    <p className="text-xs font-medium text-ink-light mb-1">AI Summary:</p>
                    <p className="text-sm text-ink-base">{analysis.summary}</p>
                  </div>
                )}
              </div>
            )}

            {!analysis && !isAnalyzing && (title.trim() && content.trim()) && (
              <button
                onClick={handleAnalyze}
                className="text-sm text-accent-600 hover:text-accent-700 font-medium"
              >
                Click to analyze with AI
              </button>
            )}
          </div>
        )}

        {/* Privacy Settings */}
        <div className="bg-surface-50 rounded-lg p-4 border border-surface-200">
          <h4 className="text-sm font-medium text-ink-dark mb-3">Privacy & Visibility</h4>
          
          <div className="space-y-3">
            {/* Visibility Level */}
            <div>
              <label className="block text-sm font-medium text-ink-light mb-2">
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
                      className="text-accent-600 focus:ring-accent-500"
                    />
                    <div className="flex items-center space-x-2">
                      {getVisibilityIcon(option.value)}
                      <div>
                        <div className="text-sm font-medium text-ink-dark">{option.label}</div>
                        <div className="text-xs text-ink-light">{option.desc}</div>
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
                  className="text-accent-600 focus:ring-accent-500 rounded"
                />
                <span className="text-sm text-ink-base">Ask anonymously</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSensitive}
                  onChange={(e) => setIsSensitive(e.target.checked)}
                  className="text-accent-600 focus:ring-accent-500 rounded"
                />
                <div className="flex items-center space-x-1">
                  <AlertTriangle className="h-4 w-4 text-clay-500" />
                  <span className="text-sm text-ink-base">Sensitive topic</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-blush-50 border border-blush-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-blush-700">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="btn-primary"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                <span>Ask Question</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default QuestionComposer;