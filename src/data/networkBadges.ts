import { Badge } from '../types/badges';

export const NETWORK_BADGE_DEFINITIONS: Badge[] = [
  // 🕳️ NETWORK DEPTH BADGES
  {
    id: 'lone-signal',
    name: 'Lone Signal',
    description: 'Started your network journey with 0-9 connections',
    icon: '🕳️',
    category: 'network',
    tier: 'bronze',
    rarity: 'common',
    requirements: [
      { type: 'network_connections', value: 1, description: 'Join N-th`ora' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 50, description: '+50 XP' }
    ],
    isActive: true,
    earnedAt: '2024-01-15'
  },
  {
    id: 'first-echo',
    name: 'First Echo',
    description: 'Expanded your network to 10+ connections',
    icon: '🌱',
    category: 'network',
    tier: 'silver',
    rarity: 'common',
    requirements: [
      { type: 'network_connections', value: 10, description: 'Reach 10 network connections' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 150, description: '+150 XP' },
      { type: 'network_boost', value: 2, description: '+2 network strength' }
    ],
    isActive: true
  },
  {
    id: 'connected-thread',
    name: 'Connected Thread',
    description: 'Built a substantial network with 100+ connections',
    icon: '🔗',
    category: 'network',
    tier: 'gold',
    rarity: 'uncommon',
    requirements: [
      { type: 'network_connections', value: 100, description: 'Reach 100 network connections' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 500, description: '+500 XP' },
      { type: 'network_boost', value: 5, description: '+5 network strength' },
      { type: 'visibility_increase', value: 1.5, description: '50% higher visibility in network' }
    ],
    isActive: true
  },
  {
    id: 'signal-grid',
    name: 'Signal Grid',
    description: 'Created an extensive network with 1000+ connections',
    icon: '🌐',
    category: 'network',
    tier: 'platinum',
    rarity: 'rare',
    requirements: [
      { type: 'network_connections', value: 1000, description: 'Reach 1000 network connections' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 1500, description: '+1500 XP' },
      { type: 'network_boost', value: 10, description: '+10 network strength' },
      { type: 'special_access', value: 'network-hub', description: 'Access to Network Hub features' }
    ],
    isActive: true
  },
  {
    id: 'echo-chamber',
    name: 'Echo Chamber',
    description: 'Built a massive network with 10,000+ connections',
    icon: '💫',
    category: 'network',
    tier: 'diamond',
    rarity: 'legendary',
    requirements: [
      { type: 'network_connections', value: 10000, description: 'Reach 10,000 network connections' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 5000, description: '+5000 XP' },
      { type: 'network_boost', value: 25, description: '+25 network strength' },
      { type: 'special_access', value: 'network-architect', description: 'Network Architect status' }
    ],
    isActive: true
  },

  // 🎯 INFLUENCE & RIPPLE BADGES
  {
    id: 'signal-finder',
    name: 'Signal Finder',
    description: 'Answered a question from a 3rd-degree connection',
    icon: '🎯',
    category: 'network',
    tier: 'silver',
    rarity: 'uncommon',
    requirements: [
      { type: 'questions_answered', value: 1, description: 'Answer a 3rd-degree question' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 200, description: '+200 XP' },
      { type: 'network_boost', value: 3, description: '+3 network strength' }
    ],
    isActive: true
  },
  {
    id: 'first-ripple',
    name: 'First Ripple',
    description: 'Your invite led to someone who invited another user',
    icon: '📡',
    category: 'network',
    tier: 'gold',
    rarity: 'rare',
    requirements: [
      { type: 'first_time_action', value: 1, description: 'Second-degree invite chain' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 350, description: '+350 XP' },
      { type: 'network_boost', value: 5, description: '+5 network strength' }
    ],
    isActive: true
  },
  {
    id: 'wave-maker',
    name: 'Wave Maker',
    description: 'Your question triggered 3+ quality answers',
    icon: '🌊',
    category: 'community',
    tier: 'silver',
    rarity: 'uncommon',
    requirements: [
      { type: 'questions_asked', value: 1, description: 'Get 3+ answers on a single question' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 250, description: '+250 XP' },
      { type: 'priority_matching', value: 1.2, description: '20% higher match priority' }
    ],
    isActive: true
  },
  {
    id: 'network-spiral',
    name: 'Network Spiral',
    description: 'Connected with 1st-3rd degree users across 3+ topics',
    icon: '🧬',
    category: 'network',
    tier: 'platinum',
    rarity: 'epic',
    requirements: [
      { type: 'categories_unlocked', value: 3, description: 'Active in 3+ categories with varied network degrees' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 1000, description: '+1000 XP' },
      { type: 'special_access', value: 'cross-domain', description: 'Cross-domain visibility boost' }
    ],
    isActive: true
  },

  // 🧠 HELPFULNESS BADGES
  {
    id: 'thoughtful-answerer',
    name: 'Thoughtful Answerer',
    description: 'Received 3+ thoughtful votes on your answers',
    icon: '🧠',
    category: 'quality',
    tier: 'silver',
    rarity: 'common',
    requirements: [
      { type: 'helpful_votes', value: 3, description: 'Receive 3 helpful votes' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 150, description: '+150 XP' },
      { type: 'priority_matching', value: 1.1, description: '10% higher match priority' }
    ],
    isActive: true
  },
  {
    id: 'problem-solver',
    name: 'Problem Solver',
    description: 'Provided 5+ confirmed solutions to questions',
    icon: '🛠️',
    category: 'quality',
    tier: 'gold',
    rarity: 'uncommon',
    requirements: [
      { type: 'helpful_votes', value: 5, description: 'Get 5 answers marked as solutions' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 300, description: '+300 XP' },
      { type: 'priority_matching', value: 1.2, description: '20% higher match priority' }
    ],
    isActive: true
  },
  {
    id: 'topic-trailblazer',
    name: 'Topic Trailblazer',
    description: 'First expert to answer questions in a new topic',
    icon: '🧭',
    category: 'expertise',
    tier: 'gold',
    rarity: 'rare',
    requirements: [
      { type: 'first_time_action', value: 1, description: 'Be first to answer in a new topic' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 500, description: '+500 XP' },
      { type: 'visibility_increase', value: 2, description: '2x visibility in that topic' }
    ],
    isActive: true
  },
  {
    id: 'mirror-badge',
    name: 'Mirror Badge',
    description: 'Answered your own past question with new knowledge',
    icon: '🪞',
    category: 'expertise',
    tier: 'silver',
    rarity: 'uncommon',
    requirements: [
      { type: 'first_time_action', value: 1, description: 'Answer your own past question' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 200, description: '+200 XP' }
    ],
    isActive: true
  },

  // 🎙️ VOICE & AUDIO BADGES
  {
    id: 'voice-vanguard',
    name: 'Voice Vanguard',
    description: 'Provided 5+ voice replies to questions',
    icon: '🎙️',
    category: 'expertise',
    tier: 'silver',
    rarity: 'uncommon',
    requirements: [
      { type: 'first_time_action', value: 5, description: 'Create 5 voice replies' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 250, description: '+250 XP' }
    ],
    isActive: true
  },
  {
    id: 'curious-listener',
    name: 'Curious Listener',
    description: 'Played 10+ audio replies from experts',
    icon: '🎧',
    category: 'community',
    tier: 'bronze',
    rarity: 'common',
    requirements: [
      { type: 'first_time_action', value: 10, description: 'Listen to 10 audio replies' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 100, description: '+100 XP' }
    ],
    isActive: true
  },
  {
    id: 'loop-closer',
    name: 'Loop Closer',
    description: 'Your answer helped a question that came back to your 1st degree',
    icon: '🔁',
    category: 'network',
    tier: 'gold',
    rarity: 'rare',
    requirements: [
      { type: 'first_time_action', value: 1, description: 'Complete a network loop' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 400, description: '+400 XP' },
      { type: 'network_boost', value: 5, description: '+5 network strength' }
    ],
    isActive: true
  },

  // 🛡️ TRUST & PRIVACY BADGES
  {
    id: 'trust-anchor',
    name: 'Trust Anchor',
    description: 'Frequently receives answers from new users',
    icon: '🛡️',
    category: 'community',
    tier: 'gold',
    rarity: 'rare',
    requirements: [
      { type: 'first_time_action', value: 5, description: 'Get 5+ new users to answer your questions' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 500, description: '+500 XP' },
      { type: 'network_boost', value: 8, description: '+8 network strength' }
    ],
    isActive: true
  },
  {
    id: 'signal-keeper',
    name: 'Signal Keeper',
    description: 'Never breached privacy in your network interactions',
    icon: '🔐',
    category: 'quality',
    tier: 'silver',
    rarity: 'common',
    requirements: [
      { type: 'first_time_action', value: 1, description: 'Maintain perfect privacy record' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 200, description: '+200 XP' },
      { type: 'trust_score', value: 10, description: '+10 Trust Score' }
    ],
    isActive: true,
    earnedAt: '2024-01-15'
  },
  {
    id: 'invisible-hand',
    name: 'Invisible Hand',
    description: 'Your past answers were reused by AI to help others',
    icon: '🌒',
    category: 'expertise',
    tier: 'gold',
    rarity: 'rare',
    requirements: [
      { type: 'first_time_action', value: 3, description: 'Have 3+ answers reused by AI' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 400, description: '+400 XP' },
      { type: 'visibility_increase', value: 1.5, description: '50% higher visibility' }
    ],
    isActive: true
  },

  // 🧪 EXPLORATION & FUN BADGES
  {
    id: 'early-signal',
    name: 'Early Signal',
    description: 'Joined among the top 100 users in a topic',
    icon: '🧪',
    category: 'achievement',
    tier: 'gold',
    rarity: 'rare',
    requirements: [
      { type: 'first_time_action', value: 100, description: 'Be among first 100 in a topic' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 500, description: '+500 XP' },
      { type: 'special_access', value: 'pioneer', description: 'Topic Pioneer status' }
    ],
    isActive: true
  },
  {
    id: 'mapper',
    name: 'Mapper',
    description: 'Active in 5+ different categories',
    icon: '🗺️',
    category: 'achievement',
    tier: 'silver',
    rarity: 'uncommon',
    requirements: [
      { type: 'categories_unlocked', value: 5, description: 'Be active in 5+ categories' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 300, description: '+300 XP' },
      { type: 'network_boost', value: 3, description: '+3 network strength' }
    ],
    isActive: true
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Answered 3+ questions after midnight',
    icon: '🦉',
    category: 'achievement',
    tier: 'bronze',
    rarity: 'common',
    requirements: [
      { type: 'questions_answered', value: 3, description: 'Answer 3 questions after midnight' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 150, description: '+150 XP' }
    ],
    isActive: true
  },
  {
    id: 'quantum-leap',
    name: 'Quantum Leap',
    description: 'Unlocked 3+ badges in a single week',
    icon: '📦',
    category: 'achievement',
    tier: 'gold',
    rarity: 'rare',
    requirements: [
      { type: 'first_time_action', value: 3, description: 'Earn 3+ badges in one week' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 500, description: '+500 XP' },
      { type: 'special_access', value: 'badge-hunter', description: 'Badge Hunter status' }
    ],
    isActive: true
  },
  {
    id: 'recursive-echo',
    name: 'Recursive Echo',
    description: 'Someone you invited → invited → answered your question',
    icon: '🌐',
    category: 'network',
    tier: 'platinum',
    rarity: 'epic',
    requirements: [
      { type: 'first_time_action', value: 1, description: 'Complete a recursive invitation chain' }
    ],
    rewards: [
      { type: 'xp_bonus', value: 1000, description: '+1000 XP' },
      { type: 'network_boost', value: 10, description: '+10 network strength' }
    ],
    isActive: true
  }
];