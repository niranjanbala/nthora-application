import React, { useState, useCallback, useEffect } from 'react';
import { Sparkles, CheckCircle, AlertCircle, Loader, Star, TrendingUp, Target } from 'lucide-react';
import { parseExpertiseText, debounce, type ParsedExpertise } from '../../services/aiParsingService';

interface AIExpertiseInputProps {
  value: string[];
  onChange: (expertise: string[]) => void;
  placeholder?: string;
  label?: string;
  description?: string;
}

const AIExpertiseInput: React.FC<AIExpertiseInputProps> = ({
  value,
  onChange,
  placeholder = "Describe your expertise in your own words...",
  label = "What can you help others with?",
  description = "Tell us about your skills, experience, and knowledge areas. Be specific!"
}) => {
  const [freeText, setFreeText] = useState('');
  const [parsedData, setParsedData] = useState<ParsedExpertise | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced parsing function
  const debouncedParse = useCallback(
    debounce(async (text: string) => {
      if (text.length < 20) {
        setParsedData(null);
        return;
      }

      setIsAnalyzing(true);
      try {
        const result = await parseExpertiseText(text);
        setParsedData(result);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Parsing error:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }, 1000),
    []
  );

  // Parse text when it changes
  useEffect(() => {
    debouncedParse(freeText);
  }, [freeText, debouncedParse]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFreeText(e.target.value);
  };

  const addTag = (tag: string) => {
    if (!value.includes(tag)) {
      onChange([...value, tag]);
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };

  const acceptAllParsed = () => {
    if (parsedData) {
      const newTags = [...parsedData.primaryAreas, ...parsedData.secondaryAreas]
        .filter(tag => !value.includes(tag));
      onChange([...value, ...newTags]);
      setShowSuggestions(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSkillLevelIcon = (level: string) => {
    switch (level) {
      case 'expert': return '🏆';
      case 'advanced': return '⭐';
      case 'intermediate': return '📈';
      case 'beginner': return '🌱';
      default: return '📊';
    }
  };

  return (
    <div className="space-y-4">
      {/* Label and Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
      </div>

      {/* AI-Powered Text Input */}
      <div className="relative">
        <div className="flex items-center space-x-2 mb-2">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-700">AI-Powered Analysis</span>
          {isAnalyzing && <Loader className="h-4 w-4 text-purple-600 animate-spin" />}
        </div>
        
        <textarea
          value={freeText}
          onChange={handleTextChange}
          placeholder={placeholder}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          maxLength={500}
        />
        
        <div className="flex justify-between items-center mt-1">
          <div className="text-xs text-gray-500">
            {freeText.length}/500 characters
          </div>
          {parsedData && (
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(parsedData.confidence)}`}>
              {Math.round(parsedData.confidence * 100)}% confidence
            </div>
          )}
        </div>
      </div>

      {/* AI Analysis Results */}
      {parsedData && parsedData.tags.length > 0 && showSuggestions && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-900">AI Detected Expertise</span>
              <span className="text-sm text-purple-600">
                {getSkillLevelIcon(parsedData.skillLevel)} {parsedData.skillLevel}
              </span>
            </div>
            <button
              onClick={acceptAllParsed}
              className="text-sm bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors duration-300"
            >
              Add All
            </button>
          </div>

          {/* Primary Areas */}
          {parsedData.primaryAreas.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center space-x-1 mb-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Primary Expertise</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {parsedData.primaryAreas.map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => addTag(tag)}
                    disabled={value.includes(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                      value.includes(tag)
                        ? 'bg-green-200 text-green-800 cursor-not-allowed'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer'
                    }`}
                  >
                    {value.includes(tag) && <CheckCircle className="h-3 w-3 inline mr-1" />}
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Secondary Areas */}
          {parsedData.secondaryAreas.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center space-x-1 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Related Skills</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {parsedData.secondaryAreas.map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => addTag(tag)}
                    disabled={value.includes(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                      value.includes(tag)
                        ? 'bg-blue-200 text-blue-800 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer'
                    }`}
                  >
                    {value.includes(tag) && <CheckCircle className="h-3 w-3 inline mr-1" />}
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {parsedData.suggestions && parsedData.suggestions.length > 0 && (
            <div>
              <div className="flex items-center space-x-1 mb-2">
                <Star className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Suggested Related Areas</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {parsedData.suggestions.map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => addTag(tag)}
                    disabled={value.includes(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                      value.includes(tag)
                        ? 'bg-yellow-200 text-yellow-800 cursor-not-allowed'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 cursor-pointer'
                    }`}
                  >
                    {value.includes(tag) && <CheckCircle className="h-3 w-3 inline mr-1" />}
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Current Expertise Tags */}
      {value.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Expertise Areas ({value.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {value.map((tag) => (
              <span
                key={tag}
                className="bg-purple-100 text-purple-700 px-3 py-2 rounded-full text-sm flex items-center space-x-2"
              >
                <span>{tag}</span>
                <button
                  onClick={() => removeTag(tag)}
                  className="text-purple-500 hover:text-purple-700 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Manual Input Fallback */}
      <div className="border-t border-gray-200 pt-4">
        <details className="group">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1">
            <span>Add expertise manually</span>
            <span className="group-open:rotate-180 transition-transform duration-200">▼</span>
          </summary>
          <div className="mt-3">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="e.g., React Performance Optimization"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    if (input.value.trim() && !value.includes(input.value.trim())) {
                      addTag(input.value.trim());
                      input.value = '';
                    }
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                  if (input.value.trim() && !value.includes(input.value.trim())) {
                    addTag(input.value.trim());
                    input.value = '';
                  }
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-300"
              >
                Add
              </button>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default AIExpertiseInput;