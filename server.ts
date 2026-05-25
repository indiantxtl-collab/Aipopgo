import express from 'express';
import path from 'path';
import fileUpload from 'express-fileupload';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

interface User {
  id: string; 
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
  isVerified: boolean;
  mixChannelId?: string;
  role: 'user' | 'creator';
  joinDate: string;
  followersCount: number;
  followingCount: number;
  isPrivate?: boolean;
}
interface Post {
  id: string;
  authorId: string;
  caption: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  filterName?: string;
  visibility: 'public' | 'followers' | 'private';
  allowComments: boolean;
  allowDownloads: boolean;
  isPinned?: boolean;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
}
interface Vote {
  id: string;
  voterId: string;
  targetUserId: string;
  timestamp: string;
}
interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
}
interface Follow {
  followerId: string;
  followingId: string;
  timestamp: string;
}
interface FollowRequest {
  id: string;
  requesterId: string;
  targetId: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
}
interface Notification {
  id: string;
  userId: string;
  actorId: string;
  type: 'vote' | 'follow' | 'comment' | 'like';
  message: string;
  isRead: boolean;
  timestamp: string;
  link?: string;
}
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export const AI_USER_ID = '100000';

const initialUsers: User[] = [
  {
    id: AI_USER_ID,
    name: 'Ai',
    username: 'aipopgirl',
    email: 'aipopgirl@demo.com',
    avatarUrl: '',
    coverUrl: '',
    bio: 'Hi, I\'m Ai — a cheerful dreamer aiming to become someone who can support and brighten other people\'s lives. I love baseball, comedians, games, studying, self-improvement, and sharing positive energy. Every cheer, every vote, and every kind message helps me move one step closer to my goal. Please support me on this journey!',
    isVerified: true,
    mixChannelId: '18641424',
    role: 'creator',
    joinDate: new Date('2024-01-01').toISOString(),
    followersCount: 12400,
    followingCount: 42,
  },
];

const initialPosts: Post[] = [
  {
    id: 'p1',
    authorId: AI_USER_ID,
    caption: 'Thank you everyone for the continued support! 💛 Keep voting daily so we can reach our 10,000 goal! ✨ #AiPopCute #ThankYou',
    mediaUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=800',
    mediaType: 'image',
    visibility: 'public',
    allowComments: true,
    allowDownloads: false,
    isPinned: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    likesCount: 1450,
    commentsCount: 132,
    viewsCount: 15400,
  },
  {
    id: 'p2',
    authorId: AI_USER_ID,
    caption: 'Had a great time studying today! Feeling productive. 📚 Hope everyone is having a wonderful week!',
    mediaUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=800',
    mediaType: 'image',
    visibility: 'public',
    allowComments: true,
    allowDownloads: true,
    isPinned: false,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    likesCount: 890,
    commentsCount: 45,
    viewsCount: 5200,
  }
];

let db = {
  users: [...initialUsers],
  posts: [...initialPosts],
  votes: [] as Vote[],
  comments: [] as Comment[],
  follows: [] as Follow[],
  followRequests: [] as FollowRequest[],
  notifications: [] as Notification[],
  messages: [] as Message[],
  progressGoal: 10000,
  totalVotes: 3450,
};

// Generate some sample notifications and comments
db.notifications.push({
  id: 'n1', userId: AI_USER_ID, actorId: '100001', type: 'vote', message: 'cheered for you!', isRead: false, timestamp: new Date().toISOString()
});

export const app = express();
const PORT = process.env.PORT || 3000;

// Use fileUpload for handling parsing
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  abortOnLimit: true
}));
app.use(express.json({ limit: '50mb' }));

// API Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  app.get('/api/data', (req, res) => res.json(db));

  app.post('/api/login', (req, res) => {
    const { identifier, password } = req.body;
    if (identifier === 'aipopgirl@demo.com' && password === 'SuperSecureAiAdmin2026!') {
      const creator = db.users.find(u => u.email === 'aipopgirl@demo.com');
      return res.json({ user: creator });
    }
    const user = db.users.find(u => u.email === identifier || u.username === identifier);
    if (user && password?.length > 0) return res.json({ user });
    res.status(401).json({ error: 'Invalid username or password.' });
  });

  app.post('/api/signup', (req, res) => {
    const { name, username, email, password } = req.body;
    if (db.users.find(u => u.username === username)) return res.status(400).json({ error: 'Username taken' });
    if (db.users.find(u => u.email === email)) return res.status(400).json({ error: 'Email registered' });

    const newUser: User = {
      id: (100000 + db.users.length + 1).toString(),
      name, username, email,
      isVerified: true, role: 'user', joinDate: new Date().toISOString(),
      followersCount: 0, followingCount: 0,
      avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${username}&backgroundColor=fbbf24`,
      bio: 'Ready to support Ai! ✨'
    };
    db.users.push(newUser);
    res.json({ user: newUser });
  });

  app.post('/api/upload', (req, res) => {
    // Handling a real file upload via form-data (express-fileupload exposes req.files)
    if (req.files && req.files.file) {
      const file = req.files.file as any;
      // Convert directly into base64 to store in memory for demo!
      const base64 = file.data.toString('base64');
      const mimetype = file.mimetype;
      const mediaUrl = `data:${mimetype};base64,${base64}`;
      return res.json({ url: mediaUrl });
    }
    // Alternatively handling base64 in body directly
    if (req.body && req.body.base64) {
       return res.json({ url: req.body.base64 });
    }
    return res.status(400).json({ error: 'No file uploaded' });
  });

  app.post('/api/vote', (req, res) => {
    const { voterId } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const existing = db.votes.find(v => v.voterId === voterId && v.timestamp.startsWith(today));
    
    if (existing) return res.status(400).json({ error: 'Already voted today' });
    db.votes.push({ id: `v_${Date.now()}`, voterId, targetUserId: AI_USER_ID, timestamp: new Date().toISOString() });
    db.totalVotes += 1;
    res.json({ status: 'success', totalVotes: db.totalVotes });
  });

  app.post('/api/posts', (req, res) => {
    const post = req.body;
    db.posts.unshift(post);
    res.json({ post });
  });
  
  app.delete('/api/posts/:id', (req, res) => {
    const index = db.posts.findIndex(p => p.id === req.params.id);
    if (index !== -1) {
      db.posts.splice(index, 1);
      return res.json({ status: 'success' });
    }
    res.status(404).json({ error: 'Not found' });
  });

  app.put('/api/posts/:id', (req, res) => {
    const post = db.posts.find(p => p.id === req.params.id);
    if (!post) return res.status(404).json({ error: 'Not found' });
    if (req.body.caption) post.caption = req.body.caption;
    res.json({ post });
  });
  
  app.post('/api/posts/:id/like', (req, res) => {
    const post = db.posts.find(p => p.id === req.params.id);
    if (post) {
      post.likesCount += 1;
      return res.json({ likesCount: post.likesCount });
    }
    res.status(404).json({ error: 'Not found' });
  });

  app.get('/api/posts/:id/comments', (req, res) => {
    const comments = db.comments.filter(c => c.postId === req.params.id);
    res.json(comments);
  });

  app.post('/api/posts/:id/comments', (req, res) => {
    const post = db.posts.find(p => p.id === req.params.id);
    if (!post) return res.status(404).json({error: 'Not found'});
    
    const { authorId, content } = req.body;
    const comment: Comment = {
      id: `c_${Date.now()}`,
      postId: req.params.id,
      authorId, content,
      createdAt: new Date().toISOString()
    };
    db.comments.push(comment);
    post.commentsCount += 1;
    res.json({ comment });
  });

  app.post('/api/users/:id/follow', (req, res) => {
    const { followerId } = req.body;
    const followingId = req.params.id;
    const existingFollow = db.follows.find(f => f.followerId === followerId && f.followingId === followingId);
    if(existingFollow) {
      return res.status(400).json({ error: 'Already following' });
    }
    
    const target = db.users.find(u => u.id === followingId);
    if (!target) return res.status(404).json({ error: 'User not found' });

    if (target.isPrivate) {
      const existingReq = db.followRequests.find(r => r.requesterId === followerId && r.targetId === followingId);
      if (existingReq) return res.status(400).json({ error: 'Request already sent' });
      const reqId = `fr_${Date.now()}`;
      db.followRequests.push({ id: reqId, requesterId: followerId, targetId: followingId, status: 'pending', timestamp: new Date().toISOString() });
      db.notifications.push({ id: `n_${Date.now()}`, userId: followingId, actorId: followerId, type: 'follow', message: 'requested to follow you.', isRead: false, timestamp: new Date().toISOString() });
      return res.json({ status: 'requested' });
    }

    db.follows.push({ followerId, followingId, timestamp: new Date().toISOString() });
    const follower = db.users.find(u => u.id === followerId);
    if(target) target.followersCount += 1;
    if(follower) follower.followingCount += 1;
    db.notifications.push({ id: `n_${Date.now()}`, userId: followingId, actorId: followerId, type: 'follow', message: 'started following you.', isRead: false, timestamp: new Date().toISOString() });
    
    return res.json({ status: 'success' });
  });

  app.post('/api/users/:id/unfollow', (req, res) => {
    const { followerId } = req.body;
    const followingId = req.params.id;
    const index = db.follows.findIndex(f => f.followerId === followerId && f.followingId === followingId);
    if(index !== -1) {
      db.follows.splice(index, 1);
      const target = db.users.find(u => u.id === followingId);
      const follower = db.users.find(u => u.id === followerId);
      if (target && target.followersCount > 0) target.followersCount -= 1;
      if (follower && follower.followingCount > 0) follower.followingCount -= 1;
      return res.json({ status: 'success' });
    }
    const reqIndex = db.followRequests.findIndex(r => r.requesterId === followerId && r.targetId === followingId);
    if (reqIndex !== -1) {
      db.followRequests.splice(reqIndex, 1);
      return res.json({ status: 'request_cancelled' });
    }
    return res.status(400).json({ error: 'Not following' });
  });

  app.post('/api/requests/:id/accept', (req, res) => {
    const reqIndex = db.followRequests.findIndex(r => r.id === req.params.id);
    if (reqIndex === -1) return res.status(404).json({ error: 'Request not found' });
    const request = db.followRequests[reqIndex];
    db.followRequests.splice(reqIndex, 1);
    
    // Check if already following just in case
    const existingFollow = db.follows.find(f => f.followerId === request.requesterId && f.followingId === request.targetId);
    if (!existingFollow) {
      db.follows.push({ followerId: request.requesterId, followingId: request.targetId, timestamp: new Date().toISOString() });
      const target = db.users.find(u => u.id === request.targetId);
      const follower = db.users.find(u => u.id === request.requesterId);
      if(target) target.followersCount += 1;
      if(follower) follower.followingCount += 1;
      db.notifications.push({ id: `n_${Date.now()}`, userId: request.requesterId, actorId: request.targetId, type: 'follow', message: 'accepted your follow request.', isRead: false, timestamp: new Date().toISOString() });
    }
    return res.json({ status: 'success' });
  });

  app.post('/api/requests/:id/reject', (req, res) => {
    const reqIndex = db.followRequests.findIndex(r => r.id === req.params.id);
    if (reqIndex === -1) return res.status(404).json({ error: 'Request not found' });
    db.followRequests.splice(reqIndex, 1);
    return res.json({ status: 'success' });
  });

  app.put('/api/users/:id/profile', (req, res) => {
    const user = db.users.find(u => u.id === req.params.id);
    if(!user) return res.status(404).json({error: 'Not found'});
    const { name, bio, avatarUrl, coverUrl, isPrivate, settings } = req.body;
    if(name !== undefined) user.name = name;
    if(bio !== undefined) user.bio = bio;
    if(avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if(coverUrl !== undefined) user.coverUrl = coverUrl;
    if(isPrivate !== undefined) user.isPrivate = isPrivate;
    if(settings !== undefined) (user as any).settings = settings;
    res.json({ user });
  });

  app.post('/api/messages', (req, res) => {
    const { senderId, conversationId, text } = req.body;
    const msg: Message = {
      id: `m_${Date.now()}`, senderId, conversationId, text, timestamp: new Date().toISOString()
    };
    db.messages.push(msg);
    const io = req.app.get('io') as SocketIOServer;
    if (io) {
      // conversationId is "userA_userB". The receiver is the other one.
      const [u1, u2] = conversationId.split('_');
      const receiverId = u1 === senderId ? u2 : u1;
      io.to(receiverId).emit('new_message', msg);
    }
    res.json({ message: msg });
  });

  app.get('/api/messages/:conversationId', (req, res) => {
    const m = db.messages.filter(m => m.conversationId === req.params.conversationId);
    res.json(m);
  });

  app.get('/api/notifications/:userId', (req, res) => {
    const n = db.notifications.filter(n => n.userId === req.params.userId);
    res.json(n);
  });
  
  app.post('/api/notifications/:userId/read', (req, res) => {
    db.notifications.filter(n => n.userId === req.params.userId).forEach(n => n.isRead = true);
    res.json({ status: 'success' });
  });

  const httpServer = http.createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: { origin: '*' }
  });
  app.set('io', io);

  io.on('connection', (socket) => {
    socket.on('join', (userId) => {
      socket.join(userId);
    });
    
    socket.on('typing', ({ senderId, receiverId }) => {
      io.to(receiverId).emit('typing', { senderId });
    });

    socket.on('mark_seen', ({ messageId, receiverId }) => {
      io.to(receiverId).emit('message_seen', { messageId });
    });
  });

async function startViteServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  httpServer.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

if (process.env.NODE_ENV !== 'production' || process.argv.includes('server.cjs')) {
  startViteServer();
}

module.exports = app;
