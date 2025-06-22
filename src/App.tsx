import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/platform/Dashboard';
import InviteRegistration from './components/membership/InviteRegistration';
import Onboarding from './pages/Onboarding';

function App() {
  return (
    <Router>
      <div className="font-sans">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/join" element={<InviteRegistration />} />
          <Route path="/join/:inviteCode" element={<InviteRegistration />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/onboarding/:inviteCode" element={<Onboarding />} />
          <Route path="*" element={<Navigate to="/join" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;