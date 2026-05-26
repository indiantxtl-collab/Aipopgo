import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Heart, MessageCircle, UserPlus, Sparkles, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Notification } from '../types';
import { formatDistanceToNow } from 'date-fns';

export function Notifications() {
  const { currentUser, systemData, refreshSystemData } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const notifications = (systemData?.notifications || []).filter(n => n.userId === currentUser?.id).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  useEffect(() => {
    if (currentUser) {
      api.markReadNotifications(currentUser.id).then(() => {
        setLoading(false);
        refreshSystemData(); // Clear unread badge
      });
    }
  }, [currentUser, refreshSystemData]);

  if (!currentUser || !systemData) return null;

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-20 relative max-w-md mx-auto flex flex-col">
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-4 py-3 shadow-sm">
         <div className="flex items-center gap-3">
           <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-50 transition-colors">
             <ChevronLeft className="w-6 h-6 text-slate-600" />
           </button>
           <h1 className="font-display font-black text-xl text-slate-900 tracking-tight">Notifications</h1>
         </div>
      </div>
      
      <div className="flex-1 px-4 py-4 space-y-3">
        {notifications.length === 0 && !loading && (
          <div className="text-center py-20 flex flex-col items-center">
             <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-10 h-10 text-pink-300" />
             </div>
             <p className="font-bold text-slate-800 text-lg">All caught up!</p>
             <p className="text-slate-500 text-sm mt-1">No new notifications right now.</p>
          </div>
        )}

        <AnimatePresence>
          {notifications.map((notif: Notification, i: number) => {
             const actor = systemData.users.find(u => u.id === notif.actorId);
             if (!actor) return null;

             let icon, bgWrapper, path;
             if (notif.type === 'like') {
               icon = <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />;
               bgWrapper = 'bg-pink-100';
               path = notif.postId ? `/post/${notif.postId}` : `/u/${actor.username}`;
             } else if (notif.type === 'comment') {
               icon = <MessageCircle className="w-4 h-4 text-blue-500 fill-blue-500" />;
               bgWrapper = 'bg-blue-100';
               path = notif.postId ? `/post/${notif.postId}` : `/u/${actor.username}`;
             } else {
               icon = <UserPlus className="w-4 h-4 text-green-500" />;
               bgWrapper = 'bg-green-100';
               path = `/u/${actor.username}`;
             }

             return (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.05 }}
                 key={notif.id}
                 onClick={() => navigate(path)}
                 className={`flex items-start gap-4 p-4 rounded-3xl cursor-pointer transition-colors shadow-sm border border-white relative overflow-hidden group ${notif.isRead ? 'bg-white' : 'bg-pink-50/50'}`}
               >
                 {!notif.isRead && (
                   <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-pink-500 m-4 shadow-sm" />
                 )}
                 <div className="relative flex-shrink-0">
                   <img src={actor.avatarUrl} className="w-12 h-12 rounded-full object-cover shadow-sm border border-slate-100" />
                   <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${bgWrapper}`}>
                     {icon}
                   </div>
                 </div>
                 <div className="flex-1 pr-4">
                   <p className="text-sm text-slate-800 leading-snug">
                     <span className="font-bold text-slate-900">{actor.name}</span>{' '}
                     {notif.type === 'like' ? 'liked your post' : notif.type === 'comment' ? 'commented on your post' : 'started following you'}
                   </p>
                   <p className="text-[11px] font-bold tracking-widest uppercase text-slate-400 mt-1">{formatDistanceToNow(new Date(notif.timestamp))} ago</p>
                 </div>
               </motion.div>
             )
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
