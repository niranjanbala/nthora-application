import React, { useState } from 'react';
import { Users, Network, Zap, Target, MessageSquare, Shield, Sparkles } from 'lucide-react';
import { BadgeService } from '../../services/badgeService';
import NetworkBadgeDisplay from '../badges/NetworkBadgeDisplay';
import BadgeShowcase from '../badges/BadgeShowcase';
import NetworkDepthBadges from '../badges/NetworkDepthBadges';

interface UserNetworkBadgesProps {
  userId?: string;
}

const UserNetworkBadges: React.FC<UserNetworkBadgesProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState<'depth' | 'influence' | 'helpfulness' | 'voice' | 'trust' | 'exploration' | 'all'>('all');
  const [showAllBadges, setShowAllBadges] = useState(false);

  // Get network stats
  const getNetworkStats = () => {
    // In production, this would fetch from the API
    return {
      totalConnections: 156,
      firstDegree: 42,
      secondDegree: 78,
      thirdDegree: 36,
      networkStrength: 28,
      categoriesUnlocked: 5,
      questionsForwarded: 12,
      questionsAnswered: {
        firstDegree: 8,
        secondDegree: 5,
        thirdDegree: 2
      }
    };
  };

  const networkStats = getNetworkStats();

  const tabs = [
    { id: 'all', label: 'All', icon: Users },
    { id: 'depth', label: 'Depth', icon: Network },
    { id: 'influence', label: 'Influence', icon: Zap },
    { id: 'helpfulness', label: 'Helpfulness', icon: Target },
    { id: 'voice', label: 'Voice', icon: MessageSquare },
    { id: 'trust', label: 'Trust', icon: Shield },
    { id: 'exploration', label: 'Exploration', icon: Sparkles }
  ];

  if (showAllBadges) {
    return (
      <div className="space-y-6">
        <BadgeShowcase 
          userBadges={BadgeService.getUserBadges().filter(b => 
            b.category === 'network' || 
            ['signal-finder', 'first-ripple', 'wave-maker', 'network-spiral',
             'thoughtful-answerer', 'problem-solver', 'topic-trailblazer', 'mirror-badge',
             'voice-vanguard', 'curious-listener', 'loop-closer',
             'trust-anchor', 'signal-keeper', 'invisible-hand',
             'early-signal', 'mapper', 'night-owl', 'quantum-leap', 'recursive-echo'].includes(b.id)
          )}
          showAll={true}
        />
        <div className="text-center">
          <button
            onClick={() => setShowAllBadges(false)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-300"
          >
            Back to Network Overview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Network Stats Overview */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Your Network</h3>
            <p className="text-gray-600">Network strength and connection metrics</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-600">{networkStats.networkStrength}</div>
            <div className="text-sm text-gray-600">Network Strength</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3 text-center border border-purple-200">
            <div className="text-lg font-semibold text-blue-600">{networkStats.firstDegree}</div>
            <div className="text-xs text-gray-600">1st Degree</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border border-purple-200">
            <div className="text-lg font-semibold text-purple-600">{networkStats.secondDegree}</div>
            <div className="text-xs text-gray-600">2nd Degree</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border border-purple-200">
            <div className="text-lg font-semibold text-indigo-600">{networkStats.thirdDegree}</div>
            <div className="text-xs text-gray-600">3rd Degree</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border border-purple-200">
            <div className="text-lg font-semibold text-green-600">{networkStats.categoriesUnlocked}</div>
            <div className="text-xs text-gray-600">Categories</div>
          </div>
        </div>
      </div>

      {/* Network Depth Badges */}
      <NetworkDepthBadges 
        showProgress={true}
        onViewAll={() => setShowAllBadges(true)}
      />

      {/* Network Badge Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Network Badges</h3>
            <p className="text-gray-600">Achievements that showcase your network impact</p>
          </div>
          <button
            onClick={() => setShowAllBadges(true)}
            className="text-sm text-purple-600 hover:text-purple-700"
          >
            View All Badges
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-300 ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Badge Display */}
        <NetworkBadgeDisplay 
          category={activeTab}
          limit={8}
          showProgress={true}
          onViewAll={() => setShowAllBadges(true)}
        />
      </div>

      {/* Network Achievements */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Achievements</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Network Depth */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-2 mb-3">
              <Network className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Network Depth</h4>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-blue-700">1st Degree Connections</span>
                  <span className="font-medium text-blue-900">{networkStats.firstDegree}</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min((networkStats.firstDegree / 100) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-blue-700">2nd Degree Reach</span>
                  <span className="font-medium text-blue-900">{networkStats.secondDegree}</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min((networkStats.secondDegree / 200) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-blue-700">3rd Degree Reach</span>
                  <span className="font-medium text-blue-900">{networkStats.thirdDegree}</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min((networkStats.thirdDegree / 500) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Network Influence */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="h-5 w-5 text-purple-600" />
              <h4 className="font-medium text-purple-900">Network Influence</h4>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-purple-700">Questions Answered (1st Degree)</span>
                  <span className="font-medium text-purple-900">{networkStats.questionsAnswered.firstDegree}</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${Math.min((networkStats.questionsAnswered.firstDegree / 20) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-purple-700">Questions Answered (2nd Degree)</span>
                  <span className="font-medium text-purple-900">{networkStats.questionsAnswered.secondDegree}</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${Math.min((networkStats.questionsAnswered.secondDegree / 10) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-purple-700">Questions Answered (3rd Degree)</span>
                  <span className="font-medium text-purple-900">{networkStats.questionsAnswered.thirdDegree}</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${Math.min((networkStats.questionsAnswered.thirdDegree / 5) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNetworkBadges;