import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Clock, ThumbsUp, Tag, Users, Filter, Search, ArrowRight, ExternalLink } from 'lucide-react';
import { getNetworkActivityFeed, type NetworkActivity } from '../../services/networkService';
import { useNavigate } from 'react-router-dom';
import { getPreferences, UserPreferences } from '../../services/preferenceService';

interface NetworkActivityFeedProps {
  maxDegree?: number;
  limit?: number;
}

const NetworkActivityFeed: React.FC<NetworkActivityFeedProps> = ({
  maxDegree = 2,
  limit = 50
}) => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<NetworkActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'questions' | 'answers'>('all');
  const [filterDegree, setFilterDegree] = useState<number | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [effectiveMaxDegree, setEffectiveMaxDegree] = useState(maxDegree);

  useEffect(() => {
    loadUserPreferences();
  }, []);

  useEffect(() => {
    if (preferences?.networkFeed) {
      // Apply user preferences
      setFilterType(preferences.networkFeed.filterType || 'all');
      setFilterDegree(preferences.networkFeed.filterDegree);
      
      // Use preference maxDegree if available, otherwise use prop
      const prefMaxDegree = preferences.networkFeed.maxDegree;
      setEffectiveMaxDegree(prefMaxDegree || maxDegree);
    }
  }, [preferences, maxDegree]);

  useEffect(() => {
    loadNetworkActivity();
    
    // Set up auto-refresh if enabled in preferences
    if (preferences?.networkFeed?.autoRefresh && preferences.networkFeed.refreshInterval) {
      const interval = setInterval(() => {
        loadNetworkActivity(false); // Don't show loading state for auto-refresh
      }, preferences.networkFeed.refreshInterval * 60 * 1000); // Convert minutes to milliseconds
      
      return () => clearInterval(interval);
    }
  }, [effectiveMaxDegree, limit, preferences?.networkFeed?.autoRefresh, preferences?.networkFeed?.refreshInterval]);

  const loadUserPreferences = async () => {
    try {
      const userPreferences = await getPreferences();
      setPreferences(userPreferences);
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  const loadNetworkActivity = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await getNetworkActivityFeed(effectiveMaxDegree, limit);
      setActivities(data);
    } catch (error) {
      console.error('Error loading network activity:', error);
      setError('Failed to load network activity. Please try again.');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleActivityClick = (activity: NetworkActivity) => {
    if (activity.activity_type === 'question') {
      navigate(`/questions/${activity.activity_id}`);
    } else {
      // For responses, navigate to the question that contains the response
      navigate(`/questions/${activity.activity_id}`);
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

  const getNetworkDegreeLabel = (degree: number) => {
    switch (degree) {
      case 0: return 'You';
      case 1: return '1st degree';
      case 2: return '2nd degree';
      case 3: return '3rd degree';
      default: return `${degree}th degree`;
    }
  };

  const getNetworkDegreeColor = (degree: number) => {
    switch (degree) {
      case 0: return 'bg-purple-100 text-purple-700';
      case 1: return 'bg-green-100 text-green-700';
      case 2: return 'bg-blue-100 text-blue-700';
      case 3: return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Apply filters
  const filteredActivities = activities.filter(activity => {
    // Filter by search query
    const matchesSearch = 
      searchQuery === '' || 
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (activity.response_content && activity.response_content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      activity.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by activity type
    const matchesType = 
      filterType === 'all' || 
      (filterType === 'questions' && activity.activity_type === 'question') ||
      (filterType === 'answers' && activity.activity_type === 'response');
    
    // Filter by network degree
    const matchesDegree = 
      filterDegree === null || 
      activity.network_degree === filterDegree;
    
    // Filter by tags from preferences
    const matchesTags = 
      !preferences?.networkFeed?.showTags?.length || 
      activity.tags.some(tag => 
        preferences.networkFeed?.showTags?.some(showTag => 
          tag.toLowerCase().includes(showTag.toLowerCase()) || 
          showTag.toLowerCase().includes(tag.toLowerCase())
        )
      );
    
    // Filter out hidden tags from preferences
    const notHiddenTags = 
      !preferences?.networkFeed?.hideTags?.length || 
      !activity.tags.some(tag => 
        preferences.networkFeed?.hideTags?.some(hideTag => 
          tag.toLowerCase().includes(hideTag.toLowerCase()) || 
          hideTag.toLowerCase().includes(tag.toLowerCase())
        )
      );
    
    return matchesSearch && matchesType && matchesDegree && matchesTags && notHiddenTags;
  });

  // Sort activities based on preferences
  const sortedActivities = [...filteredActivities].sort((a, b) => {
    const sortOrder = preferences?.networkFeed?.sortOrder || 'newest';
    
    if (sortOrder === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortOrder === 'popular') {
      // Sort by a combination of responses and helpful votes
      const aPopularity = a.response_count * 2 + a.helpful_votes;
      const bPopularity = b.response_count * 2 + b.helpful_votes;
      return bPopularity - aPopularity;
    } else if (sortOrder === 'relevant') {
      // Sort by network degree (closer connections first)
      return a.network_degree - b.network_degree;
    }
    
    // Default to newest
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={loadNetworkActivity}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-300"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Network Activity Feed</h2>
            <p className="text-gray-600">Questions and answers from your extended network</p>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-600" />
            <span className="font-bold text-gray-900">Up to {getNetworkDegreeLabel(effectiveMaxDegree)}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search activity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'questions' | 'answers')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Activity</option>
              <option value="questions">Questions Only</option>
              <option value="answers">Answers Only</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <select
              value={filterDegree === null ? 'all' : filterDegree.toString()}
              onChange={(e) => setFilterDegree(e.target.value === 'all' ? null : parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Connections</option>
              <option value="1">1st Degree Only</option>
              <option value="2">2nd Degree Only</option>
              {effectiveMaxDegree >= 3 && <option value="3">3rd Degree Only</option>}
            </select>
          </div>
          
          <button
            onClick={() => navigate('/preferences')}
            className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 transition-colors duration-300"
          >
            <Settings className="h-4 w-4" />
            <span className="text-sm">More Settings</span>
          </button>
        </div>

        {/* Activity List */}
        {sortedActivities.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No network activity found</p>
            <p className="text-sm">Try expanding your network or adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedActivities.map((activity) => (
              <div
                key={`${activity.activity_type}-${activity.activity_id}`}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-300 cursor-pointer"
                onClick={() => handleActivityClick(activity)}
              >
                {/* Activity Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{activity.user_name}</div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNetworkDegreeColor(activity.network_degree)}`}>
                          {getNetworkDegreeLabel(activity.network_degree)}
                        </span>
                        <span>
                          {activity.activity_type === 'question' ? 'asked a question' : 'answered'}
                        </span>
                        <span>{formatDate(activity.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {activity.activity_type === 'response' && (
                    <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                      Answer
                    </div>
                  )}
                </div>

                {/* Question Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-purple-600 transition-colors duration-300">
                  {activity.title}
                </h3>

                {/* Question or Answer Content */}
                {activity.activity_type === 'question' ? (
                  <p className="text-gray-700 mb-4 line-clamp-3">{activity.content}</p>
                ) : (
                  <div className="mb-4">
                    <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-300 mb-2">
                      <p className="text-gray-600 italic line-clamp-2">{activity.content}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-300">
                      <p className="text-gray-700 line-clamp-3">{activity.response_content}</p>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {activity.tags && activity.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {activity.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                    {activity.tags.length > 3 && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        +{activity.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Activity Metadata */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{activity.response_count} responses</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{activity.helpful_votes} helpful</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(activity.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-purple-600">
                    <span>View details</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Network Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="text-lg font-semibold text-purple-600 mb-1">{sortedActivities.filter(a => a.activity_type === 'question').length}</div>
            <div className="text-sm text-gray-600">Questions in your network</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="text-lg font-semibold text-indigo-600 mb-1">{sortedActivities.filter(a => a.activity_type === 'response').length}</div>
            <div className="text-sm text-gray-600">Answers from your network</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="text-lg font-semibold text-blue-600 mb-1">
              {new Set(sortedActivities.map(a => a.user_id)).size}
            </div>
            <div className="text-sm text-gray-600">Active network members</div>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-purple-700">
          <p>
            Your network activity feed shows questions and answers from your connections up to {getNetworkDegreeLabel(effectiveMaxDegree)}.
            <button 
              onClick={() => navigate('/preferences')}
              className="ml-2 text-purple-600 hover:text-purple-800 underline"
            >
              Customize your feed settings
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NetworkActivityFeed;