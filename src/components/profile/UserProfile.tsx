import React, { useState, useEffect } from 'react';
import { User, Mail, MapPin, Calendar, Edit, Settings, Trophy, Users, Star, MessageSquare, Sparkles, Zap, Network } from 'lucide-react';
import { BadgeService } from '../../services/badgeService';
import ProfileBadges from '../badges/ProfileBadges';
import BadgeShowcase from '../badges/BadgeShowcase';
import BadgeDisplay from "../badges/BadgeDisplay";
import NetworkDepthBadges from '../badges/NetworkDepthBadges';
import { getUserProfile } from '../../services/authService';
import { getUserExpertise } from '../../services/questionRoutingService';
import { getAutoDetectedSkills, getNetworkActivityFeed } from '../../services/networkService';

interface UserProfileProps {
  userId?: string;
  isOwnProfile?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  isOwnProfile = true
}) => {
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userExpertise, setUserExpertise] = useState<any[]>([]);
  const [autoDetectedSkills, setAutoDetectedSkills] = useState<any[]>([]);
  const [networkActivity, setNetworkActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Load user profile
      const profile = await getUserProfile(userId);
      setUserProfile(profile);

      // Load user expertise
      const expertise = await getUserExpertise(userId);
      setUserExpertise(expertise);

      // Load auto-detected skills
      const skills = await getAutoDetectedSkills();
      setAutoDetectedSkills(skills);

      // Load network activity
      const activity = await getNetworkActivityFeed(2, 10);
      setNetworkActivity(activity);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Mock user data as fallback if API calls fail
  const user = userProfile || {
    id: userId || 'current-user',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    location: 'San Francisco, CA',
    joinedDate: '2024-01-15',
    bio: 'Product leader with 8+ years experience in SaaS and fintech. Passionate about building user-centric products that solve real problems.',
    role: 'Product Manager',
    company: 'TechCorp',
    avatarUrl: null,
    expertise: ['Product Strategy', 'User Research', 'Growth', 'SaaS'],
    stats: {
      questionsAsked: 12,
      questionsAnswered: 28,
      helpfulVotes: 45,
      networkSize: 156
    }
  };

  const userBadges = BadgeService.getUserBadges().filter(b => b.earnedAt);
  const badgeStats = BadgeService.getUserBadgeStats();
  const networkDepthBadges = BadgeService.getNetworkDepthBadges();

  // Process network activity data for summary
  const networkActivitySummary = {
    totalQuestions: networkActivity.filter(a => a.activity_type === 'question').length,
    totalAnswers: networkActivity.filter(a => a.activity_type === 'response').length,
    uniqueContributors: new Set(networkActivity.map(a => a.user_id)).size,
    topTags: getTopTags(networkActivity),
    recentActivity: networkActivity.slice(0, 3)
  };

  // Helper function to extract top tags from network activity
  function getTopTags(activities: any[]) {
    const tagCounts: Record<string, number> = {};
    
    activities.forEach(activity => {
      if (activity.tags && activity.tags.length) {
        activity.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
  }

  // Get confidence color for auto-detected skills
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    if (confidence >= 0.4) return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  };

  // Get confidence label for auto-detected skills
  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    if (confidence >= 0.4) return 'Low';
    return 'Very Low';
  };

  // Get additional roles from onboarding details
  const getAdditionalRoles = () => {
    if (userProfile?.onboarding_details?.additionalRoles) {
      return userProfile.onboarding_details.additionalRoles;
    }
    return [];
  };

  // Get primary role from onboarding details or fallback to role
  const getPrimaryRole = () => {
    if (userProfile?.onboarding_details?.primaryRole) {
      return userProfile.onboarding_details.primaryRole;
    }
    return userProfile?.role || user.role;
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {userProfile?.full_name ? userProfile.full_name.charAt(0) : user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{userProfile?.full_name || user.name}</h1>
              <p className="text-gray-600">{getPrimaryRole()} {userProfile?.company || user.company ? `at ${userProfile?.company || user.company}` : ''}</p>
              
              {/* Additional Roles */}
              {getAdditionalRoles().length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Also: {getAdditionalRoles().join(', ')}
                </p>
              )}
              
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(userProfile?.created_at || user.joinedDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          {isOwnProfile && (
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors duration-300">
              <Edit className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed">{userProfile?.bio || user.bio}</p>
        </div>

        {/* Expertise Tags */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Expertise</h3>
          <div className="flex flex-wrap gap-2">
            {(userProfile?.expertise_areas || userExpertise.map(e => e.expertise_tag) || user.expertise).map((skill: string, index: number) => (
              <span
                key={index}
                className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="text-lg font-bold text-gray-900">{user.stats.questionsAsked}</span>
            </div>
            <div className="text-xs text-gray-600">Questions Asked</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <MessageSquare className="h-4 w-4 text-purple-600" />
              <span className="text-lg font-bold text-gray-900">{user.stats.questionsAnswered}</span>
            </div>
            <div className="text-xs text-gray-600">Answers Given</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-lg font-bold text-gray-900">{user.stats.helpfulVotes}</span>
            </div>
            <div className="text-xs text-gray-600">Helpful Votes</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-lg font-bold text-gray-900">{user.stats.networkSize}</span>
            </div>
            <div className="text-xs text-gray-600">Network Size</div>
          </div>
        </div>
      </div>

      {/* Auto-Detected Skills Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Auto-Detected Skills</h2>
            <p className="text-gray-600">Skills inferred from your high-quality answers</p>
          </div>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <span className="font-bold text-gray-900">{autoDetectedSkills.filter(s => !s.is_user_added).length}</span>
            <span className="text-gray-600">detected</span>
          </div>
        </div>

        {autoDetectedSkills.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No auto-detected skills yet</p>
            <p className="text-sm">Start answering questions to build your skill profile</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {autoDetectedSkills.slice(0, 6).map((skill) => (
              <div
                key={skill.skill}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{skill.skill}</h3>
                  {!skill.is_user_added && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(skill.confidence)}`}>
                      {getConfidenceLabel(skill.confidence)}
                    </span>
                  )}
                </div>
                
                {!skill.is_user_added && (
                  <>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <MessageSquare className="h-3 w-3" />
                      <span>{skill.questions_answered} answers</span>
                      <ThumbsUp className="h-3 w-3 ml-2" />
                      <span>{skill.helpful_votes} helpful</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-purple-600 h-1.5 rounded-full"
                        style={{ width: `${skill.confidence * 100}%` }}
                      ></div>
                    </div>
                  </>
                )}
                
                {skill.is_user_added && (
                  <div className="flex items-center space-x-1 text-sm text-blue-600">
                    <User className="h-3 w-3" />
                    <span>User added</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {autoDetectedSkills.length > 6 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => window.location.href = '/dashboard?view=auto_skills'}
              className="text-purple-600 hover:text-purple-700 font-medium text-sm"
            >
              View all {autoDetectedSkills.length} skills
            </button>
          </div>
        )}
      </div>

      {/* Network Activity Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Network Activity</h2>
            <p className="text-gray-600">Recent activity from your extended network</p>
          </div>
          <div className="flex items-center space-x-2">
            <Network className="h-5 w-5 text-purple-600" />
            <span className="font-bold text-gray-900">{networkActivitySummary.uniqueContributors}</span>
            <span className="text-gray-600">contributors</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="text-lg font-semibold text-purple-600 mb-1">{networkActivitySummary.totalQuestions}</div>
            <div className="text-sm text-gray-600">Questions</div>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
            <div className="text-lg font-semibold text-indigo-600 mb-1">{networkActivitySummary.totalAnswers}</div>
            <div className="text-sm text-gray-600">Answers</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-lg font-semibold text-blue-600 mb-1">{networkActivitySummary.topTags.length}</div>
            <div className="text-sm text-gray-600">Active Topics</div>
          </div>
        </div>

        {/* Top Tags */}
        {networkActivitySummary.topTags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Top Topics in Your Network</h3>
            <div className="flex flex-wrap gap-2">
              {networkActivitySummary.topTags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity Preview */}
        {networkActivitySummary.recentActivity.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Network Activity</h3>
            <div className="space-y-3">
              {networkActivitySummary.recentActivity.map((activity, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                      <User className="h-3 w-3 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{activity.user_name}</span>
                    <span className="text-xs text-gray-500">
                      {activity.activity_type === 'question' ? 'asked' : 'answered'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-1">{activity.title}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => window.location.href = '/dashboard?view=network_activity'}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                View all network activity
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Network Depth Badges Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Network Depth</h2>
            <p className="text-gray-600">Your network connection achievements</p>
          </div>
          <div className="flex items-center space-x-2">
            <Network className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-gray-900">{networkDepthBadges.filter(b => b.earnedAt).length}</span>
            <span className="text-gray-600">of {networkDepthBadges.length}</span>
          </div>
        </div>

        <NetworkDepthBadges 
          showProgress={true}
          onViewAll={() => setShowAllBadges(true)}
        />
      </div>

      {/* Badges Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Badges & Achievements</h2>
            <p className="text-gray-600">Showcase your expertise and contributions</p>
          </div>
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="font-bold text-gray-900">{badgeStats.totalBadges}</span>
            <span className="text-gray-600">badges</span>
          </div>
        </div>

        {showAllBadges ? (
          <>
            <BadgeShowcase userBadges={userBadges} showAll={true} />
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowAllBadges(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-300"
              >
                Show Less
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Badge Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border border-yellow-200">
                <h3 className="font-medium text-amber-900 mb-3 flex items-center">
                  <Trophy className="h-4 w-4 mr-2 text-amber-600" />
                  Rarest Badge
                </h3>
                {userBadges.filter(b => b.rarity === 'legendary' || b.rarity === 'epic').length > 0 ? (
                  <div className="flex items-center space-x-3">
                    <BadgeDisplay
                      badge={userBadges.find(b => b.rarity === 'legendary') || userBadges.find(b => b.rarity === 'epic') || userBadges[0]}
                      size="medium"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {userBadges.find(b => b.rarity === 'legendary')?.name || 
                         userBadges.find(b => b.rarity === 'epic')?.name || 
                         userBadges[0].name}
                      </div>
                      <div className="text-sm text-amber-700">
                        Only {Math.floor(Math.random() * 5) + 1}% of users have this
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2 text-amber-700">
                    No rare badges yet
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-3 flex items-center">
                  <Star className="h-4 w-4 mr-2 text-blue-600" />
                  Expertise Recognition
                </h3>
                {userBadges.filter(b => b.category === 'expertise').length > 0 ? (
                  <div className="flex items-center space-x-3">
                    <BadgeDisplay
                      badge={userBadges.find(b => b.category === 'expertise') || userBadges[0]}
                      size="medium"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {userBadges.find(b => b.category === 'expertise')?.name || userBadges[0].name}
                      </div>
                      <div className="text-sm text-blue-700">
                        {badgeStats.badgesByCategory.expertise} expertise badges earned
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2 text-blue-700">
                    No expertise badges yet
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <h3 className="font-medium text-green-900 mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-2 text-green-600" />
                  Community Impact
                </h3>
                {userBadges.filter(b => b.category === 'community').length > 0 ? (
                  <div className="flex items-center space-x-3">
                    <BadgeDisplay
                      badge={userBadges.find(b => b.category === 'community') || userBadges[0]}
                      size="medium"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {userBadges.find(b => b.category === 'community')?.name || userBadges[0].name}
                      </div>
                      <div className="text-sm text-green-700">
                        {badgeStats.badgesByCategory.community} community badges earned
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2 text-green-700">
                    No community badges yet
                  </div>
                )}
              </div>
            </div>

            {/* Recent Badges */}
            <ProfileBadges
              userId={user.id}
              limit={8}
              showTotal={true}
              onViewAll={() => setShowAllBadges(true)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;