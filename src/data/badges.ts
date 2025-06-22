import { Badge } from '../types/badges';

export const BADGE_DEFINITIONS: Badge[] = [
  // 🎯 EXPERTISE BADGES
  {
    id: 'first-answer',
    name: 'First Response',
    description: 'Answered your first question',
    icon: '🎯',
    category: 'expertise',
    tier: 'bronze',
    rarity: 'common',
    requirements: [
      { type: 'questions_answered', value: 1, description: 'Answer 1 question' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 100, description: '+100 XP' },
      { type: 'profile_badge', value: 'first-answer', description: 'Display on profile' }
    ],
    isActive: true
  },
  {
    id: 'helpful-expert',
    name: 'Helpful Expert',
    description: 'Received 10 helpful votes',
    icon: '👍',
    category: 'expertise',
    tier: 'silver',
    rarity: 'uncommon',
    requirements: [
      { type: 'helpful_votes', value: 10, description: 'Receive 10 helpful votes' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 250, description: '+250 XP' },
      { type: 'priority_matching', value: 1.2, description: '20% higher match priority' }
    ],
    isActive: true
  },
  {
    id: 'domain-expert',
    name: 'Domain Expert',
    description: 'Answered 25 questions in a single expertise area',
    icon: '🏆',
    category: 'expertise',
    tier: 'gold',
    rarity: 'rare',
    requirements: [
      { type: 'questions_answered', value: 25, description: 'Answer 25 questions in one domain' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 500, description: '+500 XP' },
      { type: 'special_access', value: 'expert-lounge', description: 'Access to Expert Lounge' },
      { type: 'visibility_increase', value: 2, description: '2x visibility in that domain' }
    ],
    isActive: true
  },
  {
    id: 'lightning-responder',
    name: 'Lightning Responder',
    description: 'Average response time under 1 hour',
    icon: '⚡',
    category: 'expertise',
    tier: 'platinum',
    rarity: 'epic',
    requirements: [
      { type: 'response_time', value: 60, description: 'Maintain <1 hour avg response time' },
      { type: 'questions_answered', value: 10, description: 'Answer at least 10 questions' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 750, description: '+750 XP' },
      { type: 'priority_matching', value: 1.5, description: '50% higher match priority' },
      { type: 'profile_badge', value: 'lightning', description: 'Lightning badge on profile' }
    ],
    isActive: true
  },

  // 🤝 COMMUNITY BADGES
  {
    id: 'first-question',
    name: 'Curious Mind',
    description: 'Asked your first question',
    icon: '❓',
    category: 'community',
    tier: 'bronze',
    rarity: 'common',
    requirements: [
      { type: 'questions_asked', value: 1, description: 'Ask 1 question' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 50, description: '+50 XP' }
    ],
    isActive: true
  },
  {
    id: 'network-builder',
    name: 'Network Builder',
    description: 'Invited 5 people to join N-th`ora',
    icon: '🌐',
    category: 'community',
    tier: 'silver',
    rarity: 'uncommon',
    requirements: [
      { type: 'invites_sent', value: 5, description: 'Send 5 successful invites' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 300, description: '+300 XP' },
      { type: 'network_boost', value: 5, description: '+5 network strength' }
    ],
    isActive: true
  },
  {
    id: 'connector',
    name: 'The Connector',
    description: 'Facilitated 10 successful introductions',
    icon: '🤝',
    category: 'community',
    tier: 'gold',
    rarity: 'rare',
    requirements: [
      { type: 'questions_answered', value: 10, description: 'Provide 10 introduction-type answers' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 600, description: '+600 XP' },
      { type: 'special_access', value: 'connector-tools', description: 'Advanced networking tools' }
    ],
    isActive: true
  },

  // ⭐ QUALITY BADGES
  {
    id: 'quality-contributor',
    name: 'Quality Contributor',
    description: 'Maintain 90%+ quality score across 20 answers',
    icon: '⭐',
    category: 'quality',
    tier: 'gold',
    rarity: 'rare',
    requirements: [
      { type: 'quality_score', value: 90, description: 'Maintain 90%+ quality score' },
      { type: 'questions_answered', value: 20, description: 'Answer 20 questions' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 800, description: '+800 XP' },
      { type: 'priority_matching', value: 1.3, description: '30% higher match priority' }
    ],
    isActive: true
  },
  {
    id: 'perfectionist',
    name: 'The Perfectionist',
    description: '100% helpful vote rate on 15+ answers',
    icon: '💎',
    category: 'quality',
    tier: 'diamond',
    rarity: 'legendary',
    requirements: [
      { type: 'helpful_votes', value: 15, description: '15+ helpful votes' },
      { type: 'quality_score', value: 100, description: '100% helpful rate' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 1500, description: '+1500 XP' },
      { type: 'special_access', value: 'elite-circle', description: 'Elite Expert Circle access' },
      { type: 'visibility_increase', value: 3, description: '3x visibility boost' }
    ],
    isActive: true
  },

  // 🚀 ACHIEVEMENT BADGES
  {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'Joined N-th`ora in the first 1000 users',
    icon: '🚀',
    category: 'achievement',
    tier: 'platinum',
    rarity: 'epic',
    requirements: [
      { type: 'first_time_action', value: 1000, description: 'Be among first 1000 users' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 1000, description: '+1000 XP' },
      { type: 'special_access', value: 'founders-circle', description: 'Founders Circle access' },
      { type: 'profile_badge', value: 'early-adopter', description: 'Exclusive profile badge' }
    ],
    isActive: true
  },
  {
    id: 'category-master',
    name: 'Category Master',
    description: 'Unlocked all available expertise categories',
    icon: '🗝️',
    category: 'achievement',
    tier: 'diamond',
    rarity: 'legendary',
    requirements: [
      { type: 'categories_unlocked', value: 10, description: 'Unlock all 10+ categories' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 2000, description: '+2000 XP' },
      { type: 'special_access', value: 'master-lounge', description: 'Master Lounge access' }
    ],
    isActive: true
  },

  // 🔥 STREAK BADGES
  {
    id: 'consistent-helper',
    name: 'Consistent Helper',
    description: 'Answered questions for 7 consecutive days',
    icon: '🔥',
    category: 'achievement',
    tier: 'silver',
    rarity: 'uncommon',
    requirements: [
      { type: 'consecutive_days', value: 7, description: 'Answer questions 7 days in a row' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 350, description: '+350 XP' },
      { type: 'network_boost', value: 2, description: '+2 network strength' }
    ],
    isActive: true
  },
  {
    id: 'dedication-master',
    name: 'Dedication Master',
    description: 'Maintained 30-day activity streak',
    icon: '🏅',
    category: 'achievement',
    tier: 'platinum',
    rarity: 'epic',
    requirements: [
      { type: 'consecutive_days', value: 30, description: 'Stay active for 30 consecutive days' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 1200, description: '+1200 XP' },
      { type: 'special_access', value: 'vip-support', description: 'VIP support access' }
    ],
    isActive: true
  },

  // 🎉 SPECIAL BADGES
  {
    id: 'beta-tester',
    name: 'Beta Tester',
    description: 'Participated in N-th`ora beta program',
    icon: '🧪',
    category: 'special',
    tier: 'gold',
    rarity: 'rare',
    requirements: [
      { type: 'first_time_action', value: 1, description: 'Join during beta period' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 500, description: '+500 XP' },
      { type: 'profile_badge', value: 'beta-tester', description: 'Beta tester badge' }
    ],
    isActive: true
  },
  {
    id: 'feedback-champion',
    name: 'Feedback Champion',
    description: 'Provided valuable product feedback',
    icon: '💡',
    category: 'special',
    tier: 'gold',
    rarity: 'rare',
    requirements: [
      { type: 'first_time_action', value: 1, description: 'Submit accepted feedback' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 400, description: '+400 XP' },
      { type: 'special_access', value: 'product-council', description: 'Product Council access' }
    ],
    isActive: true
  },

  // 🎄 SEASONAL BADGES
  {
    id: 'holiday-helper',
    name: 'Holiday Helper',
    description: 'Helped others during the holiday season',
    icon: '🎄',
    category: 'seasonal',
    tier: 'silver',
    rarity: 'uncommon',
    requirements: [
      { type: 'questions_answered', value: 5, description: 'Answer 5 questions in December', timeframe: 'December 2024' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 300, description: '+300 XP' },
      { type: 'profile_badge', value: 'holiday-2024', description: 'Holiday 2024 badge' }
    ],
    isActive: false // Seasonal, not currently active
  }
];

export const BADGE_TIERS = {
  bronze: { color: '#CD7F32', xpMultiplier: 1.0 },
  silver: { color: '#C0C0C0', xpMultiplier: 1.2 },
  gold: { color: '#FFD700', xpMultiplier: 1.5 },
  platinum: { color: '#E5E4E2', xpMultiplier: 2.0 },
  diamond: { color: '#B9F2FF', xpMultiplier: 3.0 }
};

export const BADGE_RARITIES = {
  common: { probability: 0.6, glowColor: '#9CA3AF' },
  uncommon: { probability: 0.25, glowColor: '#10B981' },
  rare: { probability: 0.1, glowColor: '#3B82F6' },
  epic: { probability: 0.04, glowColor: '#8B5CF6' },
  legendary: { probability: 0.01, glowColor: '#F59E0B' }
};