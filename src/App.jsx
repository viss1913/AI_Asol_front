import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Editor from './pages/Editor';
import Auth from './pages/Auth';
import Chat from './pages/Chat';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Sync token state if needed
  useEffect(() => {
    const handleStorage = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main>
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

            {/* Redirect any other route to landing or home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="py-12 px-6 border-t border-slate-100 mt-12 bg-white">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-xl font-bold tracking-tight family-outfit text-slate-900">
              <span className="bg-accent-gradient bg-clip-text text-transparent">
                AI Asol
              </span>
            </div>
            <p className="text-slate-400 text-sm font-medium">
              &copy; 2026 AI Asol. Все инструменты в одном месте.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
