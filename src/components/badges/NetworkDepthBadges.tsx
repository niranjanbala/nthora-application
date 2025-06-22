import React, { useState } from 'react';
import { Network, Users, ArrowRight, Info } from 'lucide-react';
import { BadgeService } from '../../services/badgeService';
import BadgeDisplay from './BadgeDisplay';
import BadgeModal from './BadgeModal';

interface NetworkDepthBadgesProps {
  showProgress?: boolean;
  onViewAll?: () => void;
}

const NetworkDepthBadges: React.FC<NetworkDepthBadgesProps> = ({
  showProgress = true,
  onViewAll
}) => {
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  
  const networkDepthBadges = BadgeService.getNetworkDepthBadges();
  const earnedCount = networkDepthBadges.filter(b => b.earnedAt).length;
  
  const getConnectionsRequired = (badgeId: string): number => {
    switch (badgeId) {
      case 'lone-signal': return 1;
      case 'first-echo': return 10;
      case 'connected-thread': return 100;
      case 'signal-grid': return 1000;
      case 'echo-chamber': return 10000;
      default: return 0;
    }
  };

  // Get current network size
  const getCurrentNetworkSize = (): number => {
    // This would come from your actual user data
    return 42; // Example value
  };

  const networkSize = getCurrentNetworkSize();

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Network className="h-5 w-5 text-blue-600" />
          <h4 className="font-medium text-gray-900">Network Depth Badges</h4>
          <span className="text-gray-500 text-sm">({earnedCount}/{networkDepthBadges.length})</span>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-purple-600 hover:text-purple-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
      
      <div className="bg-blue-50 rounded-lg p-3 mb-4 flex items-start space-x-3">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-blue-700 text-sm">
          Network depth badges recognize the size and reach of your connections. Expand your network to unlock more badges and access deeper expertise.
        </p>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Current Network Size</span>
          <span className="font-medium text-blue-600">{networkSize} connections</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((networkSize / 1000) * 100, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>10</span>
          <span>100</span>
          <span>1,000</span>
          <span>10,000+</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {networkDepthBadges.map((badge) => (
          <div key={badge.id} className="text-center">
            <BadgeDisplay
              badge={badge}
              size="medium"
              showProgress={showProgress}
              onClick={() => setSelectedBadge(badge)}
            />
            <div className="mt-2 text-xs text-gray-600">
              <div className="font-medium">{badge.name}</div>
              <div>{getConnectionsRequired(badge.id)}+ connections</div>
            </div>
          </div>
        ))}
        
        {networkDepthBadges.length === 0 && (
          <div className="col-span-full text-center py-4 text-gray-500">
            <Network className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm">No network depth badges available</p>
          </div>
        )}
      </div>

      {/* Next Badge to Earn */}
      {earnedCount < networkDepthBadges.length && (
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
          <h5 className="font-medium text-gray-900 mb-2">Next Badge to Unlock</h5>
          <div className="flex items-center space-x-3">
            {networkDepthBadges.find(b => !b.earnedAt) && (
              <BadgeDisplay
                badge={networkDepthBadges.find(b => !b.earnedAt)!}
                size="medium"
                showProgress={true}
              />
            )}
            <div>
              <div className="font-medium text-gray-900">
                {networkDepthBadges.find(b => !b.earnedAt)?.name}
              </div>
              <p className="text-sm text-gray-600">
                Invite more connections to expand your network and unlock this badge
              </p>
              <button className="mt-2 text-sm bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors duration-300">
                Invite Connections
              </button>
            </div>
          </div>
        </div>
      )}

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

export default NetworkDepthBadges;