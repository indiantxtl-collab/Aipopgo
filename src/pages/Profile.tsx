import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AI_USER_ID, api } from '../lib/api';
import { AiHeroCard } from '../components/ui/AiHeroCard';
import { FeedPost } from '../components/ui/FeedPost';
import {
  Settings,
  Pencil,
  Camera,
  Grid,
  Heart,
  Image as ImageIcon,
  X
} from 'lucide-react';
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

  if (!systemData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-bold text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const db = systemData;

  const profileUser = username
    ? db.users.find(
        u =>
          u.username &&
          u.username.toLowerCase() === username.toLowerCase()
      )
    : currentUser;

  if (!profileUser) {
    return (
      <div className="flex flex-col items-center justify-center p-10 h-screen bg-slate-50">
        <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mb-6">
          <Heart className="w-10 h-10 text-pink-300" />
        </div>

        <h2 className="text-xl font-display font-black text-slate-800">
          User not found
        </h2>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/home')}
          className="mt-6 bg-slate-900 text-white px-8 py-3 rounded-full font-bold shadow-xl"
        >
          Return Home
        </motion.button>
      </div>
    );
  }

  const user = profileUser;

  const isAi = user.id === AI_USER_ID;
  const isOwnProfile = currentUser?.id === user.id;

  const safeAvatar =
    user.avatarUrl && user.avatarUrl.trim() !== ''
      ? user.avatarUrl
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user.name || user.username
        )}&background=f9a8d4&color=fff`;

  const safeCover =
    user.coverUrl && user.coverUrl.trim() !== ''
      ? user.coverUrl
      : null;

  const userPosts = db.posts
    .filter(p => p.authorId === user.id)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

  const handleFollow = async () => {
    if (!currentUser) {
      toast.error('Please login to follow');
      return;
    }

    try {
      const res = await api.followUser(
        user.id,
        currentUser.id
      );

      if (res.error) {
        toast.error(res.error);
        return;
      }

      setIsFollowing(true);

      toast.success(`Following @${user.username}`);

      await refreshSystemData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to follow');
    }
  };

  const openEditModal = () => {
    setEditBio(user.bio || '');
    setEditName(user.name || '');
    setEditAvatarUrl(user.avatarUrl || '');
    setEditCoverUrl(user.coverUrl || '');
    setShowEdit(true);
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'avatar' | 'cover'
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setIsUploading(true);

    toast.loading(`Uploading ${type}...`, {
      id: 'upload',
    });

    try {
      const res = await api.uploadFile(file);

      if (res.url) {
        if (type === 'avatar') {
          setEditAvatarUrl(res.url);
        }

        if (type === 'cover') {
          setEditCoverUrl(res.url);
        }

        toast.success(`${type} uploaded!`, {
          id: 'upload',
        });
      } else {
        throw new Error(
          res.error || 'Upload failed'
        );
      }
    } catch (err) {
      console.error(err);

      toast.error(`Failed to upload ${type}`, {
        id: 'upload',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const saveProfile = async () => {
    if (!currentUser || !editName.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      await api.updateProfile(currentUser.id, {
        bio: editBio,
        name: editName,
        avatarUrl: editAvatarUrl,
        coverUrl: editCoverUrl,
      });

      await refreshSystemData();

      setShowEdit(false);

      toast.success('Profile saved');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save');
    }
  };

  return (
    <div className="w-full min-h-screen pb-24 relative overflow-x-hidden bg-slate-50">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-pink-200/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-yellow-200/20 rounded-full blur-[100px]" />
      </div>

      <AnimatePresence>
        {showEdit && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEdit(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 200,
              }}
              className="w-full max-w-md bg-white rounded-t-[2.5rem] relative z-10 shadow-2xl h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setShowEdit(false)}
                  className="p-2"
                >
                  <X className="w-6 h-6" />
                </button>

                <h2 className="font-black text-lg">
                  Edit Profile
                </h2>

                <button
                  onClick={saveProfile}
                  disabled={isUploading}
                  className="font-bold text-pink-500"
                >
                  Save
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="relative w-full h-32 bg-slate-100 mb-12">
                  {editCoverUrl ? (
                    <img
                      src={editCoverUrl}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-pink-200 to-yellow-200" />
                  )}

                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <button
                      onClick={() =>
                        coverInputRef.current?.click()
                      }
                      className="bg-black/40 text-white p-2 rounded-full"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>

                  <input
                    type="file"
                    ref={coverInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={e =>
                      handleFileUpload(e, 'cover')
                    }
                  />

                  <div className="absolute -bottom-10 left-6 w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-slate-200">
                    <img
                      src={
                        editAvatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          editName || user.username
                        )}`
                      }
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />

                    <button
                      onClick={() =>
                        avatarInputRef.current?.click()
                      }
                      className="absolute inset-0 bg-black/20 flex items-center justify-center"
                    >
                      <Camera className="w-5 h-5 text-white" />
                    </button>

                    <input
                      type="file"
                      ref={avatarInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={e =>
                        handleFileUpload(e, 'avatar')
                      }
                    />
                  </div>
                </div>

                <div className="px-6 space-y-5 pb-10">
                  <input
                    type="text"
                    value={editName}
                    onChange={e =>
                      setEditName(e.target.value)
                    }
                    placeholder="Display Name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 font-bold"
                  />

                  <textarea
                    value={editBio}
                    onChange={e =>
                      setEditBio(e.target.value)
                    }
                    placeholder="Your bio..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 min-h-[120px]"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="h-56 w-full max-w-md mx-auto relative">
        {safeCover ? (
          <img
            src={safeCover}
            className="w-full h-full object-cover"
            alt="Cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-300 via-purple-300 to-yellow-300" />
        )}
      </div>

      <div className="max-w-md mx-auto px-4 -mt-24 relative z-10">
        {isAi ? (
          <AiHeroCard aiUser={user} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-white flex flex-col items-center"
          >
            <img
              src={safeAvatar}
              alt={user.name}
              className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-xl bg-white"
            />

            <h2 className="mt-5 text-2xl font-black text-slate-900 flex items-center gap-2">
              {user.name}

              {user.isVerified && (
                <VerifiedBadge
                  isGolden={user.id === AI_USER_ID}
                  size={22}
                />
              )}
            </h2>

            <p className="text-pink-500 font-bold mt-1">
              @{user.username}
            </p>

            <p className="text-slate-600 mt-4 text-center">
              {user.bio}
            </p>

            <div className="flex justify-center gap-10 mt-6 w-full">
              <div className="text-center">
                <div className="font-black text-2xl">
                  {user.followersCount}
                </div>

                <div className="text-xs text-slate-400">
                  Followers
                </div>
              </div>

              <div className="text-center">
                <div className="font-black text-2xl">
                  {user.followingCount}
                </div>

                <div className="text-xs text-slate-400">
                  Following
                </div>
              </div>

              <div className="text-center">
                <div className="font-black text-2xl">
                  {userPosts.length}
                </div>

                <div className="text-xs text-slate-400">
                  Posts
                </div>
              </div>
            </div>

            <div className="w-full mt-8 flex gap-3">
              {isOwnProfile ? (
                <>
                  <button
                    onClick={openEditModal}
                    className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-2xl flex items-center justify-center gap-2"
                  >
                    <Pencil className="w-5 h-5" />
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      navigate('/settings')
                    }
                    className="w-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleFollow}
                    disabled={isFollowing}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-yellow-400 text-white font-bold py-3 rounded-2xl"
                  >
                    {isFollowing
                      ? 'Following'
                      : 'Follow'}
                  </button>

                  <button className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-2xl">
                    Message
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <div className="max-w-md mx-auto mt-8 px-4">
        <div className="flex gap-6 border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={cn(
              'pb-4 text-sm font-bold relative',
              activeTab === 'posts'
                ? 'text-slate-900'
                : 'text-slate-400'
            )}
          >
            Feed

            {activeTab === 'posts' && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-1 bg-pink-500 rounded-full"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={cn(
              'pb-4 text-sm font-bold relative',
              activeTab === 'saved'
                ? 'text-slate-900'
                : 'text-slate-400'
            )}
          >
            Gallery

            {activeTab === 'saved' && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-1 bg-pink-500 rounded-full"
              />
            )}
          </button>
        </div>

        {activeTab === 'posts' ? (
          <div className="space-y-6">
            {userPosts.length > 0 ? (
              userPosts.map(post => (
                <FeedPost
                  key={post.id}
                  post={post}
                  author={user}
                />
              ))
            ) : (
              <div className="py-16 text-center bg-white rounded-[2rem] border border-slate-100">
                <Grid className="w-10 h-10 text-pink-300 mx-auto mb-4" />

                <p className="font-bold text-slate-600">
                  No posts yet
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className="aspect-square bg-white rounded-2xl border border-slate-100 flex items-center justify-center"
              >
                <ImageIcon className="w-6 h-6 text-slate-300" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
