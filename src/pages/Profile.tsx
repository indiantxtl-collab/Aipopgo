import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AI_USER_ID, api } from '../lib/api';
import { AiHeroCard } from '../components/ui/AiHeroCard';
import { FeedPost } from '../components/ui/FeedPost';
import { Settings, Pencil, Camera, Grid, Bookmark, Heart, Image as ImageIcon, X, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { VerifiedBadge } from '../components/ui/VerifiedBadge';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

export function Profile() {
  const { username } = useParams<{ username: string }>();
  const { currentUser, systemData, refreshSystemData } = useAuth();
  const navigate = useNavigate();
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editName, setEditName] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editCoverUrl, setEditCoverUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  if (!systemData || !currentUser) {
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-slate-500 font-bold">Loading...</p>
    </div>
  );
  }
  const db = systemData;
  
  const user = username 
    ? db.users.find(u => u.username === username)
    : currentUser;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-10 h-[70vh]">
        <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mb-6">
           <Heart className="w-10 h-10 text-pink-300" />
        </div>
        <h2 className="text-xl font-display font-black text-slate-800">User not found</h2>
        <motion.button whileTap={{scale:0.95}} onClick={() => navigate('/home')} className="mt-6 bg-slate-900 text-white px-8 py-3 rounded-full font-bold shadow-xl">Return Home</motion.button>
      </div>
    );
  }

  const isAi = user.id === AI_USER_ID;
  const isOwnProfile = currentUser?.id === user.id;
  
  const userPosts = db.posts.filter(p => p.authorId === user.id).sort((a,b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleFollow = async () => {
    if(!currentUser) return toast.error("Please login to follow");
    setIsFollowing(true);
    toast.success(`Following @${user.username}`);
    try {
      await api.followUser(user.id, currentUser.id);
      await refreshSystemData();
    } catch(err) {
      toast.error('Failed to follow');
      setIsFollowing(false);
    }
  };

  const openEditModal = () => {
    setEditBio(user.bio || '');
    setEditName(user.name || '');
    setEditAvatarUrl(user.avatarUrl || '');
    setEditCoverUrl(user.coverUrl || '');
    setShowEdit(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    toast.loading(`Uploading ${type}...`, { id: 'upload' });
    try {
      const res = await api.uploadFile(file);
      if (res.url) {
        if (type === 'avatar') setEditAvatarUrl(res.url);
        if (type === 'cover') setEditCoverUrl(res.url);
        toast.success(`${type} uploaded!`, { id: 'upload' });
      } else {
        throw new Error(res.error || 'Upload failed');
      }
    } catch(err) {
      console.error(err);
      toast.error(`Failed to upload ${type}`, { id: 'upload' });
    } finally {
      setIsUploading(false);
    }
  };

  const saveProfile = async () => {
    if(!currentUser || !editName.trim()) return toast.error("Name is required");
    try {
      await api.updateProfile(currentUser.id, { 
        bio: editBio,
        name: editName,
        avatarUrl: editAvatarUrl,
        coverUrl: editCoverUrl
      });
      await refreshSystemData();
      setShowEdit(false);
      toast.success("Profile saved");
    } catch(err) { toast.error("Failed to save"); }
  };

  const handleSettingsClick = () => {
     navigate('/settings');
  };

  return (
    <div className="w-full min-h-[calc(100vh-56px)] pb-24 relative overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-pink-200/20 rounded-full blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-yellow-200/20 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <AnimatePresence>
         {showEdit && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center">
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setShowEdit(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}} transition={{type:'spring', damping:25, stiffness:200}} className="w-full max-w-md bg-white backdrop-blur-2xl rounded-t-[2.5rem] relative z-10 shadow-2xl border-t border-white h-[85vh] flex flex-col overflow-hidden">
                 <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white relative z-20">
                   <button onClick={()=>setShowEdit(false)} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 transition-colors"><X className="w-6 h-6" /></button>
                   <h2 className="font-display font-black text-slate-900 text-lg">Edit Profile</h2>
                   <button onClick={saveProfile} disabled={isUploading} className="font-bold text-pink-500 hover:text-pink-600 transition-colors px-2 py-1">Save</button>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto no-scrollbar pb-safe">
                   <div className="relative w-full h-32 bg-slate-100 mb-12">
                     {editCoverUrl && <img src={editCoverUrl || undefined} alt="Cover" className="w-full h-full object-cover" />}
                     <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <button onClick={() => coverInputRef.current?.click()} className="bg-black/40 text-white p-2.5 rounded-full backdrop-blur-sm hover:scale-110 transition-transform">
                          <Camera className="w-5 h-5" />
                        </button>
                     </div>
                     <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'cover')} />
                     
                     <div className="absolute -bottom-10 left-6 w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-slate-200 relative group">
                        <img src={editAvatarUrl || undefined} alt="Avatar" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => avatarInputRef.current?.click()} className="bg-black/40 text-white p-2 rounded-full backdrop-blur-sm hover:scale-110 transition-transform">
                             <Camera className="w-4 h-4" />
                           </button>
                        </div>
                        <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'avatar')} />
                     </div>
                   </div>

                   <div className="px-6 space-y-6 pb-6">
                     <div>
                       <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Display Name</label>
                       <input 
                         type="text"
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 text-[15px] font-bold focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all shadow-inner"
                         value={editName}
                         onChange={e=>setEditName(e.target.value)}
                         placeholder="Your lovely name"
                       />
                     </div>
                     <div>
                       <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Username</label>
                       <div className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-500 text-[15px] font-bold shadow-inner cursor-not-allowed">
                         @{user.username}
                       </div>
                       <p className="text-[10px] text-slate-400 mt-1 ml-1">Username cannot be changed after creation.</p>
                     </div>
                     <div>
                       <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Bio</label>
                       <textarea 
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 text-[15px] min-h-[120px] focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all resize-none shadow-inner"
                         value={editBio}
                         onChange={e=>setEditBio(e.target.value)}
                         placeholder="Tell us about yourself..."
                       />
                     </div>
                   </div>
                 </div>
              </motion.div>
            </div>
         )}
      </AnimatePresence>

      <div className="h-56 w-full max-w-md mx-auto relative group">
        {user.coverUrl ? (
           <img src={user.coverUrl || undefined} className="w-full h-full object-cover" alt="Cover" />
        ) : (
           <div className="w-full h-full bg-gradient-to-br from-pink-300 via-purple-300 to-yellow-300 relative shadow-inner overflow-hidden">
             <div className="absolute inset-0 bg-white/10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
           </div>
        )}
        {/* Soft gradient fade into content */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-primary-50 to-transparent"></div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-24 z-10 relative">
        {isAi ? (
          <AiHeroCard aiUser={user} />
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-[2.5rem] p-6 shadow-xl border border-white flex flex-col items-center"
          >
            <div className="relative -mt-6">
              <div className="absolute inset-0 rounded-full border border-pink-200 animate-pulse-glow" style={{ transform: 'scale(1.1)' }}></div>
              <img 
                src={user.avatarUrl || undefined} 
                alt={user.name} 
                className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-xl relative z-10 bg-white"
              />
            </div>
            
            <h2 className="mt-5 text-2xl font-display font-black text-slate-900 flex items-center justify-center gap-1.5 tracking-tight relative left-1">
              {user.name}
              {user.isVerified && <VerifiedBadge isGolden={user.id === '100000'} size={22} className="-mt-0.5" />}
            </h2>
            <div className="bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/50 shadow-sm mt-1 mb-4">
              <p className="text-[12px] font-bold text-pink-500 tracking-wide">@{user.username}</p>
            </div>
            
            <p className="text-[15px] text-slate-700 mt-2 text-center px-4 leading-relaxed font-medium">{user.bio}</p>
            
            <div className="flex flex-row justify-center gap-10 mt-6 w-full pt-6 border-t border-slate-100/50">
              <div className="text-center cursor-pointer group" onClick={() => navigate(`/u/${user.username}/followers`)}>
                <div className="font-display font-black text-2xl text-slate-900 group-hover:text-pink-500 transition-colors">{user.followersCount.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Followers</div>
              </div>
              <div className="text-center cursor-pointer group" onClick={() => navigate(`/u/${user.username}/following`)}>
                <div className="font-display font-black text-2xl text-slate-900 group-hover:text-pink-500 transition-colors">{user.followingCount.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Following</div>
              </div>
              <div className="text-center cursor-pointer group">
                <div className="font-display font-black text-2xl text-slate-900 group-hover:text-pink-500 transition-colors">{(userPosts.reduce((acc, p) => acc + p.likesCount, 0)).toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Likes</div>
              </div>
            </div>

            <div className="w-full mt-8 flex gap-3">
              {isOwnProfile ? (
                 <>
                   <motion.button whileTap={{scale:0.95}} onClick={openEditModal} className="flex-[2] bg-slate-100/80 text-slate-700 font-black py-3.5 rounded-2xl hover:bg-slate-200 flex items-center justify-center gap-2 transition-all border border-slate-200/50 shadow-sm">
                     <Pencil className="w-5 h-5"/> Edit Profile
                   </motion.button>
                   <motion.button whileTap={{scale:0.95}} onClick={handleSettingsClick} className="flex-1 bg-white border border-slate-200 text-slate-700 font-black py-3.5 rounded-2xl hover:bg-slate-50 flex items-center justify-center transition-all shadow-sm">
                     <Settings className="w-5 h-5"/>
                   </motion.button>
                 </>
              ) : (
                <>
                  <motion.button whileTap={{scale:0.95}} onClick={handleFollow} disabled={isFollowing} className="flex-[2] bg-gradient-to-r from-pink-500 to-yellow-400 text-white font-black py-3.5 rounded-2xl shadow-xl shadow-pink-300/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:shadow-none disabled:transform-none">
                    {isFollowing ? 'Following' : 'Follow'}
                  </motion.button>
                  <motion.button whileTap={{scale:0.95}} className="flex-1 glass-panel text-slate-700 font-black py-3.5 rounded-2xl hover:bg-white transition-all shadow-sm">
                    Message
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <div className="max-w-md mx-auto mt-8">
         <div className="flex px-4 gap-6 border-b border-white/40 mb-6">
           <button 
             onClick={() => setActiveTab('posts')}
             className={cn("pb-4 text-[13px] uppercase tracking-widest font-black transition-colors relative", activeTab === 'posts' ? "text-slate-900" : "text-slate-400 hover:text-slate-600")}
           >
              Feed
              {activeTab === 'posts' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-1 bg-pink-500 rounded-t-full" />}
           </button>
           <button 
             onClick={() => setActiveTab('saved')}
             className={cn("pb-4 text-[13px] uppercase tracking-widest font-black transition-colors relative", activeTab === 'saved' ? "text-slate-900" : "text-slate-400 hover:text-slate-600")}
           >
              Gallery
              {activeTab === 'saved' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-1 bg-pink-500 rounded-t-full" />}
           </button>
         </div>

         <div className="px-4 space-y-6">
           {activeTab === 'posts' && (
             <>
               {userPosts.length > 0 ? (
                 userPosts.map(post => (
                   <FeedPost key={post.id} post={post} author={user} />
                 ))
               ) : (
                 <motion.div initial={{opacity:0}} animate={{opacity:1}} className="py-16 text-center text-slate-400 flex flex-col items-center glass-card rounded-[2rem] border border-white">
                    <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                       <Grid className="w-10 h-10 text-pink-300" />
                    </div>
                    <p className="font-bold text-[15px] text-slate-600">{isOwnProfile ? "You haven't posted yet" : "No posts yet"}</p>
                    <p className="text-[13px] font-medium mt-1 text-slate-400">Share some beautiful moments.</p>
                 </motion.div>
               )}
             </>
           )}
           {activeTab === 'saved' && (
             <motion.div initial={{opacity:0}} animate={{opacity:1}} className="grid grid-cols-3 gap-1 rounded-2xl overflow-hidden border border-white/50 shadow-sm">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="aspect-square bg-white/40 flex items-center justify-center border border-white/20">
                     <ImageIcon className="w-6 h-6 text-slate-300" />
                  </div>
                ))}
             </motion.div>
           )}
         </div>
      </div>
    </div>
  );
}
