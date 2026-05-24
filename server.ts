import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import fileUpload from 'express-fileupload';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
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
  mediaUrl?: string | null;
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
type UserSettings = Record<string, Record<string, boolean | string>>;

const __dirname = path.resolve();

export const AI_USER_ID = '100000';

const initialUsers: User[] = [
  {
    id: AI_USER_ID,
    name: 'Ai',
    username: 'aipopgirl',
    email: 'aipopgirl@demo.com',
    password: 'SuperSecureAiAdmin2026!',
    avatarUrl: null,
    coverUrl: null,
    bio: `Hi, I'm Ai — a cheerful dreamer aiming to become someone who can support and brighten other people's lives. I love baseball, comedians, games, studying, self-improvement, and sharing positive energy.`,
    isVerified: true,
    mixChannelId: '18641424',
    role: 'creator',
    joinDate: new Date('2024-01-01').toISOString(),
    followersCount: 12400,
    followingCount: 42,
    isPrivate: false,
  },
];

const initialPosts: Post[] = [
  {
    id: 'p1',
    authorId: AI_USER_ID,
    caption: 'Thank you everyone for the support 💛',
    mediaUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1200',
    mediaType: 'image',
    visibility: 'public',
    allowComments: true,
    allowDownloads: false,
    isPinned: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    likesCount: 1450,
    commentsCount: 132,
    viewsCount: 15400,
  },
  {
    id: 'p2',
    authorId: AI_USER_ID,
    caption: 'Studying hard today 📚',
    mediaUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1200',
    mediaType: 'image',
    visibility: 'public',
    allowComments: true,
    allowDownloads: true,
    isPinned: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    likesCount: 890,
    commentsCount: 45,
    viewsCount: 5200,
  },
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
  userSettings: {} as UserSettings,
};

