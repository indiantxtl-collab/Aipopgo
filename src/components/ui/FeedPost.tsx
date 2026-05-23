import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Download, MoreHorizontal, Pin, Sparkles, Bookmark, Edit2, Trash2, Repeat, Link, Copy, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { Post, User } from '../../types';
import { cn } from '../../lib/utils';
import { VerifiedBadge } from './VerifiedBadge';
import { CommentsSheet } from './CommentsSheet';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function FeedPost({ post, author }: { post: Post; author?: User }) {
  const { currentUser, refreshSystemData } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showComments, setShowComments] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const navigate = useNavigate();

  if (!author) return null; // Defensive check
  const isOwnPost = currentUser?.id === author.id;

  const handleLike = async () => {
    if (isLiked) return; 
    try {
      const res = await api.likePost(post.id);
      if (res.likesCount) {
         setLikesCount(res.likesCount);
         setIsLiked(true);
      }
    } catch(err) {
      toast.error("Failed to like");
    }
  };

  const handleDoubleTap = () => {
    handleLike();
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 1000);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? "Removed from saved" : "Saved to gallery");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    toast.success("Link copied!");
    setShowShare(false);
  };

  const handleDelete = async () => {
    if(!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.deletePost(post.id);
      await refreshSystemData();
      toast.success("Post deleted");
    } catch(err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <>
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      className="glass-card rounded-[2rem] p-5 mb-6 relative overflow-hidden group"
    >
      {post.isPinned && (
        <div className="absolute top-0 right-0 bg-gradient-to-bl from-yellow-400 to-pink-500 text-white text-[10px] uppercase font-black tracking-widest px-4 py-1.5 rounded-bl-2xl shadow-sm z-10 flex items-center gap-1">
          <Pin className="w-3 h-3 fill-white" />
          <span>Pinned</span>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/u/${author.username}`)}>
          <div className="relative">
            <img src={author.avatarUrl} alt={author.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
            {author.role === 'creator' && (
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-pink-500 to-yellow-400 p-1 rounded-full border border-white shadow-sm">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[15px] font-black text-slate-900 font-display tracking-tight hover:text-pink-500 transition-colors">
              {author.name}
              {author.isVerified && <VerifiedBadge isGolden={author.id === '100000'} size={15} className="-mt-0.5" />}
            </div>
            <div className="text-[11px] font-semibold text-slate-400 tracking-wide uppercase">
              @{author.username} • {formatDistanceToNow(new Date(post.createdAt))} 
            </div>
          </div>
        </div>
        
        <div className="relative">
          <motion.button 
            whileTap={{ scale: 0.9 }} 
            onClick={() => setShowOptions(!showOptions)}
            className="text-slate-300 hover:text-slate-600 transition-colors p-2 bg-slate-50/50 rounded-full"
          >
            <MoreHorizontal className="w-5 h-5" />
          </motion.button>

          <AnimatePresence>
            {showOptions && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowOptions(false)} />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-12 w-48 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-3xl shadow-xl z-50 overflow-hidden py-2"
                >
                  {isOwnPost && (
                    <button onClick={handleDelete} className="w-full px-4 py-3 text-left flex items-center gap-3 text-red-500 hover:bg-red-50/50 transition-colors text-[14px] font-bold">
                      <Trash2 className="w-4 h-4" /> Delete Post
                    </button>
                  )}
                  {isOwnPost && (
                    <button onClick={() => { setShowOptions(false); /* open edit modal */ }} className="w-full px-4 py-3 text-left flex items-center gap-3 text-slate-700 hover:bg-slate-50 transition-colors text-[14px] font-bold">
                      <Edit2 className="w-4 h-4 text-slate-400" /> Edit Caption
                    </button>
                  )}
                  <button onClick={() => { setShowOptions(false); setShowShare(true); }} className="w-full px-4 py-3 text-left flex items-center gap-3 text-slate-700 hover:bg-slate-50 transition-colors text-[14px] font-bold border-t border-slate-50">
                    <Repeat className="w-4 h-4 text-slate-400" /> Repost
                  </button>
                  <button onClick={copyLink} className="w-full px-4 py-3 text-left flex items-center gap-3 text-slate-700 hover:bg-slate-50 transition-colors text-[14px] font-bold">
                    <Link className="w-4 h-4 text-slate-400" /> Copy Link
                  </button>
                  <button onClick={() => setShowOptions(false)} className="w-full px-4 py-3 text-left flex items-center gap-3 text-slate-400 hover:bg-slate-50 transition-colors text-[14px] font-bold border-t border-slate-50">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="text-[15px] text-slate-700 leading-relaxed whitespace-pre-wrap mb-5 px-1 font-medium relative z-10">
        {post.caption}
      </p>

      {post.mediaUrl && (
        <div 
          className="rounded-3xl overflow-hidden mb-5 bg-slate-100/50 aspect-[4/5] sm:aspect-square relative shadow-inner cursor-pointer" 
          onDoubleClick={handleDoubleTap}
        >
          {post.mediaType === 'video' ? (
             <video src={post.mediaUrl} controls className="w-full h-full object-cover" style={{ filter: post.filterName !== 'Normal' ? 'contrast(1.1) saturate(1.2)' : 'none' }} />
          ) : (
             <img src={post.mediaUrl} alt="Post media" loading="lazy" className="w-full h-full object-cover select-none" style={{ filter: post.filterName !== 'Normal' ? 'contrast(1.1) saturate(1.2)' : 'none' }} />
          )}
          
          <AnimatePresence>
            {showHeartAnim && (
              <motion.div 
                initial={{ scale: 0.5, opacity: 1, x: '-50%', y: '-50%' }}
                animate={{ scale: [0.5, 1.6, 1], opacity: [1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute top-1/2 left-1/2 flex items-center justify-center pointer-events-none drop-shadow-2xl z-20"
              >
                <Heart className="w-28 h-28 text-pink-500 fill-pink-500 drop-shadow-[0_0_40px_rgba(255,105,180,0.8)]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="flex items-center justify-between pt-1 px-2 relative z-10">
        <div className="flex gap-4">
          <motion.button 
            whileTap={{ scale: 0.8 }}
            onClick={handleLike}
            className={cn("flex items-center gap-1.5 font-black transition-colors -ml-3 rounded-full", 
              isLiked ? "text-pink-500" : "text-slate-500 hover:text-pink-500"
            )}
          >
            <div className="p-2 hover:bg-pink-50/50 rounded-full transition-colors flex items-center justify-center">
              <Heart className={cn("w-[22px] h-[22px] transition-all", isLiked ? "fill-pink-500 scale-110 drop-shadow-sm" : "hover:scale-110")} />
            </div>
            <span className="text-[14px]">{likesCount.toLocaleString()}</span>
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowComments(true)}
            className="flex items-center gap-1.5 font-black text-slate-500 transition-colors rounded-full hover:text-yellow-500 group/cmnt"
          >
            <div className="p-2 hover:bg-slate-50 rounded-full transition-colors flex items-center justify-center">
               <MessageCircle className="w-[22px] h-[22px] transition-transform group-hover/cmnt:scale-110" />
            </div>
            <span className="text-[14px]">{post.commentsCount.toLocaleString()}</span>
          </motion.button>
        </div>

        <div className="flex gap-1.5">
           <motion.button onClick={handleSave} whileTap={{scale:0.9}} className={cn("flex items-center justify-center transition-colors p-2.5 rounded-full", isSaved ? "bg-slate-100 text-slate-800" : "text-slate-400 hover:text-slate-800 hover:bg-slate-50")}>
             <Bookmark className={cn("w-5 h-5", isSaved && "fill-slate-800")} />
           </motion.button>

           <motion.button onClick={() => setShowShare(true)} whileTap={{scale:0.9}} className="flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors p-2.5 rounded-full hover:bg-slate-50">
             <Share2 className="w-5 h-5" />
           </motion.button>

          {post.allowDownloads && (
            <motion.button onClick={() => toast.success("Download started...")} whileTap={{scale:0.9}} className="flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors p-2.5 rounded-full hover:bg-slate-50">
              <Download className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>

    <AnimatePresence>
      {showShare && (
        <>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]" onClick={() => setShowShare(false)} />
          <motion.div initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}} transition={{type:'spring', damping:25, stiffness:200}} className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-[2.5rem] p-6 z-[101] shadow-2xl pb-safe border-t border-slate-100">
             <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
             <h3 className="font-display font-black text-xl text-slate-900 mb-6 px-2 text-center">Share this post</h3>
             <div className="grid grid-cols-4 gap-4 mb-6">
               <button onClick={copyLink} className="flex flex-col items-center gap-2 group">
                 <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 group-hover:scale-105 transition-transform"><Copy className="w-6 h-6 text-slate-700" /></div>
                 <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Copy</span>
               </button>
               <button onClick={() => {toast.success('Shared to messages'); setShowShare(false);}} className="flex flex-col items-center gap-2 group">
                 <div className="w-14 h-14 bg-pink-50 rounded-full flex items-center justify-center border border-pink-100 group-hover:scale-105 transition-transform"><MessageCircle className="w-6 h-6 text-pink-600" /></div>
                 <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Message</span>
               </button>
               <button onClick={() => {toast.success('Reposted!'); setShowShare(false);}} className="flex flex-col items-center gap-2 group">
                 <div className="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center border border-yellow-100 group-hover:scale-105 transition-transform"><Repeat className="w-6 h-6 text-yellow-600" /></div>
                 <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Repost</span>
               </button>
               <button className="flex flex-col items-center gap-2 group">
                 <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 group-hover:scale-105 transition-transform"><MoreHorizontal className="w-6 h-6 text-slate-700" /></div>
                 <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">More</span>
               </button>
             </div>
             <motion.button whileTap={{scale:0.95}} onClick={() => setShowShare(false)} className="w-full py-4 bg-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">Cancel</motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    
    {showComments && <CommentsSheet post={post} onClose={() => setShowComments(false)} />}
    </>
  );
}
