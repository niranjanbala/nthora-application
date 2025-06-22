import React, { useState } from 'react';
import { Trophy, Users, Star, Filter, Search, Medal, Award } from 'lucide-react';
import { Badge, BadgeCategory } from '../../types/badges';
import BadgeDisplay from './BadgeDisplay';

interface LeaderboardUser {
  id: string;
  name: string;
  avatarUrl?: string;
  role: string;
  company?: string;
  badgeCount: number;
  rareBadgeCount: number;
  xp: number;
  topBadges: Badge[];
  rank: number;
}

interface BadgeLeaderboardProps {
  timeframe?: 'weekly' | 'monthly' | 'all-time';
  category?: BadgeCategory | 'all';
  limit?: number;
}

const BadgeLeaderboard: React.FC<BadgeLeaderboardProps> = ({
  timeframe = 'monthly',
  category = 'all',
  limit = 10
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'weekly' | 'monthly' | 'all-time'>(timeframe);
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>(category);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock leaderboard data - in production would fetch from API
  const mockLeaderboardData: LeaderboardUser[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      role: 'Product Manager',
      company: 'TechCorp',
      badgeCount: 28,
      rareBadgeCount: 5,
      xp: 4250,
      topBadges: [
        { id: 'domain-expert', name: 'Domain Expert', description: 'Answered 25 questions in a single expertise area', icon: '🏆', category: 'expertise', tier: 'gold', rarity: 'rare', requirements: [], rewards: [], isActive: true, earnedAt: '2024-02-15' },
        { id: 'lightning-responder', name: 'Lightning Responder', description: 'Average response time under 1 hour', icon: '⚡', category: 'expertise', tier: 'platinum', rarity: 'epic', requirements: [], rewards: [], isActive: true, earnedAt: '2024-03-10' }
      ],
      rank: 1
    },
    {
      id: '2',
      name: 'Marcus Rodriguez',
      role: 'Software Engineer',
      company: 'CodeLabs',
      badgeCount: 24,
      rareBadgeCount: 3,
      xp: 3800,
      topBadges: [
        { id: 'quality-contributor', name: 'Quality Contributor', description: 'Maintain 90%+ quality score across 20 answers', icon: '⭐', category: 'quality', tier: 'gold', rarity: 'rare', requirements: [], rewards: [], isActive: true, earnedAt: '2024-02-20' }
      ],
      rank: 2
    },
    {
      id: '3',
      name: 'Emily Watson',
      role: 'Data Scientist',
      company: 'AI Solutions',
      badgeCount: 22,
      rareBadgeCount: 4,
      xp: 3650,
      topBadges: [
        { id: 'early-adopter', name: 'Early Adopter', description: 'Joined N-th`ora in the first 1000 users', icon: '🚀', category: 'achievement', tier: 'platinum', rarity: 'epic', requirements: [], rewards: [], isActive: true, earnedAt: '2024-01-05' }
      ],
      rank: 3
    },
    {
      id: '4',
      name: 'Alex Kim',
      role: 'UX/UI Designer',
      company: 'DesignHub',
      badgeCount: 19,
      rareBadgeCount: 2,
      xp: 3200,
      topBadges: [
        { id: 'network-builder', name: 'Network Builder', description: 'Invited 5 people to join N-th`ora', icon: '🌐', category: 'community', tier: 'silver', rarity: 'uncommon', requirements: [], rewards: [], isActive: true, earnedAt: '2024-02-10' }
      ],
      rank: 4
    },
    {
      id: '5',
      name: 'Jordan Taylor',
      role: 'Marketing Director',
      company: 'GrowthCo',
      badgeCount: 17,
      rareBadgeCount: 1,
      xp: 2950,
      topBadges: [
        { id: 'connector', name: 'The Connector', description: 'Facilitated 10 successful introductions', icon: '🤝', category: 'community', tier: 'gold', rarity: 'rare', requirements: [], rewards: [], isActive: true, earnedAt: '2024-03-05' }
      ],
      rank: 5
    }
  ];

  const filteredUsers = mockLeaderboardData.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.company && user.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getTimeframeLabel = (timeframe: string) => {
    switch (timeframe) {
      case 'weekly': return 'This Week';
      case 'monthly': return 'This Month';
      case 'all-time': return 'All Time';
      default: return 'This Month';
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-gray-400';
      case 3: return 'text-amber-600';
      default: return 'text-gray-700';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return rank;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Badge Leaderboard</h2>
          <p className="text-gray-600">Top experts and contributors in the community</p>
        </div>
        <div className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span className="font-bold text-gray-900">{getTimeframeLabel(selectedTimeframe)}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <select
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value as 'weekly' | 'monthly' | 'all-time')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="weekly">This Week</option>
          <option value="monthly">This Month</option>
          <option value="all-time">All Time</option>
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as BadgeCategory | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          <option value="expertise">Expertise Badges</option>
          <option value="community">Community Badges</option>
          <option value="quality">Quality Badges</option>
          <option value="network">Network Badges</option>
          <option value="achievement">Achievement Badges</option>
        </select>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Rank</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">User</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Top Badges</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">
                <div className="flex items-center justify-center space-x-1">
                  <Trophy className="h-4 w-4" />
                  <span>Badges</span>
                </div>
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">
                <div className="flex items-center justify-center space-x-1">
                  <Star className="h-4 w-4" />
                  <span>Rare</span>
                </div>
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">
                <div className="flex items-center justify-center space-x-1">
                  <Award className="h-4 w-4" />
                  <span>XP</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                <td className="px-4 py-4">
                  <div className={`text-xl font-bold ${getRankColor(user.rank)}`}>
                    {getRankIcon(user.rank)}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.role}{user.company ? ` at ${user.company}` : ''}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex space-x-1">
                    {user.topBadges.map((badge, index) => (
                      <BadgeDisplay
                        key={index}
                        badge={badge}
                        size="small"
                      />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="font-semibold text-gray-900">{user.badgeCount}</div>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="font-semibold text-purple-600">{user.rareBadgeCount}</div>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="font-semibold text-yellow-600">{user.xp.toLocaleString()}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No users found matching your search</p>
        </div>
      )}

      {/* Your Rank */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
              S
            </div>
            <div>
              <div className="text-sm text-purple-700">Your Rank</div>
              <div className="font-semibold text-gray-900">1st Place</div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-sm text-purple-700">Badges</div>
              <div className="font-semibold text-gray-900">28</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-purple-700">XP</div>
              <div className="font-semibold text-gray-900">4,250</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeLeaderboard;