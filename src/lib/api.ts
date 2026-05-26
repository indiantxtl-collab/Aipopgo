import { DatabaseSchema, User, Post, Comment, Notification, Message } from '../types';
import { supabase } from './supabase';

export const AI_USER_ID = '100000';

export const api = {
  getSystemData: async (): Promise<any> => {
    // With Supabase, we fetch initial states directly in context, but for compatibility we fetch all
    let [
      { data: users }, { data: posts }, { data: comments },
      { data: follows }, { data: followReqs },
      { data: notifications }, { data: messages }
    ] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('posts').select('*').order('createdAt', { ascending: false }),
      supabase.from('comments').select('*'),
      supabase.from('follows').select('*'),
      supabase.from('follow_requests').select('*'),
      supabase.from('notifications').select('*'),
      supabase.from('messages').select('*')
    ]);

    if (users && !users.find(u => u.id === AI_USER_ID)) {
      const aiUser = {
        id: AI_USER_ID,
        name: 'Ai',
        username: 'ai_official',
        email: 'ai@aipop.com',
        avatarUrl: '/ai_avatar.svg',
        coverUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80',
        bio: "My name is Ai.\nI'm taking part in the contest to decide who is pop and cute.\nMy hobbies are watching baseball, seeing some comedians and playing games.\nThe Goal is to be a person who can support someone. I am working on studying, doing self-improvement and delivering” \nMixchannel id:- 18641424",
        isVerified: true,
        role: 'user',
        followersCount: 15400,
        followingCount: 3,
        joinDate: new Date().toISOString()
      };
      await supabase.from('users').insert(aiUser);
      users.push(aiUser);
    }

    return {
      users: users || [],
      posts: posts || [],
      votes: [],
      comments: comments || [],
      follows: follows || [],
      followRequests: followReqs || [],
      notifications: notifications || [],
      messages: messages || [],
      progressGoal: 10000,
      totalVotes: 3450
    };
  },

  login: async (identifier: string, password: string): Promise<{ user?: User, error?: string }> => {
    const { data: user } = await supabase.from('users')
      .select('*')
      .or(`email.eq.${identifier},username.eq.${identifier}`)
      .single();
    
    if (user && password?.length > 0) return { user };
    return { error: 'Invalid username or password.' };
  },

  signup: async (data: any): Promise<{ user?: User, error?: string }> => {
    const id = Date.now().toString();
    const newUser = {
      id,
      name: data.name, 
      username: data.username, 
      email: data.email,
      isVerified: false, 
      role: 'user', 
      joinDate: new Date().toISOString(),
      followersCount: 0, 
      followingCount: 0,
      avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${data.username}&backgroundColor=fbbf24`,
      bio: 'New user ✨',
      settings: {}
    };
    
    const { error } = await supabase.from('users').insert(newUser);
    if (error) return { error: error.message };
    
    return { user: newUser as User };
  },

  uploadFile: async (file: File): Promise<{ url?: string; error?: string }> => {
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from('media').upload(path, file);
    if (error) return { error: error.message };
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);
    return { url: urlData.publicUrl };
  },

  vote: async (voterId: string): Promise<{ totalVotes?: number, error?: string }> => {
    return { totalVotes: 3500 };
  },

  createPost: async (post: Post): Promise<{ post: Post }> => {
    const { data, error } = await supabase.from('posts').insert(post).select().single();
    if (error) throw error;
    return { post: data };
  },

  deletePost: async (id: string): Promise<any> => {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;
    return { status: 'success' };
  },

  updatePost: async (id: string, updates: Partial<Post>): Promise<{ post: Post }> => {
    const { data, error } = await supabase.from('posts').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return { post: data };
  },

  createNotification: async (userId: string, actorId: string, type: 'like' | 'comment' | 'follow', postId?: string, message?: string) => {
    if (userId === actorId) return; // Don't notify self
    const notification = {
      id: `n_${Date.now()}_${Math.random()}`,
      userId,
      actorId,
      type,
      postId,
      message: message || '',
      isRead: false,
      timestamp: new Date().toISOString()
    };
    await supabase.from('notifications').insert(notification);
  },

  likePost: async (id: string, actorId?: string): Promise<{ likesCount: number }> => {
    // In production we would use an RPC to increment
    const { data: post } = await supabase.from('posts').select('likesCount, authorId').eq('id', id).single();
    const newCount = (post?.likesCount || 0) + 1;
    await supabase.from('posts').update({ likesCount: newCount }).eq('id', id);
    if (actorId && post?.authorId) {
       await api.createNotification(post.authorId, actorId, 'like', id, 'liked your post');
    }
    return { likesCount: newCount };
  },

  getComments: async (postId: string): Promise<Comment[]> => {
    const { data } = await supabase.from('comments').select('*').eq('postId', postId);
    return data || [];
  },

  addComment: async (postId: string, authorId: string, content: string): Promise<{ comment: Comment }> => {
    const newComment = { id: `c_${Date.now()}`, postId, authorId, content, createdAt: new Date().toISOString() };
    const { data } = await supabase.from('comments').insert(newComment).select().single();
    const { data: post } = await supabase.from('posts').select('authorId').eq('id', postId).single();
    if (post?.authorId) {
      await api.createNotification(post.authorId, authorId, 'comment', postId, content);
    }
    return { comment: data as Comment };
  },

  followUser: async (followingId: string, followerId: string): Promise<any> => {
    await supabase.from('follows').insert({ followerId, followingId });
    await api.createNotification(followingId, followerId, 'follow', undefined, 'started following you');
    return { status: 'success' };
  },

  unfollowUser: async (followingId: string, followerId: string): Promise<any> => {
    await supabase.from('follows').delete().match({ followerId, followingId });
    return { status: 'success' };
  },

  acceptFollowRequest: async (requestId: string): Promise<any> => {
    await supabase.from('follow_requests').delete().eq('id', requestId);
    return { status: 'success' };
  },

  rejectFollowRequest: async (requestId: string): Promise<any> => {
    await supabase.from('follow_requests').delete().eq('id', requestId);
    return { status: 'success' };
  },

  updateProfile: async (userId: string, data: Partial<User>): Promise<{ user: User }> => {
    const { data: user, error } = await supabase.from('users').update(data).eq('id', userId).select().single();
    if (error) throw error;
    return { user };
  },

  getNotifications: async (userId: string): Promise<Notification[]> => {
    const { data } = await supabase.from('notifications').select('*').eq('userId', userId).order('timestamp', { ascending: false });
    return data || [];
  },

  markReadNotifications: async (userId: string) => {
    await supabase.from('notifications').update({ isRead: true }).eq('userId', userId);
    return { status: 'success' };
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    const { data } = await supabase.from('messages').select('*').eq('conversationId', conversationId).order('timestamp', { ascending: true });
    return data || [];
  },

  sendMessage: async (senderId: string, conversationId: string, text: string): Promise<{ message: Message }> => {
    const msg = { id: `m_${Date.now()}`, conversationId, senderId, text, timestamp: new Date().toISOString() };
    const { data, error } = await supabase.from('messages').insert(msg).select().single();
    if (error) throw error;
    return { message: data as Message };
  }
};
