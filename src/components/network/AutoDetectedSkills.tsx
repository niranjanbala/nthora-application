import React, { useState, useEffect } from 'react';
import { Zap, Sparkles, CheckCircle, AlertTriangle, ThumbsUp, MessageSquare, X, Settings, Eye, EyeOff } from 'lucide-react';
import { getAutoDetectedSkills, removeAutoDetectedSkill, updateAutoDetectedSkill } from '../../services/networkService';

interface AutoDetectedSkillsProps {
  onSkillsUpdated?: () => void;
}

const AutoDetectedSkills: React.FC<AutoDetectedSkillsProps> = ({ onSkillsUpdated }) => {
  const [skills, setSkills] = useState<{
    skill: string;
    confidence: number;
    questions_answered: number;
    helpful_votes: number;
    is_user_added: boolean;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const [skillSettings, setSkillSettings] = useState<Record<string, { isAvailable: boolean; maxQuestions: number }>>({});

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAutoDetectedSkills();
      setSkills(data);
      
      // Initialize settings
      const settings: Record<string, { isAvailable: boolean; maxQuestions: number }> = {};
      data.forEach(skill => {
        settings[skill.skill] = {
          isAvailable: true,
          maxQuestions: 5
        };
      });
      setSkillSettings(settings);
    } catch (error) {
      console.error('Error loading auto-detected skills:', error);
      setError('Failed to load skills. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSkill = async (skill: string) => {
    try {
      const result = await removeAutoDetectedSkill(skill);
      if (result.success) {
        setSkills(skills.filter(s => s.skill !== skill));
        if (onSkillsUpdated) onSkillsUpdated();
      } else {
        setError(result.error || 'Failed to remove skill');
      }
    } catch (error) {
      console.error('Error removing skill:', error);
      setError('Failed to remove skill. Please try again.');
    }
  };

  const handleUpdateSkill = async (skill: string) => {
    const settings = skillSettings[skill];
    if (!settings) return;
    
    try {
      const result = await updateAutoDetectedSkill(
        skill,
        settings.isAvailable,
        settings.maxQuestions
      );
      
      if (result.success) {
        setEditingSkill(null);
        if (onSkillsUpdated) onSkillsUpdated();
      } else {
        setError(result.error || 'Failed to update skill');
      }
    } catch (error) {
      console.error('Error updating skill:', error);
      setError('Failed to update skill. Please try again.');
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    if (confidence >= 0.4) return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    if (confidence >= 0.4) return 'Low';
    return 'Very Low';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Auto-Detected Skills</h2>
          <p className="text-gray-600">Skills inferred from your high-quality answers</p>
        </div>
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <span className="font-bold text-gray-900">{skills.filter(s => !s.is_user_added).length} detected</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {skills.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No auto-detected skills yet</p>
          <p className="text-sm">Start answering questions to build your skill profile</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Auto-detected skills explanation */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <p className="text-purple-800 font-medium mb-1">How skills are auto-detected</p>
                <p className="text-sm text-purple-700">
                  N-th`ora analyzes the quality and helpfulness of your answers to automatically detect your areas of expertise.
                  Skills with higher confidence scores are more likely to be matched with relevant questions.
                  You can manage these skills below.
                </p>
              </div>
            </div>
          </div>

          {/* Skills list */}
          <div className="space-y-4">
            {skills.map((skill) => (
              <div
                key={skill.skill}
                className={`border rounded-lg p-4 transition-all duration-300 ${
                  editingSkill === skill.skill
                    ? 'border-purple-300 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{skill.skill}</h3>
                      {skill.is_user_added ? (
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          User Added
                        </span>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(skill.confidence)}`}>
                          {getConfidenceLabel(skill.confidence)} Confidence
                        </span>
                      )}
                    </div>
                    
                    {!skill.is_user_added && (
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{skill.questions_answered} questions answered</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{skill.helpful_votes} helpful votes</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!skill.is_user_added && (
                      <button
                        onClick={() => setEditingSkill(editingSkill === skill.skill ? null : skill.skill)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveSkill(skill.skill)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Skill settings (when editing) */}
                {editingSkill === skill.skill && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={skillSettings[skill.skill]?.isAvailable ?? true}
                            onChange={(e) => {
                              setSkillSettings(prev => ({
                                ...prev,
                                [skill.skill]: {
                                  ...prev[skill.skill],
                                  isAvailable: e.target.checked
                                }
                              }));
                            }}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Available for questions
                          </span>
                          {skillSettings[skill.skill]?.isAvailable ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-red-600" />
                          )}
                        </label>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max questions per week
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={skillSettings[skill.skill]?.maxQuestions ?? 5}
                          onChange={(e) => {
                            setSkillSettings(prev => ({
                              ...prev,
                              [skill.skill]: {
                                ...prev[skill.skill],
                                maxQuestions: parseInt(e.target.value)
                              }
                            }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 mt-4">
                      <button
                        onClick={() => handleUpdateSkill(skill.skill)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-300"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingSkill(null)}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Confidence bar for auto-detected skills */}
                {!skill.is_user_added && !editingSkill && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Confidence</span>
                      <span>{Math.round(skill.confidence * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-purple-600 h-1.5 rounded-full"
                        style={{ width: `${skill.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoDetectedSkills;