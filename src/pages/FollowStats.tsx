import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Search, ChevronLeft, UserPlus, UserCheck, Lock } from 'lucide-react';
import { VerifiedBadge } from '../components/ui/VerifiedBadge';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

export function FollowStats({ type }: { type: 'followers' | 'following' }) {
  const { username } = useParams<{ username: string }>();
  const { currentUser, systemData, refreshSystemData } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  if (!systemData || !currentUser) return null;

  const targetUser = systemData.users.find(u => u.username === username);
  if (!targetUser) return <div className="p-10 text-center">User not found</div>;

  const isOwnProfile = currentUser.id === targetUser.id;
  const isFollowingTarget = systemData.follows.some(f => f.followerId === currentUser.id && f.followingId === targetUser.id);
  
  if (targetUser.isPrivate && !isOwnProfile && !isFollowingTarget) {
     return (
       <div className="min-h-screen bg-slate-50 p-10 flex flex-col items-center pt-24 text-center">
         <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6">
           <Lock className="w-8 h-8 text-slate-400" />
         </div>
         <h2 className="text-xl font-display font-black mb-2">Private Account</h2>
         <p className="text-slate-500 font-medium">Follow this account to see their {type}.</p>
         <button onClick={() => navigate(-1)} className="mt-8 px-6 py-3 bg-slate-900 text-white rounded-full font-bold">Go Back</button>
       </div>
     );
  }

  let listIds = type === 'followers' 
    ? systemData.follows.filter(f => f.followingId === targetUser.id).map(f => f.followerId)
    : systemData.follows.filter(f => f.followerId === targetUser.id).map(f => f.followingId);

  const users = listIds.map(id => systemData.users.find(u => u.id === id)).filter(Boolean) as any[];

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(q.toLowerCase()) || 
    u.username.toLowerCase().includes(q.toLowerCase())
  );

  const FollowButton = ({ u }: { u: any }) => {
    const isFollowing = systemData.follows.some(f => f.followerId === currentUser.id && f.followingId === u.id);
    const isPending = systemData.followRequests.some(r => r.requesterId === currentUser.id && r.targetId === u.id);
    
    if (u.id === currentUser.id) return null;

    const toggle = async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        if (isFollowing || isPending) {
           await api.unfollowUser(u.id, currentUser.id);
        } else {
           await api.followUser(u.id, currentUser.id);
        }
        refreshSystemData();
      } catch(err) { toast.error("Action failed"); }
    };

    if (isFollowing) {
       return <button onClick={toggle} className="px-4 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-full text-xs">Following</button>;
    }
    if (isPending) {
       return <button onClick={toggle} className="px-4 py-1.5 border border-slate-200 text-slate-400 font-bold rounded-full text-xs">Requested</button>;
    }
    return <button onClick={toggle} className="px-4 py-1.5 bg-pink-500 text-white font-bold rounded-full text-xs shadow-md">Follow</button>;
  };

  return (
    <div className="w-full min-h-[calc(100vh-56px)] bg-slate-50 pb-20 relative max-w-md mx-auto">
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-white px-4 py-3 flex items-center justify-between">
         <div className="flex items-center gap-3">
           <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100">
             <ChevronLeft className="w-6 h-6 text-slate-600" />
           </button>
           <h1 className="font-display font-black text-lg text-slate-900 capitalize">{type}</h1>
         </div>
         <p className="text-xs font-bold text-slate-400">@{targetUser.username}</p>
      </div>

      <div className="px-4 mt-4 relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-7 top-1/2 -translate-y-1/2" />
        <input 
          value={q} onChange={e => setQ(e.target.value)}
          placeholder={`Search ${type}...`} 
          className="w-full bg-white border border-slate-200 rounded-full py-3 pl-12 pr-4 text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300" 
        />
      </div>

      <div className="mt-6 px-4 space-y-4">
        {filtered.map(u => (
          <div key={u.id} onClick={() => navigate(`/u/${u.username}`)} className="flex items-center gap-3 glass-card p-3 rounded-2xl cursor-pointer shadow-sm">
             <div className="relative">
               <img src={u.avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${u.username}&backgroundColor=fbcfe8`} className="w-12 h-12 rounded-full object-cover border border-white" />
               {u.isVerified && <VerifiedBadge isGolden={u.id === '100000'} size={12} className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5" />}
             </div>
             <div className="flex-1 overflow-hidden">
               <p className="font-bold text-sm text-slate-900 truncate">{u.name}</p>
               <p className="text-xs text-slate-500 font-medium truncate">@{u.username}</p>
             </div>
             <FollowButton u={u} />
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-10">
            <p className="text-slate-500 font-medium">No results found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
