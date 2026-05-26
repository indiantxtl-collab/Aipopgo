import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, Video, Sparkles, Send, Loader2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Post } from '../types';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

const FILTERS = [
  { name: 'Normal', css: 'none' },
  { name: 'Soft Glow', css: 'brightness(1.1) contrast(0.9) saturate(1.2)' },
  { name: 'Cute Pop', css: 'contrast(1.2) saturate(1.5) hue-rotate(10deg)' },
  { name: 'Pink Dream', css: 'sepia(0.3) saturate(1.4) hue-rotate(-15deg)' },
  { name: 'Golden', css: 'sepia(0.4) saturate(1.2) contrast(1.1)' }
];

export function Studio() {
  const { currentUser, refreshSystemData } = useAuth();
  const navigate = useNavigate();
  const [caption, setCaption] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Normal');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File too large (max 50MB)');
      return;
    }
    
    setIsUploading(true);
    try {
      const res = await api.uploadFile(file);
      if (res.url) {
        setMediaUrl(res.url);
        setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
      } else {
        toast.error("Upload failed: " + res.error);
      }
    } catch(err: any) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const isVideo = mediaType === 'video';

  const handlePublish = async () => {
    if (!currentUser) return;
    if (!caption.trim() && !mediaUrl) return;

    const newPost: Post = {
      id: `p_${Date.now()}`,
      authorId: currentUser.id,
      caption,
      mediaUrl: mediaUrl || undefined,
      mediaType: mediaUrl ? (isVideo ? 'video' : 'image') : undefined,
      filterName: selectedFilter,
      visibility: 'public',
      allowComments: true,
      allowDownloads: true,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      commentsCount: 0,
      viewsCount: 0
    };

    try {
      await api.createPost(newPost);
      await refreshSystemData();
      toast.success("Successfully Shared!");
      navigate('/home');
    } catch(err: any) {
      console.error(err);
      toast.error("Failed to publish: " + err.message);
    }
  };

  const currentFilterCss = FILTERS.find(f => f.name === selectedFilter)?.css || 'none';

  return (
    <motion.div 
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="flex flex-col min-h-screen bg-slate-50 relative max-w-md mx-auto overflow-hidden shadow-2xl"
    >
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 via-white to-yellow-50/50 z-0"></div>
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-pink-200/40 rounded-full blur-3xl mix-blend-multiply animate-pulse-glow z-0"></div>

      <div className="relative z-10 flex flex-col h-full bg-white/40 backdrop-blur-xl">
        <div className="flex justify-between items-center p-5 border-b border-white/60">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/80 shadow-sm flex items-center justify-center text-slate-600 hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-display font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-pink-400" />
            Studio
          </h1>
          <div className="w-10" /> {/* Balancer */}
        </div>

        <div className="flex-1 overflow-y-auto p-5 scrollbar-none space-y-6">
          <div className="flex gap-4">
            <img 
              src={currentUser?.avatarUrl || undefined} 
              alt="Avatar" 
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm mt-1"
            />
            <div className="flex-1">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full bg-transparent resize-none outline-none text-slate-800 placeholder-slate-400 text-lg min-h-[120px] font-medium leading-relaxed"
                autoFocus
              />
            </div>
          </div>

          <AnimatePresence>
            {mediaUrl ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl aspect-[4/5] bg-slate-100 group"
              >
                {isVideo ? (
                  <video 
                    src={mediaUrl || undefined} 
                    className="w-full h-full object-cover" 
                    controls
                    style={{ filter: currentFilterCss }}
                  />
                ) : (
                  <img 
                    src={mediaUrl || undefined} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                    style={{ filter: currentFilterCss }}
                  />
                )}
                <button 
                  onClick={() => setMediaUrl('')}
                  className="absolute top-4 right-4 bg-slate-900/40 backdrop-blur-md text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-slate-900/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                  {selectedFilter}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 gap-4"
              >
                <input 
                  type="file" 
                  accept="image/*,video/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                />
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex flex-col items-center justify-center gap-3 py-10 glass-card border-none ring-1 ring-white shadow-md rounded-[2rem] text-slate-500 font-bold hover:shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50"
                >
                  {isUploading ? (
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mb-1">
                      <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center mb-1 drop-shadow-sm">
                      <Image className="w-6 h-6 text-pink-500" />
                    </div>
                  )}
                  {isUploading ? 'Uploading...' : 'Photo'}
                </motion.button>
                
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center justify-center gap-3 py-10 glass-card border-none ring-1 ring-white shadow-md rounded-[2rem] text-slate-400 font-bold opacity-70 cursor-not-allowed"
                >
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-1">
                    <Video className="w-6 h-6 text-slate-400" />
                  </div>
                  Video (Soon)
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {mediaUrl && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/60 backdrop-blur-xl p-4 rounded-3xl border border-white shadow-sm"
            >
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Magic Filters</h4>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none px-1">
                {FILTERS.map(filter => (
                  <button
                    key={filter.name}
                    onClick={() => setSelectedFilter(filter.name)}
                    className={cn(
                      "flex-shrink-0 flex flex-col items-center gap-2 transition-all",
                      selectedFilter === filter.name ? "opacity-100 scale-105" : "opacity-60 hover:opacity-80 scale-100"
                    )}
                  >
                    <div className={cn(
                      "w-16 h-16 rounded-2xl overflow-hidden border-2 transition-colors",
                      selectedFilter === filter.name ? "border-pink-400 shadow-md" : "border-transparent"
                    )}>
                       <img src={mediaUrl || undefined} alt="" className="w-full h-full object-cover" style={{ filter: filter.css }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600">{filter.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-5 border-t border-white/60 bg-white/80 backdrop-blur-2xl pb-safe">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-slate-900">Anyone can reply</span>
              <span className="text-[11px] text-slate-500 font-medium">Public visibility</span>
            </div>
            <motion.button
              whileTap={!(!caption.trim() && !mediaUrl) ? { scale: 0.95 } : {}}
              onClick={handlePublish}
              disabled={!caption.trim() && !mediaUrl}
              className="bg-gradient-to-r from-pink-500 to-yellow-400 text-white font-black px-8 py-3.5 rounded-full flex items-center gap-2 disabled:opacity-50 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none shadow-xl shadow-pink-300/30 transition-all hover:-translate-y-0.5"
            >
              <Send className="w-4 h-4" />
              Publish
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
