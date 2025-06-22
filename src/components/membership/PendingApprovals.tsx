import React, { useState, useEffect } from 'react';
import { Clock, User, CheckCircle, MessageSquare, Users } from 'lucide-react';
import { 
  getPendingUsers, 
  approvePendingUser, 
  getMemberApprovals,
  type PendingUser,
  type MemberApproval 
} from '../../services/membershipService';

const PendingApprovals: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [approvals, setApprovals] = useState<Record<string, MemberApproval[]>>({});
  const [loading, setLoading] = useState(true);
  const [approvingUser, setApprovingUser] = useState<string | null>(null);
  const [approvalReason, setApprovalReason] = useState<Record<string, string>>({});

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = async () => {
    setLoading(true);
    try {
      const users = await getPendingUsers();
      setPendingUsers(users);
      
      // Load approvals for each pending user
      const approvalsData: Record<string, MemberApproval[]> = {};
      for (const user of users) {
        const userApprovals = await getMemberApprovals(user.id);
        approvalsData[user.id] = userApprovals;
      }
      setApprovals(approvalsData);
    } catch (error) {
      console.error('Error loading pending users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setApprovingUser(userId);
    try {
      const result = await approvePendingUser(userId, approvalReason[userId]);
      if (result.success) {
        await loadPendingUsers();
        setApprovalReason(prev => ({ ...prev, [userId]: '' }));
      }
    } catch (error) {
      console.error('Error approving user:', error);
    } finally {
      setApprovingUser(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getApprovalProgress = (user: PendingUser) => {
    const needed = 3; // Fast-track threshold
    const current = user.approval_count;
    const percentage = (current / needed) * 100;
    
    return {
      current,
      needed,
      percentage: Math.min(percentage, 100),
      remaining: Math.max(needed - current, 0)
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
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
          <h3 className="text-xl font-semibold text-gray-900">Pending Approvals</h3>
          <p className="text-gray-600">Review and approve new member applications</p>
        </div>
        <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
          {pendingUsers.length} pending
        </div>
      </div>

      {pendingUsers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No pending approvals</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingUsers.map((user) => {
            const progress = getApprovalProgress(user);
            const userApprovals = approvals[user.id] || [];
            
            return (
              <div
                key={user.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{user.full_name}</h4>
                        <p className="text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    
                    {user.bio && (
                      <p className="text-gray-700 mb-3">{user.bio}</p>
                    )}
                    
                    {user.expertise_areas.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Expertise Areas:</p>
                        <div className="flex flex-wrap gap-2">
                          {user.expertise_areas.map((area, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Applied {formatDate(user.created_at)}</span>
                      </div>
                      {user.invite_code && (
                        <div className="flex items-center space-x-1">
                          <span>Invite code: </span>
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">{user.invite_code}</code>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Approval Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Approval Progress
                    </span>
                    <span className="text-sm text-gray-600">
                      {progress.current}/{progress.needed} approvals
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    ></div>
                  </div>
                  {progress.remaining > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      {progress.remaining} more approval{progress.remaining !== 1 ? 's' : ''} needed
                    </p>
                  )}
                </div>

                {/* Existing Approvals */}
                {userApprovals.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Recent Approvals:</p>
                    <div className="space-y-2">
                      {userApprovals.slice(0, 3).map((approval) => (
                        <div key={approval.id} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-gray-700">
                            Approved by {approval.approver?.full_name || 'Member'}
                          </span>
                          <span className="text-gray-500">
                            {formatDate(approval.approved_at)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Approval Form */}
                <div className="border-t pt-4">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Approval Reason (Optional)
                    </label>
                    <textarea
                      value={approvalReason[user.id] || ''}
                      onChange={(e) => setApprovalReason(prev => ({
                        ...prev,
                        [user.id]: e.target.value
                      }))}
                      placeholder="Why are you approving this member?"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                  </div>
                  
                  <button
                    onClick={() => handleApprove(user.id)}
                    disabled={approvingUser === user.id}
                    className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors duration-300"
                  >
                    {approvingUser === user.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Approving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Approve Member</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;