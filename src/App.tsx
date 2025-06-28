import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import Dashboard from './components/platform/Dashboard';
import QuestionDetail from './components/questions/QuestionDetail';
import InviteRegistration from './components/membership/InviteRegistration';
import Onboarding from './pages/Onboarding';
import OnboardingDemo from './pages/OnboardingDemo';

function App() {
  return (
    <Router>
      <motion.div 
        className="font-sans min-h-screen bg-surface-50 text-ink-base"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/join" element={<InviteRegistration />} />
          <Route path="/join/:inviteCode" element={<InviteRegistration />} />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/questions/:questionId" 
            element={
              <ProtectedRoute>
                <QuestionDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/onboarding/:inviteCode" 
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/demo" 
            element={
              <ProtectedRoute>
                <OnboardingDemo />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </motion.div>
    </Router>
  );
}

export default App;