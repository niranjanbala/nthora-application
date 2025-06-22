import React from 'react';
import { Badge } from '../../types/badges';
import BadgeDisplay from '../badges/BadgeDisplay';
import { Users, Lock, Unlock, ArrowRight } from 'lucide-react';

interface NetworkBadgeCardProps {
  badge: Badge;
  showDetails?: boolean;
  onClick?: () => void;
}

const NetworkBadgeCard: React.FC<NetworkBadgeCardProps> = ({
  badge,
  showDetails = false,
  onClick
}) => {
  const isUnlocked = !!badge.earnedAt;

  const getBadgeColor = () => {
    if (!isUnlocked) return 'bg-gray-50 border-gray-200';
    
    switch (badge.tier) {
      case 'bronze': return 'bg-amber-50 border-amber-200';
      case 'silver': return 'bg-gray-50 border-gray-300';
      case 'gold': return 'bg-yellow-50 border-yellow-200';
      case 'platinum': return 'bg-indigo-50 border-indigo-200';
      case 'diamond': return 'bg-blue-50 border-blue-200';
      default: return 'bg-purple-50 border-purple-200';
    }
  };

  const getXpReward = () => {
    const xpReward = badge.rewards.find(r => r.type === 'xp_bonus');
    return xpReward ? xpReward.value : 0;
  };

  return (
    <div 
      className={`rounded-lg p-4 border ${getBadgeColor()} transition-all duration-300 hover:shadow-md cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3 mb-3">
        <BadgeDisplay badge={badge} size="medium" showProgress={!isUnlocked} />
        <div>
          <h4 className="font-medium text-gray-900">{badge.name}</h4>
          <p className="text-sm text-gray-600">{badge.description}</p>
        </div>
      </div>

      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          {isUnlocked ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-green-600">
                <Unlock className="h-4 w-4" />
                <span className="text-sm font-medium">Unlocked</span>
              </div>
              <div className="text-sm font-medium text-yellow-600">+{getXpReward()} XP</div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-gray-600">
                <Lock className="h-4 w-4" />
                <span className="text-sm font-medium">Locked</span>
              </div>
              {badge.progress && (
                <div className="text-sm text-gray-600">
                  {badge.progress.current}/{badge.progress.target}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!showDetails && (
        <div className="flex items-center justify-between mt-2">
          {isUnlocked ? (
            <div className="text-sm font-medium text-green-600">Unlocked</div>
          ) : (
            badge.progress && (
              <div className="w-full">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{badge.progress.current}/{badge.progress.target}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-purple-600 h-1.5 rounded-full"
                    style={{ width: `${badge.progress.percentage}%` }}
                  ></div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default NetworkBadgeCard;