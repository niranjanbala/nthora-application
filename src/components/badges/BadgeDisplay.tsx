import React from 'react';
import { motion } from 'framer-motion';
import { Badge, BadgeTier, BadgeRarity } from '../../types/badges';
import { BADGE_TIERS, BADGE_RARITIES } from '../../data/badges';

interface BadgeDisplayProps {
  badge: Badge;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  showTooltip?: boolean;
  onClick?: () => void;
}

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  badge,
  size = 'medium',
  showProgress = false,
  showTooltip = true,
  onClick
}) => {
  const tierConfig = BADGE_TIERS[badge.tier];
  const rarityConfig = BADGE_RARITIES[badge.rarity];

  const sizeClasses = {
    small: 'w-8 h-8 text-lg',
    medium: 'w-12 h-12 text-2xl',
    large: 'w-16 h-16 text-3xl'
  };

  const getBadgeStyle = () => {
    const baseStyle = {
      backgroundColor: badge.earnedAt ? tierConfig.color + '20' : '#F5F5F5',
      boxShadow: badge.earnedAt 
        ? `0 0 10px ${rarityConfig.glowColor}20, 0 0 20px ${rarityConfig.glowColor}10`
        : 'none',
      opacity: badge.earnedAt ? 1 : 0.7,
      borderColor: badge.earnedAt ? tierConfig.color + '40' : '#E5E5E5'
    };

    return baseStyle;
  };

  const getProgressPercentage = () => {
    if (!badge.progress) return 0;
    return Math.min((badge.progress.current / badge.progress.target) * 100, 100);
  };

  return (
    <div className="relative group">
      <motion.div
        className={`
          ${sizeClasses[size]} 
          rounded-full 
          flex items-center justify-center 
          border-2
          cursor-pointer 
          transition-all duration-300 
          hover:scale-105 
          ${badge.earnedAt ? 'animate-pulse-subtle' : ''}
        `}
        style={getBadgeStyle()}
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="filter drop-shadow-sm">{badge.icon}</span>
        
        {/* Rarity indicator */}
        {badge.earnedAt && badge.rarity !== 'common' && (
          <div 
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white"
            style={{ backgroundColor: rarityConfig.glowColor }}
          />
        )}
      </motion.div>

      {/* Progress ring for unearned badges */}
      {!badge.earnedAt && showProgress && badge.progress && (
        <svg 
          className="absolute inset-0 w-full h-full transform -rotate-90"
          viewBox="0 0 36 36"
        >
          <path
            className="text-surface-200"
            stroke="currentColor"
            strokeWidth="2"
            fill="transparent"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="text-accent-600"
            stroke="currentColor"
            strokeWidth="2"
            fill="transparent"
            strokeDasharray={`${getProgressPercentage()}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
          <div className="bg-ink-dark text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-medium">
            <div className="font-medium">{badge.name}</div>
            <div className="text-surface-300">{badge.description}</div>
            {badge.progress && !badge.earnedAt && (
              <div className="text-accent-300 mt-1">
                {badge.progress.current}/{badge.progress.target}
              </div>
            )}
            {badge.earnedAt && (
              <div className="text-sage-300 mt-1">
                Earned {new Date(badge.earnedAt).toLocaleDateString()}
              </div>
            )}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-ink-dark"></div>
        </div>
      )}
    </div>
  );
};

export default BadgeDisplay;