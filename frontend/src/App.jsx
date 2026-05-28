import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import CourseGenerator from './components/CourseGenerator';
import SyllabusEditor from './components/SyllabusEditor';
import CourseViewer from './components/CourseViewer';
import { LogOut, LayoutDashboard, BrainCircuit, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return null;
  return token ? children : <Navigate to="/auth" />;
};

const Header = () => {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-white p-2 rounded-lg group-hover:bg-slate-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-slate-700">
              <BrainCircuit className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">AI Course Builder</h1>
          </Link>
          {user && (
            <div className="flex items-center gap-6">
              <Link 
                to="/dashboard" 
                className="text-slate-400 font-semibold hover:text-white transition-colors flex items-center gap-2 text-sm"
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <button 
                onClick={() => setShowLogoutModal(true)} 
                className="text-slate-500 font-semibold hover:text-white transition-colors flex items-center gap-2 text-sm"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#111] border border-slate-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex justify-center mb-6">
                <div className="bg-red-500/10 p-4 rounded-full border border-red-500/20">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white text-center mb-2">Are you sure?</h3>
              <p className="text-slate-400 text-center mb-8 text-sm">You are about to log out of your session. You will need to sign in again to access your courses.</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-3 rounded-lg font-bold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-3 rounded-lg font-bold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#0A0A0A] bg-grid-pattern relative flex flex-col font-sans">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/generate" element={<PrivateRoute><CourseGenerator /></PrivateRoute>} />
              <Route path="/course/:id/edit" element={<PrivateRoute><SyllabusEditor /></PrivateRoute>} />
              <Route path="/course/:id" element={<PrivateRoute><CourseViewer /></PrivateRoute>} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
