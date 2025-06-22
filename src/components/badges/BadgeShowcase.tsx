import React, { useState } from 'react';
import { Trophy, Star, Users, Target, Calendar, Filter, Search } from 'lucide-react';
import { Badge, BadgeCategory, BadgeTier, BadgeRarity } from '../../types/badges';
import { BADGE_DEFINITIONS } from '../../data/badges';
import BadgeDisplay from './BadgeDisplay';
import BadgeModal from './BadgeModal';

interface BadgeShowcaseProps {
  userBadges: Badge[];
  showAll?: boolean;
}

const BadgeShowcase: React.FC<BadgeShowcaseProps> = ({
  userBadges,
  showAll = false
}) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [filterCategory, setFilterCategory] = useState<BadgeCategory | 'all'>('all');
  const [filterTier, setFilterTier] = useState<BadgeTier | 'all'>('all');
  const [filterEarned, setFilterEarned] = useState<'all' | 'earned' | 'unearned'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allBadges = showAll ? BADGE_DEFINITIONS : userBadges;

  const filteredBadges = allBadges.filter(badge => {
    const matchesCategory = filterCategory === 'all' || badge.category === filterCategory;
    const matchesTier = filterTier === 'all' || badge.tier === filterTier;
    const matchesEarned = filterEarned === 'all' || 
      (filterEarned === 'earned' && badge.earnedAt) ||
      (filterEarned === 'unearned' && !badge.earnedAt);
    const matchesSearch = searchQuery === '' || 
      badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      badge.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesTier && matchesEarned && matchesSearch;
  });

  const earnedBadges = allBadges.filter(badge => badge.earnedAt);
  const totalBadges = BADGE_DEFINITIONS.length;

  const getCategoryIcon = (category: BadgeCategory) => {
    const icons = {
      expertise: '🎯',
      community: '🤝',
      quality: '⭐',
      network: '🌐',
      achievement: '🏆',
      special: '💎',
      seasonal: '🎄'
    };
    return icons[category];
  };

  const getCategoryStats = () => {
    const stats: Record<BadgeCategory, { earned: number; total: number }> = {
      expertise: { earned: 0, total: 0 },
      community: { earned: 0, total: 0 },
      quality: { earned: 0, total: 0 },
      network: { earned: 0, total: 0 },
      achievement: { earned: 0, total: 0 },
      special: { earned: 0, total: 0 },
      seasonal: { earned: 0, total: 0 }
    };

    BADGE_DEFINITIONS.forEach(badge => {
      stats[badge.category].total++;
      if (badge.earnedAt) {
        stats[badge.category].earned++;
      }
    });

    return stats;
  };

  const categoryStats = getCategoryStats();

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Badge Collection</h2>
            <p className="text-gray-600">Showcase your achievements and expertise</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-600">{earnedBadges.length}</div>
            <div className="text-sm text-gray-600">of {totalBadges} badges</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3 text-center border border-purple-200">
            <div className="text-lg font-semibold text-purple-600">
              {Math.round((earnedBadges.length / totalBadges) * 100)}%
            </div>
            <div className="text-xs text-gray-600">Completion</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border border-purple-200">
            <div className="text-lg font-semibold text-gold-600">
              {earnedBadges.filter(b => b.rarity === 'rare' || b.rarity === 'epic' || b.rarity === 'legendary').length}
            </div>
            <div className="text-xs text-gray-600">Rare+</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border border-purple-200">
            <div className="text-lg font-semibold text-blue-600">
              {earnedBadges.filter(b => b.category === 'expertise').length}
            </div>
            <div className="text-xs text-gray-600">Expertise</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border border-purple-200">
            <div className="text-lg font-semibold text-green-600">
              {earnedBadges.filter(b => b.category === 'community').length}
            </div>
            <div className="text-xs text-gray-600">Community</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search badges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as BadgeCategory | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="expertise">🎯 Expertise</option>
            <option value="community">🤝 Community</option>
            <option value="quality">⭐ Quality</option>
            <option value="network">🌐 Network</option>
            <option value="achievement">🏆 Achievement</option>
            <option value="special">💎 Special</option>
            <option value="seasonal">🎄 Seasonal</option>
          </select>

          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value as BadgeTier | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Tiers</option>
            <option value="bronze">🥉 Bronze</option>
            <option value="silver">🥈 Silver</option>
            <option value="gold">🥇 Gold</option>
            <option value="platinum">💎 Platinum</option>
            <option value="diamond">💠 Diamond</option>
          </select>

          <select
            value={filterEarned}
            onChange={(e) => setFilterEarned(e.target.value as 'all' | 'earned' | 'unearned')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Badges</option>
            <option value="earned">✅ Earned</option>
            <option value="unearned">⏳ In Progress</option>
          </select>
        </div>
      </div>

      {/* Category Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {Object.entries(categoryStats).map(([category, stats]) => (
          <div
            key={category}
            className={`bg-white rounded-lg p-4 border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${
              filterCategory === category ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
            }`}
            onClick={() => setFilterCategory(filterCategory === category ? 'all' : category as BadgeCategory)}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">{getCategoryIcon(category as BadgeCategory)}</div>
              <div className="text-sm font-medium text-gray-900 capitalize">{category}</div>
              <div className="text-xs text-gray-600">{stats.earned}/{stats.total}</div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                <div
                  className="bg-purple-600 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.earned / stats.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Badge Grid */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {filterCategory === 'all' ? 'All Badges' : `${filterCategory} Badges`}
            <span className="text-gray-500 ml-2">({filteredBadges.length})</span>
          </h3>
          <div className="text-sm text-gray-600">
            {filteredBadges.filter(b => b.earnedAt).length} earned
          </div>
        </div>

        <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-4">
          {filteredBadges.map((badge) => (
            <div key={badge.id} className="flex justify-center">
              <BadgeDisplay
                badge={badge}
                size="medium"
                showProgress={true}
                onClick={() => setSelectedBadge(badge)}
              />
            </div>
          ))}
        </div>

        {filteredBadges.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No badges found matching your filters</p>
          </div>
        )}
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

export default BadgeShowcase;