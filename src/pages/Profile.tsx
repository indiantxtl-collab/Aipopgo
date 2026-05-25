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
  X,
  Lock
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { VerifiedBadge } from '../components/ui/VerifiedBadge';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

export function Profile() {
  const { username } = useParams<{ username: string }>();

  const {
    currentUser,
    systemData,
    refreshSystemData
  } = useAuth();

  const navigate = useNavigate();

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
        <p className="text-slate-500 font-bold">
          Loading...
        </p>
      </div>
    );
  }

  const db = systemData;

  const cleanUsername = username?.replace('@', '').toLowerCase().trim();

let user = username
  ? db.users.find((u) => {
      if (!u.username) return false;

      return (
        u.username.toLowerCase().trim() ===
        username.toLowerCase().replace('@', '').trim()
      );
    })
  : currentUser;

if (!user && currentUser?.username === username) {
  user = currentUser;
}

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-10 h-[70vh]">
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

  const isAi = user.id === AI_USER_ID;

  const isOwnProfile =
    currentUser?.id === user.id;

  const follows = db.follows || [];

  const followRequests =
    db.followRequests || [];

  const isFollowing = follows.some(
    (f: any) =>
      f.followerId === currentUser.id &&
      f.followingId === user.id
  );

  const isPendingRequest =
    followRequests.some(
      (r: any) =>
        r.requesterId === currentUser.id &&
        r.targetId === user.id
    );

  const isPrivate =
    user.isPrivate || false;

  const canViewPosts =
    !isPrivate ||
    isOwnProfile ||
    isFollowing;

  const canMessage =
    isOwnProfile ||
    isFollowing ||
    !isPrivate;

  const userPosts = canViewPosts
    ? db.posts
        .filter(
          (p: any) => p.authorId === user.id
        )
        .sort(
          (a: any, b: any) =>
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
        )
    : [];

  const handleFollow = async () => {
    if (!currentUser) {
      return toast.error(
        'Please login first'
      );
    }

    try {
      if (isFollowing) {
        await api.unfollowUser(
          user.id,
          currentUser.id
        );

        toast.success('Unfollowed');
      } else {
        await api.followUser(
          user.id,
          currentUser.id
        );

        if (isPrivate) {
          toast.success(
            'Follow request sent'
          );
        } else {
          toast.success(
            `Following @${user.username}`
          );
        }
      }

      await refreshSystemData();
    } catch (err) {
      console.error(err);

      toast.error('Action failed');
    }
  };

  const openEditModal = () => {
    setEditBio(user.bio || '');
    setEditName(user.name || '');
    setEditAvatarUrl(
      user.avatarUrl || ''
    );
    setEditCoverUrl(
      user.coverUrl || ''
    );

    setShowEdit(true);
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'avatar' | 'cover'
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setIsUploading(true);

    toast.loading(
      `Uploading ${type}...`,
      {
        id: 'upload'
      }
    );

    try {
      const res = await api.uploadFile(
        file
      );

      if (res.url) {
        if (type === 'avatar') {
          setEditAvatarUrl(res.url);
        }

        if (type === 'cover') {
          setEditCoverUrl(res.url);
        }

        toast.success(
          `${type} uploaded!`,
          {
            id: 'upload'
          }
        );
      } else {
        throw new Error(
          res.error || 'Upload failed'
        );
      }
    } catch (err) {
      console.error(err);

      toast.error(
        `Failed to upload ${type}`,
        {
          id: 'upload'
        }
      );
    } finally {
      setIsUploading(false);
    }
  };

  const saveProfile = async () => {
    if (
      !currentUser ||
      !editName.trim()
    ) {
      return toast.error(
        'Name is required'
      );
    }

    try {
      await api.updateProfile(
        currentUser.id,
        {
          bio: editBio,
          name: editName,
          avatarUrl: editAvatarUrl,
          coverUrl: editCoverUrl
        }
      );

      await refreshSystemData();

      setShowEdit(false);

      toast.success('Profile saved');
    } catch (err) {
      toast.error('Failed to save');
    }
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  return (
    <div className="w-full min-h-[calc(100vh-56px)] pb-24 relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-pink-200/20 rounded-full blur-[100px] animate-pulse-glow" />

        <div
          className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-yellow-200/20 rounded-full blur-[100px] animate-pulse-glow"
          style={{
            animationDelay: '1s'
          }}
        />
      </div>

      <AnimatePresence>
        {showEdit && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                setShowEdit(false)
              }
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 200
              }}
              className="w-full max-w-md bg-white rounded-t-[2.5rem] relative z-10 shadow-2xl border-t border-white h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
                <button
                  onClick={() =>
                    setShowEdit(false)
                  }
                  className="p-2 -ml-2 text-slate-400"
                >
                  <X className="w-6 h-6" />
                </button>

                <h2 className="font-display font-black text-slate-900 text-lg">
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
                  {editCoverUrl && (
                    <img
                      src={editCoverUrl}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  )}

                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <button
                      onClick={() =>
                        coverInputRef.current?.click()
                      }
                      className="bg-black/40 text-white p-2.5 rounded-full"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>

                  <input
                    type="file"
                    ref={coverInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileUpload(
                        e,
                        'cover'
                      )
                    }
                  />

                  <div className="absolute -bottom-10 left-6 w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-slate-200">
                    <img
                      src={editAvatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />

                    <button
                      onClick={() =>
                        avatarInputRef.current?.click()
                      }
                      className="absolute inset-0 bg-black/20 flex items-center justify-center"
                    >
                      <Camera className="w-4 h-4 text-white" />
                    </button>

                    <input
                      type="file"
                      ref={avatarInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(
                          e,
                          'avatar'
                        )
                      }
                    />
                  </div>
                </div>

                <div className="px-6 space-y-6 pb-6">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase">
                      Display Name
                    </label>

                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3"
                      value={editName}
                      onChange={(e) =>
                        setEditName(
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase">
                      Bio
                    </label>

                    <textarea
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 min-h-[120px]"
                      value={editBio}
                      onChange={(e) =>
                        setEditBio(
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="h-56 w-full max-w-md mx-auto relative">
        {user.coverUrl ? (
          <img
            src={user.coverUrl}
            className="w-full h-full object-cover"
            alt="Cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-300 via-purple-300 to-yellow-300" />
        )}
      </div>

      <div className="max-w-md mx-auto px-4 -mt-24 z-10 relative">
        {isAi ? (
          <AiHeroCard aiUser={user} />
        ) : (
          <motion.div
            initial={{
              opacity: 0,
              y: 30
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className="glass-card rounded-[2.5rem] p-6 shadow-xl border border-white flex flex-col items-center"
          >
            <div className="relative -mt-6">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-xl bg-white"
              />
            </div>

            <h2 className="mt-5 text-2xl font-display font-black text-slate-900 flex items-center gap-2">
              {user.name}

              {user.isVerified && (
                <VerifiedBadge
                  isGolden={
                    user.id === '100000'
                  }
                  size={22}
                />
              )}

              {isPrivate && (
                <Lock className="w-4 h-4 text-slate-500" />
              )}
            </h2>

            <div className="bg-white/60 px-3 py-1 rounded-full border mt-1 mb-4">
              <p className="text-[12px] font-bold text-pink-500">
                @{user.username}
              </p>
            </div>

            <p className="text-[15px] text-slate-700 mt-2 text-center px-4">
              {user.bio}
            </p>

            <div className="flex flex-row justify-center gap-10 mt-6 w-full pt-6 border-t border-slate-100/50">
              <div className="text-center">
                <div className="font-display font-black text-2xl text-slate-900">
                  {user.followersCount?.toLocaleString?.() ||
                    0}
                </div>

                <div className="text-[10px] text-slate-400 uppercase">
                  Followers
                </div>
              </div>

              <div className="text-center">
                <div className="font-display font-black text-2xl text-slate-900">
                  {user.followingCount?.toLocaleString?.() ||
                    0}
                </div>

                <div className="text-[10px] text-slate-400 uppercase">
                  Following
                </div>
              </div>

              <div className="text-center">
                <div className="font-display font-black text-2xl text-slate-900">
                  {userPosts
                    .reduce(
                      (
                        acc: number,
                        p: any
                      ) =>
                        acc +
                        (p.likesCount || 0),
                      0
                    )
                    .toLocaleString()}
                </div>

                <div className="text-[10px] text-slate-400 uppercase">
                  Likes
                </div>
              </div>
            </div>

            <div className="w-full mt-8 flex gap-3">
              {isOwnProfile ? (
                <>
                  <motion.button
                    whileTap={{
                      scale: 0.95
                    }}
                    onClick={
                      openEditModal
                    }
                    className="flex-[2] bg-slate-100 text-slate-700 font-black py-3.5 rounded-2xl"
                  >
                    Edit Profile
                  </motion.button>

                  <motion.button
                    whileTap={{
                      scale: 0.95
                    }}
                    onClick={
                      handleSettingsClick
                    }
                    className="flex-1 bg-white border border-slate-200 text-slate-700 font-black py-3.5 rounded-2xl"
                  >
                    <Settings className="w-5 h-5 mx-auto" />
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.button
                    whileTap={{
                      scale: 0.95
                    }}
                    onClick={
                      handleFollow
                    }
                    disabled={
                      isPendingRequest
                    }
                    className="flex-[2] bg-gradient-to-r from-pink-500 to-yellow-400 text-white font-black py-3.5 rounded-2xl"
                  >
                    {isFollowing
                      ? 'Following'
                      : isPendingRequest
                      ? 'Requested'
                      : 'Follow'}
                  </motion.button>

                  <motion.button
                    whileTap={{
                      scale: 0.95
                    }}
                    onClick={() => {
                      if (
                        !canMessage
                      ) {
                        return toast.error(
                          'Private account'
                        );
                      }

                      navigate(
                        `/messages/new/${user.id}`
                      );
                    }}
                    className="flex-1 glass-panel text-slate-700 font-black py-3.5 rounded-2xl"
                  >
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
            onClick={() =>
              setActiveTab('posts')
            }
            className={cn(
              'pb-4 text-[13px] uppercase tracking-widest font-black transition-colors relative',
              activeTab === 'posts'
                ? 'text-slate-900'
                : 'text-slate-400'
            )}
          >
            Feed
          </button>

          <button
            onClick={() =>
              setActiveTab('saved')
            }
            className={cn(
              'pb-4 text-[13px] uppercase tracking-widest font-black transition-colors relative',
              activeTab === 'saved'
                ? 'text-slate-900'
                : 'text-slate-400'
            )}
          >
            Gallery
          </button>
        </div>

        <div className="px-4 space-y-6">
          {activeTab === 'posts' && (
            <>
              {!canViewPosts ? (
                <motion.div
                  initial={{
                    opacity: 0
                  }}
                  animate={{
                    opacity: 1
                  }}
                  className="py-16 text-center text-slate-400 flex flex-col items-center glass-card rounded-[2rem] border border-white"
                >
                  <Lock className="w-12 h-12 text-pink-300 mb-4" />

                  <p className="font-bold text-[15px] text-slate-700">
                    Private Account
                  </p>

                  <p className="text-[13px] mt-1 text-slate-400">
                    Follow karne ke baad
                    posts dikhenge
                  </p>
                </motion.div>
              ) : userPosts.length >
                0 ? (
                userPosts.map(
                  (post: any) => (
                    <FeedPost
                      key={post.id}
                      post={post}
                      author={user}
                    />
                  )
                )
              ) : (
                <motion.div
                  initial={{
                    opacity: 0
                  }}
                  animate={{
                    opacity: 1
                  }}
                  className="py-16 text-center text-slate-400 flex flex-col items-center glass-card rounded-[2rem] border border-white"
                >
                  <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                    <Grid className="w-10 h-10 text-pink-300" />
                  </div>

                  <p className="font-bold text-[15px] text-slate-600">
                    {isOwnProfile
                      ? "You haven't posted yet"
                      : 'No posts yet'}
                  </p>
                </motion.div>
              )}
            </>
          )}

          {activeTab === 'saved' && (
            <motion.div
              initial={{
                opacity: 0
              }}
              animate={{
                opacity: 1
              }}
              className="grid grid-cols-3 gap-1 rounded-2xl overflow-hidden border border-white/50 shadow-sm"
            >
              {[1, 2, 3, 4, 5, 6].map(
                (i) => (
                  <div
                    key={i}
                    className="aspect-square bg-white/40 flex items-center justify-center border border-white/20"
                  >
                    <ImageIcon className="w-6 h-6 text-slate-300" />
                  </div>
                )
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
