import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageSquare, Plus, Search } from 'lucide-react';

interface Endorsement {
  id: string;
  endorser_name: string;
  endorser_avatar?: string;
  expertise_tag: string;
  strength: number;
  reason?: string;
  created_at: string;
}

interface EndorsementRequest {
  expertise_tag: string;
  target_user_id: string;
  target_user_name: string;
  reason: string;
}

const ExpertiseEndorsements: React.FC = () => {
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEndorsements();
  }, []);

  const loadEndorsements = async () => {
    setLoading(true);
    try {
      // Mock endorsements data - in production would fetch from expertise_endorsements
      const mockEndorsements: Endorsement[] = [
        {
          id: '1',
          endorser_name: 'Sarah Chen',
          expertise_tag: 'Product Management',
          strength: 5,
          reason: 'Exceptional product strategy and execution. Led our most successful product launch.',
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          endorser_name: 'Marcus Rodriguez',
          expertise_tag: 'AI/ML',
          strength: 4,
          reason: 'Deep technical knowledge and great at explaining complex concepts.',
          created_at: '2024-01-10T14:30:00Z'
        },
        {
          id: '3',
          endorser_name: 'Dr. Emily Watson',
          expertise_tag: 'Product Management',
          strength: 5,
          reason: 'Outstanding leadership in product development and team management.',
          created_at: '2024-01-08T09:15:00Z'
        },
        {
          id: '4',
          endorser_name: 'Alex Kim',
          expertise_tag: 'Growth Marketing',
          strength: 4,
          created_at: '2024-01-05T16:45:00Z'
        }
      ];
      setEndorsements(mockEndorsements);
    } catch (error) {
      console.error('Error loading endorsements:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedEndorsements = endorsements.reduce((acc, endorsement) => {
    if (!acc[endorsement.expertise_tag]) {
      acc[endorsement.expertise_tag] = [];
    }
    acc[endorsement.expertise_tag].push(endorsement);
    return acc;
  }, {} as Record<string, Endorsement[]>);

  const getStrengthColor = (strength: number) => {
    if (strength >= 5) return 'text-green-600';
    if (strength >= 4) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getStrengthLabel = (strength: number) => {
    switch (strength) {
      case 5: return 'Expert';
      case 4: return 'Very Good';
      case 3: return 'Good';
      case 2: return 'Fair';
      case 1: return 'Basic';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Expertise Endorsements</h3>
          <p className="text-gray-600">Peer validation of your skills and knowledge</p>
        </div>
        <button
          onClick={() => setShowRequestForm(true)}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-300"
        >
          <Plus className="h-4 w-4" />
          <span>Request Endorsement</span>
        </button>
      </div>

      {/* Request Endorsement Form */}
      {showRequestForm && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Request Endorsement</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expertise Area
              </label>
              <input
                type="text"
                value={selectedExpertise}
                onChange={(e) => setSelectedExpertise(e.target.value)}
                placeholder="e.g., Product Management, AI/ML"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search for someone to endorse you
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your network..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  // Handle endorsement request
                  setShowRequestForm(false);
                  setSelectedExpertise('');
                  setSearchQuery('');
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-300"
              >
                Send Request
              </button>
              <button
                onClick={() => {
                  setShowRequestForm(false);
                  setSelectedExpertise('');
                  setSearchQuery('');
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Endorsements by Expertise */}
      {Object.keys(groupedEndorsements).length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No endorsements yet</p>
          <p className="text-sm">Request endorsements from colleagues who know your work</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedEndorsements).map(([expertise, endorsementList]) => (
            <div key={expertise} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <h4 className="text-lg font-semibold text-gray-900">{expertise}</h4>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                    {endorsementList.length} endorsement{endorsementList.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  <span className="font-semibold text-gray-900">
                    {(endorsementList.reduce((sum, e) => sum + e.strength, 0) / endorsementList.length).toFixed(1)}
                  </span>
                  <span className="text-gray-600">/5.0</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {endorsementList.map((endorsement) => (
                  <div
                    key={endorsement.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Star className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{endorsement.endorser_name}</p>
                          <p className="text-sm text-gray-600">{formatDate(endorsement.created_at)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < endorsement.strength
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className={`ml-2 text-sm font-medium ${getStrengthColor(endorsement.strength)}`}>
                          {getStrengthLabel(endorsement.strength)}
                        </span>
                      </div>
                    </div>
                    
                    {endorsement.reason && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-start space-x-2">
                          <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                          <p className="text-gray-700 text-sm leading-relaxed">
                            "{endorsement.reason}"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpertiseEndorsements;