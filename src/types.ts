export interface User {
  id: string; // numeric User ID starting from 100001 as string
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
  settings?: Record<string, boolean>;
}

export interface Post {
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

export interface Vote {
  id: string;
  voterId: string;
  targetUserId: string;
  timestamp: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Follow {
  followerId: string;
  followingId: string;
  timestamp: string;
}

export interface FollowRequest {
  id: string;
  requesterId: string;
  targetId: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  actorId: string;
  type: 'vote' | 'follow' | 'comment' | 'like';
  message: string;
  isRead: boolean;
  timestamp: string;
  link?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string;
}


export interface DatabaseSchema {
  users: User[];
  posts: Post[];
  votes: Vote[]; // Simulating daily votes
  comments: Comment[];
  follows: Follow[];
  followRequests: FollowRequest[];
  notifications: Notification[];
  messages: Message[];
  progressGoal: number;
  totalVotes: number;
}
