import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Editor from './pages/Editor';
import Auth from './pages/Auth';

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Chat from './pages/Chat';
import VideoGeneration from './pages/VideoGeneration';
import ImageGeneration from './pages/ImageGeneration';
import AudioGeneration from './pages/AudioGeneration';
import VideoEditor from './pages/VideoEditor';
import CookieConsent from './components/common/CookieConsent';
import Dashboard from './pages/Dashboard';

import { useUser } from './context/UserContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUser();

  if (loading) return null; // Or a loading spinner

  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

function App() {
  const location = useLocation();
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isChat = location.pathname.startsWith('/chat');
  const isLanding = location.pathname === '/';

  return (
    <div className={`min-h-screen bg-white ${isChat ? 'h-screen overflow-hidden' : ''}`}>
      <Header />
      <main className={isChat ? 'h-full pt-16' : 'pt-0'}>
        <Routes>
          <Route path="/" element={
            user ? <Navigate to="/dashboard" replace /> : <Landing />
          } />

          <Route path="/login" element={
            user ? <Navigate to="/dashboard" replace /> : <Auth />
          } />
          <Route path="/register" element={
            user ? <Navigate to="/dashboard" replace /> : <Auth />
          } />

          <Route path="/auth" element={
            user ? <Navigate to="/dashboard" replace /> : <Auth />
          } />



          <Route path="/forgot-password" element={
            user ? <Navigate to="/dashboard" replace /> : <ForgotPassword />
          } />

          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          {/* Deprecated Home/Studio route -> redirect to Video for now or keep as fallback */}
          <Route path="/studio" element={<Navigate to="/video" replace />} />

          <Route path="/video" element={
            <ProtectedRoute>
              <VideoGeneration />
            </ProtectedRoute>
          } />

          <Route path="/image" element={
            <ProtectedRoute>
              <ImageGeneration />
            </ProtectedRoute>
          } />

          <Route path="/audio" element={
            <ProtectedRoute>
              <AudioGeneration />
            </ProtectedRoute>
          } />

          <Route path="/video-editor" element={
            <ProtectedRoute>
              <VideoEditor />
            </ProtectedRoute>
          } />

          <Route path="/editor" element={
            <ProtectedRoute>
              <Editor />
            </ProtectedRoute>
          } />

          <Route path="/chat" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />

          {/* Projects route removed as per request */}

          {/* Redirect any other route to landing or home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <CookieConsent />
    </div>
  );
}

export default App;
