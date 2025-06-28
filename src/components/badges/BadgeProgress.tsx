import React from 'react';
import { motion } from 'framer-motion';
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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-soft border border-surface-200 p-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-ink-dark">Badge Progress</h3>
          <p className="text-ink-light">Track your achievements and expertise recognition</p>
        </div>
        <div className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-clay-500" />
          <span className="font-medium text-ink-dark">{stats.totalBadges}</span>
          <span className="text-ink-light">badges</span>
        </div>
      </div>

      {/* Stats Overview */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        variants={container}
      >
        <motion.div variants={item} className="bg-accent-50 rounded-lg p-4 border border-accent-200">
          <div className="text-2xl font-medium text-accent-700">{stats.totalXP}</div>
          <div className="text-sm text-accent-600">Total XP</div>
        </motion.div>
        <motion.div variants={item} className="bg-clay-50 rounded-lg p-4 border border-clay-200">
          <div className="text-2xl font-medium text-clay-700">{stats.badgesByRarity.rare + stats.badgesByRarity.epic + stats.badgesByRarity.legendary}</div>
          <div className="text-sm text-clay-600">Rare+ Badges</div>
        </motion.div>
        <motion.div variants={item} className="bg-sage-50 rounded-lg p-4 border border-sage-200">
          <div className="text-2xl font-medium text-sage-700">{stats.badgesByCategory.expertise}</div>
          <div className="text-sm text-sage-600">Expertise Badges</div>
        </motion.div>
        <motion.div variants={item} className="bg-blush-50 rounded-lg p-4 border border-blush-200">
          <div className="text-2xl font-medium text-blush-700">{stats.currentStreak}</div>
          <div className="text-sm text-blush-600">Day Streak</div>
        </motion.div>
      </motion.div>

      {/* Recently Earned */}
      {showRecentlyEarned && recentlyEarned.length > 0 && (
        <motion.div className="mb-6" variants={container}>
          <h4 className="font-medium text-ink-dark mb-3 flex items-center">
            <Trophy className="h-4 w-4 mr-2 text-clay-500" />
            Recently Earned
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentlyEarned.map((badge) => (
              <motion.div 
                key={badge.id} 
                className="bg-clay-50 rounded-lg p-4 border border-clay-200"
                variants={item}
              >
                <div className="flex items-center space-x-3">
                  <BadgeDisplay badge={badge} size="medium" />
                  <div>
                    <div className="font-medium text-ink-dark">{badge.name}</div>
                    <div className="text-sm text-ink-light">
                      {badge.earnedAt && new Date(badge.earnedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Next to Earn */}
      {showNextToEarn && nextToEarn.length > 0 && (
        <motion.div className="mb-6" variants={container}>
          <h4 className="font-medium text-ink-dark mb-3 flex items-center">
            <Target className="h-4 w-4 mr-2 text-accent-600" />
            Almost There
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {nextToEarn.map((badge) => (
              <motion.div 
                key={badge.id} 
                className="bg-accent-50 rounded-lg p-4 border border-accent-200"
                variants={item}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <BadgeDisplay badge={badge} size="medium" />
                  <div>
                    <div className="font-medium text-ink-dark">{badge.name}</div>
                    <div className="text-sm text-ink-light">{badge.description}</div>
                  </div>
                </div>
                {badge.progress && (
                  <div>
                    <div className="flex justify-between text-xs text-accent-700 mb-1">
                      <span>Progress</span>
                      <span>{badge.progress.current}/{badge.progress.target}</span>
                    </div>
                    <div className="w-full bg-accent-200 rounded-full h-2">
                      <div
                        className="bg-accent-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${badge.progress.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* View All Button */}
      {onViewAllBadges && (
        <motion.button
          onClick={onViewAllBadges}
          className="w-full btn-primary flex items-center justify-center space-x-2"
          variants={item}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>View All Badges</span>
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      )}
    </motion.div>
  );
};

export default BadgeProgress;