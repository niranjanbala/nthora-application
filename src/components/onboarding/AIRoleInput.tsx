import React, { useState, useCallback, useEffect } from 'react';
import { Sparkles, CheckCircle, Loader, Briefcase, TrendingUp, Users, Building, Mic, StopCircle, AlertTriangle } from 'lucide-react';
import { parseRoleText, debounce, type ParsedRole } from '../../services/aiParsingService';
import { elevenLabsService } from '../../services/elevenLabsService';

interface AIRoleInputProps {
  value: string;
  onChange: (role: string, industries: string[]) => void;
  placeholder?: string;
  label?: string;
  description?: string;
}

const AIRoleInput: React.FC<AIRoleInputProps> = ({
  value,
  onChange,
  placeholder = "Describe your current role and what you do...",
  label = "What best describes your current role?",
  description = "Tell us about your position, responsibilities, and the type of work you do."
}) => {
  const [freeText, setFreeText] = useState('');
  const [parsedData, setParsedData] = useState<ParsedRole | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Speech-to-text state
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isProcessingSpeech, setIsProcessingSpeech] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  // Debounced parsing function
  const debouncedParse = useCallback(
    debounce(async (text: string) => {
      if (text.length < 5) {
        setParsedData(null);
        return;
      }

      setIsAnalyzing(true);
      setError(null);
      try {
        const result = await parseRoleText(text);
        setParsedData(result);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Parsing error:', error);
        setError('Failed to analyze role. You can still enter your role manually.');
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

  const selectRole = (role: string) => {
    onChange(role, parsedData?.industries || []);
    setShowSuggestions(false);
  };

  const acceptParsedRole = () => {
    if (parsedData?.primaryRole) {
      onChange(parsedData.primaryRole, parsedData.industries);
      setShowSuggestions(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRoleLevelIcon = (level: string) => {
    switch (level) {
      case 'executive': return '👑';
      case 'lead': return '⭐';
      case 'senior': return '📈';
      case 'mid': return '💼';
      case 'junior': return '🌱';
      default: return '💼';
    }
  };

  const getRoleTypeIcon = (type: string) => {
    switch (type) {
      case 'founder': return '🚀';
      case 'director': return '🎯';
      case 'manager': return '👥';
      case 'consultant': return '🎓';
      case 'individual_contributor': return '⚡';
      default: return '💼';
    }
  };

  // Speech-to-text functions
  const handleStartRecording = async () => {
    setRecordingError(null);
    setAudioChunks([]);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
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
  

    if (audioChunks.length === 0) return;
    
    setIsProcessingSpeech(true);
    try {
      // Combine audio chunks into a single blob
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      
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
      setAudioChunks([]);
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
          <span className="text-sm font-medium text-purple-700">AI-Powered Role Detection</span>
          {isAnalyzing && <Loader className="h-4 w-4 text-purple-600 animate-spin" />}
        </div>
        
        <div className="relative">
          <textarea
            value={freeText}
            onChange={handleTextChange}
            placeholder={placeholder}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            maxLength={300}
          />
          
          {/* Microphone button */}
          <div className="absolute right-3 bottom-3">
            {isRecording ? (
              <div className="relative">
                <button
                  onClick={handleStopRecording}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors relative z-10"
                  aria-label="Stop recording"
                >
                  <StopCircle className="h-5 w-5" />
                </button>
                {/* Pulsing recording animation */}
                <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></div>
                <div className="absolute inset-1 bg-red-300 rounded-full animate-pulse opacity-50"></div>
              </div>
            ) : isProcessingSpeech ? (
              <div className="relative">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-full">
                  <Loader className="h-5 w-5 animate-spin" />
                </div>
                <div className="absolute inset-0 bg-purple-200 rounded-full animate-pulse opacity-30"></div>
              </div>
            ) : (
              <button
                onClick={handleStartRecording}
                className="p-2 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-colors group"
                aria-label="Start recording"
              >
                <Mic className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </button>
            )}
          </div>
        </div>
        
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
        
        {error && (
          <div className="mt-2 text-sm text-red-600">
            {error}
          </div>
        )}
        
        {recordingError && (
          <div className="mt-2 text-sm text-red-600 flex items-center space-x-1">
            <AlertTriangle className="h-4 w-4" />
            <span>{recordingError}</span>
          </div>
        )}
        
        {isRecording && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <span className="inline-block h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
                <span className="inline-block h-2 w-2 bg-red-400 rounded-full animate-pulse delay-75"></span>
                <span className="inline-block h-2 w-2 bg-red-300 rounded-full animate-pulse delay-150"></span>
              </div>
              <span className="text-sm font-medium text-red-700">Recording in progress...</span>
            </div>
            <p className="text-xs text-red-600 mt-1">Speak clearly and click the stop button when finished.</p>
          </div>
        )}
        
        {isProcessingSpeech && (
          <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Loader className="h-4 w-4 text-purple-600 animate-spin" />
              <span className="text-sm font-medium text-purple-700">Processing your speech...</span>
            </div>
            <p className="text-xs text-purple-600 mt-1">Converting audio to text using AI.</p>
          </div>
        )}
      </div>

      {/* AI Analysis Results */}
      {parsedData && parsedData.primaryRole && showSuggestions && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-900">AI Detected Role</span>
            </div>
            <button
              onClick={acceptParsedRole}
              className="text-sm bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors duration-300"
            >
              Use This Role
            </button>
          </div>

          {/* Primary Role */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Briefcase className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Primary Role</span>
            </div>
            <div className="bg-white rounded-lg p-3 border border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getRoleTypeIcon(parsedData.roleType)}</span>
                  <div>
                    <div className="font-medium text-gray-900">{parsedData.primaryRole}</div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{getRoleLevelIcon(parsedData.roleLevel)} {parsedData.roleLevel}</span>
                      <span>•</span>
                      <span>{parsedData.roleType.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => selectRole(parsedData.primaryRole)}
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                >
                  Select
                </button>
              </div>
            </div>
          </div>

          {/* Suggested Roles */}
          {parsedData.suggestedRoles.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Similar Roles</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {parsedData.suggestedRoles.map((role, index) => (
                  <button
                    key={index}
                    onClick={() => selectRole(role)}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors duration-300"
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Detected Industries */}
          {parsedData.industries.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Building className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Detected Industries</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {parsedData.industries.map((industry, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    🏢 {industry}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Current Selection */}
      {value && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Selected Primary Role</span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="font-medium text-gray-900">{value}</div>
          </div>
        </div>
      )}

      {/* Manual Input Fallback */}
      <div className="border-t border-gray-200 pt-4">
        <details className="group">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1">
            <span>Select from predefined roles</span>
            <span className="group-open:rotate-180 transition-transform duration-200">▼</span>
          </summary>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              'Founder/CEO',
              'Product Manager',
              'Software Engineer',
              'Designer',
              'Marketing Manager',
              'Sales Manager',
              'Data Scientist',
              'Consultant',
              'Investor',
              'Student'
            ].map((role) => (
              <button
                key={role}
                onClick={() => selectRole(role)}
                className="text-left px-3 py-2 bg-gray-100 hover:bg-purple-100 hover:text-purple-700 rounded-lg text-sm transition-colors duration-300"
              >
                {role}
              </button>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
};

export default AIRoleInput;