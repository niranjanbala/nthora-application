import React, { useState, useEffect } from 'react';
import { Plus, Star, Activity, Settings, Trash2, CheckCircle } from 'lucide-react';
import { getUserExpertise, updateUserExpertise, type UserExpertise } from '../../services/questionRoutingService';

const ExpertiseManager: React.FC = () => {
  const [expertise, setExpertise] = useState<UserExpertise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpertise, setNewExpertise] = useState('');
  const [editingExpertise, setEditingExpertise] = useState<string | null>(null);
  const [availabilitySettings, setAvailabilitySettings] = useState<Record<string, { available: boolean; maxQuestions: number }>>({});

  useEffect(() => {
    loadExpertise();
  }, []);

  const loadExpertise = async () => {
    setLoading(true);
    try {
      const data = await getUserExpertise();
      setExpertise(data);
      
      // Initialize availability settings
      const settings: Record<string, { available: boolean; maxQuestions: number }> = {};
      data.forEach(exp => {
        settings[exp.expertise_tag] = {
          available: exp.is_available,
          maxQuestions: exp.max_questions_per_week
        };
      });
      setAvailabilitySettings(settings);
    } catch (error) {
      console.error('Error loading expertise:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpertise = async () => {
    if (!newExpertise.trim()) return;

    try {
      await updateUserExpertise(newExpertise.trim());
      setNewExpertise('');
      setShowAddForm(false);
      await loadExpertise();
    } catch (error) {
      console.error('Error adding expertise:', error);
    }
  };

  const handleUpdateAvailability = async (expertiseTag: string, available: boolean, maxQuestions: number) => {
    try {
      await updateUserExpertise(expertiseTag, available, maxQuestions);
      setAvailabilitySettings(prev => ({
        ...prev,
        [expertiseTag]: { available, maxQuestions }
      }));
      await loadExpertise();
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return 'Expert';
    if (score >= 0.6) return 'Experienced';
    if (score >= 0.4) return 'Intermediate';
    return 'Beginner';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Your Expertise</h3>
          <p className="text-gray-600">Manage your areas of expertise and availability</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-300"
        >
          <Plus className="h-4 w-4" />
          <span>Add Expertise</span>
        </button>
      </div>

      {/* Add Expertise Form */}
      {showAddForm && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Add New Expertise</h4>
          <div className="flex space-x-3">
            <input
              type="text"
              value={newExpertise}
              onChange={(e) => setNewExpertise(e.target.value)}
              placeholder="e.g., Product Management, AI/ML, Marketing"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleAddExpertise()}
            />
            <button
              onClick={handleAddExpertise}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-300"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewExpertise('');
              }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Expertise List */}
      {expertise.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No expertise areas added yet</p>
          <p className="text-sm">Add your first area of expertise to start receiving relevant questions</p>
        </div>
      ) : (
        <div className="space-y-4">
          {expertise.map((exp) => (
            <div
              key={exp.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{exp.expertise_tag}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(exp.confidence_score)}`}>
                      {getConfidenceLabel(exp.confidence_score)}
                    </span>
                    {exp.is_available ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="h-4 w-4 rounded-full bg-gray-300"></div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Activity className="h-4 w-4" />
                      <span>{exp.questions_answered} answered</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4" />
                      <span>{exp.helpful_responses} helpful</span>
                    </div>
                    <div>
                      <span>Response rate: {Math.round(exp.response_rate * 100)}%</span>
                    </div>
                    <div>
                      <span>This week: {exp.current_week_count}/{exp.max_questions_per_week}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setEditingExpertise(editingExpertise === exp.id ? null : exp.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>

              {/* Availability Settings */}
              {editingExpertise === exp.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={availabilitySettings[exp.expertise_tag]?.available ?? exp.is_available}
                          onChange={(e) => {
                            const newSettings = {
                              ...availabilitySettings,
                              [exp.expertise_tag]: {
                                ...availabilitySettings[exp.expertise_tag],
                                available: e.target.checked
                              }
                            };
                            setAvailabilitySettings(newSettings);
                          }}
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Available for questions
                        </span>
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
                        value={availabilitySettings[exp.expertise_tag]?.maxQuestions ?? exp.max_questions_per_week}
                        onChange={(e) => {
                          const newSettings = {
                            ...availabilitySettings,
                            [exp.expertise_tag]: {
                              ...availabilitySettings[exp.expertise_tag],
                              maxQuestions: parseInt(e.target.value)
                            }
                          };
                          setAvailabilitySettings(newSettings);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={() => {
                        const settings = availabilitySettings[exp.expertise_tag];
                        handleUpdateAvailability(
                          exp.expertise_tag,
                          settings?.available ?? exp.is_available,
                          settings?.maxQuestions ?? exp.max_questions_per_week
                        );
                        setEditingExpertise(null);
                      }}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-300"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingExpertise(null)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpertiseManager;