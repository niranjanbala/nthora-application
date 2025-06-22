import React, { useState } from 'react';
import { User, Mail, MapPin, Calendar, Edit, Settings, Trophy, Users, Star, MessageSquare } from 'lucide-react';
import { BadgeService } from '../../services/badgeService';
import ProfileBadges from '../badges/ProfileBadges';
import BadgeShowcase from '../badges/BadgeShowcase';
import BadgeDisplay from "../badges/BadgeDisplay";
import NetworkDepthBadges from '../badges/NetworkDepthBadges';

interface UserProfileProps {
  userId?: string;
  isOwnProfile?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  isOwnProfile = true
}) => {
  const [showAllBadges, setShowAllBadges] = useState(false);
  
  // Mock user data - in production would fetch from API
  const user = {
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

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">{user.role} at {user.company}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(user.joinedDate).toLocaleDateString()}</span>
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
          <p className="text-gray-700 leading-relaxed">{user.bio}</p>
        </div>

        {/* Expertise Tags */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Expertise</h3>
          <div className="flex flex-wrap gap-2">
            {user.expertise.map((skill, index) => (
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