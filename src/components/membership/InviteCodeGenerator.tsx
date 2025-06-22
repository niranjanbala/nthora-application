import React, { useState } from 'react';
import { Copy, Plus, Calendar, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { createInviteCode, getUserInviteCodes, type InviteCode } from '../../services/membershipService';

const InviteCodeGenerator: React.FC = () => {
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [maxUses, setMaxUses] = useState(1);
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  React.useEffect(() => {
    loadInviteCodes();
  }, []);

  const loadInviteCodes = async () => {
    const codes = await getUserInviteCodes();
    setInviteCodes(codes);
  };

  const handleCreateCode = async () => {
    setIsCreating(true);
    try {
      const result = await createInviteCode(maxUses, expiresInDays);
      if (result.success) {
        await loadInviteCodes();
        setShowCreateForm(false);
        setMaxUses(1);
        setExpiresInDays(30);
      }
    } catch (error) {
      console.error('Error creating invite code:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCodeStatus = (code: InviteCode) => {
    const now = new Date();
    const expires = code.expires_at ? new Date(code.expires_at) : null;
    
    if (!code.is_active) return { status: 'inactive', color: 'gray' };
    if (expires && expires < now) return { status: 'expired', color: 'red' };
    if (code.current_uses >= code.max_uses) return { status: 'used up', color: 'orange' };
    return { status: 'active', color: 'green' };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Invite Codes</h3>
          <p className="text-gray-600">Create and manage invitation codes for new members</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-300"
        >
          <Plus className="h-4 w-4" />
          <span>Create Code</span>
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Create New Invite Code</h4>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Uses
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={maxUses}
                onChange={(e) => setMaxUses(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expires In (Days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleCreateCode}
              disabled={isCreating}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors duration-300"
            >
              {isCreating ? 'Creating...' : 'Create Code'}
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Invite Codes List */}
      <div className="space-y-4">
        {inviteCodes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No invite codes created yet</p>
          </div>
        ) : (
          inviteCodes.map((code) => {
            const status = getCodeStatus(code);
            return (
              <div
                key={code.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <code className="bg-gray-100 px-3 py-1 rounded font-mono text-lg font-semibold">
                        {code.code}
                      </code>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        status.color === 'green' ? 'bg-green-100 text-green-700' :
                        status.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                        status.color === 'red' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {status.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{code.current_uses}/{code.max_uses} uses</span>
                      </div>
                      {code.expires_at && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Expires {formatDate(code.expires_at)}</span>
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Fast-track: {code.fast_track_threshold} users
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => copyToClipboard(code.code)}
                    className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors duration-300"
                  >
                    {copiedCode === code.code ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default InviteCodeGenerator;