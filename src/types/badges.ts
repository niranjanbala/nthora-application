export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  tier: BadgeTier;
  rarity: BadgeRarity;
  requirements: BadgeRequirement[];
  rewards: BadgeReward[];
  isActive: boolean;
  earnedAt?: string;
  progress?: BadgeProgress;
}

export interface BadgeProgress {
  current: number;
  target: number;
  percentage: number;
  nextMilestone?: number;
}

export interface BadgeRequirement {
  type: RequirementType;
  value: number;
  description: string;
  timeframe?: string; // e.g., "30 days", "all time"
}

export interface BadgeReward {
  type: RewardType;
  value: number | string;
  description: string;
}

export type BadgeCategory = 
  | 'expertise' 
  | 'community' 
  | 'quality' 
  | 'network' 
  | 'achievement' 
  | 'special' 
  | 'seasonal';

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type RequirementType = 
  | 'questions_answered'
  | 'helpful_votes'
  | 'expertise_endorsements'
  | 'network_connections'
  | 'response_time'
  | 'consecutive_days'
  | 'quality_score'
  | 'questions_asked'
  | 'categories_unlocked'
  | 'invites_sent'
  | 'first_time_action';

export type RewardType = 
  | 'xp_bonus'
  | 'priority_matching'
  | 'profile_badge'
  | 'special_access'
  | 'network_boost'
  | 'visibility_increase';

export interface UserBadgeStats {
  totalBadges: number;
  badgesByCategory: Record<BadgeCategory, number>;
  badgesByTier: Record<BadgeTier, number>;
  badgesByRarity: Record<BadgeRarity, number>;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
}