import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, Star, Settings, Plus, Bell, Search, Menu, X, Sparkle, Zap, ArrowRight, Trophy, User, LogOut, Compass, ToggleLeft, ToggleRight } from 'lucide-react';
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
import NetworkActivityFeed from '../network/NetworkActivityFeed';
import AutoDetectedSkills from '../network/AutoDetectedSkills';
import PreferencesPage from '../../pages/PreferencesPage';
import { signOut } from '../../services/authService';

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
  | 'network_depth'
  | 'network_activity'
  | 'auto_skills'
  | 'preferences'
  | 'explore_topics';

const Dashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentView, setCurrentView] = useState<DashboardView>('feed');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      navigate('/login');
    }
  };

  const toggleDemoMode = () => {
    setIsDemoMode(!isDemoMode);
  };

  const navigationItems = [
    { id: 'feed', label: 'Feed', icon: MessageSquare, badge: null, description: 'Latest questions and activity' },
    { id: 'explore_topics', label: 'Explore Topics', icon: Compass, badge: null, description: 'Questions in your areas of interest' },
    { id: 'ask_question', label: 'Ask Question', icon: Plus, badge: null, description: 'Get expert answers instantly' },
    { id: 'my_questions', label: 'My Questions', icon: MessageSquare, badge: null, description: 'Questions you\'ve asked' },
    { id: 'matched_questions', label: 'Answer Questions', icon: Users, badge: 2, description: 'Questions matched to your expertise' },
    { id: 'expertise', label: 'My Expertise', icon: Star, badge: null, description: 'Manage your knowledge areas' },
    { id: 'auto_skills', label: 'Auto-Detected Skills', icon: Sparkle, badge: 3, description: 'Skills inferred from your answers' },
    { id: 'network_activity', label: 'Network Activity', icon: Zap, badge: null, description: 'Questions and answers from your network' },
    { id: 'network', label: 'Network', icon: Users, badge: null, description: 'Explore your extended network' },
    { id: 'endorsements', label: 'Endorsements', icon: Star, badge: null, description: 'Peer validation of your skills' },
    { id: 'badges', label: 'Badges', icon: Trophy, badge: BadgeService.getRecentlyEarnedBadges().length, description: 'Your achievements and recognition' },
    { id: 'profile', label: 'My Profile', icon: User, badge: null, description: 'View and edit your profile' },
    { id: 'approvals', label: 'Approvals', icon: Users, badge: 1, description: 'Review new member applications' },
    { id: 'invites', label: 'Invite Codes', icon: Plus, badge: null, description: 'Invite trusted connections' },
    { id: 'preferences', label: 'Preferences', icon: Settings, badge: null, description: 'Customize your experience' }
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'feed':
        return <QuestionFeed view="all" isDemoMode={isDemoMode} />;
      case 'explore_topics':
        return <QuestionFeed view="explore_topics" isDemoMode={isDemoMode} />;
      case 'ask_question':
        return <QuestionComposer onQuestionCreated={() => handleViewChange('my_questions')} />;
      case 'my_questions':
        return <QuestionFeed view="my_questions" isDemoMode={isDemoMode} />;
      case 'matched_questions':
        return <QuestionFeed view="matched_questions" isDemoMode={isDemoMode} />;
      case 'expertise':
        return <ExpertiseManager />;
      case 'auto_skills':
        return <AutoDetectedSkills onSkillsUpdated={() => handleViewChange('auto_skills')} />;
      case 'network_activity':
        return <NetworkActivityFeed maxDegree={2} limit={50} />;
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
      case 'preferences':
        return <PreferencesPage />;
      default:
        return <QuestionFeed view="all" isDemoMode={isDemoMode} />;
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
    <div className="min-h-screen bg-surface-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white shadow-soft border-b border-surface-200 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center">
                <Sparkle className="h-4 w-4 text-accent-600" />
              </div>
              <span className="text-xl font-medium text-ink-dark">N-th`ora</span>
            </div>
            
            {/* Mobile Actions */}
            <div className="flex items-center space-x-3">
              <button className="relative p-2 text-ink-light hover:text-ink-dark transition-colors duration-300">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
              
              <button
                onClick={toggleMobileMenu}
                className="p-2 text-ink-light hover:text-ink-dark transition-colors duration-300"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          {/* Current View Info */}
          <div className="mt-3">
            <h1 className="text-lg font-medium text-ink-dark">{getViewTitle()}</h1>
            <p className="text-sm text-ink-light">{getViewDescription()}</p>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block bg-white shadow-soft border-b border-surface-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
                  <Sparkle className="h-5 w-5 text-accent-600" />
                </div>
                <div>
                  <span className="text-xl font-medium text-ink-dark">N-th`ora</span>
                  <p className="text-xs text-ink-light">Amplify Your Network</p>
                </div>
              </div>
              <div className="hidden md:block text-surface-300">|</div>
              <div className="hidden md:block">
                <h1 className="text-lg font-medium text-ink-dark">{getViewTitle()}</h1>
                <p className="text-sm text-ink-light">{getViewDescription()}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Demo Mode Toggle */}
              <button
                onClick={toggleDemoMode}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-300 ${
                  isDemoMode 
                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isDemoMode ? (
                  <>
                    <ToggleRight className="h-5 w-5" />
                    <span className="text-sm font-medium">Demo Mode</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="h-5 w-5" />
                    <span className="text-sm font-medium">Demo Mode</span>
                  </>
                )}
              </button>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search questions, people..."
                  className="input pl-10 w-64"
                />
              </div>
              
              <button className="relative p-2 text-ink-light hover:text-ink-dark transition-colors duration-300">
                <Bell className="h-6 w-6" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
              
              <button 
                onClick={() => handleViewChange('preferences')}
                className="p-2 text-ink-light hover:text-ink-dark transition-colors duration-300"
              >
                <Settings className="h-6 w-6" />
              </button>
              
              <div className="w-8 h-8 bg-surface-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-ink-base" />
              </div>
              
              <button 
                onClick={handleLogout}
                className="p-2 text-ink-light hover:text-blush-600 transition-colors duration-300"
                title="Logout"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="lg:hidden fixed inset-0 z-50 bg-ink-dark/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-white shadow-xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="flex flex-col h-full">
                {/* Menu Header */}
                <div className="bg-surface-50 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                        <Sparkle className="h-5 w-5 text-accent-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-medium text-ink-dark">N-th`ora</h2>
                        <p className="text-ink-light text-sm">Your Expert Network</p>
                      </div>
                    </div>
                    <button
                      onClick={toggleMobileMenu}
                      className="p-2 text-ink-light hover:text-ink-dark"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Demo Mode Toggle (Mobile) */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <button
                    onClick={toggleDemoMode}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors duration-300 ${
                      isDemoMode 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {isDemoMode ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                      <span className="font-medium">Demo Mode</span>
                    </div>
                    <span className="text-xs">
                      {isDemoMode ? 'On' : 'Off'}
                    </span>
                  </button>
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
                              ? 'bg-accent-50 text-accent-700 border border-accent-200'
                              : 'text-ink-base hover:bg-surface-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <IconComponent className="h-5 w-5" />
                            <div>
                              <div className="font-medium">{item.label}</div>
                              <div className={`text-xs ${isActive ? 'text-accent-600/70' : 'text-ink-light'}`}>
                                {item.description}
                              </div>
                            </div>
                          </div>
                          {item.badge && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isActive ? 'bg-accent-200 text-accent-700' : 'bg-accent-500 text-white'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                    
                    {/* Logout Button for Mobile */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between p-4 rounded-xl text-left transition-all duration-300 text-blush-700 hover:bg-blush-50 mt-4"
                    >
                      <div className="flex items-center space-x-3">
                        <LogOut className="h-5 w-5" />
                        <div>
                          <div className="font-medium">Logout</div>
                          <div className="text-xs text-blush-600/70">
                            Sign out of your account
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="p-4 bg-surface-50 border-t border-surface-200">
                  <h3 className="text-sm font-medium text-ink-dark mb-3">Quick Stats</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center bg-white rounded-lg p-3 border border-surface-200">
                      <div className="text-lg font-medium text-accent-600">12</div>
                      <div className="text-xs text-ink-light">Questions Asked</div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-3 border border-surface-200">
                      <div className="text-lg font-medium text-sage-600">28</div>
                      <div className="text-xs text-ink-light">Answers Given</div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-3 border border-surface-200">
                      <div className="text-lg font-medium text-clay-600">45</div>
                      <div className="text-xs text-ink-light">Helpful Votes</div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-3 border border-surface-200">
                      <div className="text-lg font-medium text-blush-600">156</div>
                      <div className="text-xs text-ink-light">Network Size</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex gap-6 lg:gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Navigation */}
              <nav className="bg-white rounded-2xl shadow-soft border border-surface-200 p-4">
                <div className="space-y-1">
                  {navigationItems.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = currentView === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleViewChange(item.id as DashboardView)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-300 ${
                          isActive
                            ? 'bg-accent-50 text-accent-700 border border-accent-200'
                            : 'text-ink-base hover:bg-surface-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <IconComponent className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isActive ? 'bg-accent-200 text-accent-700' : 'bg-accent-500 text-white'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                  
                  {/* Logout Button for Desktop Sidebar */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-300 text-blush-700 hover:bg-blush-50 mt-2"
                  >
                    <div className="flex items-center space-x-3">
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">Logout</span>
                    </div>
                  </button>
                </div>
              </nav>

              {/* Badge Progress */}
              <BadgeProgress 
                onViewAllBadges={() => handleViewChange('badges')}
              />

              {/* Quick Action */}
              <div className="bg-white rounded-2xl p-6 border border-surface-200 shadow-soft">
                <div className="flex items-center space-x-2 mb-3">
                  <Zap className="h-5 w-5 text-accent-600" />
                  <h3 className="font-medium text-ink-dark">Quick Ask</h3>
                </div>
                <p className="text-ink-light text-sm mb-4">
                  Got a burning question? Get expert answers from your network instantly.
                </p>
                <button
                  onClick={() => handleViewChange('ask_question')}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ask Question</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <motion.div 
            className="flex-1 min-w-0"
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>

      {/* Mobile FAB for Quick Ask */}
      <div className="lg:hidden fixed bottom-6 right-6 z-30">
        <button
          onClick={() => {
            handleViewChange('ask_question');
            setIsMobileMenuOpen(false);
          }}
          className="w-14 h-14 bg-accent-600 text-white rounded-full shadow-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center transform hover:scale-105"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;