import React from 'react';
import { Badge } from '../../types/badges';
import { BadgeService } from '../../services/badgeService';
import BadgeDisplay from './BadgeDisplay';
import { Network, Users, Zap, Target, MessageSquare, Shield } from 'lucide-react';

interface NetworkBadgeDisplayProps {
  category?: 'depth' | 'influence' | 'helpfulness' | 'voice' | 'trust' | 'exploration' | 'all';
  limit?: number;
  showProgress?: boolean;
  onViewAll?: () => void;
}

const NetworkBadgeDisplay: React.FC<NetworkBadgeDisplayProps> = ({
  category = 'all',
  limit = 5,
  showProgress = true,
  onViewAll
}) => {
  // Get badges based on category
  const getBadges = () => {
    switch (category) {
      case 'depth':
        return BadgeService.getNetworkDepthBadges();
      case 'influence':
        return BadgeService.getInfluenceBadges();
      case 'helpfulness':
        return BadgeService.getHelpfulnessBadges();
      case 'voice':
        return BadgeService.getVoiceBadges();
      case 'trust':
        return BadgeService.getTrustBadges();
      case 'exploration':
        return BadgeService.getExplorationBadges();
      case 'all':
      default:
        return BadgeService.getUserBadges().filter(b => 
          b.category === 'network' || 
          ['signal-finder', 'first-ripple', 'wave-maker', 'network-spiral',
           'thoughtful-answerer', 'problem-solver', 'topic-trailblazer', 'mirror-badge',
           'voice-vanguard', 'curious-listener', 'loop-closer',
           'trust-anchor', 'signal-keeper', 'invisible-hand',
           'early-signal', 'mapper', 'night-owl', 'quantum-leap', 'recursive-echo'].includes(b.id)
        );
    }
  };

  const badges = getBadges();
  const displayBadges = badges.slice(0, limit);
  const earnedCount = badges.filter(b => b.earnedAt).length;

  const getCategoryIcon = () => {
    switch (category) {
      case 'depth':
        return <Network className="h-5 w-5 text-blue-600" />;
      case 'influence':
        return <Zap className="h-5 w-5 text-purple-600" />;
      case 'helpfulness':
        return <Target className="h-5 w-5 text-green-600" />;
      case 'voice':
        return <MessageSquare className="h-5 w-5 text-orange-600" />;
      case 'trust':
        return <Shield className="h-5 w-5 text-indigo-600" />;
      case 'exploration':
        return <Target className="h-5 w-5 text-yellow-600" />;
      case 'all':
      default:
        return <Users className="h-5 w-5 text-purple-600" />;
    }
  };

  const getCategoryTitle = () => {
    switch (category) {
      case 'depth':
        return 'Network Depth Badges';
      case 'influence':
        return 'Influence & Ripple Badges';
      case 'helpfulness':
        return 'Helpfulness Badges';
      case 'voice':
        return 'Voice & Audio Badges';
      case 'trust':
        return 'Trust & Privacy Badges';
      case 'exploration':
        return 'Exploration & Fun Badges';
      case 'all':
      default:
        return 'Network Badges';
    }
  };

  const getCategoryDescription = () => {
    switch (category) {
      case 'depth':
        return 'Recognizing the size and reach of your network';
      case 'influence':
        return 'Celebrating your impact across extended connections';
      case 'helpfulness':
        return 'Acknowledging your valuable contributions';
      case 'voice':
        return 'Recognizing audio and voice interactions';
      case 'trust':
        return 'Celebrating privacy and trust in your network';
      case 'exploration':
        return 'Rewarding exploration and unique achievements';
      case 'all':
      default:
        return 'Badges that recognize your network contributions';
    }
  };

  if (badges.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No network badges available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {getCategoryIcon()}
          <h4 className="font-medium text-gray-900">{getCategoryTitle()}</h4>
          <span className="text-gray-500 text-sm">({earnedCount}/{badges.length})</span>
        </div>
        {onViewAll && badges.length > limit && (
          <button
            onClick={onViewAll}
            className="text-sm text-purple-600 hover:text-purple-700"
          >
            View All
          </button>
        )}
      </div>
      
      <p className="text-gray-600 text-sm mb-4">{getCategoryDescription()}</p>

      <div className="flex flex-wrap gap-3">
        {displayBadges.map((badge) => (
          <div key={badge.id} className="text-center">
            <BadgeDisplay
              badge={badge}
              size="medium"
              showProgress={showProgress}
            />
            <div className="mt-1 text-xs text-gray-600 max-w-[60px] truncate mx-auto">
              {badge.name}
            </div>
          </div>
        ))}
        {badges.length > limit && (
          <div 
            className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors duration-300"
            onClick={onViewAll}
          >
            +{badges.length - limit}
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkBadgeDisplay;