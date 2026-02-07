import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Editor from './pages/Editor';
import Auth from './pages/Auth';
import Chat from './pages/Chat';
import Projects from './pages/Projects';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

function App() {
  const location = useLocation();
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Sync token state if needed
  useEffect(() => {
    const handleStorage = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const isChat = location.pathname.startsWith('/chat');

  return (
    <div className={`min-h-screen bg-white ${isChat ? 'h-screen overflow-hidden' : ''}`}>
      <Navbar />
      <main className={isChat ? 'h-full' : ''}>
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route path="/auth" element={
            token ? <Navigate to="/studio" replace /> : <Auth onLogin={() => setToken(localStorage.getItem('token'))} />
          } />

          <Route path="/studio" element={
            <ProtectedRoute>
              <Home />
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

          <Route path="/projects" element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          } />

          {/* Redirect any other route to landing or home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isChat && (
        <footer className="py-4 px-6 border-t border-slate-100 mt-6 bg-white">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-sm font-bold tracking-tight family-outfit text-slate-400">
              AI Asol
            </div>
            <p className="text-slate-400 text-xs font-medium">
              &copy; 2026 AI Asol. Все инструменты в одном месте.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