db.notifications.push({
  id: 'n1',
  userId: AI_USER_ID,
  actorId: '100001',
  type: 'vote',
  message: 'cheered for you!',
  isRead: false,
  timestamp: new Date().toISOString(),
});

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    return next();
  });

  app.use(
    fileUpload({
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
      abortOnLimit: true,
      createParentPath: true,
    }),
  );

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.get('/api/health', (_, res) => {
    return res.json({
      status: 'ok',
    });
  });

  app.get('/api/data', (_, res) => {
    const users = db.users.map((u) => ({
      ...u,
      password: undefined,
    }));

    return res.json({
      ...db,
      users,
    });
  });

  app.post('/api/login', (req, res) => {
    try {
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        return res.status(400).json({
          error: 'Email/username and password required.',
        });
      }

      const user = db.users.find(
        (u) =>
          u.email.toLowerCase() === String(identifier).toLowerCase() ||
          u.username.toLowerCase() === String(identifier).toLowerCase(),
      );

      if (!user) {
        return res.status(404).json({
          error: 'User not found.',
        });
      }

      if (user.password !== password) {
        return res.status(401).json({
          error: 'Invalid password.',
        });
      }

      return res.json({
        user: {
          ...user,
          password: undefined,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Login failed.',
      });
    }
  });

  app.post('/api/signup', (req, res) => {
    try {
      const { name, username, email, password } = req.body;

      if (!name || !username || !email || !password) {
        return res.status(400).json({
          error: 'All fields are required.',
        });
      }

      const cleanUsername = String(username)
        .trim()
        .toLowerCase();

      const cleanEmail = String(email)
        .trim()
        .toLowerCase();

      const existingUsername = db.users.find(
        (u) => u.username.toLowerCase() === cleanUsername,
      );

      if (existingUsername) {
        return res.status(400).json({
          error: 'Username already taken.',
        });
      }

      const existingEmail = db.users.find(
        (u) => u.email.toLowerCase() === cleanEmail,
      );

      if (existingEmail) {
        return res.status(400).json({
          error: 'Email already registered.',
        });
      }

      const newUser: User = {
        id: `${100000 + db.users.length + 1}`,
        name: String(name).trim(),
        username: cleanUsername,
        email: cleanEmail,
        password,
        isVerified: false,
        role: 'user',
        joinDate: new Date().toISOString(),
        followersCount: 0,
        followingCount: 0,
        avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${cleanUsername}`,
        coverUrl: null,
        bio: 'Ready to support Ai ✨',
        isPrivate: false,
      };

      db.users.push(newUser);

      return res.json({
        user: {
          ...newUser,
          password: undefined,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Signup failed.',
      });
    }
  });

  app.post('/api/upload', (req, res) => {
    try {
      if (req.files && req.files.file) {
        const file = req.files.file as fileUpload.UploadedFile;

        const base64 = file.data.toString('base64');

        const mediaUrl = `data:${file.mimetype};base64,${base64}`;

        return res.json({
          url: mediaUrl,
        });
      }

      if (req.body?.base64) {
        return res.json({
          url: req.body.base64,
        });
      }

      return res.status(400).json({
        error: 'No file uploaded.',
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Upload failed.',
      });
    }
  });

  app.post('/api/vote', (req, res) => {
    try {
      const { voterId } = req.body;

      if (!voterId) {
        return res.status(400).json({
          error: 'Missing voter id.',
        });
      }

      const today = new Date().toISOString().split('T')[0];

      const existing = db.votes.find(
        (v) =>
          v.voterId === voterId &&
          v.timestamp.startsWith(today),
      );

      if (existing) {
        return res.status(400).json({
          error: 'Already voted today.',
        });
      }

      db.votes.push({
        id: `v_${Date.now()}`,
        voterId,
        targetUserId: AI_USER_ID,
        timestamp: new Date().toISOString(),
      });

      db.totalVotes += 1;

      return res.json({
        success: true,
        totalVotes: db.totalVotes,
      });
    } catch {
      return res.status(500).json({
        error: 'Vote failed.',
      });
    }
  });

  app.post('/api/users/:followingId/follow', (req, res) => {
    const { followerId } = req.body;
    const followingId = req.params.followingId;
    const follower = db.users.find((u) => u.id === followerId);
    const following = db.users.find((u) => u.id === followingId);
    if (!follower || !following) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const exists = db.follows.find((f) => f.followerId === followerId && f.followingId === followingId);
    if (exists) return res.json({ success: true });
    db.follows.push({ followerId, followingId, timestamp: new Date().toISOString() });
    following.followersCount += 1;
    follower.followingCount += 1;
    return res.json({ success: true });
  });

  app.post('/api/users/:followingId/unfollow', (req, res) => {
    const { followerId } = req.body;
    const followingId = req.params.followingId;
    const idx = db.follows.findIndex((f) => f.followerId === followerId && f.followingId === followingId);
    if (idx === -1) return res.json({ success: true });
    db.follows.splice(idx, 1);
    const follower = db.users.find((u) => u.id === followerId);
    const following = db.users.find((u) => u.id === followingId);
    if (following && following.followersCount > 0) following.followersCount -= 1;
    if (follower && follower.followingCount > 0) follower.followingCount -= 1;
    return res.json({ success: true });
  });

  app.get('/api/users/:id', (req, res) => {
    const user = db.users.find((u) => u.id === req.params.id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found.',
      });
    }

    return res.json({
      user: {
        ...user,
        password: undefined,
      },
    });
  });

  app.get('/api/users/username/:username', (req, res) => {
    const user = db.users.find(
      (u) =>
        u.username.toLowerCase() ===
        req.params.username.toLowerCase(),
    );

    if (!user) {
      return res.status(404).json({
        error: 'User not found.',
      });
    }

    return res.json({
      user: {
        ...user,
        password: undefined,
      },
    });
  });

  app.put('/api/users/:id/profile', (req, res) => {
    const user = db.users.find((u) => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const { name, bio, avatarUrl, coverUrl } = req.body || {};
    if (typeof name === 'string' && name.trim()) user.name = name.trim();
    if (typeof bio === 'string') user.bio = bio.trim();
    if (typeof avatarUrl === 'string') user.avatarUrl = avatarUrl.trim() || null;
    if (typeof coverUrl === 'string') user.coverUrl = coverUrl.trim() || null;
    return res.json({ user: { ...user, password: undefined } });
  });

  app.put('/api/users/:id/settings', (req, res) => {
    const user = db.users.find((u) => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const { section, values } = req.body || {};
    if (!section || typeof values !== 'object') return res.status(400).json({ error: 'Invalid settings payload.' });
    if (!db.userSettings[user.id]) db.userSettings[user.id] = {};
    db.userSettings[user.id][section] = { ...(db.userSettings[user.id][section] || {}), ...values };
    return res.json({ success: true, settings: db.userSettings[user.id] });
  });

  app.get('/api/posts', (_, res) => {
    const posts = db.posts.map((post) => {
      const author = db.users.find(
        (u) => u.id === post.authorId,
      );

      return {
        ...post,
        author,
      };
    });

    return res.json(posts);
  });

  app.post('/api/posts', (req, res) => {
    try {
      const post: Post = {
        ...req.body,
        id: `p_${Date.now()}`,
        createdAt: new Date().toISOString(),
        likesCount: 0,
        commentsCount: 0,
        viewsCount: 0,
      };

      db.posts.unshift(post);

      return res.json({
        post,
      });
    } catch {
      return res.status(500).json({
        error: 'Create post failed.',
      });
    }
  });

  app.put('/api/posts/:id', (req, res) => {
    const post = db.posts.find(
      (p) => p.id === req.params.id,
    );

    if (!post) {
      return res.status(404).json({
        error: 'Post not found.',
      });
    }

    post.caption = req.body.caption || post.caption;

    return res.json({
      post,
    });
  });

  app.delete('/api/posts/:id', (req, res) => {
    const index = db.posts.findIndex(
      (p) => p.id === req.params.id,
    );

    if (index === -1) {
      return res.status(404).json({
        error: 'Post not found.',
      });
    }

    db.posts.splice(index, 1);

    return res.json({
      success: true,
    });
  });

  app.post('/api/posts/:id/like', (req, res) => {
    const post = db.posts.find(
      (p) => p.id === req.params.id,
    );

    if (!post) {
      return res.status(404).json({
        error: 'Post not found.',
      });
    }

    post.likesCount += 1;

    return res.json({
      likesCount: post.likesCount,
    });
  });

  app.get('/api/posts/:id/comments', (req, res) => {
    const comments = db.comments.filter(
      (c) => c.postId === req.params.id,
    );

    return res.json(comments);
  });

  app.post('/api/posts/:id/comments', (req, res) => {
    const post = db.posts.find(
      (p) => p.id === req.params.id,
    );

    if (!post) {
      return res.status(404).json({
        error: 'Post not found.',
      });
    }

    const comment: Comment = {
      id: `c_${Date.now()}`,
      postId: req.params.id,
      authorId: req.body.authorId,
      content: req.body.content,
      createdAt: new Date().toISOString(),
    };

    db.comments.push(comment);

    post.commentsCount += 1;

    return res.json({
      comment,
    });
  });

  app.post('/api/messages', (req, res) => {
    const msg: Message = {
      id: `m_${Date.now()}`,
      senderId: req.body.senderId,
      conversationId: req.body.conversationId,
      text: req.body.text,
      timestamp: new Date().toISOString(),
    };

    db.messages.push(msg);

    return res.json({
      message: msg,
    });
  });

  app.get('/api/messages/:conversationId', (req, res) => {
    const messages = db.messages.filter(
      (m) =>
        m.conversationId === req.params.conversationId,
    );

    return res.json(messages);
  });

  app.get('/api/notifications/:userId', (req, res) => {
    const notifications = db.notifications.filter(
      (n) => n.userId === req.params.userId,
    );

    return res.json(notifications);
  });

  app.post('/api/notifications/:userId/read', (req, res) => {
    db.notifications
      .filter((n) => n.userId === req.params.userId)
      .forEach((n) => {
        n.isRead = true;
      });

    return res.json({
      success: true,
    });
  });

  app.use('/api/*', (req, res) => {
    return res.status(404).json({
      error: `API route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');

    app.use(express.static(distPath));

    app.get('*', (_, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on ${PORT}`);
  });
}

startServer();
