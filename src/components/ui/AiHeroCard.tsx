import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Star, UserPlus, UserCheck, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { User, Post } from '../../types';
import { VerifiedBadge } from './VerifiedBadge';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import heroImage from '../../assets/hero.jpg';

export function AiHeroCard({ aiUser }: { aiUser: User }) {
  const { currentUser, systemData, refreshSystemData } = useAuth();
  const navigate = useNavigate();
  const [votes, setVotes] = useState(0);
  const [goal, setGoal] = useState(10000);
  const [hasVotedToday, setHasVotedToday] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (systemData) {
      setVotes(systemData.totalVotes);
      setGoal(systemData.progressGoal);

      if (currentUser) {
        const today = new Date().toISOString().split('T')[0];
        const todayVote = systemData.votes.find(v => v.voterId === currentUser.id && v.timestamp.startsWith(today));
        if (todayVote) setHasVotedToday(true);
        
        setIsFollowing(systemData.follows.some(f => f.followerId === currentUser.id && f.followingId === aiUser.id));
        setIsPending(systemData.followRequests?.some(r => r.requesterId === currentUser.id && r.targetId === aiUser.id) || false);
      }
    }
  }, [currentUser, systemData, aiUser]);

  const handleVote = async () => {
    if (!currentUser) return navigate('/login');
    if (hasVotedToday) return;

    try {
      const res = await api.vote(currentUser.id);
      if (res.totalVotes) {
        setVotes(res.totalVotes);
        setHasVotedToday(true);
        setShowBurst(true);
        setTimeout(() => setShowBurst(false), 2000);
        refreshSystemData();
      } else if (res.error === 'Already voted today') {
        setHasVotedToday(true);
      }
    } catch(e) {
      console.error(e);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return navigate('/login');
    try {
      if (isFollowing || isPending) {
         await api.unfollowUser(aiUser.id, currentUser.id);
         setIsFollowing(false);
         setIsPending(false);
      } else {
         const res = await api.followUser(aiUser.id, currentUser.id);
         if (res.status === 'requested') setIsPending(true);
         else setIsFollowing(true);
      }
      refreshSystemData();
    } catch(e) {
      toast.error('Action failed');
    }
  };

  const startMessage = () => {
    if (!currentUser) return navigate('/login');
    if (aiUser.isPrivate && !isFollowing && currentUser.id !== aiUser.id) {
      return toast.error("Must follow to message private account");
    }
    navigate(`/messages/new/${aiUser.id}`);
  };

  const progressPercentage = Math.min(100, Math.round((votes / goal) * 100));
  const postCount = systemData?.posts.filter(p => p.authorId === aiUser.id).length || 0;
  const isOwnProfile = currentUser?.id === aiUser.id;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-[2.5rem] p-6 relative flex flex-col items-center max-w-md w-full border border-white/60 mx-auto group shadow-sm z-30"
    >
      {/* Background Animated Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100/40 via-white/40 to-yellow-100/40 opacity-80 z-0 rounded-[2.5rem]"></div>
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-pink-200/40 rounded-full blur-3xl mix-blend-multiply animate-pulse-glow pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-yellow-200/40 rounded-full blur-3xl mix-blend-multiply animate-pulse-glow pointer-events-none" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 flex flex-col items-center w-full">
        <motion.div className="relative flex items-center justify-center pt-2 cursor-pointer" onClick={() => navigate(`/u/${aiUser.username}`)}>
          {/* Pulsing rings around avatar */}
          <div className="absolute inset-0 rounded-full border-2 border-pink-200 animate-pulse-glow" style={{ transform: 'scale(1.15)' }}></div>
          <div className="absolute inset-0 rounded-full border border-yellow-200 animate-pulse-glow" style={{ transform: 'scale(1.3)', animationDelay: '0.5s' }}></div>
          
          <img 
            src={heroImage}
            alt={aiUser.name} 
            className="w-28 h-28 object-cover rounded-full border-4 border-white shadow-xl bg-slate-50 relative z-10"
          />
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-tr from-pink-500 to-yellow-400 rounded-full p-1.5 shadow-lg border-2 border-white z-20">
             <Star className="w-4 h-4 text-white fill-white" />
          </div>
        </motion.div>
        
        <h2 className="mt-5 text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-1.5 font-display cursor-pointer hover:text-pink-500 transition-colors" onClick={() => navigate(`/u/${aiUser.username}`)}>
          {aiUser.name}
          {aiUser.isVerified && <VerifiedBadge isGolden={aiUser.id === '100000'} size={22} className="-mt-0.5" />}
        </h2>
        <p className="text-[13px] font-bold text-slate-400 mb-4">@{aiUser.username}</p>

        <div className="flex w-full items-center justify-center gap-8 mb-5">
           <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate(`/u/${aiUser.username}/followers`)}>
             <span className="font-display font-black text-lg text-slate-900">{aiUser.followersCount.toLocaleString()}</span>
             <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Followers</span>
           </div>
           <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate(`/u/${aiUser.username}/following`)}>
             <span className="font-display font-black text-lg text-slate-900">{aiUser.followingCount.toLocaleString()}</span>
             <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Following</span>
           </div>
           <div className="flex flex-col items-center">
             <span className="font-display font-black text-lg text-slate-900">{postCount.toLocaleString()}</span>
             <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Posts</span>
           </div>
        </div>

        <p className="text-[13px] text-slate-600 mb-6 text-center leading-relaxed font-medium px-2 max-h-20 overflow-y-auto no-scrollbar">
          {aiUser.bio}
        </p>

        {!isOwnProfile && (
           <div className="flex w-full gap-3 mb-6">
             <motion.button 
               whileTap={{scale:0.95}} 
               onClick={handleFollow} 
               className={cn("flex-1 py-3 rounded-full font-bold shadow-sm transition-colors flex items-center justify-center gap-2 text-sm",
                 isFollowing ? "bg-slate-100 text-slate-600 hover:bg-slate-200" :
                 isPending ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-wait" :
                 "bg-slate-900 text-white hover:bg-slate-800"
               )}
             >
               {isFollowing ? <><UserCheck className="w-4 h-4" /> Following</> : 
                isPending ? "Requested" : <><UserPlus className="w-4 h-4" /> Follow</>}
             </motion.button>
             <motion.button 
               whileTap={{scale:0.95}} 
               onClick={startMessage} 
               className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-full hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm"
             >
               <MessageCircle className="w-4 h-4" /> Message
             </motion.button>
           </div>
        )}

        <div className="w-full bg-white/60 backdrop-blur-xl p-4 rounded-3xl border border-white/80 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
             <div className="flex flex-col">
               <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Current Votes</span>
               <span className="font-display font-black text-xl text-slate-900">{votes.toLocaleString()}</span>
             </div>
             <div className="flex flex-col items-end">
               <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Goal</span>
               <span className="font-display font-black text-xl text-pink-500">{goal.toLocaleString()}</span>
             </div>
          </div>
          <div className="h-3.5 w-full bg-slate-100/80 rounded-full overflow-hidden shadow-inner relative">
            <motion.div 
              className="h-full bg-gradient-to-r from-pink-400 via-pink-500 to-yellow-400 rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            >
               <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20" style={{ transform: 'skewX(-45deg)', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }} />
            </motion.div>
          </div>
        </div>

        <div className="mt-5 w-full relative">
          <motion.button
            whileTap={!hasVotedToday ? { scale: 0.95 } : {}}
            onClick={handleVote}
            disabled={hasVotedToday}
            className={cn(
              "w-full py-4 rounded-full font-black text-[15px] flex items-center justify-center gap-2 transition-all shadow-xl group/btn disabled:cursor-not-allowed border-none",
              hasVotedToday 
                ? "bg-slate-100 text-slate-400 shadow-none border border-slate-200" 
                : "bg-gradient-to-r from-pink-500 to-yellow-400 text-white hover:shadow-pink-300/50 hover:-translate-y-0.5"
            )}
          >
            {hasVotedToday ? (
              <>
                <Heart className="w-5 h-5 fill-slate-300 text-slate-300" />
                Cheered Today!
              </>
            ) : (
              <>
                <Heart className="w-5 h-5 fill-white group-hover/btn:scale-110 transition-transform" />
                Vote & Cheer!
              </>
            )}
          </motion.button>
          
          <AnimatePresence>
            {showBurst && (
              <motion.div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 flex items-center justify-center"
                initial={{ scale: 0.5, opacity: 1 }}
                animate={{ scale: 4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <Heart className="w-16 h-16 text-pink-500 fill-pink-500 drop-shadow-xl" />
                <Sparkles className="absolute -top-6 -right-6 w-10 h-10 text-yellow-400 drop-shadow-md" />
                <Sparkles className="absolute -bottom-4 -left-6 w-8 h-8 text-yellow-400 drop-shadow-md" />
                <Star className="absolute top-2 -left-8 w-6 h-6 text-pink-300 fill-pink-300 drop-shadow-md" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
