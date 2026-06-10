import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabase/client';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'manager' | 'user' | 'talent' | 'supplier';
  tenant?: string;
  plan?: 'starter' | 'pro' | 'enterprise' | 'government';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
  getDashboardRoute: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Redirection par rôle
export const getDashboardByRole = (role: string): string => {
  switch (role) {
    case 'super_admin':   return '/super-admin/dashboard';
    case 'admin':         return '/dashboard';
    case 'manager':       return '/dashboard';
    case 'supplier':      return '/supplier/dashboard';
    case 'talent':        return '/talent/dashboard';
    default:              return '/dashboard';
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string, userEmail: string) => {
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('*, tenants(subscription_plan)')
        .eq('id', userId)
        .single();

      if (profile) {
        setUser({
          id: userId,
          email: userEmail,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          role: profile.role || 'user',
          tenant: profile.tenant_id,
          plan: profile.tenants?.subscription_plan,
        });
      }
    } catch (error) {
      console.error('Profile load error:', error);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await loadProfile(session.user.id, session.user.email || '');
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadProfile(session.user.id, session.user.email || '');
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const isAuthenticated = () => user !== null;

  const getDashboardRoute = () => {
    if (!user) return '/login';
    return getDashboardByRole(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated, getDashboardRoute }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
