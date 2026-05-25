import React, { useEffect, useState, useRef } from 'react';
import { Heart, UserPlus, MessageCircle, Send, Search as SearchIcon, TrendingUp, Sparkles, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Notification, Message, User } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { VerifiedBadge } from '../components/ui/VerifiedBadge';

export function Notifications() {
  const { currentUser, systemData } = useAuth();
  const [notifs, setNotifs] = useState<Notification[]>([]);

  useEffect(() => {
    if(currentUser) {
      api.getNotifications(currentUser.id).then(setNotifs);
      api.markReadNotifications(currentUser.id);
    }
  }, [currentUser]);

  const getUser = (id: string) => systemData?.users.find(u => u.id === id);

  return (
    <div className="w-full min-h-[calc(100vh-56px)] pb-24 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-pink-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 left-0 w-64 h-64 bg-yellow-300/20 rounded-full blur-3xl pointer-events-none" />

      <div className="px-4 py-6 max-w-md mx-auto relative z-10">
        <h1 className="text-2xl font-display font-black text-slate-900 mb-6 flex items-center gap-2 tracking-tight">
          <Sparkles className="w-6 h-6 text-pink-400" />
          Activity
        </h1>
        <div className="space-y-3">
          {notifs.length === 0 ? (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-center py-16 glass-panel rounded-[2rem] border border-white flex flex-col items-center">
              <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                 <Heart className="w-8 h-8 text-pink-300" />
              </div>
              <p className="text-slate-900 font-bold text-[15px]">No activity yet.</p>
              <p className="text-slate-400 font-medium text-[13px] mt-1">When someone interacts with you, it will appear here.</p>
            </motion.div>
          ) : (
            notifs.map((n, i) => {
              const actor = getUser(n.actorId);
              return (
                <motion.div 
                  initial={{ opacity:0, y:20 }} 
                  animate={{ opacity:1, y:0 }} 
                  transition={{ delay: i * 0.05 }}
                  key={n.id} 
                  className={`glass-card p-4 rounded-3xl flex items-center gap-4 shadow-sm border border-white ${n.isRead ? '' : 'bg-pink-50/50 shadow-pink-100/50 relative overflow-hidden'}`}
                >
                  {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-pink-400 rounded-l-3xl"></div>}
                  <div className="relative cursor-pointer" onClick={() => actor && navigate(`/u/${actor.username}`)}>
                     <img src={actor?.avatarUrl || undefined} className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover" />
                     {actor?.isVerified && (
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full">
                           <VerifiedBadge isGolden={actor.id === '100000'} size={14} />
                        </div>
                     )}
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] text-slate-700 leading-tight">
                      <span className="font-black text-slate-900 mr-1">{actor?.username}</span> 
                      <span className="font-medium text-slate-600">{n.message}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">{formatDistanceToNow(new Date(n.timestamp))} ago</p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export function Search() {
  const { systemData } = useAuth();
  const [q, setQ] = useState('');

  // Handle case where systemData is still loading
  if (!systemData) return null;

  const results = systemData.users.filter(u => 
    u.username.toLowerCase().includes(q.toLowerCase()) || 
    u.name.toLowerCase().includes(q.toLowerCase())
  ).slice(0, 10);

  return (
    <div className="w-full min-h-[calc(100vh-56px)] px-4 py-8 max-w-md mx-auto relative overflow-hidden pb-24">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-pink-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 left-0 w-64 h-64 bg-yellow-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <h1 className="text-2xl font-display font-black text-slate-900 mb-6 tracking-tight flex items-center gap-2">
           <SearchIcon className="w-6 h-6 text-pink-400" />
           Discover
        </h1>

        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input 
            type="text" 
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search users or tags..."
            className="w-full glass-card border-none ring-1 ring-white shadow-xl shadow-pink-100/30 rounded-full pl-12 pr-5 py-4 text-[15px] font-bold outline-none focus:ring-2 focus:ring-pink-300 text-slate-800 placeholder-slate-400 transition-all placeholder:font-medium"
          />
          <AnimatePresence>
            {q && (
              <motion.button 
                 initial={{ opacity:0, scale:0.5 }} 
                 animate={{ opacity:1, scale:1 }} 
                 exit={{ opacity:0, scale:0.5 }} 
                 onClick={() => setQ('')}
                 className="absolute inset-y-0 right-0 pr-5 flex items-center"
              >
                 <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-300">
                    <X className="w-4 h-4" />
                 </div>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        
        {!q ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <h3 className="font-display font-black text-lg text-slate-900 mb-4 flex items-center gap-2 px-1">
               <TrendingUp className="w-5 h-5 text-yellow-500" />
               Trending Tags
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {['#AiPopCute', '#Target10k', '#MixChannel', '#CheerForAi', '#LuxuryUI'].map((tag, i) => (
                <motion.span 
                   whileTap={{ scale: 0.95 }}
                   initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                   key={tag} 
                   className="glass-panel border-white text-slate-700 px-5 py-2.5 rounded-full text-sm shadow-sm transition-all hover:shadow-md cursor-pointer font-bold tracking-tight border hover:border-pink-300"
                >
                  <span className="text-pink-500 mr-1 opacity-70">#</span>
                  {tag.replace('#', '')}
                </motion.span>
              ))}
            </div>
            
            <div className="mt-10 glass-panel rounded-[2rem] p-6 text-center border border-white/60 relative overflow-hidden">
               <div className="absolute -right-4 -bottom-4 opacity-5">
                  <Sparkles className="w-32 h-32 text-pink-500" />
               </div>
               <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <SearchIcon className="w-6 h-6 text-pink-400" />
               </div>
               <h4 className="font-black text-slate-800 text-[15px] mb-1">Find your friends</h4>
               <p className="text-[13px] font-medium text-slate-500">Search by username or name to connect with others.</p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-3">Results</h3>
            <AnimatePresence>
               {results.map((u, i) => (
                  <motion.div 
                     initial={{ opacity: 0, y: 10, scale: 0.98 }} 
                     animate={{ opacity: 1, y: 0, scale: 1 }} 
                     exit={{ opacity: 0, scale: 0.95 }}
                     transition={{ delay: i * 0.03 }}
                     key={u.id} 
                     onClick={() => navigate(`/u/${u.username}`)}
                     className="flex items-center gap-4 glass-card p-4 rounded-3xl shadow-sm border border-white cursor-pointer hover:shadow-md transition-shadow group"
                  >
                     <div className="relative">
                        <img src={u.avatarUrl || undefined} className="w-14 h-14 object-cover rounded-full border-2 border-white shadow-sm group-hover:scale-105 transition-transform" />
                        {u.isVerified && (
                           <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                              <VerifiedBadge isGolden={u.id === '100000'} size={14} />
                           </div>
                        )}
                     </div>
                     <div className="flex flex-col">
                        <p className="font-black text-[15px] text-slate-900 leading-tight tracking-tight">{u.name}</p>
                        <p className="text-[13px] text-slate-500 font-medium">@{u.username}</p>
                     </div>
                     <div className="ml-auto w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-pink-50 group-hover:text-pink-500 transition-colors">
                        <Sparkles className="w-4 h-4" />
                     </div>
                  </motion.div>
               ))}
               {results.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
                     <p className="font-bold text-slate-700">No users found</p>
                     <p className="text-sm text-slate-500 mt-1">Try a different search term</p>
                  </motion.div>
               )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
