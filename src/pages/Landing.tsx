import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { FeedPost } from '../components/ui/FeedPost';
import { AiHeroCard } from '../components/ui/AiHeroCard';
import { AI_USER_ID } from '../lib/api';
import { Post } from '../types';
import { Sparkles, Compass } from 'lucide-react';

export function Landing() {
  const { systemData } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (systemData) {
       const publicPosts = systemData.posts.filter(p => {
          const author = systemData.users.find(u => u.id === p.authorId);
          return author && !author.isPrivate;
       }).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPosts(publicPosts);
    }
  }, [systemData]);

  if (!systemData) {
    return (
      <div className="flex justify-center items-center h-screen pb-20 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-[40rem] h-[40rem] bg-pink-100/50 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          className="w-12 h-12 border-4 border-pink-400 border-t-transparent rounded-full relative z-10 shadow-[0_0_15px_rgba(244,114,182,0.5)]"
        />
      </div>
    );
  }

  const aiUser = systemData.users.find(u => u.id === AI_USER_ID);

  return (
    <div className="min-h-screen bg-slate-50 relative pb-20 flex flex-col items-center">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-40 bg-gradient-to-b from-pink-50 to-transparent pointer-events-none z-10" />

      {/* Sticky Hero Section */}
      <div className="sticky top-0 w-full z-40 bg-slate-50/90 backdrop-blur-xl border-b border-slate-100 pt-3 pb-3 px-4 shadow-sm flex flex-col items-center">
         <div className="w-full max-w-md">
           {aiUser && <AiHeroCard aiUser={aiUser} />}
         </div>
      </div>

      <div className="px-4 py-2 flex flex-col gap-6 w-full max-w-md mx-auto relative z-20">
        <div className="flex items-center justify-between mb-2 mt-4 px-1">
          <h2 className="font-display font-black text-xl text-slate-900 flex items-center gap-2">
            <Compass className="w-6 h-6 text-pink-400" />
            Discover
          </h2>
          <div className="bg-white/60 backdrop-blur-md text-pink-500 border border-pink-100 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
             Trending
          </div>
        </div>

        <div className="space-y-6">
           {posts.map((post, i) => (
             <motion.div
               key={post.id}
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1, type: 'spring', damping: 25, stiffness: 200 }}
             >
               <FeedPost 
                 post={post} 
                 author={systemData.users.find(u => u.id === post.authorId)} 
               />
             </motion.div>
           ))}

           {posts.length === 0 && (
              <div className="py-10 text-center">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Sparkles className="w-6 h-6 text-pink-500" />
                </div>
                <p className="text-slate-500 font-medium">No public posts yet.</p>
              </div>
           )}

           {posts.length > 0 && (
             <div className="py-10 text-center">
               <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-pink-500" />
               </div>
               <h3 className="font-bold text-slate-900 text-lg">You've caught up!</h3>
               <p className="text-slate-500 text-sm mt-1">Check back later for more updates.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
