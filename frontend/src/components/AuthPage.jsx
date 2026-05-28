import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainCircuit, LogIn, UserPlus } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#111] p-10 rounded-2xl border border-slate-800 shadow-2xl relative z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="bg-white p-4 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.1)] border border-slate-700">
            <BrainCircuit className="w-10 h-10 text-black" />
          </div>
        </div>
        
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-400 font-medium">
            {isLogin ? 'Sign in to access your learning dashboard.' : 'Start building your personalized AI courses.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full p-4 bg-[#0A0A0A] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                placeholder="John Doe"
                required 
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-4 bg-[#0A0A0A] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              placeholder="you@example.com"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-4 bg-[#0A0A0A] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              placeholder="••••••••"
              required 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-white hover:bg-slate-200 text-black font-black py-4 rounded-xl flex justify-center items-center gap-2 transition-all transform active:scale-[0.98] mt-4"
          >
            {isLogin ? <><LogIn className="w-5 h-5"/> Sign In</> : <><UserPlus className="w-5 h-5"/> Create Account</>}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm font-medium">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-white font-bold hover:underline"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
