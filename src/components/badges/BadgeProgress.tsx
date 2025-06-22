import React from 'react';
import { Trophy, Target, ArrowRight } from 'lucide-react';
import { Badge } from '../../types/badges';
import { BadgeService } from '../../services/badgeService';
import BadgeDisplay from './BadgeDisplay';

interface BadgeProgressProps {
  showRecentlyEarned?: boolean;
  showNextToEarn?: boolean;
  showRecommended?: boolean;
  onViewAllBadges?: () => void;
}

const BadgeProgress: React.FC<BadgeProgressProps> = ({
  showRecentlyEarned = true,
  showNextToEarn = true,
  showRecommended = true,
  onViewAllBadges
}) => {
  const recentlyEarned = BadgeService.getRecentlyEarnedBadges(3);
  const nextToEarn = BadgeService.getNextBadgesToEarn(3);
  const recommended = BadgeService.getRecommendedBadges(3);
  const stats = BadgeService.getUserBadgeStats();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Badge Progress</h3>
          <p className="text-gray-600">Track your achievements and expertise recognition</p>
        </div>
        <div className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span className="font-bold text-gray-900">{stats.totalBadges}</span>
          <span className="text-gray-600">badges</span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{stats.totalXP}</div>
          <div className="text-sm text-purple-700">Total XP</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{stats.badgesByRarity.rare + stats.badgesByRarity.epic + stats.badgesByRarity.legendary}</div>
          <div className="text-sm text-blue-700">Rare+ Badges</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-2xl font-bold text-green-600">{stats.badgesByCategory.expertise}</div>
          <div className="text-sm text-green-700">Expertise Badges</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">{stats.currentStreak}</div>
          <div className="text-sm text-orange-700">Day Streak</div>
        </div>
      </div>

      {/* Recently Earned */}
      {showRecentlyEarned && recentlyEarned.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
            Recently Earned
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentlyEarned.map((badge) => (
              <div key={badge.id} className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center space-x-3">
                  <BadgeDisplay badge={badge} size="medium" />
                  <div>
                    <div className="font-medium text-gray-900">{badge.name}</div>
                    <div className="text-sm text-gray-600">
                      {badge.earnedAt && new Date(badge.earnedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next to Earn */}
      {showNextToEarn && nextToEarn.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Target className="h-4 w-4 mr-2 text-blue-500" />
            Almost There
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {nextToEarn.map((badge) => (
              <div key={badge.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-3 mb-3">
                  <BadgeDisplay badge={badge} size="medium" />
                  <div>
                    <div className="font-medium text-gray-900">{badge.name}</div>
                    <div className="text-sm text-gray-600">{badge.description}</div>
                  </div>
                </div>
                {badge.progress && (
                  <div>
                    <div className="flex justify-between text-xs text-blue-700 mb-1">
                      <span>Progress</span>
                      <span>{badge.progress.current}/{badge.progress.target}</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${badge.progress.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended */}
      {showRecommended && recommended.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Target className="h-4 w-4 mr-2 text-purple-500" />
            Recommended for You
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommended.map((badge) => (
              <div key={badge.id} className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center space-x-3">
                  <BadgeDisplay badge={badge} size="medium" />
                  <div>
                    <div className="font-medium text-gray-900">{badge.name}</div>
                    <div className="text-sm text-gray-600">{badge.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View All Button */}
      {onViewAllBadges && (
        <button
          onClick={onViewAllBadges}
          className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors duration-300"
        >
          <span>View All Badges</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default BadgeProgress;