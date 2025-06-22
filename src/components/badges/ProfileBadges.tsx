import React from 'react';
import { Trophy } from 'lucide-react';
import { BadgeService } from '../../services/badgeService';
import BadgeDisplay from './BadgeDisplay';

interface ProfileBadgesProps {
  userId?: string;
  limit?: number;
  showTotal?: boolean;
  onViewAll?: () => void;
}

const ProfileBadges: React.FC<ProfileBadgesProps> = ({
  userId,
  limit = 5,
  showTotal = true,
  onViewAll
}) => {
  // In a real implementation, you would fetch badges for the specific user
  const userBadges = BadgeService.getUserBadges().filter(b => b.earnedAt);
  const displayBadges = userBadges.slice(0, limit);
  const totalBadges = userBadges.length;

  if (totalBadges === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <Trophy className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No badges earned yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 flex items-center">
          <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
          Badges
          {showTotal && <span className="text-gray-500 ml-2">({totalBadges})</span>}
        </h4>
        {onViewAll && totalBadges > limit && (
          <button
            onClick={onViewAll}
            className="text-sm text-purple-600 hover:text-purple-700"
          >
            View All
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {displayBadges.map((badge) => (
          <BadgeDisplay
            key={badge.id}
            badge={badge}
            size="small"
          />
        ))}
        {totalBadges > limit && (
          <div 
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors duration-300"
            onClick={onViewAll}
          >
            +{totalBadges - limit}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileBadges;