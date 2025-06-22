import React, { useState, useEffect } from 'react';
import { X, Search, Users, ArrowRight, AlertTriangle } from 'lucide-react';
import { forwardQuestion } from '../../services/questionRoutingService';

interface ForwardingModalProps {
  questionId: string;
  isOpen: boolean;
  onClose: () => void;
  onForwarded?: () => void;
}

interface NetworkConnection {
  id: string;
  name: string;
  avatar_url?: string;
  expertise_areas: string[];
  connection_strength: number;
  network_degree: number;
  mutual_connections: number;
}

const ForwardingModal: React.FC<ForwardingModalProps> = ({ 
  questionId, 
  isOpen, 
  onClose, 
  onForwarded 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [connections, setConnections] = useState<NetworkConnection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [forwardReason, setForwardReason] = useState('');
  const [isForwarding, setIsForwarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadNetworkConnections();
    }
  }, [isOpen]);

  const loadNetworkConnections = async () => {
    setLoading(true);
    try {
      // Mock network connections - in production would fetch from user_connections
      const mockConnections: NetworkConnection[] = [
        {
          id: '1',
          name: 'Sarah Chen',
          expertise_areas: ['Product Management', 'SaaS', 'Growth'],
          connection_strength: 0.9,
          network_degree: 1,
          mutual_connections: 12
        },
        {
          id: '2',
          name: 'Marcus Rodriguez',
          expertise_areas: ['AI/ML', 'Data Science', 'Backend'],
          connection_strength: 0.8,
          network_degree: 2,
          mutual_connections: 5
        },
        {
          id: '3',
          name: 'Dr. Emily Watson',
          expertise_areas: ['Healthcare', 'Regulatory', 'Clinical Trials'],
          connection_strength: 0.7,
          network_degree: 2,
          mutual_connections: 3
        }
      ];
      setConnections(mockConnections);
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForward = async () => {
    if (!selectedConnection) return;

    setIsForwarding(true);
    try {
      const result = await forwardQuestion(questionId, selectedConnection, forwardReason);
      if (result.success) {
        onForwarded?.();
        onClose();
      }
    } catch (error) {
      console.error('Error forwarding question:', error);
    } finally {
      setIsForwarding(false);
    }
  };

  const filteredConnections = connections.filter(conn =>
    conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.expertise_areas.some(area => 
      area.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const getNetworkDegreeColor = (degree: number) => {
    switch (degree) {
      case 1: return 'bg-green-100 text-green-700';
      case 2: return 'bg-yellow-100 text-yellow-700';
      case 3: return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Forward to Network</h3>
            <p className="text-gray-600">Share this question with someone in your extended network</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or expertise..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Privacy Warning */}
        <div className="p-6 bg-yellow-50 border-b border-yellow-200">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Privacy Notice</p>
              <p className="text-sm text-yellow-700">
                Forwarding will add the selected person to the question's visibility chain. 
                They'll be able to see the original question and all responses.
              </p>
            </div>
          </div>
        </div>

        {/* Connections List */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : filteredConnections.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No connections found</p>
            </div>
          ) : (
            <div className="p-6 space-y-3">
              {filteredConnections.map((connection) => (
                <div
                  key={connection.id}
                  onClick={() => setSelectedConnection(connection.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
                    selectedConnection === connection.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{connection.name}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNetworkDegreeColor(connection.network_degree)}`}>
                            {connection.network_degree === 1 ? '1st' : connection.network_degree === 2 ? '2nd' : '3rd'} degree
                          </span>
                          <span>{connection.mutual_connections} mutual</span>
                        </div>
                      </div>
                    </div>
                    
                    {selectedConnection === connection.id && (
                      <ArrowRight className="h-5 w-5 text-purple-600" />
                    )}
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-1">
                    {connection.expertise_areas.slice(0, 3).map((area, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                      >
                        {area}
                      </span>
                    ))}
                    {connection.expertise_areas.length > 3 && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        +{connection.expertise_areas.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Forward Reason */}
        {selectedConnection && (
          <div className="p-6 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Why are you forwarding this question? (Optional)
            </label>
            <textarea
              value={forwardReason}
              onChange={(e) => setForwardReason(e.target.value)}
              placeholder="e.g., They have specific experience with this topic..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              maxLength={500}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleForward}
            disabled={!selectedConnection || isForwarding}
            className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors duration-300"
          >
            {isForwarding ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            <span>{isForwarding ? 'Forwarding...' : 'Forward Question'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForwardingModal;