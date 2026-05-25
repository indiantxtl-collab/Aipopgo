import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, MessageCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { Comment, Post } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { VerifiedBadge } from './VerifiedBadge';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export function CommentsSheet({ post, onClose }: { post: Post; onClose: () => void }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const { currentUser, systemData } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getComments(post.id).then(c => {
      setComments(c);
      setIsLoading(false);
    });
  }, [post.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Login to comment');
      return;
    }
    if (!content.trim()) return;
    
    try {
      const tempId = `temp-${Date.now()}`;
      const tempComment = {
        id: tempId,
        postId: post.id,
        authorId: currentUser.id,
        content: content,
        createdAt: new Date().toISOString()
      };
      // Optimistic update
      setComments(prev => [...prev, tempComment]);
      setContent('');

      const res = await api.addComment(post.id, currentUser.id, content);
      if (res.comment) {
        setComments(prev => prev.map(c => c.id === tempId ? res.comment : c));
      }
    } catch(err) {
      toast.error('Failed to post comment');
      // Rollback might be handled here typically
    }
  };

  const getUser = (id: string) => systemData?.users.find(u => u.id === id);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex flex-col justify-end">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div 
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative bg-white/90 backdrop-blur-2xl w-full max-w-md mx-auto h-[80vh] rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden border-t border-x border-white"
        >
          {/* Drag handle */}
          <div className="w-full flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
          </div>

          <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100/50">
            <h3 className="font-display font-black text-xl text-slate-900">Comments</h3>
            <button onClick={onClose} className="p-2 bg-slate-100/80 rounded-full text-slate-600 hover:bg-slate-200 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none relative">
            {isLoading ? (
              <div className="flex justify-center p-10 mt-10">
                <div className="w-8 h-8 rounded-full border-4 border-pink-100 border-t-pink-500 animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center pb-20">
                <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-10 h-10 text-pink-300" />
                </div>
                <p className="text-slate-500 font-medium">No comments yet.</p>
                <p className="text-sm text-slate-400">Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map((c, i) => {
                const author = getUser(c.authorId);
                if(!author) return null;
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={c.id} 
                    className="flex gap-3 relative group"
                  >
                    <img 
                      src={author.avatarUrl || undefined} 
                      alt="" 
                      className="w-10 h-10 rounded-full object-cover border border-slate-100 mt-1 shadow-sm cursor-pointer" 
                      onClick={() => { onClose(); navigate(`/u/${author.username}`); }}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline">
                         <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => { onClose(); navigate(`/u/${author.username}`); }}>
                           <span className="font-bold text-[14px] text-slate-900">{author.username}</span>
                           {author.isVerified && <VerifiedBadge isGolden={author.id === '100000'} size={13} />}
                         </div>
                         <span className="text-[11px] text-slate-400 font-medium">
                           {formatDistanceToNow(new Date(c.createdAt))}
                         </span>
                      </div>
                      <p className="text-[15px] text-slate-700 mt-1 leading-relaxed">{c.content}</p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          <div className="p-4 px-5 border-t border-slate-100/50 bg-white/60 backdrop-blur-xl pb-safe">
            <form onSubmit={handleSubmit} className="flex items-end gap-3 relative">
              <img src={currentUser?.avatarUrl || 'https://api.dicebear.com/7.x/notionists/svg?seed=guest'} alt="" className="w-10 h-10 rounded-full border border-slate-200 shadow-sm mb-1" />
              <div className="flex-1 relative">
                <textarea 
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Add a cute comment..."
                  rows={1}
                  className="w-full bg-slate-50 border border-slate-200/60 rounded-3xl pl-4 pr-12 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all resize-none shadow-inner"
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  disabled={!content.trim()} 
                  type="submit" 
                  className="absolute right-1.5 bottom-1.5 w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-400 text-white flex items-center justify-center disabled:opacity-50 disabled:from-slate-300 disabled:to-slate-300 shadow-sm"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
