import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { getSupabaseClient } from 'utils/supabase';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null } | null;
  }>;
  signUp: (email: string, password: string) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null } | null;
  }>;
  signOut: () => Promise<{ error: Error | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [supabase, setSupabase] = useState<any>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const client = await getSupabaseClient();
        setSupabase(client);

        // Get initial session
        const { data } = await client.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);

        // Listen for auth changes
        const {
          data: { subscription },
        } = client.auth.onAuthStateChange((_event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const value = {
    session,
    user,
    loading,
    error,
    signIn: async (email: string, password: string) => {
      if (!supabase) throw new Error('Supabase client not initialized');
      return supabase.auth.signInWithPassword({ email, password });
    },
    signUp: async (email: string, password: string) => {
      if (!supabase) throw new Error('Supabase client not initialized');
      return supabase.auth.signUp({ email, password });
    },
    signOut: async () => {
      if (!supabase) throw new Error('Supabase client not initialized');
      return supabase.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
