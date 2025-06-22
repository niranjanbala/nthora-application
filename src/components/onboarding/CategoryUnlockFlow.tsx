import React, { useState, useEffect } from 'react';
import { Lock, Users, Zap, Target, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import NetworkStrengthGate from './NetworkStrengthGate';

interface CategoryData {
  id: string;
  name: string;
  description: string;
  requiredStrength: number;
  expertCount: number;
  recentQuestions: number;
  avgResponseTime: string;
  topExperts: string[];
}

interface CategoryUnlockFlowProps {
  userNetworkStrength: number;
  selectedCategories: string[];
  onCategoryUnlocked?: (category: string) => void;
  onInviteSent?: () => void;
}

const CategoryUnlockFlow: React.FC<CategoryUnlockFlowProps> = ({
  userNetworkStrength,
  selectedCategories,
  onCategoryUnlocked,
  onInviteSent
}) => {
  const [networkStrength, setNetworkStrength] = useState(userNetworkStrength);
  const [unlockedCategories, setUnlockedCategories] = useState<string[]>([]);

  // Mock category data with different unlock requirements
  const categories: CategoryData[] = [
    {
      id: 'ai-ml',
      name: 'AI/ML',
      description: 'Machine learning, data science, and artificial intelligence',
      requiredStrength: 15,
      expertCount: 234,
      recentQuestions: 47,
      avgResponseTime: '2.3 hours',
      topExperts: ['Senior ML Engineer at OpenAI', 'Data Science Lead at Meta', 'AI Researcher at Stanford']
    },
    {
      id: 'fintech',
      name: 'Fintech',
      description: 'Financial technology, payments, and banking innovation',
      requiredStrength: 20,
      expertCount: 189,
      recentQuestions: 32,
      avgResponseTime: '1.8 hours',
      topExperts: ['VP Engineering at Stripe', 'Product Lead at Coinbase', 'Fintech Founder (Series B)']
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      description: 'Digital health, medical devices, and healthcare innovation',
      requiredStrength: 25,
      expertCount: 156,
      recentQuestions: 28,
      avgResponseTime: '3.1 hours',
      topExperts: ['Chief Medical Officer', 'Healthcare IT Director', 'Digital Health Founder']
    },
    {
      id: 'enterprise-sales',
      name: 'Enterprise Sales',
      description: 'B2B sales, enterprise accounts, and sales operations',
      requiredStrength: 12,
      expertCount: 312,
      recentQuestions: 56,
      avgResponseTime: '1.5 hours',
      topExperts: ['VP Sales at Salesforce', 'Enterprise AE at HubSpot', 'Sales Ops Director']
    },
    {
      id: 'crypto-web3',
      name: 'Crypto/Web3',
      description: 'Blockchain, DeFi, NFTs, and decentralized technologies',
      requiredStrength: 18,
      expertCount: 198,
      recentQuestions: 41,
      avgResponseTime: '2.7 hours',
      topExperts: ['Protocol Engineer at Ethereum', 'DeFi Product Manager', 'Crypto Fund Partner']
    },
    {
      id: 'climate-tech',
      name: 'Climate Tech',
      description: 'Sustainability, clean energy, and environmental technology',
      requiredStrength: 22,
      expertCount: 143,
      recentQuestions: 19,
      avgResponseTime: '4.2 hours',
      topExperts: ['Climate Tech Investor', 'Renewable Energy Engineer', 'Sustainability Director']
    }
  ];

  const handleInviteSent = () => {
    // Simulate network strength increase when invites are sent
    setNetworkStrength(prev => prev + 2);
    onInviteSent?.();
  };

  const handleCategoryUnlocked = (categoryId: string) => {
    if (!unlockedCategories.includes(categoryId)) {
      setUnlockedCategories(prev => [...prev, categoryId]);
      onCategoryUnlocked?.(categoryId);
    }
  };

  const getUnlockableCategories = () => {
    return categories.filter(category => 
      selectedCategories.includes(category.id) || 
      selectedCategories.some(selected => 
        category.name.toLowerCase().includes(selected.toLowerCase()) ||
        selected.toLowerCase().includes(category.name.toLowerCase())
      )
    );
  };

  const unlockableCategories = getUnlockableCategories();
  const lockedCategories = unlockableCategories.filter(cat => networkStrength < cat.requiredStrength);
  const availableCategories = unlockableCategories.filter(cat => networkStrength >= cat.requiredStrength);

  return (
    <div className="space-y-6">
      {/* Network Strength Overview */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Your Network Strength</h3>
            <p className="text-gray-600">Unlock specialized expertise categories by expanding your network</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-600">{networkStrength}</div>
            <div className="text-sm text-gray-600">connections</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <div className="text-lg font-semibold text-green-600">{availableCategories.length}</div>
            <div className="text-xs text-gray-600">Unlocked</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <div className="text-lg font-semibold text-orange-600">{lockedCategories.length}</div>
            <div className="text-xs text-gray-600">Locked</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <div className="text-lg font-semibold text-purple-600">{categories.reduce((sum, cat) => sum + cat.expertCount, 0)}</div>
            <div className="text-xs text-gray-600">Total Experts</div>
          </div>
        </div>
      </div>

      {/* Available Categories */}
      {availableCategories.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            Available Categories ({availableCategories.length})
          </h4>
          <div className="grid gap-4">
            {availableCategories.map((category) => (
              <div key={category.id} className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h5 className="text-lg font-semibold text-green-900">{category.name}</h5>
                    <p className="text-green-700">{category.description}</p>
                  </div>
                  <div className="bg-green-100 rounded-full p-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-800">{category.expertCount}</div>
                    <div className="text-xs text-green-600">Experts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-800">{category.recentQuestions}</div>
                    <div className="text-xs text-green-600">Recent Q&As</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-800">{category.avgResponseTime}</div>
                    <div className="text-xs text-green-600">Avg Response</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <p className="text-sm font-medium text-green-900 mb-2">Top Experts Available:</p>
                  <div className="space-y-1">
                    {category.topExperts.slice(0, 2).map((expert, index) => (
                      <div key={index} className="text-sm text-green-700">• {expert}</div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Categories */}
      {lockedCategories.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Lock className="h-5 w-5 text-gray-600 mr-2" />
            Locked Categories ({lockedCategories.length})
          </h4>
          <div className="grid gap-6">
            {lockedCategories.map((category) => (
              <div key={category.id}>
                <NetworkStrengthGate
                  category={category.name}
                  currentStrength={networkStrength}
                  requiredStrength={category.requiredStrength}
                  onInviteSent={handleInviteSent}
                  onUnlocked={() => handleCategoryUnlocked(category.id)}
                />
                
                {/* Category Preview */}
                <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-400">{category.expertCount}</div>
                      <div className="text-xs text-gray-500">Experts Waiting</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-400">{category.recentQuestions}</div>
                      <div className="text-xs text-gray-500">Recent Q&As</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-400">{category.avgResponseTime}</div>
                      <div className="text-xs text-gray-500">Avg Response</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview of Available Experts:</p>
                    <div className="space-y-1">
                      {category.topExperts.map((expert, index) => (
                        <div key={index} className="text-sm text-gray-600 opacity-60">• {expert}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivation Section */}
      {lockedCategories.length > 0 && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="h-6 w-6" />
            <h4 className="text-lg font-semibold">Unlock Your Full Potential</h4>
          </div>
          <p className="text-purple-100 mb-4">
            Each person you invite doesn't just expand your network—they unlock access to their expertise 
            and their connections' knowledge. The more diverse your network, the better answers you'll get.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold">{lockedCategories.reduce((sum, cat) => sum + cat.expertCount, 0)}</div>
              <div className="text-sm text-purple-200">Experts waiting to help</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold">{Math.max(...lockedCategories.map(cat => cat.requiredStrength)) - networkStrength}</div>
              <div className="text-sm text-purple-200">Invites to unlock all</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryUnlockFlow;