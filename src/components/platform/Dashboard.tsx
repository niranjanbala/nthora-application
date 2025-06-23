import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, Users, Star, Settings, Plus, Bell, Search, Menu, X, Network, Sparkles, Zap, ArrowRight, Trophy, User } from 'lucide-react';
import QuestionComposer from '../questions/QuestionComposer';
import QuestionFeed from '../questions/QuestionFeed';
import ExpertiseManager from '../questions/ExpertiseManager';
import NetworkVisualization from '../profile/NetworkVisualization';
import ExpertiseEndorsements from '../profile/ExpertiseEndorsements';
import PendingApprovals from '../membership/PendingApprovals';
import InviteCodeGenerator from '../membership/InviteCodeGenerator';
import BadgeProgress from '../badges/BadgeProgress';
import UserProfile from '../profile/UserProfile';
import BadgeShowcase from '../badges/BadgeShowcase';
import { BadgeService } from '../../services/badgeService';
import UserNetworkBadges from '../profile/UserNetworkBadges';
import NetworkDepthBadges from '../badges/NetworkDepthBadges';

type DashboardView = 
  | 'feed' 
  | 'ask_question' 
  | 'my_questions' 
  | 'matched_questions' 
  | 'expertise' 
  | 'network' 
  | 'endorsements'
  | 'approvals'
  | 'invites'
  | 'badges'
  | 'profile'
  | 'network_badges'
  | 'network_depth';

const Dashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentView, setCurrentView] = useState<DashboardView>('feed');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);

  // Handle URL-based view changes
  useEffect(() => {
    const view = searchParams.get('view') as DashboardView;
    if (view && navigationItems.some(item => item.id === view)) {
      setCurrentView(view);
    }
  }, [searchParams]);

  const handleViewChange = (view: DashboardView) => {
    setCurrentView(view);
    setSearchParams({ view });
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    { id: 'feed', label: 'Feed', icon: MessageSquare, badge: null, description: 'Latest questions and activity' },
    { id: 'ask_question', label: 'Ask Question', icon: Plus, badge: null, description: 'Get expert answers instantly' },
    { id: 'my_questions', label: 'My Questions', icon: MessageSquare, badge: null, description: 'Questions you\'ve asked' },
    { id: 'matched_questions', label: 'Answer Questions', icon: Users, badge: 2, description: 'Questions matched to your expertise' },
    { id: 'expertise', label: 'My Expertise', icon: Star, badge: null, description: 'Manage your knowledge areas' },
    { id: 'network', label: 'Network', icon: Users, badge: null, description: 'Explore your extended network' },
    { id: 'endorsements', label: 'Endorsements', icon: Star, badge: null, description: 'Peer validation of your skills' },
    { id: 'badges', label: 'Badges', icon: Trophy, badge: BadgeService.getRecentlyEarnedBadges().length, description: 'Your achievements and recognition' },
    { id: 'network_badges', label: 'Network Badges', icon: Network, badge: null, description: 'Network depth and influence badges' },
    { id: 'network_depth', label: 'Network Depth', icon: Network, badge: null, description: 'Network connection achievements' },
    { id: 'profile', label: 'My Profile', icon: User, badge: null, description: 'View and edit your profile' },
    { id: 'approvals', label: 'Approvals', icon: Users, badge: 1, description: 'Review new member applications' },
    { id: 'invites', label: 'Invite Codes', icon: Plus, badge: null, description: 'Invite trusted connections' }
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'feed':
        return <QuestionFeed view="all" />;
      case 'ask_question':
        return <QuestionComposer onQuestionCreated={() => handleViewChange('my_questions')} />;
      case 'my_questions':
        return <QuestionFeed view="my_questions" />;
      case 'matched_questions':
        return <QuestionFeed view="matched_questions" />;
      case 'expertise':
        return <ExpertiseManager />;
      case 'network':
        return <NetworkVisualization />;
      case 'endorsements':
        return <ExpertiseEndorsements />;
      case 'badges':
        return <BadgeShowcase userBadges={BadgeService.getUserBadges()} showAll={true} />;
      case 'network_badges':
        return <UserNetworkBadges />;
      case 'network_depth':
        return <NetworkDepthBadges showProgress={true} />;
      case 'profile':
        return <UserProfile />;
      case 'approvals':
        return <PendingApprovals />;
      case 'invites':
        return <InviteCodeGenerator />;
      default:
        return <QuestionFeed view="all" />;
    }
  };

  const getViewTitle = () => {
    const item = navigationItems.find(item => item.id === currentView);
    return item?.label || 'Dashboard';
  };

  const getViewDescription = () => {
    const item = navigationItems.find(item => item.id === currentView);
    return item?.description || 'Amplify your network. Get trusted answers instantly.';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Network className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">N-th`ora</span>
            </div>
            
            {/* Mobile Actions */}
            <div className="flex items-center space-x-3">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors duration-300">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
              
              <button
                onClick={toggleMobileMenu}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          {/* Current View Info */}
          <div className="mt-3">
            <h1 className="text-lg font-semibold text-gray-900">{getViewTitle()}</h1>
            <p className="text-sm text-gray-600">{getViewDescription()}</p>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Network className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-xl font-semibold text-gray-900">N-th`ora</span>
                  <p className="text-xs text-gray-500">Amplify Your Network</p>
                </div>
              </div>
              <div className="hidden md:block text-gray-300">|</div>
              <div className="hidden md:block">
                <h1 className="text-lg font-medium text-gray-900">{getViewTitle()}</h1>
                <p className="text-sm text-gray-600">{getViewDescription()}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions, people..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
                />
              </div>
              
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors duration-300">
                <Bell className="h-6 w-6" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
              
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-300">
                <Settings className="h-6 w-6" />
              </button>
              
              <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Menu Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Network className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">N-th`ora</h2>
                      <p className="text-purple-200 text-sm">Your Expert Network</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleMobileMenu}
                    className="p-2 text-white/80 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {navigationItems.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = currentView === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleViewChange(item.id as DashboardView)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <IconComponent className="h-5 w-5" />
                          <div>
                            <div className="font-medium">{item.label}</div>
                            <div className={`text-xs ${isActive ? 'text-purple-200' : 'text-gray-500'}`}>
                              {item.description}
                            </div>
                          </div>
                        </div>
                        {item.badge && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isActive ? 'bg-white/20 text-white' : 'bg-purple-600 text-white'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">12</div>
                    <div className="text-xs text-gray-600">Questions Asked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-indigo-600">28</div>
                    <div className="text-xs text-gray-600">Answers Given</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">45</div>
                    <div className="text-xs text-gray-600">Helpful Votes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">156</div>
                    <div className="text-xs text-gray-600">Network Size</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex gap-6 lg:gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Navigation */}
              <nav className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="space-y-2">
                  {navigationItems.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = currentView === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleViewChange(item.id as DashboardView)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg transform scale-105'
                            : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <IconComponent className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isActive ? 'bg-white/20 text-white' : 'bg-purple-600 text-white'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </nav>

              {/* Badge Progress */}
              <BadgeProgress 
                onViewAllBadges={() => handleViewChange('badges')}
              />

              {/* Quick Action */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
                <div className="flex items-center space-x-2 mb-3">
                  <Zap className="h-5 w-5" />
                  <h3 className="font-semibold">Quick Ask</h3>
                </div>
                <p className="text-purple-100 text-sm mb-4">
                  Got a burning question? Get expert answers from your network instantly.
                </p>
                <button
                  onClick={() => handleViewChange('ask_question')}
                  className="w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ask Question</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Mobile FAB for Quick Ask */}
      <div className="lg:hidden fixed bottom-6 right-6 z-30">
        <button
          onClick={() => {
            handleViewChange('ask_question');
            setIsMobileMenuOpen(false);
          }}
          className="w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center transform hover:scale-110"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;