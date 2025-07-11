import { useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables for Supabase (fallback to localhost)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:8000';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key';

// Create a function to get the supabase client
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = async (): Promise<SupabaseClient> => {
  // If we already have an instance, return it
  if (supabaseInstance) {
    return supabaseInstance;
  }
  
  try {
    // Create and store the client using environment variables
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabaseInstance;
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    throw error;
  }
};

// Hook to use supabase in components
export const useSupabase = () => {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeSupabase = async () => {
      try {
        const client = await getSupabaseClient();
        setSupabase(client);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    initializeSupabase();
  }, []);

  return { supabase, loading, error };
};

// Default export for backward compatibility
export default {
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: null, error: null }),
    signOut: () => Promise.resolve({ error: null })
  }
};
