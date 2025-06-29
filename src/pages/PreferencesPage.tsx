import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Network, 
  Bell, 
  Lock, 
  Star, 
  Save, 
  CheckCircle, 
  AlertCircle,
  Users,
  Filter,
  Clock,
  Tag,
  Eye,
  EyeOff,
  RefreshCw,
  Mail,
  MessageSquare,
  AtSign,
  Activity,
  UserPlus,
  User,
  Shield
} from 'lucide-react';
import { getPreferences, updatePreferences, UserPreferences, DEFAULT_PREFERENCES } from '../services/preferenceService';

const PreferencesPage: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'network' | 'notifications' | 'privacy' | 'expertise'>('network');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const userPreferences = await getPreferences();
      setPreferences(userPreferences);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    setSaveStatus('idle');
    setSaveMessage('');

    try {
      const result = await updatePreferences(preferences);
      
      if (result.success) {
        setSaveStatus('success');
        setSaveMessage('Preferences saved successfully');
      } else {
        setSaveStatus('error');
        setSaveMessage(result.error || 'Failed to save preferences');
      }
    } catch (error) {
      setSaveStatus('error');
      setSaveMessage('An unexpected error occurred');
    } finally {
      setSaving(false);
      
      // Clear status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveMessage('');
      }, 3000);
    }
  };

  const updateNetworkPreference = (key: keyof NonNullable<UserPreferences['networkFeed']>, value: any) => {
    setPreferences(prev => ({
      ...prev,
      networkFeed: {
        ...prev.networkFeed,
        [key]: value
      }
    }));
  };

  const updateNotificationPreference = (key: keyof NonNullable<UserPreferences['notifications']>, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const updatePrivacyPreference = (key: keyof NonNullable<UserPreferences['privacy']>, value: any) => {
    setPreferences(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  };

  const updateExpertisePreference = (key: keyof NonNullable<UserPreferences['expertise']>, value: any) => {
    setPreferences(prev => ({
      ...prev,
      expertise: {
        ...prev.expertise,
        [key]: value
      }
    }));
  };

  const renderNetworkTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Network className="h-5 w-5 mr-2 text-purple-600" />
          Network Feed Settings
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Network Degree
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Control how far your network extends for the activity feed
            </p>
            <select
              value={preferences.networkFeed?.maxDegree || 2}
              onChange={(e) => updateNetworkPreference('maxDegree', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value={1}>1st Degree Only (Direct Connections)</option>
              <option value={2}>2nd Degree (Friends of Friends)</option>
              <option value={3}>3rd Degree (Extended Network)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Content Filter
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Choose what type of content to show by default
            </p>
            <select
              value={preferences.networkFeed?.filterType || 'all'}
              onChange={(e) => updateNetworkPreference('filterType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Activity</option>
              <option value="questions">Questions Only</option>
              <option value="answers">Answers Only</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Sort Order
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Choose how content is sorted in your feed
            </p>
            <select
              value={preferences.networkFeed?.sortOrder || 'newest'}
              onChange={(e) => updateNetworkPreference('sortOrder', e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="relevant">Most Relevant</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={preferences.networkFeed?.autoRefresh || false}
              onChange={(e) => updateNetworkPreference('autoRefresh', e.target.checked)}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <div>
              <label htmlFor="autoRefresh" className="text-sm font-medium text-gray-700">
                Auto-refresh feed
              </label>
              <p className="text-xs text-gray-500">
                Automatically check for new content
              </p>
            </div>
          </div>
          
          {preferences.networkFeed?.autoRefresh && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refresh Interval (minutes)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={preferences.networkFeed?.refreshInterval || 5}
                onChange={(e) => updateNetworkPreference('refreshInterval', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Tag className="h-5 w-5 mr-2 text-purple-600" />
          Content Filtering
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Always Show Tags
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Content with these tags will always be shown in your feed
            </p>
            <div className="flex flex-wrap gap-2 mb-2">
              {(preferences.networkFeed?.showTags || []).map((tag, index) => (
                <div key={index} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center">
                  <span>{tag}</span>
                  <button
                    onClick={() => {
                      const newShowTags = [...(preferences.networkFeed?.showTags || [])];
                      newShowTags.splice(index, 1);
                      updateNetworkPreference('showTags', newShowTags);
                    }}
                    className="ml-2 text-purple-500 hover:text-purple-700"
                  >
                    ×
                  </button>
                </div>
              ))}
              {(preferences.networkFeed?.showTags || []).length === 0 && (
                <div className="text-sm text-gray-500 italic">No tags added</div>
              )}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add a tag..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    const tag = input.value.trim();
                    if (tag && !(preferences.networkFeed?.showTags || []).includes(tag)) {
                      updateNetworkPreference('showTags', [...(preferences.networkFeed?.showTags || []), tag]);
                      input.value = '';
                    }
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                  const tag = input.value.trim();
                  if (tag && !(preferences.networkFeed?.showTags || []).includes(tag)) {
                    updateNetworkPreference('showTags', [...(preferences.networkFeed?.showTags || []), tag]);
                    input.value = '';
                  }
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-300"
              >
                Add
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hide Tags
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Content with these tags will be hidden from your feed
            </p>
            <div className="flex flex-wrap gap-2 mb-2">
              {(preferences.networkFeed?.hideTags || []).map((tag, index) => (
                <div key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center">
                  <span>{tag}</span>
                  <button
                    onClick={() => {
                      const newHideTags = [...(preferences.networkFeed?.hideTags || [])];
                      newHideTags.splice(index, 1);
                      updateNetworkPreference('hideTags', newHideTags);
                    }}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
              ))}
              {(preferences.networkFeed?.hideTags || []).length === 0 && (
                <div className="text-sm text-gray-500 italic">No tags added</div>
              )}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add a tag..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    const tag = input.value.trim();
                    if (tag && !(preferences.networkFeed?.hideTags || []).includes(tag)) {
                      updateNetworkPreference('hideTags', [...(preferences.networkFeed?.hideTags || []), tag]);
                      input.value = '';
                    }
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                  const tag = input.value.trim();
                  if (tag && !(preferences.networkFeed?.hideTags || []).includes(tag)) {
                    updateNetworkPreference('hideTags', [...(preferences.networkFeed?.hideTags || []), tag]);
                    input.value = '';
                  }
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-300"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Bell className="h-5 w-5 mr-2 text-purple-600" />
          Notification Channels
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">Email Notifications</div>
                <div className="text-sm text-gray-500">Receive updates via email</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={preferences.notifications?.email || false}
                onChange={(e) => updateNotificationPreference('email', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">Push Notifications</div>
                <div className="text-sm text-gray-500">Receive in-app notifications</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={preferences.notifications?.push || false}
                onChange={(e) => updateNotificationPreference('push', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-purple-600" />
          Notification Types
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">Question Matches</div>
                <div className="text-sm text-gray-500">When questions match your expertise</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={preferences.notifications?.questionMatches || false}
                onChange={(e) => updateNotificationPreference('questionMatches', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-5 w-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">Responses</div>
                <div className="text-sm text-gray-500">When someone responds to your questions</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={preferences.notifications?.responses || false}
                onChange={(e) => updateNotificationPreference('responses', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <AtSign className="h-5 w-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">Mentions</div>
                <div className="text-sm text-gray-500">When you're mentioned in a question or response</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={preferences.notifications?.mentions || false}
                onChange={(e) => updateNotificationPreference('mentions', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Activity className="h-5 w-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">Network Activity</div>
                <div className="text-sm text-gray-500">Updates from your extended network</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={preferences.notifications?.networkActivity || false}
                onChange={(e) => updateNotificationPreference('networkActivity', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Lock className="h-5 w-5 mr-2 text-purple-600" />
          Default Privacy Settings
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Question Visibility
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Who can see your questions by default
            </p>
            <select
              value={preferences.privacy?.defaultVisibility || 'first_degree'}
              onChange={(e) => updatePrivacyPreference('defaultVisibility', e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="first_degree">1st Degree Only (Direct Connections)</option>
              <option value="second_degree">2nd Degree (Friends of Friends)</option>
              <option value="third_degree">3rd Degree (Extended Network)</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="defaultAnonymous"
              checked={preferences.privacy?.defaultAnonymous || false}
              onChange={(e) => updatePrivacyPreference('defaultAnonymous', e.target.checked)}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <div>
              <label htmlFor="defaultAnonymous" className="text-sm font-medium text-gray-700">
                Ask questions anonymously by default
              </label>
              <p className="text-xs text-gray-500">
                Your identity will be hidden from other users
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <User className="h-5 w-5 mr-2 text-purple-600" />
          Profile Privacy
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Who can view your profile
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Control who can see your profile information
            </p>
            <select
              value={preferences.privacy?.allowProfileView || 'everyone'}
              onChange={(e) => updatePrivacyPreference('allowProfileView', e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="everyone">Everyone</option>
              <option value="connections">Connections Only</option>
              <option value="nobody">Nobody</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium text-purple-900 mb-2">Privacy Commitment</h3>
            <p className="text-sm text-purple-700">
              N-th`ora is built on a foundation of trust and privacy. Your data is never sold or shared with third parties. 
              We use your preferences only to enhance your experience and connect you with relevant expertise.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderExpertiseTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Star className="h-5 w-5 mr-2 text-purple-600" />
          Expertise Settings
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Maximum Questions Per Week
            </label>
            <p className="text-sm text-gray-500 mb-2">
              The default limit for how many questions you'll receive per expertise area each week
            </p>
            <input
              type="number"
              min={1}
              max={50}
              value={preferences.expertise?.defaultMaxQuestionsPerWeek || 10}
              onChange={(e) => updateExpertisePreference('defaultMaxQuestionsPerWeek', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoDetectSkills"
              checked={preferences.expertise?.autoDetectSkills || false}
              onChange={(e) => updateExpertisePreference('autoDetectSkills', e.target.checked)}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <div>
              <label htmlFor="autoDetectSkills" className="text-sm font-medium text-gray-700">
                Auto-detect skills from my answers
              </label>
              <p className="text-xs text-gray-500">
                Allow N-th`ora to analyze your answers and suggest new expertise areas
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showConfidenceScores"
              checked={preferences.expertise?.showConfidenceScores || false}
              onChange={(e) => updateExpertisePreference('showConfidenceScores', e.target.checked)}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <div>
              <label htmlFor="showConfidenceScores" className="text-sm font-medium text-gray-700">
                Show confidence scores
              </label>
              <p className="text-xs text-gray-500">
                Display confidence scores for your expertise areas
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <UserPlus className="h-5 w-5 mr-2 text-purple-600" />
          Expertise Matching
        </h3>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            N-th`ora uses your expertise settings to match you with relevant questions. 
            You can manage individual expertise areas from the "My Expertise" page.
          </p>
          
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Pro Tip</span>
              </div>
            </div>
            <p className="text-sm text-purple-700 mt-1">
              For more granular control over your expertise areas, including availability and question limits,
              visit the "My Expertise" page from the dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'network':
        return renderNetworkTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'privacy':
        return renderPrivacyTab();
      case 'expertise':
        return renderExpertiseTab();
      default:
        return renderNetworkTab();
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Preferences</h1>
          <p className="text-gray-600">Customize your N-th`ora experience</p>
        </div>
        
        <button
          onClick={handleSavePreferences}
          disabled={saving}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors duration-300"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : saveStatus === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : saveStatus === 'error' ? (
            <AlertCircle className="h-5 w-5" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          <span>
            {saving ? 'Saving...' : 
             saveStatus === 'success' ? 'Saved!' : 
             saveStatus === 'error' ? 'Error!' : 
             'Save Preferences'}
          </span>
        </button>
      </div>

      {saveStatus === 'error' && saveMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>{saveMessage}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('network')}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium ${
              activeTab === 'network'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Network className="h-5 w-5" />
            <span>Network Feed</span>
          </button>
          
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium ${
              activeTab === 'notifications'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </button>
          
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium ${
              activeTab === 'privacy'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Lock className="h-5 w-5" />
            <span>Privacy</span>
          </button>
          
          <button
            onClick={() => setActiveTab('expertise')}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium ${
              activeTab === 'expertise'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Star className="h-5 w-5" />
            <span>Expertise</span>
          </button>
        </div>
        
        <div className="p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderActiveTab()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesPage;