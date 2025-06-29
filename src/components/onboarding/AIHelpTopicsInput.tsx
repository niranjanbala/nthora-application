import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Sparkles, CheckCircle, Loader, AlertTriangle, Target, BookOpen, TrendingUp, Mic, StopCircle } from 'lucide-react';
import { parseHelpTopicsText, debounce, type ParsedHelpTopics } from '../../services/aiParsingService';
import { elevenLabsService } from '../../services/elevenLabsService';

interface AIHelpTopicsInputProps {
  value: string[];
  onChange: (topics: string[]) => void;
  placeholder?: string;
  label?: string;
  description?: string;
}

const AIHelpTopicsInput: React.FC<AIHelpTopicsInputProps> = ({
  value,
  onChange,
  placeholder = "Describe what you need help with...",
  label = "What do you want help with?",
  description = "Tell us about areas where you're seeking expertise, advice, or learning opportunities."
}) => {
  const [freeText, setFreeText] = useState('');
  const [parsedData, setParsedData] = useState<ParsedHelpTopics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Speech-to-text state
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isProcessingSpeech, setIsProcessingSpeech] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  // Debounced parsing function
  const debouncedParse = useCallback(
    debounce(async (text: string) => {
      if (text.length < 10) {
        setParsedData(null);
        return;
      }

      setIsAnalyzing(true);
      try {
        const result = await parseHelpTopicsText(text);
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

  const addTopic = (topic: string) => {
    if (!value.includes(topic)) {
      onChange([...value, topic]);
    }
  };

  const removeTopic = (topic: string) => {
    onChange(value.filter(t => t !== topic));
  };

  const acceptAllParsed = () => {
    if (parsedData) {
      const newTopics = [...parsedData.urgentTopics, ...parsedData.learningGoals, ...parsedData.currentChallenges]
        .filter(topic => !value.includes(topic));
      onChange([...value, ...newTopics]);
      setShowSuggestions(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Speech-to-text functions
  const handleStartRecording = async () => {
    setRecordingError(null);
    audioChunksRef.current = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      recorder.onstop = handleProcessRecording;
      
      recorder.onerror = (event) => {
        console.error('Recording error:', event);
        setRecordingError('Error during recording. Please try again.');
        setIsRecording(false);
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setRecordingError('Could not access microphone. Please check permissions and try again.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      // Stop all audio tracks
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleProcessRecording = async () => {
    if (audioChunksRef.current.length === 0) return;
    
    setIsProcessingSpeech(true);
    try {
      // Combine audio chunks into a single blob
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Send to speech-to-text service
      const result = await elevenLabsService.speechToText(audioBlob);
      
      if (result.success && result.text) {
        // Append to existing text or replace it
        const newText = freeText ? `${freeText} ${result.text}` : result.text;
        setFreeText(newText);
        // This will trigger the debounced parse via the useEffect
      } else {
        setRecordingError(result.error || 'Failed to transcribe speech. Please try again.');
      }
    } catch (error) {
      console.error('Error processing recording:', error);
      setRecordingError('Error processing your speech. Please try again.');
    } finally {
      audioChunksRef.current = [];
      setIsProcessingSpeech(false);
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
        
        <div className="relative">
          <textarea
            id="helpTopicsInput"
            value={freeText}
            onChange={handleTextChange}
            placeholder={placeholder}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            maxLength={500}
          />
          
          {/* Microphone button */}
          <div className="absolute right-3 bottom-3">
            {isRecording ? (
              <button
                onClick={handleStopRecording}
                className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                aria-label="Stop recording"
              >
                <StopCircle className="h-5 w-5" />
              </button>
            ) : isProcessingSpeech ? (
              <div className="p-2 bg-purple-100 text-purple-600 rounded-full">
                <Loader className="h-5 w-5 animate-spin" />
              </div>
            ) : (
              <button
                onClick={handleStartRecording}
                className="p-2 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-colors"
                aria-label="Start recording"
              >
                <Mic className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        
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
        
        {recordingError && (
          <div className="mt-2 text-sm text-red-600 flex items-center space-x-1">
            <AlertTriangle className="h-4 w-4" />
            <span>{recordingError}</span>
          </div>
        )}
        
        {isRecording && (
          <div className="mt-2 text-sm text-purple-600 flex items-center space-x-1">
            <span className="inline-block h-2 w-2 bg-red-600 rounded-full animate-pulse"></span>
            <span>Recording... Click the stop button when finished.</span>
          </div>
        )}
      </div>

      {/* AI Analysis Results */}
      {parsedData && parsedData.tags.length > 0 && showSuggestions && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-900">AI Detected Help Topics</span>
            </div>
            <button
              onClick={acceptAllParsed}
              className="text-sm bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors duration-300"
            >
              Add All
            </button>
          </div>

          {/* Urgent Topics */}
          {parsedData.urgentTopics.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center space-x-1 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Urgent Needs</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {parsedData.urgentTopics.map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => addTopic(topic)}
                    disabled={value.includes(topic)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                      value.includes(topic)
                        ? 'bg-red-200 text-red-800 cursor-not-allowed'
                        : 'bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer'
                    }`}
                  >
                    {value.includes(topic) && <CheckCircle className="h-3 w-3 inline mr-1" />}
                    🚨 {topic}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Learning Goals */}
          {parsedData.learningGoals.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center space-x-1 mb-2">
                <BookOpen className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Learning Goals</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {parsedData.learningGoals.map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => addTopic(topic)}
                    disabled={value.includes(topic)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                      value.includes(topic)
                        ? 'bg-green-200 text-green-800 cursor-not-allowed'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer'
                    }`}
                  >
                    {value.includes(topic) && <CheckCircle className="h-3 w-3 inline mr-1" />}
                    📚 {topic}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Current Challenges */}
          {parsedData.currentChallenges.length > 0 && (
            <div>
              <div className="flex items-center space-x-1 mb-2">
                <Target className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Current Challenges</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {parsedData.currentChallenges.map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => addTopic(topic)}
                    disabled={value.includes(topic)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                      value.includes(topic)
                        ? 'bg-orange-200 text-orange-800 cursor-not-allowed'
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200 cursor-pointer'
                    }`}
                  >
                    {value.includes(topic) && <CheckCircle className="h-3 w-3 inline mr-1" />}
                    🎯 {topic}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Current Help Topics */}
      {value.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Topics You Want Help With ({value.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {value.map((topic) => (
              <span
                key={topic}
                className="bg-purple-100 text-purple-700 px-3 py-2 rounded-full text-sm flex items-center space-x-2"
              >
                <span>{topic}</span>
                <button
                  onClick={() => removeTopic(topic)}
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
            <span>Add topics manually</span>
            <span className="group-open:rotate-180 transition-transform duration-200">▼</span>
          </summary>
          <div className="mt-3">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="e.g., Fundraising Strategy, Technical Architecture"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    if (input.value.trim() && !value.includes(input.value.trim())) {
                      addTopic(input.value.trim());
                      input.value = '';
                    }
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                  if (input.value.trim() && !value.includes(input.value.trim())) {
                    addTopic(input.value.trim());
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

export default AIHelpTopicsInput;