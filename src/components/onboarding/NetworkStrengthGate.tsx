import React, { useState, useEffect } from 'react';
import { Users, Lock, Unlock, Share2, Mail, MessageCircle, Copy, CheckCircle, ArrowRight, Target, Zap } from 'lucide-react';

interface NetworkStrengthGateProps {
  category: string;
  currentStrength: number;
  requiredStrength: number;
  onInviteSent?: () => void;
  onUnlocked?: () => void;
}

interface InviteMethod {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  action: string;
}

const NetworkStrengthGate: React.FC<NetworkStrengthGateProps> = ({
  category,
  currentStrength,
  requiredStrength,
  onInviteSent,
  onUnlocked
}) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [invitesSent, setInvitesSent] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const needed = requiredStrength - currentStrength;
  const progress = (currentStrength / requiredStrength) * 100;
  const isUnlocked = currentStrength >= requiredStrength;

  const inviteMethods: InviteMethod[] = [
    {
      id: 'email',
      name: 'Email Contacts',
      icon: Mail,
      description: 'Send personalized invites to your email contacts',
      action: 'Send Email Invites'
    },
    {
      id: 'link',
      name: 'Share Link',
      icon: Share2,
      description: 'Copy your referral link to share anywhere',
      action: 'Copy Invite Link'
    },
    {
      id: 'message',
      name: 'Direct Message',
      icon: MessageCircle,
      description: 'Send invites via text or messaging apps',
      action: 'Share via Message'
    }
  ];

  const handleInviteMethod = async (methodId: string) => {
    setSelectedMethod(methodId);
    
    if (methodId === 'link') {
      // Copy invite link to clipboard
      const inviteLink = `${window.location.origin}/join/ABC123`; // Mock invite code
      try {
        await navigator.clipboard.writeText(inviteLink);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } catch (error) {
        console.error('Failed to copy link:', error);
      }
    } else if (methodId === 'email') {
      // Simulate email invite flow
      setInvitesSent(prev => prev + 3);
      onInviteSent?.();
    } else if (methodId === 'message') {
      // Simulate message sharing
      setInvitesSent(prev => prev + 2);
      onInviteSent?.();
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'ai/ml': return '🤖';
      case 'fintech': return '💰';
      case 'healthcare': return '🏥';
      case 'enterprise sales': return '🏢';
      case 'crypto/web3': return '₿';
      case 'climate tech': return '🌱';
      default: return '🎯';
    }
  };

  const getNetworkBenefits = (category: string) => {
    const benefits = {
      'AI/ML': [
        'Connect with ML engineers at top tech companies',
        'Access to AI research and implementation experts',
        'Insights from data scientists and AI product managers'
      ],
      'Fintech': [
        'Network with fintech founders and executives',
        'Access to regulatory and compliance experts',
        'Connect with payment and banking technology leaders'
      ],
      'Healthcare': [
        'Reach healthcare professionals and administrators',
        'Connect with medical device and pharma experts',
        'Access to digital health and telemedicine specialists'
      ],
      'Enterprise Sales': [
        'Network with B2B sales leaders and executives',
        'Access to enterprise account managers',
        'Connect with sales operations and enablement experts'
      ]
    };
    
    return benefits[category as keyof typeof benefits] || [
      'Access to specialized industry experts',
      'Connect with experienced professionals',
      'Unlock domain-specific knowledge and insights'
    ];
  };

  useEffect(() => {
    if (isUnlocked) {
      onUnlocked?.();
    }
  }, [isUnlocked, onUnlocked]);

  if (isUnlocked) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Unlock className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900">
              {getCategoryIcon(category)} {category} Unlocked!
            </h3>
            <p className="text-green-700">You now have access to experts in this category</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <span className="text-green-800 font-medium">Network Strength: {currentStrength}</span>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <Lock className="h-6 w-6 text-gray-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {getCategoryIcon(category)} {category}
            </h3>
            <p className="text-gray-600">Expand your network to unlock this category</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Network Strength</span>
            <span className="text-sm text-gray-600">{currentStrength}/{requiredStrength}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            <strong>{needed}</strong> more connection{needed !== 1 ? 's' : ''} needed to unlock
          </p>
        </div>

        {/* Benefits Preview */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Target className="h-4 w-4 mr-2 text-purple-600" />
            What you'll unlock:
          </h4>
          <ul className="space-y-2">
            {getNetworkBenefits(category).map((benefit, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Call to Action */}
        <button
          onClick={() => setShowInviteModal(true)}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
        >
          <Users className="h-5 w-5" />
          <span>Invite Contacts to Unlock</span>
          <ArrowRight className="h-4 w-4" />
        </button>

        {invitesSent > 0 && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                {invitesSent} invite{invitesSent !== 1 ? 's' : ''} sent! 
                {needed - invitesSent > 0 && ` ${needed - invitesSent} more needed.`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Unlock {category}</h3>
                  <p className="text-purple-100">Invite {needed} more contact{needed !== 1 ? 's' : ''}</p>
                </div>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-white/80 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-gray-900">Why invite contacts?</span>
                </div>
                <p className="text-gray-600 text-sm">
                  N-th`ora works by mapping your extended network. The more connections you have, 
                  the more experts we can find for your specific questions.
                </p>
              </div>

              {/* Invite Methods */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 mb-3">Choose how to invite:</h4>
                {inviteMethods.map((method) => {
                  const IconComponent = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => handleInviteMethod(method.id)}
                      className="w-full p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <IconComponent className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{method.name}</div>
                          <div className="text-sm text-gray-600">{method.description}</div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Copy Link Success */}
              {copiedLink && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800">
                      Invite link copied! Share it with your contacts.
                    </span>
                  </div>
                </div>
              )}

              {/* Progress Update */}
              {invitesSent > 0 && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-900">Progress Update</span>
                    <span className="text-sm text-blue-700">{invitesSent} sent</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((invitesSent / needed) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-blue-700 mt-2">
                    {needed - invitesSent > 0 
                      ? `${needed - invitesSent} more needed to unlock ${category}`
                      : `${category} will be unlocked once your invites are accepted!`
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                Your contacts will receive a personalized invite to join N-th`ora. 
                They can decline without affecting your relationship.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NetworkStrengthGate;