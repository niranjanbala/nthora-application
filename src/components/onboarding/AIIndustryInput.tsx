import React, { useState, useCallback, useEffect } from 'react';
import { Sparkles, CheckCircle, Loader, Building, Target, TrendingUp, Zap } from 'lucide-react';
import { parseIndustryText, debounce, type ParsedIndustry } from '../../services/aiParsingService';

interface AIIndustryInputProps {
  value: string[];
  onChange: (industries: string[]) => void;
  placeholder?: string;
  label?: string;
  description?: string;
}

const AIIndustryInput: React.FC<AIIndustryInputProps> = ({
  value,
  onChange,
  placeholder = "Describe the industry, company type, or market you work in...",
  label = "What industry or field do you work in?",
  description = "Tell us about your industry, business model, company stage, or market focus."
}) => {
  const [freeText, setFreeText] = useState('');
  const [parsedData, setParsedData] = useState<ParsedIndustry | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced parsing function
  const debouncedParse = useCallback(
    debounce(async (text: string) => {
      if (text.length < 5) {
        setParsedData(null);
        return;
      }

      setIsAnalyzing(true);
      try {
        const result = await parseIndustryText(text);
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

  const addIndustry = (industry: string) => {
    if (!value.includes(industry)) {
      onChange([...value, industry]);
    }
  };

  const removeIndustry = (industry: string) => {
    onChange(value.filter(i => i !== industry));
  };

  const acceptAllParsed = () => {
    if (parsedData) {
      const newIndustries = [...parsedData.primaryIndustries, ...parsedData.secondaryIndustries]
        .filter(industry => !value.includes(industry));
      onChange([...value, ...newIndustries]);
      setShowSuggestions(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getBusinessModelIcon = (model: string) => {
    switch (model.toLowerCase()) {
      case 'subscription': return '🔄';
      case 'marketplace': return '🏪';
      case 'b2b': return '🏢';
      case 'b2c': return '👥';
      case 'enterprise': return '🏛️';
      case 'direct-to-consumer': return '🛒';
      case 'services': return '🛠️';
      case 'freemium': return '🆓';
      default: return '💼';
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'startup': return '🚀';
      case 'growth stage': return '📈';
      case 'public company': return '🏛️';
      case 'enterprise': return '🏢';
      default: return '🏗️';
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
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">AI-Powered Industry Detection</span>
          {isAnalyzing && <Loader className="h-4 w-4 text-blue-600 animate-spin" />}
        </div>
        
        <textarea
          value={freeText}
          onChange={handleTextChange}
          placeholder={placeholder}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          maxLength={300}
        />
        
        <div className="flex justify-between items-center mt-1">
          <div className="text-xs text-gray-500">
            {freeText.length}/300 characters
          </div>
          {parsedData && (
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(parsedData.confidence)}`}>
              {Math.round(parsedData.confidence * 100)}% confidence
            </div>
          )}
        </div>
      </div>

      {/* AI Analysis Results */}
      {parsedData && parsedData.primaryIndustries.length > 0 && showSuggestions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">AI Detected Industries</span>
            </div>
            <button
              onClick={acceptAllParsed}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              Add All
            </button>
          </div>

          {/* Primary Industries */}
          {parsedData.primaryIndustries.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center space-x-1 mb-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Primary Industries</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {parsedData.primaryIndustries.map((industry, index) => (
                  <button
                    key={index}
                    onClick={() => addIndustry(industry)}
                    disabled={value.includes(industry)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                      value.includes(industry)
                        ? 'bg-green-200 text-green-800 cursor-not-allowed'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer'
                    }`}
                  >
                    {value.includes(industry) && <CheckCircle className="h-3 w-3 inline mr-1" />}
                    🏢 {industry}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Business Model */}
          {parsedData.businessModel.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center space-x-1 mb-2">
                <Zap className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Business Model</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {parsedData.businessModel.map((model, index) => (
                  <button
                    key={index}
                    onClick={() => addIndustry(model)}
                    disabled={value.includes(model)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                      value.includes(model)
                        ? 'bg-purple-200 text-purple-800 cursor-not-allowed'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200 cursor-pointer'
                    }`}
                  >
                    {value.includes(model) && <CheckCircle className="h-3 w-3 inline mr-1" />}
                    {getBusinessModelIcon(model)} {model}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Company Stage */}
          {parsedData.companyStage.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center space-x-1 mb-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Company Stage</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {parsedData.companyStage.map((stage, index) => (
                  <button
                    key={index}
                    onClick={() => addIndustry(stage)}
                    disabled={value.includes(stage)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                      value.includes(stage)
                        ? 'bg-orange-200 text-orange-800 cursor-not-allowed'
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200 cursor-pointer'
                    }`}
                  >
                    {value.includes(stage) && <CheckCircle className="h-3 w-3 inline mr-1" />}
                    {getStageIcon(stage)} {stage}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Industries */}
          {parsedData.suggestedIndustries.length > 0 && (
            <div>
              <div className="flex items-center space-x-1 mb-2">
                <Building className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">Related Industries</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {parsedData.suggestedIndustries.map((industry, index) => (
                  <button
                    key={index}
                    onClick={() => addIndustry(industry)}
                    disabled={value.includes(industry)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                      value.includes(industry)
                        ? 'bg-gray-200 text-gray-800 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer'
                    }`}
                  >
                    {value.includes(industry) && <CheckCircle className="h-3 w-3 inline mr-1" />}
                    💡 {industry}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Current Selection */}
      {value.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selected Industries ({value.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {value.map((industry) => (
              <span
                key={industry}
                className="bg-blue-100 text-blue-700 px-3 py-2 rounded-full text-sm flex items-center space-x-2"
              >
                <span>{industry}</span>
                <button
                  onClick={() => removeIndustry(industry)}
                  className="text-blue-500 hover:text-blue-700 font-bold"
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
            <span>Select from common industries</span>
            <span className="group-open:rotate-180 transition-transform duration-200">▼</span>
          </summary>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              'SaaS', 'Fintech', 'Healthcare', 'AI/ML', 'E-commerce', 'EdTech',
              'Gaming', 'Crypto/Web3', 'Climate Tech', 'Biotech', 'Manufacturing',
              'Consulting', 'Media', 'Real Estate', 'Non-profit', 'Government'
            ].map((industry) => (
              <button
                key={industry}
                onClick={() => addIndustry(industry)}
                disabled={value.includes(industry)}
                className={`text-left px-3 py-2 rounded-lg text-sm transition-colors duration-300 ${
                  value.includes(industry)
                    ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                    : 'bg-gray-100 hover:bg-blue-100 hover:text-blue-700'
                }`}
              >
                {industry}
              </button>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
};

export default AIIndustryInput;