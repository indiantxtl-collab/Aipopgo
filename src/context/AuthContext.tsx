import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, DatabaseSchema } from '../types';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
  systemData: DatabaseSchema | null;
  refreshSystemData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [systemData, setSystemData] = useState<DatabaseSchema | null>(null);

  const refreshSystemData = useCallback(async () => {
    try {
      const data = await api.getSystemData();
      setSystemData(data);
    } catch (e) {
      console.error("Failed to load system data", e);
    }
  }, []);

  useEffect(() => {
    let globalChannel: ReturnType<typeof supabase.channel> | null = null;
    
    const initApp = async () => {
      await refreshSystemData();
      
      const storedUserId = localStorage.getItem('ai_pop_session');
      if (storedUserId) {
        try {
          const data = await api.getSystemData();
          const user = data.users.find((u: User) => u.id === storedUserId);
          if (user) {
            setCurrentUser(user);
          } else {
            localStorage.removeItem('ai_pop_session');
          }
        } catch (e) {
          console.error("Failed to restore session", e);
        }
      }
      setIsLoading(false);

      // Super powerful: Automatically listen to all changes across all tables to keep the single source of truth updated in Realtime
      if (import.meta.env.VITE_SUPABASE_URL) {
        globalChannel = supabase.channel('global_db_changes')
          .on('postgres_changes', { event: '*', schema: 'public' }, () => {
             refreshSystemData();
          })
          .subscribe();
      }
    };
    initApp();

    return () => {
      if (globalChannel) {
        supabase.removeChannel(globalChannel);
      }
    }
  }, [refreshSystemData]);

  const login = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('ai_pop_session', user.id);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ai_pop_session');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isLoading, systemData, refreshSystemData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
