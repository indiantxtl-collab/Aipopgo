import {
  DatabaseSchema,
  User,
  Post,
  Comment,
  Notification,
  Message,
} from '../types';

export const AI_USER_ID = '100000';

async function safeFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    const raw = await response.text();
    const contentType =
      response.headers.get('content-type') || '';
    let data: any = null;
    if (raw) {
      if (contentType.includes('application/json')) {
        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error('Invalid JSON response from server');
        }
      } else {
        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error(
            `Invalid server response (expected JSON, got ${contentType || 'unknown'})`,
          );
        }
      }
    }

    if (!response.ok) {
      throw new Error(
        data?.error ||
          `Request failed (${response.status})`,
      );
    }

    return (data || {}) as T;
  } catch (error: any) {
    console.error(`API ERROR (${url})`, error);

    return {
      error:
        error?.message ||
        'Network error. Backend may be offline.',
    } as T;
  }
}

export const api = {
  getUserByUsername: async (
    username: string,
  ): Promise<{ user?: User; error?: string }> => {
    return safeFetch(
      `/api/users/username/${encodeURIComponent(username)}`,
    );
  },
  getSystemData: async (): Promise<any> => {
    return safeFetch<DatabaseSchema | any>(
      '/api/data',
    );
  },

  login: async (
    identifier: string,
    password: string,
  ): Promise<{ user?: User; error?: string }> => {
    return safeFetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier,
        password,
      }),
    });
  },

  signup: async (
    data: any,
  ): Promise<{ user?: User; error?: string }> => {
    return safeFetch('/api/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  uploadFile: async (
    file: File,
  ): Promise<{ url?: string; error?: string }> => {
    try {
      const formData = new FormData();

      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || 'Upload failed',
        );
      }

      return data;
    } catch (error: any) {
      console.error(error);

      return {
        error:
          error?.message ||
          'Upload failed',
      };
    }
  },

  vote: async (
    voterId: string,
  ): Promise<{
    totalVotes?: number;
    error?: string;
  }> => {
    return safeFetch('/api/vote', {
      method: 'POST',
      body: JSON.stringify({
        voterId,
      }),
    });
  },

  createPost: async (
    post: Post,
  ): Promise<any> => {
    return safeFetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify(post),
    });
  },

  deletePost: async (
    id: string,
  ): Promise<any> => {
    return safeFetch(`/api/posts/${id}`, {
      method: 'DELETE',
    });
  },

  updatePost: async (
    id: string,
    updates: Partial<Post>,
  ): Promise<any> => {
    return safeFetch(`/api/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  likePost: async (
    id: string,
  ): Promise<any> => {
    return safeFetch(`/api/posts/${id}/like`, {
      method: 'POST',
    });
  },

  getComments: async (
    postId: string,
  ): Promise<any> => {
    return safeFetch(
      `/api/posts/${postId}/comments`,
    );
  },

  addComment: async (
    postId: string,
    authorId: string,
    content: string,
  ): Promise<any> => {
    return safeFetch(
      `/api/posts/${postId}/comments`,
      {
        method: 'POST',
        body: JSON.stringify({
          authorId,
          content,
        }),
      },
    );
  },

  followUser: async (
    followingId: string,
    followerId: string,
  ): Promise<any> => {
    return safeFetch(
      `/api/users/${followingId}/follow`,
      {
        method: 'POST',
        body: JSON.stringify({
          followerId,
        }),
      },
    );
  },

  unfollowUser: async (
    followingId: string,
    followerId: string,
  ): Promise<any> => {
    return safeFetch(
      `/api/users/${followingId}/unfollow`,
      {
        method: 'POST',
        body: JSON.stringify({
          followerId,
        }),
      },
    );
  },

  acceptFollowRequest: async (
    requestId: string,
  ): Promise<any> => {
    return safeFetch(
      `/api/requests/${requestId}/accept`,
      {
        method: 'POST',
      },
    );
  },

  rejectFollowRequest: async (
    requestId: string,
  ): Promise<any> => {
    return safeFetch(
      `/api/requests/${requestId}/reject`,
      {
        method: 'POST',
      },
    );
  },

  updateProfile: async (
    userId: string,
    data: Partial<User>,
  ): Promise<any> => {
    return safeFetch(
      `/api/users/${userId}/profile`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
    );
  },
  updateSettings: async (
    userId: string,
    section: string,
    values: Record<string, boolean | string>,
  ): Promise<any> => {
    return safeFetch(`/api/users/${userId}/settings`, {
      method: 'PUT',
      body: JSON.stringify({ section, values }),
    });
  },

  getNotifications: async (
    userId: string,
  ): Promise<any> => {
    return safeFetch(
      `/api/notifications/${userId}`,
    );
  },

  markReadNotifications: async (
    userId: string,
  ): Promise<any> => {
    return safeFetch(
      `/api/notifications/${userId}/read`,
      {
        method: 'POST',
      },
    );
  },

  getMessages: async (
    conversationId: string,
  ): Promise<any> => {
    return safeFetch(
      `/api/messages/${conversationId}`,
    );
  },

  sendMessage: async (
    senderId: string,
    conversationId: string,
    text: string,
  ): Promise<any> => {
    return safeFetch('/api/messages', {
      method: 'POST',
      body: JSON.stringify({
        senderId,
        conversationId,
        text,
      }),
    });
  },
};
