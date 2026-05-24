import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Sparkles, Mail, Lock, User as UserIcon, AtSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { User } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export function Signup() {
  const [name, setName] = useState('');
  const [username, setusername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.signup({ name, username, email, password });
      if (res.user) {
        login(res.user);
        navigate('/home');
      } else {
        setError(res.error || 'Signup failed');
      }
    } catch(err) {
      setError('An error occurred during signup');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative overflow-hidden justify-center py-10 px-5 sm:px-6 lg:px-8">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-pink-200/30 rounded-full blur-[100px] animate-pulse-glow" style={{ transform: 'translate(-20%, -20%)' }} />
      <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-yellow-200/30 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '1s', transform: 'translate(20%, 20%)' }} />
      <div className="absolute top-1/2 left-1/2 w-full h-full bg-white/10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,192,203,0.15) 1px, transparent 0)', backgroundSize: '32px 32px', transform: 'translate(-50%, -50%)' }}></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md my-auto"
      >
        <div className="glass-panel border border-white shadow-2xl rounded-[3rem] p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-[0.03]">
             <Sparkles className="w-64 h-64 text-yellow-500" />
          </div>

          <div className="flex justify-center mb-6 relative">
            <div className="absolute inset-0 rounded-full border-2 border-yellow-200 animate-pulse-glow" style={{ width: '80px', height: '80px', margin: 'auto', transform: 'scale(1.2)' }}></div>
            <div className="bg-gradient-to-tr from-yellow-400 to-pink-400 p-4 rounded-3xl shadow-lg relative z-10">
              <Heart className="w-10 h-10 text-white fill-white" />
            </div>
          </div>

          <h1 className="text-3xl font-display font-black text-center text-slate-900 mb-2 tracking-tight">Create Account</h1>
          <p className="text-center text-slate-500 text-[15px] font-medium mb-8">Join the cute pop community!</p>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-50 text-red-600 p-4 rounded-2xl text-[13px] mb-6 text-center border border-red-100 font-bold tracking-wide">
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSignup} className="space-y-4 relative z-10 w-full">
            <div className="space-y-1">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-300" />
                </div>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-800 text-[15px] font-bold focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all shadow-inner placeholder-slate-300"
                  placeholder="Your name"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <AtSign className="h-5 w-5 text-slate-300" />
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setusername(e.target.value.toLowerCase())}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-800 text-[15px] font-bold focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all shadow-inner placeholder-slate-300"
                  placeholder="cute_fan24"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-300" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-800 text-[15px] font-bold focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all shadow-inner placeholder-slate-300"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-300" />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-800 text-[15px] font-bold focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all shadow-inner placeholder-slate-300"
                  placeholder="Min 8 characters"
                  required
                />
              </div>
            </div>

            <div className="pt-4">
              <motion.button 
                 whileTap={{ scale: 0.95 }}
                 type="submit" 
                 disabled={isSubmitting}
                 className="w-full bg-gradient-to-r from-pink-500 to-yellow-400 text-white font-black py-4 rounded-full shadow-xl shadow-pink-300/30 active:scale-95 transition-all text-[15px] tracking-wide"
              >
                {isSubmitting ? 'Creating account...' : 'Join Now'}
              </motion.button>
            </div>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-8 relative z-10">
            <p className="text-[14px] text-slate-500 font-medium">
              Already have an account? <Link to="/login" className="text-pink-500 font-black hover:underline transition-all">Log in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
