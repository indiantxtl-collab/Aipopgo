-- Supabase Setup Schema
-- Run this block in the Supabase SQL Editor

-- 1. Create Tables

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatarUrl TEXT,
  coverUrl TEXT,
  bio TEXT,
  isVerified BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'user',
  joinDate TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  followersCount INTEGER DEFAULT 0,
  followingCount INTEGER DEFAULT 0,
  isPrivate BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  authorId TEXT REFERENCES users(id) ON DELETE CASCADE,
  caption TEXT,
  mediaUrl TEXT,
  mediaType TEXT,
  visibility TEXT DEFAULT 'public',
  allowComments BOOLEAN DEFAULT true,
  allowDownloads BOOLEAN DEFAULT false,
  isPinned BOOLEAN DEFAULT false,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  likesCount INTEGER DEFAULT 0,
  commentsCount INTEGER DEFAULT 0,
  viewsCount INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  postId TEXT REFERENCES posts(id) ON DELETE CASCADE,
  authorId TEXT REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS follows (
  followerId TEXT REFERENCES users(id) ON DELETE CASCADE,
  followingId TEXT REFERENCES users(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (followerId, followingId)
);

CREATE TABLE IF NOT EXISTS follow_requests (
  id TEXT PRIMARY KEY,
  requesterId TEXT REFERENCES users(id) ON DELETE CASCADE,
  targetId TEXT REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS likes (
  postId TEXT REFERENCES posts(id) ON DELETE CASCADE,
  userId TEXT REFERENCES users(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (postId, userId)
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversationId TEXT NOT NULL,
  senderId TEXT REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  userId TEXT REFERENCES users(id) ON DELETE CASCADE,
  actorId TEXT REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  isRead BOOLEAN DEFAULT false,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  link TEXT
);

-- Enables realtime for these tables
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table posts;
alter publication supabase_realtime add table comments;
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table notifications;
