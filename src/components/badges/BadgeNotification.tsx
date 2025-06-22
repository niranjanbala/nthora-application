import React, { useState, useEffect } from 'react';
import { Trophy, X, Sparkles, Gift } from 'lucide-react';
import { Badge } from '../../types/badges';
import { BADGE_TIERS, BADGE_RARITIES } from '../../data/badges';
import BadgeDisplay from './BadgeDisplay';

interface BadgeNotificationProps {
  badge: Badge;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const BadgeNotification: React.FC<BadgeNotificationProps> = ({
  badge,
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const tierConfig = BADGE_TIERS[badge.tier];
  const rarityConfig = BADGE_RARITIES[badge.rarity];

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto close
    if (autoClose) {
      const closeTimer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(closeTimer);
      };
    }
    
    return () => clearTimeout(timer);
  }, [autoClose, duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getXPReward = () => {
    const xpReward = badge.rewards.find(r => r.type === 'xp_bonus');
    return xpReward ? xpReward.value : 0;
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

  return (
    <div className={`
      fixed top-4 right-4 z-50 max-w-sm w-full
      transform transition-all duration-500 ease-out
      ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div 
        className="bg-white rounded-xl shadow-2xl border-2 overflow-hidden"
        style={{ 
          borderColor: rarityConfig.glowColor,
          boxShadow: `0 10px 40px ${rarityConfig.glowColor}30, 0 0 20px ${rarityConfig.glowColor}20`
        }}
      >
        {/* Header */}
        <div 
          className="relative p-4 text-white"
          style={{
            background: `linear-gradient(135deg, ${tierConfig.color}, ${rarityConfig.glowColor})`
          }}
        >
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors duration-300"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center space-x-3">
            <Trophy className="h-6 w-6" />
            <div>
              <div className="font-bold text-lg">Badge Earned!</div>
              <div className="text-sm opacity-90">{getRarityLabel(badge.rarity)} Achievement</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center space-x-4 mb-4">
            <BadgeDisplay badge={badge} size="large" showTooltip={false} />
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900">{badge.name}</h3>
              <p className="text-gray-600 text-sm">{badge.description}</p>
            </div>
          </div>

          {/* Rewards */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Gift className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-purple-900">Rewards Unlocked</span>
            </div>
            <div className="space-y-1">
              {badge.rewards.map((reward, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-purple-700">{reward.description}</span>
                  {reward.type === 'xp_bonus' && (
                    <div className="flex items-center space-x-1">
                      <Sparkles className="h-3 w-3 text-yellow-500" />
                      <span className="font-medium text-yellow-600">+{reward.value} XP</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress bar for auto-close */}
        {autoClose && (
          <div className="h-1 bg-gray-200">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-100 ease-linear"
              style={{
                animation: `shrink ${duration}ms linear`,
                transformOrigin: 'left'
              }}
            />
          </div>
        )}
      </div>

      {/* Celebration particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-bounce"
            style={{
              backgroundColor: rarityConfig.glowColor,
              left: `${20 + i * 15}%`,
              top: `${10 + (i % 2) * 20}%`,
              animationDelay: `${i * 100}ms`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
};

export default BadgeNotification;