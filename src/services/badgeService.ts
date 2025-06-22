import { Badge, UserBadgeStats, BadgeProgress } from '../types/badges';
import { BADGE_DEFINITIONS } from '../data/badges';
import { NETWORK_BADGE_DEFINITIONS } from '../data/networkBadges';

// Combine all badge definitions
const ALL_BADGES = [...BADGE_DEFINITIONS, ...NETWORK_BADGE_DEFINITIONS];

// Mock user data - in production this would come from your database
const mockUserData = {
  questionsAnswered: 15,
  helpfulVotes: 8,
  expertiseEndorsements: 3,
  networkConnections: 12,
  avgResponseTime: 45, // minutes
  consecutiveDays: 5,
  qualityScore: 85,
  questionsAsked: 3,
  categoriesUnlocked: 2,
  invitesSent: 4,
  joinedDate: '2024-01-15',
  userNumber: 234, // For early adopter badge
  voiceReplies: 2,
  audioListened: 8,
  networkDegreeAnswers: {
    first: 10,
    second: 4,
    third: 1
  },
  inviteChain: {
    secondDegree: true,
    thirdDegree: false
  },
  newUserAnswers: 2,
  aiReuseCount: 1,
  midnightAnswers: 1,
  badgesPerWeek: {
    max: 2,
    current: 1
  }
};

export class BadgeService {
  static calculateBadgeProgress(badge: Badge): BadgeProgress | undefined {
    if (badge.earnedAt) return undefined;

    const requirement = badge.requirements[0]; // Simplified - taking first requirement
    let current = 0;

    switch (requirement.type) {
      case 'questions_answered':
        if (badge.id === 'night-owl') {
          current = mockUserData.midnightAnswers;
        } else if (badge.id === 'signal-finder') {
          current = mockUserData.networkDegreeAnswers.third;
        } else {
          current = mockUserData.questionsAnswered;
        }
        break;
      case 'helpful_votes':
        if (badge.id === 'problem-solver') {
          // Specific for solutions, not just helpful votes
          current = Math.floor(mockUserData.helpfulVotes * 0.6); // Assume 60% are solutions
        } else {
          current = mockUserData.helpfulVotes;
        }
        break;
      case 'expertise_endorsements':
        current = mockUserData.expertiseEndorsements;
        break;
      case 'network_connections':
        current = mockUserData.networkConnections;
        break;
      case 'response_time':
        // For response time, lower is better, so we need to invert the calculation
        current = requirement.value - Math.min(mockUserData.avgResponseTime, requirement.value);
        break;
      case 'consecutive_days':
        current = mockUserData.consecutiveDays;
        break;
      case 'quality_score':
        current = mockUserData.qualityScore;
        break;
      case 'questions_asked':
        if (badge.id === 'wave-maker') {
          // For wave-maker, we're counting questions with 3+ answers
          current = Math.floor(mockUserData.questionsAsked * 0.3); // Assume 30% get 3+ answers
        } else {
          current = mockUserData.questionsAsked;
        }
        break;
      case 'categories_unlocked':
        if (badge.id === 'network-spiral') {
          // For network spiral, we need categories across different network degrees
          current = mockUserData.networkDegreeAnswers.first > 0 && 
                   mockUserData.networkDegreeAnswers.second > 0 && 
                   mockUserData.networkDegreeAnswers.third > 0 ? 3 : 
                   mockUserData.categoriesUnlocked;
        } else {
          current = mockUserData.categoriesUnlocked;
        }
        break;
      case 'invites_sent':
        current = mockUserData.invitesSent;
        break;
      case 'first_time_action':
        // Special handling for various first-time actions
        if (badge.id === 'first-ripple') {
          current = mockUserData.inviteChain.secondDegree ? 1 : 0;
        } else if (badge.id === 'topic-trailblazer') {
          current = Math.random() > 0.7 ? 1 : 0; // 30% chance of being first
        } else if (badge.id === 'mirror-badge') {
          current = Math.random() > 0.8 ? 1 : 0; // 20% chance of answering own question
        } else if (badge.id === 'voice-vanguard') {
          current = mockUserData.voiceReplies;
        } else if (badge.id === 'curious-listener') {
          current = mockUserData.audioListened;
        } else if (badge.id === 'loop-closer') {
          current = Math.random() > 0.9 ? 1 : 0; // 10% chance of loop closing
        } else if (badge.id === 'trust-anchor') {
          current = mockUserData.newUserAnswers;
        } else if (badge.id === 'signal-keeper') {
          current = 1; // Always earned by default
        } else if (badge.id === 'invisible-hand') {
          current = mockUserData.aiReuseCount;
        } else if (badge.id === 'early-signal') {
          current = Math.random() > 0.7 ? 1 : 0; // 30% chance of being early
        } else if (badge.id === 'quantum-leap') {
          current = mockUserData.badgesPerWeek.current;
        } else if (badge.id === 'recursive-echo') {
          current = Math.random() > 0.95 ? 1 : 0; // 5% chance of recursive echo
        } else {
          current = mockUserData.userNumber <= requirement.value ? 1 : 0;
        }
        break;
      default:
        current = 0;
    }

    const target = requirement.value;
    let percentage = 0;
    
    // For quality_score and similar metrics where we want to reach a threshold
    if (requirement.type === 'quality_score') {
      percentage = Math.min((current / target) * 100, 100);
    } 
    // For response_time where lower is better
    else if (requirement.type === 'response_time') {
      percentage = Math.min((current / requirement.value) * 100, 100);
    }
    // For standard counting metrics
    else {
      percentage = Math.min((current / target) * 100, 100);
    }

    return {
      current,
      target,
      percentage,
      nextMilestone: current < target ? target : undefined
    };
  }

