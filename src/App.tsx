import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { AppLayout, PublicLayout } from './components/layout/AppLayout';
import { ProtectedRoute, CreatorRoute } from './components/layout/ProtectedRoutes';

import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { Studio } from './pages/Studio';
import { CreatorDashboard } from './pages/CreatorDashboard';
import { Notifications, Search } from './pages/Extras';
import { MessagesList, MessageThread } from './pages/MessagesFlow';
import { FollowStats } from './pages/FollowStats';
import { Settings } from './pages/Settings';

function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages Output */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      <Route element={<AppLayout />}>
        <Route path="/u/:username" element={<Profile />} />
        <Route path="/u/:username/followers" element={<FollowStats type="followers" />} />
        <Route path="/u/:username/following" element={<FollowStats type="following" />} />

        {/* Protected App Pages Output */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/messages" element={<MessagesList />} />
          <Route path="/messages/new/:userId" element={<MessageThread />} />
          <Route path="/settings/*" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Creator Pages Output */}
          <Route element={<CreatorRoute />}>
             <Route path="/creator/*" element={<CreatorDashboard />} />
          </Route>
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        {/* Fullscreen Studio */}
        <Route path="/studio" element={<Studio />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
