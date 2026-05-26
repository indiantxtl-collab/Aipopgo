import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Home, Search, Plus, Bell, User as UserIcon, Heart, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

function TopNav() {
  const { currentUser, systemData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const unreadCount = systemData?.notifications.filter(n => n.userId === currentUser?.id && !n.isRead).length || 0;

  const isHome = location.pathname === '/home';

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white/70 backdrop-blur-2xl z-40 flex items-center justify-between px-5 max-w-md mx-auto border-b border-pink-50/50">
      <motion.div 
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 cursor-pointer" 
        onClick={() => navigate('/home')}
      >
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-pink-400 to-yellow-400 p-[2px]">
           <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
             <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
           </div>
        </div>
        <span className="font-bold text-xl text-slate-900 tracking-tight font-display">Ai Pop</span>
      </motion.div>
      
      <div className="flex items-center gap-4">
        {currentUser && currentUser.role === 'creator' && (
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/creator')} 
            className="flex items-center gap-1.5 text-[11px] font-bold text-pink-600 bg-pink-50 px-3 py-1.5 rounded-full border border-pink-100 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Studio
          </motion.button>
        )}
        <motion.div 
          whileTap={{ scale: 0.9 }}
          className="relative cursor-pointer p-2 -mr-2" 
          onClick={() => navigate('/notifications')}
        >
          <Bell className="w-6 h-6 text-slate-700" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[10px] font-black text-white shadow-sm ring-2 ring-white">
              {unreadCount}
            </span>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function BottomNav() {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  const navItems = [
    { icon: Home, path: '/home' },
    { icon: Search, path: '/search' },
    { icon: Plus, path: '/studio', center: true },
    { icon: Heart, path: '/messages' },
    { icon: UserIcon, path: currentUser ? `/u/${currentUser.username}` : '/login' },
  ];

  // Hide on thread to allow full keyboard/input area
  if (location.pathname.startsWith('/messages/new/')) {
     return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-2xl border-t border-slate-100/50 z-40 pb-safe max-w-md mx-auto">
      <div className="flex justify-evenly items-center h-full px-2">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex items-center justify-center w-14 h-14"
            >
              {item.center ? (
                <motion.div 
                  whileTap={{ scale: 0.85 }} 
                  className="absolute -top-6 bg-gradient-to-tr from-pink-500 to-yellow-400 p-3.5 rounded-2xl shadow-xl shadow-pink-500/30 rotate-3 transition-transform hover:rotate-6"
                >
                  <item.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </motion.div>
              ) : (
                <div className="relative flex flex-col items-center justify-center w-full h-full">
                  <motion.div whileTap={{ scale: 0.8 }}>
                    <item.icon 
                      className={cn(
                        "w-6 h-6 transition-all duration-300", 
                        isActive ? "text-pink-500 fill-pink-500/20" : "text-slate-400 hover:text-pink-400"
                      )} 
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </motion.div>
                  {isActive && (
                    <motion.div 
                      layoutId="bottom-nav-indicator"
                      className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-pink-500"
                    />
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

export function AppLayout() {
  return (
    <div className="min-h-screen font-sans text-slate-900 flex justify-center bg-primary-50">
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: { background: '#fff', color: '#1e293b', borderRadius: '100px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontWeight: 600, fontSize: '14px' }
        }} 
      />
      <div className="w-full max-w-md bg-white min-h-screen relative shadow-2xl overflow-x-hidden flex flex-col border-x border-white/50 ring-1 ring-slate-900/5">
        <TopNav />
        <main className="pt-16 pb-24 min-h-screen flex-1 relative bg-slate-50/30">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

export function PublicLayout() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen font-sans text-slate-900 flex justify-center bg-primary-50">
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: { background: '#fff', color: '#1e293b', borderRadius: '100px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontWeight: 600, fontSize: '14px' }
        }} 
      />
      <div className="w-full max-w-md bg-white min-h-screen relative shadow-2xl overflow-x-hidden border-x border-white/50 ring-1 ring-slate-900/5">
        <div className="fixed top-0 left-0 right-0 h-16 bg-white/70 backdrop-blur-2xl z-40 flex items-center justify-between px-5 max-w-md mx-auto border-b border-pink-50/50">
          <motion.div 
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate('/')}
          >
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-400 to-yellow-400 flex items-center justify-center p-[2px]">
               <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                 <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
               </div>
             </div>
             <span className="font-bold text-xl text-slate-900 tracking-tight font-display">Ai Pop</span>
          </motion.div>
          <div className="flex items-center gap-3">
            <NavLink to="/login" className="text-sm font-bold text-slate-600 hover:text-pink-500 px-2 py-1">Login</NavLink>
            <NavLink to="/signup" className="text-sm font-bold text-white bg-slate-900 px-5 py-2 rounded-full shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">Sign Up</NavLink>
          </div>
        </div>
        <main className="pt-16 min-h-screen flex flex-col relative bg-slate-50/30">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