  static checkBadgeEligibility(badge: Badge): boolean {
    const progress = this.calculateBadgeProgress(badge);
    return progress ? progress.percentage >= 100 : false;
  }

  static getUserBadges(): Badge[] {
    return ALL_BADGES.map(badge => {
      const badgeWithProgress = { ...badge };
      
      // Check if badge should be earned
      if (this.checkBadgeEligibility(badge) && !badge.earnedAt) {
        badgeWithProgress.earnedAt = new Date().toISOString();
      }
      
      // Add progress for unearned badges
      if (!badgeWithProgress.earnedAt) {
        badgeWithProgress.progress = this.calculateBadgeProgress(badge);
      }

      return badgeWithProgress;
    });
  }

  static getUserBadgeStats(): UserBadgeStats {
    const userBadges = this.getUserBadges();
    const earnedBadges = userBadges.filter(b => b.earnedAt);

    const badgesByCategory = earnedBadges.reduce((acc, badge) => {
      acc[badge.category] = (acc[badge.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const badgesByTier = earnedBadges.reduce((acc, badge) => {
      acc[badge.tier] = (acc[badge.tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const badgesByRarity = earnedBadges.reduce((acc, badge) => {
      acc[badge.rarity] = (acc[badge.rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate total XP from badges
    const totalXP = earnedBadges.reduce((total, badge) => {
      const xpReward = badge.rewards.find(r => r.type === 'xp_bonus');
      return total + (xpReward ?  Number(xpReward.value) : 0);
    }, 0);

    return {
      totalBadges: earnedBadges.length,
      badgesByCategory: {
        expertise: badgesByCategory.expertise || 0,
        community: badgesByCategory.community || 0,
        quality: badgesByCategory.quality || 0,
        network: badgesByCategory.network || 0,
        achievement: badgesByCategory.achievement || 0,
        special: badgesByCategory.special || 0,
        seasonal: badgesByCategory.seasonal || 0
      },
      badgesByTier: {
        bronze: badgesByTier.bronze || 0,
        silver: badgesByTier.silver || 0,
        gold: badgesByTier.gold || 0,
        platinum: badgesByTier.platinum || 0,
        diamond: badgesByTier.diamond || 0
      },
      badgesByRarity: {
        common: badgesByRarity.common || 0,
        uncommon: badgesByRarity.uncommon || 0,
        rare: badgesByRarity.rare || 0,
        epic: badgesByRarity.epic || 0,
        legendary: badgesByRarity.legendary || 0
      },
      totalXP,
      currentStreak: mockUserData.consecutiveDays,
      longestStreak: mockUserData.consecutiveDays
    };
  }

  static getRecentlyEarnedBadges(limit: number = 3): Badge[] {
    const userBadges = this.getUserBadges();
    return userBadges
      .filter(b => b.earnedAt)
      .sort((a, b) => new Date(b.earnedAt!).getTime() - new Date(a.earnedAt!).getTime())
      .slice(0, limit);
  }

  static getNextBadgesToEarn(limit: number = 3): Badge[] {
    const userBadges = this.getUserBadges();
    return userBadges
      .filter(b => !b.earnedAt && b.progress && b.progress.percentage > 0)
      .sort((a, b) => (b.progress?.percentage || 0) - (a.progress?.percentage || 0))
      .slice(0, limit);
  }

  static getRecommendedBadges(limit: number = 3): Badge[] {
    const userBadges = this.getUserBadges();
    const unearned = userBadges.filter(b => !b.earnedAt);
    
    // Prioritize badges that are close to being earned
    const closeToEarning = unearned
      .filter(b => b.progress && b.progress.percentage >= 50)
      .sort((a, b) => (b.progress?.percentage || 0) - (a.progress?.percentage || 0));
    
    // If we have enough close badges, return those
    if (closeToEarning.length >= limit) {
      return closeToEarning.slice(0, limit);
    }
    
    // Otherwise, add some badges that align with user activity
    const remainingCount = limit - closeToEarning.length;
    
    // Determine which activity the user does most
    const activityFocus = mockUserData.questionsAnswered > mockUserData.questionsAsked 
      ? 'answering' 
      : 'asking';
    
    const activityBadges = unearned
      .filter(b => {
        if (activityFocus === 'answering') {
          return b.requirements.some(r => 
            r.type === 'questions_answered' || 
            r.type === 'helpful_votes' || 
            r.type === 'quality_score'
          );
        } else {
          return b.requirements.some(r => 
            r.type === 'questions_asked' || 
            r.type === 'categories_unlocked'
          );
        }
      })
      .filter(b => !closeToEarning.includes(b))
      .slice(0, remainingCount);
    
    return [...closeToEarning, ...activityBadges];
  }

  // Get badges by category
  static getBadgesByCategory(category: string, earnedOnly: boolean = false): Badge[] {
    const userBadges = this.getUserBadges();
    return userBadges
      .filter(b => b.category === category && (!earnedOnly || b.earnedAt))
      .sort((a, b) => {
        // Sort by earned status first, then by tier
        if (a.earnedAt && !b.earnedAt) return -1;
        if (!a.earnedAt && b.earnedAt) return 1;
        
        // Then sort by tier
        const tierOrder = { bronze: 1, silver: 2, gold: 3, platinum: 4, diamond: 5 };
        return tierOrder[b.tier] - tierOrder[a.tier];
      });
  }

  // Get network depth badges
  static getNetworkDepthBadges(): Badge[] {
    return this.getUserBadges().filter(b => 
      ['lone-signal', 'first-echo', 'connected-thread', 'signal-grid', 'echo-chamber'].includes(b.id)
    );
  }

  // Get influence badges
  static getInfluenceBadges(): Badge[] {
    return this.getUserBadges().filter(b => 
      ['signal-finder', 'first-ripple', 'wave-maker', 'network-spiral'].includes(b.id)
    );
  }

  // Get helpfulness badges
  static getHelpfulnessBadges(): Badge[] {
    return this.getUserBadges().filter(b => 
      ['thoughtful-answerer', 'problem-solver', 'topic-trailblazer', 'mirror-badge'].includes(b.id)
    );
  }

  // Get voice badges
  static getVoiceBadges(): Badge[] {
    return this.getUserBadges().filter(b => 
      ['voice-vanguard', 'curious-listener', 'loop-closer'].includes(b.id)
    );
  }

  // Get trust badges
  static getTrustBadges(): Badge[] {
    return this.getUserBadges().filter(b => 
      ['trust-anchor', 'signal-keeper', 'invisible-hand'].includes(b.id)
    );
  }

  // Get exploration badges
  static getExplorationBadges(): Badge[] {
    return this.getUserBadges().filter(b => 
      ['early-signal', 'mapper', 'night-owl', 'quantum-leap', 'recursive-echo'].includes(b.id)
    );
  }

  // Get badges by network depth
  static getBadgesByNetworkDepth(depth: number): Badge[] {
    const userBadges = this.getUserBadges();
    
    // Filter badges that are relevant to the specified network depth
    return userBadges.filter(badge => {
      if (depth === 1) {
        // First-degree badges
        return badge.id === 'lone-signal' || 
               badge.id === 'first-echo' || 
               badge.id === 'mirror-badge';
      } else if (depth === 2) {
        // Second-degree badges
        return badge.id === 'first-ripple' || 
               badge.id === 'wave-maker';
      } else if (depth === 3) {
        // Third-degree badges
        return badge.id === 'signal-finder' || 
               badge.id === 'network-spiral';
      }
      return false;
    });
  }
}