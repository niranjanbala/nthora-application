import React, { useState } from 'react';
import { Badge } from '../../types/badges';
import { BadgeService } from '../../services/badgeService';
import NetworkBadgeCard from './NetworkBadgeCard';
import BadgeModal from '../badges/BadgeModal';
import { Network, Zap, Target, MessageSquare, Shield, Sparkles } from 'lucide-react';

interface NetworkBadgeGridProps {
  title?: string;
  description?: string;
  badgeType?: 'depth' | 'influence' | 'helpfulness' | 'voice' | 'trust' | 'exploration' | 'all';
}

const NetworkBadgeGrid: React.FC<NetworkBadgeGridProps> = ({
  title = "Network Badges",
  description = "Achievements that showcase your network impact",
  badgeType = 'all'
}) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  // Get badges based on type
  const getBadges = () => {
    switch (badgeType) {
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
  const earnedCount = badges.filter(b => b.earnedAt).length;

  const getCategoryIcon = () => {
    switch (badgeType) {
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
        return <Sparkles className="h-5 w-5 text-yellow-600" />;
      default:
        return <Network className="h-5 w-5 text-purple-600" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {getCategoryIcon()}
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <p className="text-gray-600">{description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-purple-600">{earnedCount}/{badges.length}</div>
          <div className="text-xs text-gray-600">Badges Earned</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge) => (
          <NetworkBadgeCard
            key={badge.id}
            badge={badge}
            onClick={() => setSelectedBadge(badge)}
          />
        ))}
      </div>

      {/* Badge Modal */}
      {selectedBadge && (
        <BadgeModal
          badge={selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
};

export default NetworkBadgeGrid;