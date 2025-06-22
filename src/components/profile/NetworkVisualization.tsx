import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Zap, Star, Activity } from 'lucide-react';

interface NetworkNode {
  id: string;
  name: string;
  expertise_areas: string[];
  connection_strength: number;
  network_degree: number;
  activity_level: 'high' | 'medium' | 'low';
  response_rate: number;
  mutual_connections: number;
}

interface ExpertiseCluster {
  name: string;
  color: string;
  members: NetworkNode[];
  strength: number;
}

const NetworkVisualization: React.FC = () => {
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [clusters, setClusters] = useState<ExpertiseCluster[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'clusters' | 'connections'>('clusters');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNetworkData();
  }, []);

  const loadNetworkData = async () => {
    setLoading(true);
    try {
      // Mock network data - in production would fetch from user_connections and user_expertise
      const mockNodes: NetworkNode[] = [
        {
          id: '1',
          name: 'Sarah Chen',
          expertise_areas: ['Product Management', 'SaaS', 'Growth'],
          connection_strength: 0.9,
          network_degree: 1,
          activity_level: 'high',
          response_rate: 0.85,
          mutual_connections: 12
        },
        {
          id: '2',
          name: 'Marcus Rodriguez',
          expertise_areas: ['AI/ML', 'Data Science', 'Python'],
          connection_strength: 0.8,
          network_degree: 1,
          activity_level: 'medium',
          response_rate: 0.72,
          mutual_connections: 8
        },
        {
          id: '3',
          name: 'Dr. Emily Watson',
          expertise_areas: ['Healthcare', 'Regulatory', 'Clinical Trials'],
          connection_strength: 0.7,
          network_degree: 2,
          activity_level: 'medium',
          response_rate: 0.68,
          mutual_connections: 5
        },
        {
          id: '4',
          name: 'Alex Kim',
          expertise_areas: ['Frontend', 'React', 'Design Systems'],
          connection_strength: 0.85,
          network_degree: 1,
          activity_level: 'high',
          response_rate: 0.91,
          mutual_connections: 15
        },
        {
          id: '5',
          name: 'Jordan Taylor',
          expertise_areas: ['Marketing', 'Growth', 'Analytics'],
          connection_strength: 0.75,
          network_degree: 2,
          activity_level: 'low',
          response_rate: 0.45,
          mutual_connections: 3
        }
      ];

      const mockClusters: ExpertiseCluster[] = [
        {
          name: 'Product & Growth',
          color: 'bg-purple-500',
          members: mockNodes.filter(n => 
            n.expertise_areas.some(area => 
              ['Product Management', 'Growth', 'SaaS', 'Marketing'].includes(area)
            )
          ),
          strength: 0.85
        },
        {
          name: 'Technology',
          color: 'bg-blue-500',
          members: mockNodes.filter(n => 
            n.expertise_areas.some(area => 
              ['AI/ML', 'Data Science', 'Frontend', 'React', 'Python'].includes(area)
            )
          ),
          strength: 0.78
        },
        {
          name: 'Healthcare',
          color: 'bg-green-500',
          members: mockNodes.filter(n => 
            n.expertise_areas.some(area => 
              ['Healthcare', 'Regulatory', 'Clinical Trials'].includes(area)
            )
          ),
          strength: 0.65
        }
      ];

      setNodes(mockNodes);
      setClusters(mockClusters);
    } catch (error) {
      console.error('Error loading network data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNodes = nodes.filter(node =>
    node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.expertise_areas.some(area => 
      area.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const getActivityColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getNetworkDegreeColor = (degree: number) => {
    switch (degree) {
      case 1: return 'bg-green-100 text-green-700';
      case 2: return 'bg-yellow-100 text-yellow-700';
      case 3: return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
          <h3 className="text-xl font-semibold text-gray-900">Network Explorer</h3>
          <p className="text-gray-600">Visualize expertise clusters in your network</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('clusters')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-300 ${
                viewMode === 'clusters'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Clusters
            </button>
            <button
              onClick={() => setViewMode('connections')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-300 ${
                viewMode === 'connections'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Connections
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
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

      {viewMode === 'clusters' ? (
        /* Expertise Clusters View */
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {clusters.map((cluster) => (
              <div
                key={cluster.name}
                onClick={() => setSelectedCluster(selectedCluster === cluster.name ? null : cluster.name)}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  selectedCluster === cluster.name
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-4 h-4 rounded-full ${cluster.color}`}></div>
                  <h4 className="text-lg font-semibold text-gray-900">{cluster.name}</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Members</span>
                    <span className="font-medium">{cluster.members.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Cluster Strength</span>
                    <span className="font-medium">{Math.round(cluster.strength * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${cluster.color}`}
                      style={{ width: `${cluster.strength * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Cluster Details */}
          {selectedCluster && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-purple-900 mb-4">
                {selectedCluster} Cluster Members
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                {clusters
                  .find(c => c.name === selectedCluster)
                  ?.members.map((member) => (
                    <div
                      key={member.id}
                      className="bg-white rounded-lg p-4 border border-purple-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNetworkDegreeColor(member.network_degree)}`}>
                          {member.network_degree === 1 ? '1st' : member.network_degree === 2 ? '2nd' : '3rd'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {member.expertise_areas.slice(0, 2).map((area, index) => (
                          <span
                            key={index}
                            className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Response: {Math.round(member.response_rate * 100)}%</span>
                        <span className={`px-2 py-1 rounded-full ${getActivityColor(member.activity_level)}`}>
                          {member.activity_level}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Individual Connections View */
        <div className="space-y-4">
          {filteredNodes.map((node) => (
            <div
              key={node.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{node.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNetworkDegreeColor(node.network_degree)}`}>
                          {node.network_degree === 1 ? '1st' : node.network_degree === 2 ? '2nd' : '3rd'} degree
                        </span>
                        <span>{node.mutual_connections} mutual</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {node.expertise_areas.map((area, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityColor(node.activity_level)}`}>
                    {node.activity_level} activity
                  </span>
                  <div className="text-right text-sm">
                    <div className="text-gray-600">Response Rate</div>
                    <div className="font-semibold text-gray-900">{Math.round(node.response_rate * 100)}%</div>
                  </div>
                </div>
              </div>
              
              {/* Connection Strength Indicator */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Connection Strength</span>
                  <span className="font-medium">{Math.round(node.connection_strength * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${node.connection_strength * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NetworkVisualization;