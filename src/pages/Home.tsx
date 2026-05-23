import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AI_USER_ID } from '../lib/api';
import { AiHeroCard } from '../components/ui/AiHeroCard';
import { FeedPost } from '../components/ui/FeedPost';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export function Home() {
  const { systemData, currentUser } = useAuth();
  
  if (!systemData) return null;
  const db = systemData;
  
  const aiUser = db.users.find(u => u.id === AI_USER_ID);
  
  // Mixed public and followed posts
  const posts = [...db.posts].filter(p => {
    const au = db.users.find(x => x.id === p.authorId);
    if (!au) return false;
    if (au.id === currentUser?.id) return true;
    if (!au.isPrivate) return true;
    if (db.follows.some(f => f.followerId === currentUser?.id && f.followingId === au.id)) return true;
    return false;
  }).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (!aiUser) return null;

  return (
    <div className="w-full flex-col flex items-center bg-slate-50 relative min-h-screen">
      {/* Sticky Hero Section */}
      <div className="sticky top-0 w-full z-40 bg-slate-50/90 backdrop-blur-xl border-b border-slate-100 pt-3 pb-3 px-4 shadow-sm flex flex-col items-center">
         <div className="w-full max-w-md">
           <AiHeroCard aiUser={aiUser} />
         </div>
      </div>

      <div className="w-full max-w-md px-4 pt-6 pb-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between mb-5 px-1"
        >
          <h3 className="font-display font-black text-xl text-slate-900 flex items-center gap-2">
            <span>Community Feed</span>
          </h3>
          <div className="bg-gradient-to-r from-pink-500 to-yellow-400 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-sm shadow-pink-200">
             <Sparkles className="w-3 h-3" />
             Live
          </div>
        </motion.div>
        
        <div className="space-y-6">
          {posts.map((post, i) => {
            const author = db.users.find(u => u.id === post.authorId);
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <FeedPost post={post} author={author} />
              </motion.div>
            );
          })}
          
          {posts.length === 0 && (
            <div className="text-center py-16 glass-card rounded-[2rem] border border-white/60 flex flex-col items-center">
              <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                 <Sparkles className="w-8 h-8 text-pink-300" />
              </div>
              <p className="text-slate-500 font-medium text-[15px]">No posts yet.</p>
              <p className="text-slate-400 text-sm mt-1">Be the first to share something cute!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
