import React from 'react';
import { X, Trophy, Clock, Target, Gift, Users, Zap } from 'lucide-react';
import { Badge } from '../../types/badges';
import { BADGE_TIERS, BADGE_RARITIES } from '../../data/badges';
import BadgeDisplay from './BadgeDisplay';

interface BadgeModalProps {
  badge: Badge;
  onClose: () => void;
}

const BadgeModal: React.FC<BadgeModalProps> = ({ badge, onClose }) => {
  const tierConfig = BADGE_TIERS[badge.tier];
  const rarityConfig = BADGE_RARITIES[badge.rarity];

  const getRequirementIcon = (type: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      questions_answered: Target,
      helpful_votes: Trophy,
      expertise_endorsements: Users,
      network_connections: Users,
      response_time: Clock,
      consecutive_days: Clock,
      quality_score: Trophy,
      questions_asked: Target,
      categories_unlocked: Target,
      invites_sent: Users,
      first_time_action: Zap
    };
    return icons[type] || Target;
  };

  const getRewardIcon = (type: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      xp_bonus: Zap,
      priority_matching: Target,
      profile_badge: Trophy,
      special_access: Gift,
      network_boost: Users,
      visibility_increase: Trophy
    };
    return icons[type] || Gift;
  };

  const getRarityLabel = (rarity: string) => {
    const labels = {
      common: 'Common',
      uncommon: 'Uncommon',
      rare: 'Rare',
      epic: 'Epic',
      legendary: 'Legendary'
    };
    return labels[rarity as keyof typeof labels] || 'Unknown';
  };

  const getTierLabel = (tier: string) => {
    const labels = {
      bronze: 'Bronze',
      silver: 'Silver',
      gold: 'Gold',
      platinum: 'Platinum',
      diamond: 'Diamond'
    };
    return labels[tier as keyof typeof labels] || 'Unknown';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div 
          className="relative p-8 text-white"
          style={{
            background: `linear-gradient(135deg, ${tierConfig.color}40, ${rarityConfig.glowColor}40)`
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors duration-300"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <BadgeDisplay badge={badge} size="large" showTooltip={false} />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-3xl font-bold text-gray-900">{badge.name}</h2>
                <div className="flex space-x-2">
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: tierConfig.color }}
                  >
                    {getTierLabel(badge.tier)}
                  </span>
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: rarityConfig.glowColor }}
                  >
                    {getRarityLabel(badge.rarity)}
                  </span>
                </div>
              </div>
              <p className="text-lg text-gray-700 mb-4">{badge.description}</p>
              
              {badge.earnedAt ? (
                <div className="bg-green-100 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 font-medium">
                      Earned on {new Date(badge.earnedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-100 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span className="text-blue-800 font-medium">In Progress</span>
                  </div>
                  {badge.progress && (
                    <div className="mt-2">
                      <div className="flex justify-between text-sm text-blue-700 mb-1">
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
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Requirements */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-purple-600" />
              Requirements
            </h3>
            <div className="space-y-3">
              {badge.requirements.map((req, index) => {
                const IconComponent = getRequirementIcon(req.type);
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <IconComponent className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{req.description}</div>
                      {req.timeframe && (
                        <div className="text-sm text-gray-600">Timeframe: {req.timeframe}</div>
                      )}
                    </div>
                    {badge.progress && (
                      <div className="text-sm font-medium text-purple-600">
                        {badge.progress.current}/{req.value}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rewards */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Gift className="h-5 w-5 mr-2 text-green-600" />
              Rewards
            </h3>
            <div className="space-y-3">
              {badge.rewards.map((reward, index) => {
                const IconComponent = getRewardIcon(reward.type);
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <IconComponent className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{reward.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Badge Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Badge Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Category:</span>
                <span className="ml-2 font-medium text-gray-900 capitalize">{badge.category}</span>
              </div>
              <div>
                <span className="text-gray-600">Rarity:</span>
                <span className="ml-2 font-medium" style={{ color: rarityConfig.glowColor }}>
                  {getRarityLabel(badge.rarity)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Tier:</span>
                <span className="ml-2 font-medium" style={{ color: tierConfig.color }}>
                  {getTierLabel(badge.tier)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">XP Multiplier:</span>
                <span className="ml-2 font-medium text-gray-900">{tierConfig.xpMultiplier}x</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeModal;