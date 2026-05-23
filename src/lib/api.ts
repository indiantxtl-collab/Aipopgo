import { DatabaseSchema, User, Post, Comment, Notification, Message } from '../types';

export const AI_USER_ID = '100000';

export const api = {
  getSystemData: async (): Promise<DatabaseSchema> => {
    const res = await fetch('/api/data');
    return res.json();
  },
  login: async (identifier: string, password: string): Promise<{ user?: User, error?: string }> => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    return res.json();
  },
  signup: async (data: any): Promise<{ user?: User, error?: string }> => {
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  uploadFile: async (file: File): Promise<{ url?: string; error?: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    return res.json();
  },
  vote: async (voterId: string): Promise<{ totalVotes?: number, error?: string }> => {
    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voterId })
    });
    return res.json();
  },
  createPost: async (post: Post): Promise<{ post: Post }> => {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post)
    });
    return res.json();
  },
  deletePost: async (id: string): Promise<any> => {
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    return res.json();
  },
  updatePost: async (id: string, updates: Partial<Post>): Promise<{ post: Post }> => {
    const res = await fetch(`/api/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },
  likePost: async (id: string): Promise<{ likesCount: number }> => {
    const res = await fetch(`/api/posts/${id}/like`, { method: 'POST' });
    return res.json();
  },
  getComments: async (postId: string): Promise<Comment[]> => {
    const res = await fetch(`/api/posts/${postId}/comments`);
    return res.json();
  },
  addComment: async (postId: string, authorId: string, content: string): Promise<{ comment: Comment }> => {
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorId, content })
    });
    return res.json();
  },
  followUser: async (followingId: string, followerId: string): Promise<any> => {
    const res = await fetch(`/api/users/${followingId}/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ followerId })
    });
    return res.json();
  },
  unfollowUser: async (followingId: string, followerId: string): Promise<any> => {
    const res = await fetch(`/api/users/${followingId}/unfollow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ followerId })
    });
    return res.json();
  },
  acceptFollowRequest: async (requestId: string): Promise<any> => {
    const res = await fetch(`/api/requests/${requestId}/accept`, { method: 'POST' });
    return res.json();
  },
  rejectFollowRequest: async (requestId: string): Promise<any> => {
    const res = await fetch(`/api/requests/${requestId}/reject`, { method: 'POST' });
    return res.json();
  },
  updateProfile: async (userId: string, data: Partial<User>): Promise<{ user: User }> => {
    const res = await fetch(`/api/users/${userId}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  getNotifications: async (userId: string): Promise<Notification[]> => {
    const res = await fetch(`/api/notifications/${userId}`);
    return res.json();
  },
  markReadNotifications: async (userId: string) => {
    const res = await fetch(`/api/notifications/${userId}/read`, { method: 'POST' });
    return res.json();
  },
  getMessages: async (conversationId: string): Promise<Message[]> => {
    const res = await fetch(`/api/messages/${conversationId}`);
    return res.json();
  },
  sendMessage: async (senderId: string, conversationId: string, text: string): Promise<{ message: Message }> => {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId, conversationId, text })
    });
    return res.json();
  }
};
