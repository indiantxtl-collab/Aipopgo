import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';

import {
  User,
  DatabaseSchema,
} from '../types';

import { api } from '../lib/api';

interface AuthContextType {
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
  systemData: DatabaseSchema | null;
  refreshSystemData: () => Promise<void>;
  hasBootError: boolean;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined,
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [currentUser, setCurrentUser] =
    useState<User | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [systemData, setSystemData] =
    useState<DatabaseSchema | null>(null);
  const [hasBootError, setHasBootError] =
    useState(false);

  const refreshSystemData =
    useCallback(async () => {
      try {
        const data: any =
          await api.getSystemData();

        if (
          !data ||
          data.error ||
          !Array.isArray(data.users)
        ) {
          console.error(
            'Invalid system data:',
            data,
          );

          setSystemData(null);

          return;
        }

        setSystemData(data);
      } catch (error) {
        console.error(
          'Failed to load system data:',
          error,
        );

        setSystemData(null);
      }
    }, []);

  useEffect(() => {
    let mounted = true;

    const initApp = async () => {
      try {
        setIsLoading(true);

        const data: any =
          await api.getSystemData();

        if (
          !mounted
        ) {
          return;
        }

        if (
          !data ||
          data.error ||
          !Array.isArray(data.users)
        ) {
          console.error(
            'Backend not responding properly:',
            data,
          );

          setSystemData(null);
          setHasBootError(true);
          setCurrentUser(null);

          return;
        }

        setSystemData(data);
        setHasBootError(false);

        const storedUserId =
          localStorage.getItem(
            'ai_pop_session',
          );

        if (storedUserId) {
          const user =
            data.users.find(
              (u: User) =>
                u.id === storedUserId,
            ) || null;

          if (user) {
            setCurrentUser(user);
          } else {
            localStorage.removeItem(
              'ai_pop_session',
            );
          }
        }
      } catch (error) {
        console.error(
          'App initialization failed:',
          error,
        );

        setCurrentUser(null);
        setSystemData(null);
        setHasBootError(true);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initApp();

    return () => {
      mounted = false;
    };
  }, []);

  const login = (user: User) => {
    setCurrentUser(user);

    localStorage.setItem(
      'ai_pop_session',
      user.id,
    );
  };

  const logout = () => {
    setCurrentUser(null);

    localStorage.removeItem(
      'ai_pop_session',
    );
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        isLoading,
        systemData,
        refreshSystemData,
        hasBootError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider',
    );
  }

  return context;
}
